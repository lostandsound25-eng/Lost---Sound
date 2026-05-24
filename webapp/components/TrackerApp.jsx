'use client';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import SearchableCurrencySelect from './SearchableCurrencySelect';


// SVG Icons as minimal inline components
const MicIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#F59E0B" : "none"} stroke={filled ? "#F59E0B" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// Constants
const CATEGORIES = ["Accommodation", "Transportation", "Food & Drink", "Everything Else"];

const CATEGORY_COLORS = {
  Accommodation: "#853A51",
  Transportation: "#81C3D7",
  "Food & Drink": "#E86B32",
  "Everything Else": "#6B7280"
};

const CATEGORY_EMOJIS = {
  Accommodation: "🏨",
  Transportation: "🛵",
  "Food & Drink": "🍔",
  "Everything Else": "📦"
};

const DEFAULT_RATES = {
  USD: 1.0,
  EUR: 1.08,
  THB: 0.027,
  PHP: 0.017,
  VND: 0.000039,
  IDR: 0.000062,
  CAD: 0.73,
  MXN: 0.060,
  AUD: 0.66
};

const CURRENCY_SYMBOLS = {
  USD: '$',
  HTML: '€', // fallback if needed
  EUR: '€',
  THB: '฿',
  PHP: '₱',
  JPY: '¥',
  VND: '₫',
  IDR: 'Rp',
  CAD: 'CA$',
  MXN: 'Mex$',
  AUD: 'A$'
};

// Formatting & Conversion Helpers
const formatMoney = (amount, currency) => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return symbol.length > 1 ? `${symbol} ${amount.toFixed(2)}` : `${symbol}${amount.toFixed(2)}`;
};

const convertCurrency = (amount, fromCurrency, toCurrency, rates) => {
  return (amount * (rates[fromCurrency] || 1)) / (rates[toCurrency] || 1);
};

const getDaysActive = (expenses) => {
  if (expenses.length === 0) return 1;
  const minTime = Math.min(...expenses.map(e => new Date(e.timestamp).getTime()));
  const minDate = new Date(minTime);
  const startDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
  const today = new Date();
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.max(1, Math.round((endDate - startDate) / 86400000) + 1);
};

const getDayLabel = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const dDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = dToday.getTime() - dDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays === -1) {
    return "Tomorrow";
  } else if (diffDays === 2) {
    return "Day Before";
  } else {
    return date.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

const parseSearchQuery = (query, exp, homeCurrency, convertCurrency, rates) => {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;

  // 1. Comparison operator: >, >=, <, <=, =, ==
  const opMatch = q.match(/^(>=|<=|>|<|==|=)\s*\$?\s*([0-9]+(?:\.[0-9]+)?)$/);
  if (opMatch) {
    const op = opMatch[1];
    const targetVal = parseFloat(opMatch[2]);
    const amountInHome = convertCurrency(exp.amount, exp.currency, homeCurrency, rates);
    
    if (op === ">") return amountInHome > targetVal;
    if (op === ">=") return amountInHome >= targetVal;
    if (op === "<") return amountInHome < targetVal;
    if (op === "<=") return amountInHome <= targetVal;
    if (op === "=" || op === "==") return Math.abs(amountInHome - targetVal) < 0.01;
  }

  // 2. English comparisons: over, above, under, below, more than, less than
  const phraseMatch = q.match(/^(over|above|under|below|more than|less than)\s*\$?\s*([0-9]+(?:\.[0-9]+)?)$/);
  if (phraseMatch) {
    const direction = phraseMatch[1];
    const targetVal = parseFloat(phraseMatch[2]);
    const amountInHome = convertCurrency(exp.amount, exp.currency, homeCurrency, rates);

    if (["over", "above", "more than"].includes(direction)) {
      return amountInHome > targetVal;
    }
    if (["under", "below", "less than"].includes(direction)) {
      return amountInHome < targetVal;
    }
  }

  // 3. Simple text search (note, category, location, currency, tags)
  const note = (exp.note || "").toLowerCase();
  const location = (exp.location || "").toLowerCase();
  const category = (exp.category || "").toLowerCase();
  const currency = (exp.currency || "").toLowerCase();
  
  if (q.startsWith("#")) {
    const tag = q.slice(1);
    return note.includes(q) || (exp.tags && exp.tags.some(t => t.toLowerCase() === tag));
  }

  return (
    note.includes(q) || 
    location.includes(q) || 
    category.includes(q) || 
    currency.includes(q) ||
    (exp.tags && exp.tags.some(t => t.toLowerCase().includes(q)))
  );
};

export default function TrackerApp({ tripId = null, isDemo = false }) {
  const [expenses, setExpenses] = useState([]);
  const [trip, setTrip] = useState({
    name: isDemo ? "My Local Trip" : "Loading Trip...",
    homeCurrency: "USD",
    localCurrency: "USD",
    currentLocation: ""
  });
  const [locationInput, setLocationInput] = useState("");
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [customCurrencies, setCustomCurrencies] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'manual', 'voice', 'subscribe', 'auth', 'collaborators'
  const [editingExpense, setEditingExpense] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedLogDates, setExpandedLogDates] = useState([]);
  const [expandedOlderCategory, setExpandedOlderCategory] = useState({});
  const [showFuture, setShowFuture] = useState(false);
  const [todaySectionExpanded, setTodaySectionExpanded] = useState(false);
  const [logView, setLogView] = useState("recent"); // 'recent' or 'history'
  const [logLimit, setLogLimit] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleOlderCategory = (dateKey, cat) => {
    setExpandedOlderCategory((prev) => ({
      ...prev,
      [`${dateKey}-${cat}`]: !prev[`${dateKey}-${cat}`]
    }));
  };
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [pendingCloudSync, setPendingCloudSync] = useState(false);

  // Editable trip name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // Offline background queue state
  const [syncQueue, setSyncQueue] = useState([]);

  useEffect(() => {
    setNameInput(trip.name);
  }, [trip.name]);

  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isVoiceParsing, setIsVoiceParsing] = useState(false);

  const recognitionRef = useRef(null);
  const latestTranscriptRef = useRef("");
  const hasParsedRef = useRef(false);
  const voiceTimeoutRef = useRef(null);

  const handleVoiceParse = async (text) => {
    if (!text.trim()) return;
    setIsVoiceParsing(true);
    try {
      const res = await fetch("/api/parse-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text,
          homeCurrency: trip.homeCurrency,
          localCurrency: trip.localCurrency,
          currentLocation: trip.currentLocation,
          categories: CATEGORIES
        })
      });
      if (res.ok) {
        const parsed = await res.json();
        setEditingExpense((prev) => {
          const combinedNote = parsed.location ? `${parsed.note}, ${parsed.location}` : parsed.note;
          return {
            amount: parsed.amount,
            currency: parsed.currency,
            category: parsed.category,
            note: combinedNote,
            location: "",
            tags: parsed.tags || [],
            worthIt: parsed.worthIt,
            id: prev?.id || null
          };
        });
        setActiveModal("manual");
      } else {
        console.error("Parser endpoint failed, using fallback");
        alert("Parsing failed. Please enter details manually.");
        setEditingExpense((prev) => ({
          amount: "",
          currency: trip.localCurrency,
          category: "Everything Else",
          note: text,
          location: "",
          tags: [],
          worthIt: false,
          id: prev?.id || null
        }));
        setActiveModal("manual");
      }
    } catch (e) {
      console.error("Failed to call parser API:", e);
      alert("Could not reach parser. Please enter details manually.");
      setEditingExpense((prev) => ({
        amount: "",
        currency: trip.localCurrency,
        category: "Everything Else",
        note: text,
        location: "",
        tags: [],
        worthIt: false,
        id: prev?.id || null
      }));
      setActiveModal("manual");
    } finally {
      setIsVoiceParsing(false);
    }
  };

  const startVoiceListening = () => {
    const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechClass) {
      alert("Speech recognition is not supported in this browser. Please type to enter details manually. Note: On iOS (iPhone/iPad), Apple restricts Chrome and other third-party browsers from using the speech engine. Please open this page in Safari to use microphone dictation!");
      setEditingExpense(null);
      setActiveModal("manual");
      return;
    }
    
    // Abort any running instances
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    
    // Clear any active timeouts
    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current);
    }
    
    const rec = new SpeechClass();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";
    
    hasParsedRef.current = false;
    latestTranscriptRef.current = "";
    
    rec.onstart = () => {
      setIsVoiceListening(true);
      setVoiceTranscript("");
      
      // Start an 8-second absolute inactivity/no-speech timeout
      voiceTimeoutRef.current = setTimeout(() => {
        if (!latestTranscriptRef.current) {
          console.log("No speech detected, timing out...");
          hasParsedRef.current = true;
          try {
            rec.abort();
          } catch (e) {}
          setIsVoiceListening(false);
          alert("No speech detected. Directing to manual entry.");
          setEditingExpense(null);
          setActiveModal("manual");
        }
      }, 8000);
    };
    
    rec.onresult = (e) => {
      // Clear timeout once speech is received
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
        voiceTimeoutRef.current = null;
      }
      
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        } else {
          interimTranscript += e.results[i][0].transcript;
        }
      }
      
      const text = finalTranscript || interimTranscript;
      if (text) {
        setVoiceTranscript(text);
        latestTranscriptRef.current = text;
      }
    };
    
    rec.onerror = (e) => {
      console.error("Speech Recognition Error:", e);
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
        voiceTimeoutRef.current = null;
      }
      
      setIsVoiceListening(false);
      
      if (e.error === "not-allowed") {
        alert("Microphone access is blocked. Please enable microphone permissions for this website in your browser settings (e.g. tap the 'aA' icon in Safari, or check Settings > Safari > Microphone).");
        setActiveModal("manual");
      } else if (e.error === "service-not-allowed") {
        alert("Speech recognition is not allowed or supported on this browser. Note: If you are using Chrome or another browser on iPhone/iPad, Apple's iOS sandbox blocks them from using speech recognition features. Please open this page in Safari to use the microphone!");
        setActiveModal("manual");
      } else if (e.error !== "aborted" && e.error !== "no-speech") {
        alert(`Voice recognition error (${e.error}). Directing to manual entry.`);
        setEditingExpense(null);
        setActiveModal("manual");
      }
    };
    
    rec.onend = () => {
      setIsVoiceListening(false);
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
        voiceTimeoutRef.current = null;
      }
      
      const finalVal = latestTranscriptRef.current;
      if (finalVal && !hasParsedRef.current) {
        hasParsedRef.current = true;
        handleVoiceParse(finalVal);
      }
    };
    
    recognitionRef.current = rec;
    
    try {
      rec.start();
    } catch (err) {
      console.error("Failed to start Speech Recognition:", err);
      setIsVoiceListening(false);
      setEditingExpense(null);
      setActiveModal("manual");
    }
  };



  // Load state from localStorage / cloud on mount
  useEffect(() => {
    const savedRates = localStorage.getItem("tracker_rates");
    if (savedRates) setRates(JSON.parse(savedRates));

    const savedCustom = localStorage.getItem("tracker_custom_currencies");
    if (savedCustom) setCustomCurrencies(JSON.parse(savedCustom));

    const subscribed = localStorage.getItem("tracker_subscribed") === "true";
    setIsSubscribed(subscribed);

    if (isDemo) {
      const savedTrip = localStorage.getItem("tracker_trip_demo");
      let parsedTrip = null;
      if (savedTrip) {
        setTrip(parsedTrip = JSON.parse(savedTrip));
      } else {
        setTrip({
          name: "Demo Trip (Southeast Asia)",
          homeCurrency: "USD",
          localCurrency: "PHP",
          currentLocation: "Manila"
        });
      }

      const savedExpenses = localStorage.getItem("tracker_expenses_demo");
      let parsedExpenses = [];
      if (savedExpenses) {
        setExpenses(parsedExpenses = JSON.parse(savedExpenses));
      } else {
        // Prepopulate with realistic example expenses to guide the user
        const initialDemoExpenses = [
          {
            id: "demo-1",
            amount: 75.00,
            currency: "USD",
            category: "Everything Else",
            note: "Scuba Diving in El Nido",
            worthIt: true,
            location: "El Nido | Philippines",
            tags: ["activities", "scuba"],
            timestamp: new Date().toISOString()
          },
          {
            id: "demo-2",
            amount: 8.50,
            currency: "USD",
            category: "Food & Drink",
            note: "Mango Sticky Rice & Fruit Shake",
            worthIt: false,
            location: "Manila | Philippines",
            tags: ["food", "dessert"],
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "demo-3",
            amount: 5.00,
            currency: "USD",
            category: "Transportation",
            note: "Tuk Tuk ride around city",
            worthIt: false,
            location: "Manila | Philippines",
            tags: ["transport"],
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "demo-4",
            amount: 120.00,
            currency: "USD",
            category: "Accommodation",
            note: "Beachfront Bungalow (2 nights)",
            worthIt: true,
            location: "El Nido | Philippines",
            tags: ["accommodation", "hotel"],
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        setExpenses(parsedExpenses = initialDemoExpenses);
      }

      if (parsedTrip && !parsedTrip.currentLocation && parsedExpenses.length > 0) {
        const lastExp = parsedExpenses.find((e) => e.location);
        if (lastExp) {
          setTrip((prev) => ({ ...prev, currentLocation: lastExp.location }));
        }
      }
      setIsMounted(true);
    } else if (tripId && supabase) {
      // Load from local cache first for instant loading
      const cacheTrip = localStorage.getItem(`tracker_trip_${tripId}`);
      if (cacheTrip) setTrip(JSON.parse(cacheTrip));
      
      const cacheExpenses = localStorage.getItem(`tracker_expenses_${tripId}`);
      if (cacheExpenses) setExpenses(JSON.parse(cacheExpenses));

      loadTripFromCloud(tripId);
    } else {
      setIsMounted(true);
    }

    if (navigator.onLine) {
      fetchLatestRates();
    }
  }, [tripId, isDemo]);

  // Prevent bouncy/page-level scrolling on mobile browsers to make the web app feel native
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      document.documentElement.style.position = "fixed";
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.width = "100%";
      document.documentElement.style.height = "100%";
      
      document.body.style.position = "fixed";
      document.body.style.overflow = "hidden";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
    }

    return () => {
      document.documentElement.style.position = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.width = "";
      document.documentElement.style.height = "";
      
      document.body.style.position = "";
      document.body.style.overflow = "";
      document.body.style.width = "";
      document.body.style.height = "";
    };
  }, []);

  // Keep locationInput in sync when trip location is loaded/changed
  useEffect(() => {
    if (trip?.currentLocation !== undefined) {
      setLocationInput(trip.currentLocation);
    }
  }, [trip?.currentLocation]);

  // Save changes locally
  useEffect(() => {
    if (isMounted) {
      const key = isDemo ? "tracker_trip_demo" : `tracker_trip_${tripId}`;
      localStorage.setItem(key, JSON.stringify(trip));
    }
  }, [trip, isMounted, isDemo, tripId]);

  useEffect(() => {
    if (isMounted) {
      const key = isDemo ? "tracker_expenses_demo" : `tracker_expenses_${tripId}`;
      localStorage.setItem(key, JSON.stringify(expenses));
    }
  }, [expenses, isMounted, isDemo, tripId]);

  // Offline background queue storage & processing
  const [isOnline, setIsOnline] = useState(typeof window !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    if (!isDemo && tripId) {
      const savedQueue = localStorage.getItem(`sync_queue_${tripId}`);
      if (savedQueue) setSyncQueue(JSON.parse(savedQueue));
    }
  }, [tripId, isDemo]);

  useEffect(() => {
    if (!isDemo && tripId && isMounted) {
      localStorage.setItem(`sync_queue_${tripId}`, JSON.stringify(syncQueue));
    }
  }, [syncQueue, tripId, isMounted, isDemo]);

  const processSyncQueue = async () => {
    if (isDemo || syncQueue.length === 0 || !navigator.onLine || !supabase) return;

    const queue = [...syncQueue];
    let successCount = 0;

    for (const op of queue) {
      try {
        let error = null;
        if (op.type === "insert") {
          const { error: err } = await supabase.from("trip_entries").insert(op.payload);
          error = err;
        } else if (op.type === "update") {
          const { error: err } = await supabase.from("trip_entries").update(op.payload).eq("id", op.payload.id);
          error = err;
        } else if (op.type === "delete") {
          const { error: err } = await supabase.from("trip_entries").delete().eq("id", op.payload.id);
          error = err;
        }
        if (error) throw error;
        successCount++;
      } catch (err) {
        console.error("Queue execution error:", err);
        break; // Stop sequencing to maintain order of operations
      }
    }

    setSyncQueue((prev) => prev.slice(successCount));
    if (successCount === queue.length) {
      setSyncError(null);
    }
  };

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      setSyncError(null);
      processSyncQueue();
    };
    const goOffline = () => {
      setIsOnline(false);
      setSyncError("Working offline. Actions are queued.");
    };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    if (navigator.onLine) {
      processSyncQueue();
    }

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [syncQueue]);

  // Realtime replication subscription
  useEffect(() => {
    if (isDemo || !tripId || !supabase) return;

    const channel = supabase
      .channel(`realtime:trip_entries:${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trip_entries",
          filter: `trip_id=eq.${tripId}`
        },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;
          if (eventType === "INSERT") {
            const mapped = {
              id: newRow.id,
              timestamp: newRow.created_at || new Date().toISOString(),
              amount: parseFloat(newRow.amount),
              currency: newRow.currency,
              category: newRow.category,
              note: newRow.note || "",
              worthIt: newRow.worth_it,
              location: newRow.location || "",
              tags: newRow.tags || []
            };
            setExpenses((prev) => {
              if (prev.some(e => e.id === mapped.id)) return prev;
              return [mapped, ...prev];
            });
          } else if (eventType === "UPDATE") {
            const mapped = {
              id: newRow.id,
              timestamp: newRow.created_at || new Date().toISOString(),
              amount: parseFloat(newRow.amount),
              currency: newRow.currency,
              category: newRow.category,
              note: newRow.note || "",
              worthIt: newRow.worth_it,
              location: newRow.location || "",
              tags: newRow.tags || []
            };
            setExpenses((prev) => prev.map(e => e.id === mapped.id ? mapped : e));
          } else if (eventType === "DELETE") {
            setExpenses((prev) => prev.filter(e => e.id !== oldRow.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, isDemo]);

  // Helper for background cloud syncing
  const performCloudAction = async (type, payload) => {
    if (isDemo || !tripId || !supabase) return;

    if (!navigator.onLine) {
      setSyncQueue((prev) => [...prev, { type, payload, timestamp: Date.now() }]);
      setSyncError("Working offline. Action queued.");
      return;
    }

    try {
      let error = null;
      if (type === "insert") {
        const { error: err } = await supabase.from("trip_entries").insert(payload);
        error = err;
      } else if (type === "update") {
        const { error: err } = await supabase.from("trip_entries").update(payload).eq("id", payload.id);
        error = err;
      } else if (type === "delete") {
        const { error: err } = await supabase.from("trip_entries").delete().eq("id", payload.id);
        error = err;
      }
      if (error) throw error;
    } catch (err) {
      console.error("Cloud action failed, queuing:", err);
      setSyncQueue((prev) => [...prev, { type, payload, timestamp: Date.now() }]);
      setSyncError("Sync pending. Action queued.");
    }
  };

  const handleMigrateDemoTrip = async (user) => {
    setIsSyncing(true);
    try {
      const { data: tripData, error: tripErr } = await supabase
        .from("trips")
        .insert({
          name: trip.name,
          home_currency: trip.homeCurrency,
          local_currency: trip.localCurrency,
          current_location: trip.currentLocation,
          created_by: user.id
        })
        .select()
        .single();
      if (tripErr) throw tripErr;

      const { error: memErr } = await supabase
        .from("trip_members")
        .insert({
          trip_id: tripData.id,
          user_id: user.id,
          email: user.email,
          role: "owner"
        });
      if (memErr) throw memErr;

      if (expenses.length > 0) {
        const dbEntries = expenses.map((e) => ({
          id: e.id,
          trip_id: tripData.id,
          created_by: user.id,
          amount: e.amount,
          currency: e.currency,
          category: e.category,
          note: e.note,
          worth_it: e.worthIt,
          location: e.location,
          tags: e.tags,
          created_at: e.timestamp
        }));
        const { error: expErr } = await supabase.from("trip_entries").insert(dbEntries);
        if (expErr) throw expErr;
      }

      localStorage.removeItem("tracker_trip_demo");
      localStorage.removeItem("tracker_expenses_demo");

      localStorage.setItem(`tracker_trip_${tripData.id}`, JSON.stringify({
        id: tripData.id,
        name: tripData.name,
        homeCurrency: trip.homeCurrency,
        localCurrency: trip.localCurrency,
        currentLocation: trip.currentLocation
      }));
      localStorage.setItem(`tracker_expenses_${tripData.id}`, JSON.stringify(expenses));

      alert("Trip saved to cloud successfully!");
      window.location.href = `/tracker/trip/${tripData.id}`;
    } catch (err) {
      console.error("Migration failed:", err);
      alert("Failed to migrate demo data to the cloud: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Local to cloud migration upon user login
  useEffect(() => {
    if (!isDemo || !supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Trigger migration if we detect user logs in/registers
        handleMigrateDemoTrip(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isDemo, trip, expenses]);

  const fetchLatestRates = async () => {
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      if (res.ok) {
        const data = await res.json();
        const updatedRates = {};
        for (const [curr, val] of Object.entries(data.rates)) {
          updatedRates[curr] = 1 / val;
        }
        setRates((prev) => {
          const merged = { ...prev, ...updatedRates };
          localStorage.setItem("tracker_rates", JSON.stringify(merged));
          return merged;
        });
      }
    } catch (e) {
      console.error("Error fetching latest rates:", e);
    }
  };

  const loadTripFromCloud = async (tripId) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const { data: tripData, error: tripErr } = await supabase
        .from("trips")
        .select("*")
        .eq("id", tripId)
        .single();
      if (tripErr) throw tripErr;

      const newTrip = {
        id: tripData.id,
        name: tripData.name,
        homeCurrency: tripData.home_currency || "USD",
        localCurrency: tripData.local_currency || "USD",
        currentLocation: tripData.current_location || ""
      };
      setTrip(newTrip);

      const { data: expensesData, error: expErr } = await supabase
        .from("trip_entries")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: false });
      if (expErr) throw expErr;

      const mappedExpenses = expensesData.map((e) => ({
        id: e.id,
        timestamp: e.created_at || new Date().toISOString(),
        amount: parseFloat(e.amount),
        currency: e.currency,
        category: e.category,
        note: e.note || "",
        worthIt: e.worth_it,
        location: e.location || "",
        tags: e.tags || []
      }));
      setExpenses(mappedExpenses);

      localStorage.setItem(`tracker_trip_${tripId}`, JSON.stringify(newTrip));
      localStorage.setItem(`tracker_expenses_${tripId}`, JSON.stringify(mappedExpenses));
    } catch (e) {
      console.error("Supabase sync failed, loading locally.", e);
      setSyncError("Cloud connection error. Working offline.");
    } finally {
      setIsSyncing(false);
      setIsMounted(true);
    }
  };

  const updateLocation = async (loc) => {
    setTrip((prev) => ({ ...prev, currentLocation: loc }));
    if (!isDemo && tripId && supabase) {
      try {
        await supabase.from("trips").update({ current_location: loc }).eq("id", tripId);
      } catch (e) {
        console.error("Failed to sync location to cloud:", e);
      }
    }
  };

  const saveTripName = async () => {
    setIsEditingName(false);
    if (!nameInput.trim()) return;
    setTrip((prev) => ({ ...prev, name: nameInput.trim() }));
    if (!isDemo && tripId && supabase) {
      try {
        await supabase
          .from("trips")
          .update({ name: nameInput.trim() })
          .eq("id", tripId);
      } catch (err) {
        console.error("Failed to sync updated name:", err);
      }
    }
  };

  const updateHomeCurrency = async (curr) => {
    setTrip((prev) => ({ ...prev, homeCurrency: curr }));
    if (!isDemo && tripId && supabase) {
      try {
        await supabase.from("trips").update({ home_currency: curr }).eq("id", tripId);
      } catch (e) {
        console.error("Failed to sync home currency to cloud:", e);
      }
    }
  };

  const updateLocalCurrency = async (curr) => {
    setTrip((prev) => ({ ...prev, localCurrency: curr }));
    if (!isDemo && tripId && supabase) {
      try {
        await supabase.from("trips").update({ local_currency: curr }).eq("id", tripId);
      } catch (e) {
        console.error("Failed to sync local currency to cloud:", e);
      }
    }
  };

  const addCustomCurrency = (curr) => {
    setCustomCurrencies((prev) => {
      const merged = [...new Set([...prev, curr])];
      localStorage.setItem("tracker_custom_currencies", JSON.stringify(merged));
      return merged;
    });
  };

  const saveExpense = async (expense) => {
    if (expense.delete) {
      setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
      if (!isDemo && tripId) {
        performCloudAction("delete", { id: expense.id });
      }
      setActiveModal(null);
      setEditingExpense(null);
      return;
    }

    if (expense.id) {
      // Update
      const originalHighLevel = editingExpense?.location ? (editingExpense.location.split(" | ")[1] || "") : "";
      const finalLocation = originalHighLevel 
        ? (expense.location ? `${expense.location} | ${originalHighLevel}` : `| ${originalHighLevel}`) 
        : (expense.location ? `${expense.location} | ${trip.currentLocation}` : (trip.currentLocation ? `| ${trip.currentLocation}` : ""));

      const updatedExpense = {
        ...expense,
        location: finalLocation,
        timestamp: expense.timestamp || editingExpense?.timestamp
      };

      setExpenses((prev) => prev.map((e) => (e.id === expense.id ? { ...e, ...updatedExpense } : e)));
      if (!isDemo && tripId) {
        performCloudAction("update", {
          id: expense.id,
          amount: expense.amount,
          currency: expense.currency,
          category: expense.category,
          note: expense.note,
          worth_it: expense.worthIt,
          location: finalLocation,
          tags: expense.tags,
          created_at: expense.timestamp || editingExpense?.timestamp,
          updated_at: new Date().toISOString()
        });
      }
    } else {
      // Insert
      const finalLocation = expense.location 
        ? `${expense.location} | ${trip.currentLocation}` 
        : (trip.currentLocation ? `| ${trip.currentLocation}` : "");

      if (expense.spreadDays && expense.spreadDays > 1) {
        const N = expense.spreadDays;
        const totalAmount = expense.amount;
        const dailyAmount = parseFloat((totalAmount / N).toFixed(2));
        const remainder = parseFloat((totalAmount - dailyAmount * N).toFixed(2));

        const newExpenses = [];
        const dbInserts = [];

        const startD = expense.spreadStart ? new Date(expense.spreadStart + "T00:00:00") : new Date();

        for (let i = 0; i < N; i++) {
          const amt = (i === N - 1) ? parseFloat((dailyAmount + remainder).toFixed(2)) : dailyAmount;
          const newId = crypto.randomUUID ? crypto.randomUUID() : (Date.now() + i).toString();
          
          // Calculate timestamp offset starting from selected date range start
          const d = new Date(startD);
          d.setDate(d.getDate() + i);
          const timestamp = d.toISOString();

          const startStr = expense.spreadStart ? new Date(expense.spreadStart + "T00:00:00").toLocaleDateString("en-US", { month: 'short', day: 'numeric' }) : "";
          const endStr = expense.spreadEnd ? new Date(expense.spreadEnd + "T00:00:00").toLocaleDateString("en-US", { month: 'short', day: 'numeric' }) : "";
          const baseNote = expense.note || expense.category;
          const noteWithSuffix = startStr && endStr 
            ? `${baseNote} (Day ${i + 1}/${N}, ${startStr} - ${endStr})` 
            : `${baseNote} (Day ${i + 1}/${N})`;

          const singleExpense = {
            amount: amt,
            currency: expense.currency,
            category: expense.category,
            note: noteWithSuffix,
            worthIt: expense.worthIt,
            location: finalLocation,
            tags: expense.tags,
            id: newId,
            timestamp: timestamp
          };

          newExpenses.push(singleExpense);

          if (!isDemo && tripId) {
            dbInserts.push({
              id: singleExpense.id,
              created_at: singleExpense.timestamp,
              amount: singleExpense.amount,
              currency: singleExpense.currency,
              category: singleExpense.category,
              note: singleExpense.note,
              worth_it: singleExpense.worthIt,
              location: singleExpense.location,
              tags: singleExpense.tags,
              trip_id: tripId
            });
          }
        }

        setExpenses((prev) => [...newExpenses, ...prev]);

        if (!isDemo && tripId && dbInserts.length > 0) {
          dbInserts.forEach((dbEntry) => {
            performCloudAction("insert", dbEntry);
          });
        }
      } else {
        const newId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
        const newExpense = {
          ...expense,
          location: finalLocation,
          id: newId,
          timestamp: expense.timestamp || new Date().toISOString()
        };
        setExpenses((prev) => [newExpense, ...prev]);

        if (!isDemo && tripId) {
          performCloudAction("insert", {
            id: newExpense.id,
            created_at: newExpense.timestamp,
            amount: newExpense.amount,
            currency: newExpense.currency,
            category: newExpense.category,
            note: newExpense.note,
            worth_it: newExpense.worthIt,
            location: newExpense.location,
            tags: newExpense.tags,
            trip_id: tripId
          });
        }
      }
    }
    setActiveModal(null);
    setEditingExpense(null);
  };

  const deleteExpense = async (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    if (!isDemo && tripId) {
      performCloudAction("delete", { id });
    }
  };

  const now = new Date();
  const visibleExpenses = expenses.filter((e) => new Date(e.timestamp) <= now);

  const todayStr = new Date().toLocaleDateString();
  const todayExpenses = visibleExpenses.filter((e) => new Date(e.timestamp).toLocaleDateString() === todayStr);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, trip.homeCurrency, rates), 0);
  const allExpensesTotal = visibleExpenses.reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, trip.homeCurrency, rates), 0);
  const daysActive = getDaysActive(visibleExpenses);

  const categoryTotalsToday = CATEGORIES.map((cat) => {
    const catExpenses = todayExpenses.filter((e) => e.category === cat);
    const catTotal = catExpenses.reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, trip.homeCurrency, rates), 0);
    return { cat, total: catTotal };
  });
  const activeTotalsToday = categoryTotalsToday.filter(c => c.total > 0);
  const topCategoryToday = activeTotalsToday.length > 0 
    ? activeTotalsToday.sort((a, b) => b.total - a.total)[0] 
    : null;

  const handleSaveSyncClick = async () => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      handleMigrateDemoTrip(session.user);
    } else {
      setActiveModal("auth");
    }
  };

  const nameLength = trip.name ? trip.name.length : 0;
  const dynamicFontSize = nameLength > 24 
    ? "0.85rem" 
    : nameLength > 18 
      ? "0.95rem" 
      : nameLength > 12 
        ? "1.05rem" 
        : "1.2rem";

  return isMounted ? (
    <div 
      className="tracker-container"
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        height: "100vh",
        height: "100dvh",
        backgroundColor: "#F9F6ED",
        position: "relative",
        fontFamily: "var(--font-body), system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 0 40px rgba(0,0,0,0.05)",
        color: "var(--color-text)",
        overflow: "hidden"
      }}
    >
      {syncError && (
        <div style={{
          backgroundColor: "#FEF2F2",
          color: "#EF4444",
          padding: "8px 24px",
          fontSize: "0.8rem",
          fontWeight: 500,
          borderBottom: "1px solid #FEE2E2",
          textAlign: "center"
        }}>
          ⚠️ {syncError}
        </div>
      )}

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "0 0 120px" }}>
        {/* Header (scrolls out of the way) */}
        <header style={{
          padding: "20px 20px 16px",
          backgroundColor: "white",
          borderBottom: "1px solid #eee",
          marginBottom: "20px"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
            gap: "12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
              <button
                type="button"
                onClick={() => window.location.href = '/tracker/trips'}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.15rem",
                  cursor: "pointer",
                  color: "var(--color-purple)",
                  padding: "4px 8px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(133, 58, 81, 0.05)",
                  flexShrink: 0
                }}
                title="Back to My Trips"
              >
                ←
              </button>

              {isEditingName ? (
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={saveTripName}
                  onKeyDown={(e) => e.key === "Enter" && saveTripName()}
                  autoFocus
                  style={{
                    fontSize: dynamicFontSize,
                    fontWeight: 800,
                    color: "var(--color-purple)",
                    border: "none",
                    borderBottom: "1.5px solid var(--color-purple)",
                    outline: "none",
                    background: "transparent",
                    flex: 1,
                    minWidth: 0,
                    padding: 0
                  }}
                />
              ) : (
                <div 
                  onClick={() => setIsEditingName(true)}
                  style={{
                    fontSize: dynamicFontSize,
                    fontWeight: 800,
                    color: "var(--color-purple)",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                    minWidth: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }} 
                  title={trip.name}
                >
                  <span>{trip.name}</span>
                  <span style={{ fontSize: "0.8rem", color: "#9CA3AF", fontWeight: 400 }}>✏️</span>
                </div>
              )}
            </div>
            {supabase && (
              <div style={{ flexShrink: 0 }}>
                {isDemo ? (
                  <button
                    onClick={handleSaveSyncClick}
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "white",
                      backgroundColor: "var(--color-orange)",
                      border: "none",
                      borderRadius: "12px",
                      padding: "6px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      boxShadow: "0 2px 8px rgba(232, 107, 50, 0.25)"
                    }}
                  >
                    ☁️ Save & Sync
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <button
                      onClick={() => setActiveModal("collaborators")}
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "var(--color-purple)",
                        backgroundColor: "rgba(133, 58, 81, 0.08)",
                        border: "none",
                        borderRadius: "12px",
                        padding: "6px 10px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      👥 Share
                    </button>
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#10B981",
                      backgroundColor: "#ECFDF5",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      ● Live
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Currency selectors */}
          <div style={{
            display: "flex",
            gap: "12px",
            fontSize: "0.85rem",
            backgroundColor: "#F3F4F6",
            padding: "6px 12px",
            borderRadius: "20px",
            width: "fit-content",
            marginBottom: "12px"
          }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer",
              fontWeight: 600,
              color: "#4B5563"
            }}>
              Home:
              <SearchableCurrencySelect
                value={trip.homeCurrency}
                onChange={updateHomeCurrency}
                rates={rates}
                customCurrencies={customCurrencies}
                onAddCustomCurrency={addCustomCurrency}
              />
            </label>
            <span style={{ color: "#D1D5DB" }}>|</span>
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer",
              fontWeight: 600,
              color: "#4B5563"
            }}>
              Local:
              <SearchableCurrencySelect
                value={trip.localCurrency}
                onChange={updateLocalCurrency}
                rates={rates}
                customCurrencies={customCurrencies}
                onAddCustomCurrency={addCustomCurrency}
              />
            </label>
          </div>

          {/* Location input */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "14px",
            borderBottom: "1px dashed #E5E7EB",
            paddingBottom: "6px"
          }}>
            <span style={{ fontSize: "1.1rem" }}>📍</span>
            <input
              type="text"
              placeholder="Where are you today?"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateLocation(locationInput);
                }
              }}
              style={{
                border: "none",
                fontSize: "16px",
                fontWeight: 500,
                color: "#374151",
                outline: "none",
                width: "100%",
                background: "transparent"
              }}
            />
            {locationInput !== (trip.currentLocation || "") && (
              <button
                type="button"
                onClick={() => updateLocation(locationInput)}
                style={{
                  backgroundColor: "var(--color-purple)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 10px rgba(133, 58, 81, 0.2)",
                  animation: "fadeInOverlay 0.2s ease-out",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-orange)";
                  e.currentTarget.style.boxShadow = "0 6px 12px rgba(232, 107, 50, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-purple)";
                  e.currentTarget.style.boxShadow = "0 4px 10px rgba(133, 58, 81, 0.2)";
                }}
              >
                Save
              </button>
            )}
          </div>

          {/* Totals */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end"
          }}>
            <div
              onClick={() => setTodaySectionExpanded(!todaySectionExpanded)}
              style={{
                cursor: "pointer",
                padding: "6px 12px",
                marginLeft: "-12px",
                borderRadius: "12px",
                backgroundColor: todaySectionExpanded ? "rgba(133, 58, 81, 0.05)" : "transparent",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                if (!todaySectionExpanded) {
                  e.currentTarget.style.backgroundColor = "rgba(133, 58, 81, 0.03)";
                }
              }}
              onMouseLeave={(e) => {
                if (!todaySectionExpanded) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <p style={{
                fontSize: "0.82rem",
                color: "#6B7280",
                fontWeight: 600,
                marginBottom: "3px",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}>
                <span>Today</span>
                <span style={{
                  fontSize: "0.6rem",
                  color: "#9CA3AF",
                  transform: todaySectionExpanded ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                  display: "inline-block"
                }}>▼</span>
              </p>
              <h2 style={{
                fontSize: "1.8rem",
                fontWeight: 900,
                color: "#111827",
                lineHeight: 1,
                fontFamily: "var(--font-heading)"
              }}>{formatMoney(todayTotal, trip.homeCurrency)}</h2>
            </div>
            <div style={{ textAlign: "right", paddingBottom: "6px" }}>
              <p style={{
                fontSize: "0.8rem",
                color: "#6B7280",
                fontWeight: 500,
                marginBottom: "2px"
              }}>Daily Avg ({daysActive}d)</p>
              <p style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "var(--color-purple)",
                fontFamily: "var(--font-heading)",
                lineHeight: 1
              }}>{formatMoney(allExpensesTotal / daysActive, trip.homeCurrency)}</p>
            </div>
          </div>

          {todaySectionExpanded && (
            <div style={{
              marginTop: "16px",
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "8px"
            }}>
              {CATEGORIES.map((cat) => {
                const catExpenses = todayExpenses.filter((e) => e.category === cat);
                const catTotal = catExpenses.reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, trip.homeCurrency, rates), 0);
                const isExpanded = expandedCategory === cat;

                return (
                  <div
                    key={cat}
                    style={{
                      gridColumn: isExpanded ? "span 2" : "span 1",
                      backgroundColor: "white",
                      borderRadius: "16px",
                      padding: "10px 12px",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.02)",
                      cursor: "pointer",
                      border: isExpanded ? `1.5px solid ${CATEGORY_COLORS[cat]}` : "1.5px solid transparent",
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      overflow: "hidden"
                    }}
                    onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                  >
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      alignItems: "flex-start",
                      width: "100%"
                    }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        width: "100%",
                        overflow: "hidden"
                      }}>
                        <span style={{ fontSize: "1.15rem", flexShrink: 0 }}>{CATEGORY_EMOJIS[cat]}</span>
                        <span style={{
                          fontWeight: 700,
                          fontSize: "0.72rem",
                          color: "#6B7280",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1
                        }} title={cat}>{cat}</span>
                      </div>
                      <div style={{
                        fontWeight: 900,
                        fontSize: "1.1rem",
                        color: catTotal > 0 ? CATEGORY_COLORS[cat] : "#9CA3AF",
                        marginTop: "1px"
                      }}>{formatMoney(catTotal, trip.homeCurrency)}</div>
                    </div>

                    {isExpanded && (
                      <div
                        style={{
                          marginTop: "14px",
                          borderTop: "1px solid #F3F4F6",
                          paddingTop: "10px"
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {catExpenses.length === 0 ? (
                          <p style={{
                            fontSize: "0.8rem",
                            color: "#9CA3AF",
                            textAlign: "center",
                            padding: "8px 0"
                          }}>No expenses today</p>
                        ) : (
                          <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px"
                          }}>
                            {catExpenses.map((exp) => (
                              <div
                                key={exp.id}
                                onClick={() => {
                                  setEditingExpense(exp);
                                  setActiveModal("manual");
                                }}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "8px 10px",
                                  borderRadius: "10px",
                                  backgroundColor: "#F9FAFB",
                                  fontSize: "0.8rem",
                                  cursor: "pointer",
                                  border: "1px solid #E5E7EB"
                                }}
                              >
                                <div style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "2px"
                                }}>
                                  <span style={{ fontWeight: 600, color: "#374151" }}>{exp.note || "Unspecified"}</span>
                                  {exp.location && (
                                    <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                                      📍 {exp.location}
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontWeight: 700, color: "#111827" }}>
                                  {formatMoney(convertCurrency(exp.amount, exp.currency, trip.homeCurrency, rates), trip.homeCurrency)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </header>

        {/* Log */}
        <section style={{ padding: "0 24px" }}>
          {(() => {
            const hasFutureExpenses = expenses.some((e) => new Date(e.timestamp) > now);
            const baseExpenses = showFuture ? expenses : visibleExpenses;
            const filteredExpenses = searchQuery
              ? baseExpenses.filter((e) => parseSearchQuery(searchQuery, e, trip.homeCurrency, convertCurrency, rates))
              : baseExpenses;
            const displayedExpenses = filteredExpenses;
            return (
              <>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                  gap: "10px",
                  flexWrap: "wrap"
                }}>
                  {/* Segmented View Toggles */}
                  <div style={{
                    display: "flex",
                    backgroundColor: "rgba(133, 58, 81, 0.05)",
                    padding: "3px",
                    borderRadius: "8px",
                    gap: "2px"
                  }}>
                    <button
                      type="button"
                      onClick={() => setLogView("recent")}
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: logView === "recent" ? 700 : 500,
                        color: logView === "recent" ? "var(--color-purple)" : "#6B7280",
                        backgroundColor: logView === "recent" ? "white" : "transparent",
                        border: "none",
                        borderRadius: "6px",
                        padding: "5px 14px",
                        cursor: "pointer",
                        boxShadow: logView === "recent" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                        transition: "all 0.15s"
                      }}
                    >
                      Log
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogView("history")}
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: logView === "history" ? 700 : 500,
                        color: logView === "history" ? "var(--color-purple)" : "#6B7280",
                        backgroundColor: logView === "history" ? "white" : "transparent",
                        border: "none",
                        borderRadius: "6px",
                        padding: "5px 14px",
                        cursor: "pointer",
                        boxShadow: logView === "history" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                        transition: "all 0.15s"
                      }}
                    >
                      History
                    </button>
                  </div>

                  {/* Future filter toggle */}
                  {hasFutureExpenses && (
                    <button
                      type="button"
                      onClick={() => setShowFuture(!showFuture)}
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: showFuture ? "white" : "var(--color-purple)",
                        backgroundColor: showFuture ? "var(--color-purple)" : "rgba(133, 58, 81, 0.08)",
                        border: "none",
                        borderRadius: "20px",
                        padding: "6px 12px",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      {showFuture ? "Hide Future" : "Show Future"}
                    </button>
                  )}
                </div>

                {/* Search Input Box */}
                <div style={{
                  position: "relative",
                  marginBottom: "16px"
                }}>
                  <span style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "0.95rem",
                    color: "#9CA3AF",
                    pointerEvents: "none"
                  }}>🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search note, tag, category, or operators (e.g. >100, over 50)..."
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 36px",
                      borderRadius: "12px",
                      border: "1.5px solid #E5E7EB",
                      backgroundColor: "white",
                      fontSize: "0.85rem",
                      color: "#374151",
                      outline: "none",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.01)",
                      transition: "all 0.2s"
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-purple)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(133, 58, 81, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E5E7EB";
                      e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.01)";
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        border: "none",
                        background: "transparent",
                        fontSize: "0.9rem",
                        color: "#9CA3AF",
                        cursor: "pointer",
                        padding: "4px"
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {displayedExpenses.length === 0 ? (
                  <div style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: "#9CA3AF"
                  }}>
                    {searchQuery ? (
                      <>
                        <p style={{ fontSize: "1rem", fontWeight: 600, color: "#4B5563" }}>No matching expenses found</p>
                        <p style={{ fontSize: "0.82rem", marginTop: "6px" }}>Try searching for a different note, tag, or operator (e.g. &gt; 50)</p>
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: "1rem", fontWeight: 500 }}>No expenses logged yet.</p>
                        <p style={{ fontSize: "0.85rem", marginTop: "6px" }}>Tap the mic to add your first expense.</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    {(() => {
                      const sortedExpenses = [...displayedExpenses].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                      if (logView === "recent") {
                        const recentExpenses = sortedExpenses.slice(0, logLimit);
                        let lastLabel = null;
                        return (
                          <div>
                            {recentExpenses.length === 0 ? (
                              <div style={{ textAlign: "center", padding: "30px 0", color: "#9CA3AF" }}>
                                <p style={{ fontSize: "0.9rem" }}>No recent expenses.</p>
                              </div>
                            ) : (
                              <div>
                                {recentExpenses.map((exp) => {
                                  const label = getDayLabel(exp.timestamp);
                                  const showHeader = label !== lastLabel;
                                  lastLabel = label;

                                  const sameDayExpenses = sortedExpenses.filter(e => getDayLabel(e.timestamp) === label);
                                  const dayLocation = sameDayExpenses.map(e => e.location ? (e.location.split(" | ")[1] || "") : "").find(loc => loc) || "";

                                  return (
                                    <div key={exp.id}>
                                      {showHeader && (
                                        <div style={{
                                          fontSize: "0.8rem",
                                          fontWeight: 800,
                                          color: "var(--color-purple)",
                                          backgroundColor: "rgba(133, 58, 81, 0.06)",
                                          padding: "6px 12px",
                                          borderRadius: "8px",
                                          marginTop: "16px",
                                          marginBottom: "8px",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "6px",
                                          textTransform: "uppercase",
                                          letterSpacing: "0.5px"
                                        }}>
                                          <span>{label}</span>
                                          {dayLocation && (
                                            <span style={{ color: "var(--color-orange)", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                                              📍 {dayLocation}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                      <ExpenseCard
                                        expense={exp}
                                        onEdit={(e) => {
                                          setEditingExpense(e);
                                          setActiveModal("manual");
                                        }}
                                        onDelete={deleteExpense}
                                        formatMoney={formatMoney}
                                        convertCurrency={convertCurrency}
                                        homeCurrency={trip.homeCurrency}
                                        rates={rates}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Load More Button */}
                            {sortedExpenses.length > logLimit && (
                              <div style={{ display: "flex", justifyContent: "center", marginTop: "16px", marginBottom: "10px" }}>
                                <button
                                  type="button"
                                  onClick={() => setLogLimit((prev) => prev + 10)}
                                  style={{
                                    fontSize: "0.82rem",
                                    fontWeight: 750,
                                    color: "var(--color-purple)",
                                    backgroundColor: "white",
                                    border: "1.5px solid rgba(133, 58, 81, 0.15)",
                                    borderRadius: "12px",
                                    padding: "10px 20px",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                                    width: "100%",
                                    maxWidth: "200px",
                                    textAlign: "center"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = "var(--color-purple)";
                                    e.currentTarget.style.backgroundColor = "rgba(133, 58, 81, 0.02)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "rgba(133, 58, 81, 0.15)";
                                    e.currentTarget.style.backgroundColor = "white";
                                  }}
                                >
                                  Load More
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      } else {
                        // History View
                        const olderGroups = {};
                        sortedExpenses.forEach((exp) => {
                          const d = new Date(exp.timestamp);
                          const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                          if (!olderGroups[dateKey]) {
                            olderGroups[dateKey] = {
                              dateDisplay: d.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }),
                              dateKey: dateKey,
                              totalSpend: 0,
                              categories: {},
                              location: ""
                            };
                          }

                          const amtInHome = convertCurrency(exp.amount, exp.currency, trip.homeCurrency, rates);
                          olderGroups[dateKey].totalSpend += amtInHome;

                          if (!olderGroups[dateKey].categories[exp.category]) {
                            olderGroups[dateKey].categories[exp.category] = { total: 0, list: [] };
                          }
                          olderGroups[dateKey].categories[exp.category].total += amtInHome;
                          olderGroups[dateKey].categories[exp.category].list.push(exp);

                          const highLevelLoc = exp.location ? (exp.location.split(" | ")[1] || "") : "";
                          if (highLevelLoc && !olderGroups[dateKey].location) {
                            olderGroups[dateKey].location = highLevelLoc;
                          }
                        });

                        const olderGroupsArray = Object.values(olderGroups).sort((a, b) => b.dateKey.localeCompare(a.dateKey));

                        if (olderGroupsArray.length === 0) {
                          return (
                            <div style={{ textAlign: "center", padding: "40px 0", color: "#9CA3AF" }}>
                              <p style={{ fontSize: "1rem", fontWeight: 500 }}>No history yet.</p>
                            </div>
                          );
                        }

                        return (
                          <div style={{ marginTop: "8px" }}>
                            {olderGroupsArray.map((group) => {
                              const isExpanded = expandedLogDates.includes(group.dateKey);
                              return (
                                <div
                                  key={group.dateKey}
                                  style={{
                                    backgroundColor: "white",
                                    borderRadius: "16px",
                                    padding: "14px",
                                    marginBottom: "10px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                                    border: "1px solid #F3F4F6"
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      cursor: "pointer"
                                    }}
                                    onClick={() => {
                                      setExpandedLogDates(prev =>
                                        prev.includes(group.dateKey)
                                          ? prev.filter(k => k !== group.dateKey)
                                          : [...prev, group.dateKey]
                                      );
                                    }}
                                  >
                                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                      <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#374151" }}>
                                        {group.dateDisplay}
                                      </span>
                                      {group.location && (
                                        <span style={{ fontSize: "0.75rem", color: "var(--color-orange)", display: "flex", alignItems: "center", gap: "2px" }}>
                                          📍 {group.location}
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <span style={{
                                        fontSize: "0.95rem",
                                        fontWeight: 800,
                                        color: "var(--color-purple)"
                                      }}>
                                        {formatMoney(group.totalSpend, trip.homeCurrency)}
                                      </span>
                                      <span style={{
                                        fontSize: "0.7rem",
                                        color: "#9CA3AF",
                                        transform: isExpanded ? "rotate(180deg)" : "none",
                                        transition: "transform 0.2s"
                                      }}>▼</span>
                                    </div>
                                  </div>

                                  {isExpanded && (
                                    <div
                                      style={{
                                        marginTop: "14px",
                                        borderTop: "1px solid #F3F4F6",
                                        paddingTop: "10px",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "8px"
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {Object.entries(group.categories).map(([cat, catData]) => {
                                        const key = `${group.dateKey}-${cat}`;
                                        const isCatExpanded = !!expandedOlderCategory[key];
                                        return (
                                          <div
                                            key={cat}
                                            style={{
                                              display: "flex",
                                              flexDirection: "column",
                                              gap: "6px",
                                              fontSize: "0.85rem",
                                              color: "#4B5563",
                                              borderBottom: "1px dashed #F3F4F6",
                                              paddingBottom: "8px",
                                              marginTop: "4px"
                                            }}
                                          >
                                            <div
                                              style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                cursor: "pointer",
                                                width: "100%"
                                              }}
                                              onClick={() => toggleOlderCategory(group.dateKey, cat)}
                                            >
                                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span>{CATEGORY_EMOJIS[cat] || "📦"}</span>
                                                <span style={{ fontWeight: 600 }}>{cat}</span>
                                                <span style={{ fontSize: "0.7rem", color: "#9CA3AF" }}>
                                                  ({catData.list.length} {catData.list.length === 1 ? "item" : "items"})
                                                </span>
                                              </div>
                                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span style={{
                                                  fontWeight: 700,
                                                  color: CATEGORY_COLORS[cat] || "#111827"
                                                }}>
                                                  {formatMoney(catData.total, trip.homeCurrency)}
                                                </span>
                                                <span style={{
                                                  fontSize: "0.6rem",
                                                  color: "#9CA3AF",
                                                  transform: isCatExpanded ? "rotate(180deg)" : "none",
                                                  transition: "transform 0.15s"
                                                }}>▼</span>
                                              </div>
                                            </div>

                                            {isCatExpanded && (
                                              <div style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "8px",
                                                paddingLeft: "16px",
                                                marginTop: "6px"
                                              }}>
                                                {catData.list.map((exp) => (
                                                  <ExpenseCard
                                                    key={exp.id}
                                                    expense={exp}
                                                    onEdit={(e) => {
                                                      setEditingExpense(e);
                                                      setActiveModal("manual");
                                                    }}
                                                    onDelete={deleteExpense}
                                                    formatMoney={formatMoney}
                                                    convertCurrency={convertCurrency}
                                                    homeCurrency={trip.homeCurrency}
                                                    rates={rates}
                                                  />
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}
              </>
            );
          })()}
        </section>
      </main>

      {/* Floating Action Button */}
      <div style={{
        position: "fixed",
        bottom: "30px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100
      }}>
        <button
          onClick={() => {
            setEditingExpense(null);
            setActiveModal("manual");
          }}
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            backgroundColor: "var(--color-orange)",
            color: "white",
            border: "none",
            boxShadow: "0 10px 30px rgba(232, 107, 50, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s ease"
          }}
          onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
          onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <PlusIcon />
        </button>
      </div>

      {/* Modals */}
      {activeModal === "manual" && (
        <ManualEntryModal
          onClose={() => {
            setActiveModal(null);
            setEditingExpense(null);
          }}
          onSave={saveExpense}
          trip={trip}
          expenseToEdit={editingExpense}
          rates={rates}
          customCurrencies={customCurrencies}
          onAddCustomCurrency={addCustomCurrency}
          onVoiceStart={startVoiceListening}
        />
      )}

      {isVoiceListening && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          padding: "24px",
          textAlign: "center"
        }}>
          <div style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            backgroundColor: "rgba(133, 58, 81, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
            animation: "pulsePurple 1.5s infinite"
          }}>
            <div style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              backgroundColor: "var(--color-purple)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <MicIcon />
            </div>
          </div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>Listening...</h3>
          <p style={{ color: "#9CA3AF", fontSize: "0.95rem", marginBottom: "24px", maxWidth: "280px" }}>
            Speak your expense now (e.g. 5 USD coffee at Starbucks)
          </p>

          {voiceTranscript ? (
            <div style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              padding: "16px 24px",
              borderRadius: "16px",
              fontSize: "1.1rem",
              fontStyle: "italic",
              color: "#E5E7EB",
              maxWidth: "360px",
              lineHeight: "1.4",
              marginBottom: "32px",
              minHeight: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              "{voiceTranscript}"
            </div>
          ) : (
            <div style={{ height: "82px" }} />
          )}

          <div style={{ display: "flex", gap: "16px", width: "100%", maxWidth: "320px" }}>
            <button
              type="button"
              onClick={() => {
                hasParsedRef.current = true;
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.abort();
                  } catch (e) {}
                }
                setIsVoiceListening(false);
              }}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "white",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!voiceTranscript}
              onClick={() => {
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.stop();
                  } catch (e) {}
                }
              }}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "12px",
                backgroundColor: "white",
                color: "var(--color-purple)",
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
                opacity: !voiceTranscript ? 0.5 : 1,
                transition: "opacity 0.2s"
              }}
            >
              Done Speaking
            </button>
          </div>
        </div>
      )}

      {isVoiceParsing && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white"
        }}>
          <div className="spinner" style={{ marginBottom: "24px" }} />
          <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "12px" }}>Processing Expense...</h3>
          {voiceTranscript && (
            <p style={{ 
              fontSize: "1.1rem", 
              fontStyle: "italic", 
              color: "#D1D5DB", 
              padding: "0 24px", 
              textAlign: "center",
              lineHeight: "1.4",
              maxWidth: "320px"
            }}>
              "{voiceTranscript}"
            </p>
          )}
        </div>
      )}


      {activeModal === "auth" && (
        <AuthModal
          onClose={() => setActiveModal(null)}
          onSuccess={() => setActiveModal(null)}
        />
      )}

      {activeModal === "collaborators" && (
        <CollaboratorsModal
          tripId={tripId}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  ) : (
    <div style={{ minHeight: "100vh", background: "#F9F6ED" }} />
  );
}

// Swipe-to-delete card representing each expense log
function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  formatMoney,
  convertCurrency,
  homeCurrency,
  rates
}) {
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [isSwipedOpen, setIsSwipedOpen] = useState(false);

  const convertedAmount = convertCurrency(expense.amount, expense.currency, homeCurrency, rates);

  // Parse custom note suffix for spread details if present: e.g. "Hotel Booking (Day 1/7, May 23 - May 29)"
  const spreadMatch = expense.note ? expense.note.match(/(.*)\s\(Day\s(\d+)\/(\d+),\s(.*)\)/) : null;
  const displayNote = spreadMatch ? spreadMatch[1].trim() : (expense.note || expense.category);
  const spreadInfo = spreadMatch ? `Spread: Day ${spreadMatch[2]}/${spreadMatch[3]} (${spreadMatch[4]})` : null;

  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      borderRadius: "16px",
      marginBottom: "12px"
    }}>
      {/* Delete button revealed by swiping */}
      <div
        onClick={() => onDelete(expense.id)}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "80px",
          backgroundColor: "#FCA5A5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#B91C1C",
          fontWeight: 700,
          fontSize: "0.85rem",
          cursor: "pointer",
          zIndex: 1,
          borderTopRightRadius: "16px",
          borderBottomRightRadius: "16px",
          boxShadow: "inset 4px 0 10px rgba(0,0,0,0.05)"
        }}
      >
        ✕ Delete
      </div>

      <div
        onTouchStart={(e) => {
          setStartX(e.touches[0].clientX);
          setIsDragging(true);
        }}
        onTouchMove={(e) => {
          if (!isDragging) return;
          const diff = startX - e.touches[0].clientX;
          if (diff > 0) {
            setOffsetX(Math.min(isSwipedOpen ? 80 + diff : diff, 120));
          } else if (isSwipedOpen && diff < 0) {
            setOffsetX(Math.max(80 + diff, 0));
          }
        }}
        onTouchEnd={() => {
          setIsDragging(false);
          if (isSwipedOpen) {
            if (offsetX < 40) {
              setOffsetX(0);
              setIsSwipedOpen(false);
            } else {
              setOffsetX(80);
            }
          } else {
            if (offsetX > 45) {
              setOffsetX(80);
              setIsSwipedOpen(true);
            } else {
              setOffsetX(0);
            }
          }
        }}
        onClick={() => {
          if (isSwipedOpen) {
            setOffsetX(0);
            setIsSwipedOpen(false);
          } else {
            onEdit(expense);
          }
        }}
        style={{
          backgroundColor: expense.worthIt ? "#FFFDF6" : "white",
          borderRadius: "16px",
          border: expense.worthIt ? "1.5px solid rgba(242, 174, 48, 0.35)" : "1.5px solid transparent",
          padding: "15px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 2,
          transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: `translateX(-${offsetX}px)`,
          cursor: "pointer",
          boxShadow: expense.worthIt ? "0 4px 16px rgba(242, 174, 48, 0.16)" : "0 4px 10px rgba(0,0,0,0.02)"
        }}
      >
        <div style={{
          width: "4px",
          height: "100%",
          backgroundColor: CATEGORY_COLORS[expense.category] || "#6B7280",
          position: "absolute",
          left: 0,
          top: 0
        }} />

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          paddingLeft: "8px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{
              fontWeight: 700,
              color: "#111827",
              fontSize: "1rem"
            }}>{displayNote}</span>
            {expense.worthIt && <StarIcon filled={true} />}
          </div>
          {spreadInfo && (
            <div style={{
              fontSize: "0.78rem",
              color: "var(--color-orange)",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginTop: "-2px"
            }}>
              🗓️ {spreadInfo}
            </div>
          )}

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap"
          }}>
            <span style={{ fontSize: "0.78rem", color: "#6B7280" }}>
              {CATEGORY_EMOJIS[expense.category] || "📦"} {expense.category}
            </span>
            {expense.location && expense.location.split(" | ")[0] && (
              <span style={{
                fontSize: "0.78rem",
                color: "#9CA3AF",
                display: "flex",
                alignItems: "center",
                gap: "2px"
              }}>
                📍 {expense.location.split(" | ")[0]}
              </span>
            )}
          </div>

          {expense.tags && expense.tags.length > 0 && (
            <div style={{
              display: "flex",
              gap: "4px",
              marginTop: "4px",
              flexWrap: "wrap"
            }}>
              {expense.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  style={{
                    fontSize: "0.7rem",
                    backgroundColor: "#F3F4F6",
                    color: "#6B7280",
                    padding: "2px 6px",
                    borderRadius: "6px",
                    fontWeight: 600
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{
            fontWeight: 800,
            fontSize: "1.05rem",
            color: "#111827"
          }}>{formatMoney(convertedAmount, homeCurrency)}</div>
          {expense.currency !== homeCurrency && (
            <div style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>
              {expense.amount.toFixed(2)} {expense.currency}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Modal for adding or editing expenses manually
function ManualEntryModal({
  onClose,
  onSave,
  trip,
  expenseToEdit,
  rates,
  customCurrencies,
  onAddCustomCurrency,
  onVoiceStart
}) {
  const getDraft = () => {
    if (typeof window === 'undefined') return null;
    const draft = localStorage.getItem("tracker_expense_draft");
    if (!draft) return null;
    try {
      return JSON.parse(draft);
    } catch (e) {
      return null;
    }
  };

  const [amount, setAmount] = useState(() => {
    if (expenseToEdit) return expenseToEdit.amount;
    const draft = getDraft();
    return draft ? draft.amount : "";
  });
  const [note, setNote] = useState(() => {
    if (expenseToEdit) return expenseToEdit.note;
    const draft = getDraft();
    return draft ? draft.note : "";
  });
  const [category, setCategory] = useState(() => {
    if (expenseToEdit) return expenseToEdit.category;
    const draft = getDraft();
    return draft ? draft.category : "Everything Else";
  });
  const [worthIt, setWorthIt] = useState(() => {
    if (expenseToEdit) return !!expenseToEdit.worthIt;
    const draft = getDraft();
    return draft ? !!draft.worthIt : false;
  });
  const [currency, setCurrency] = useState(() => {
    if (expenseToEdit) return expenseToEdit.currency;
    const draft = getDraft();
    if (draft && draft.currency) return draft.currency;
    const lastUsed = typeof window !== 'undefined' ? localStorage.getItem("tracker_last_used_currency") : null;
    return lastUsed || trip.localCurrency;
  });
  const [location, setLocation] = useState(() => {
    if (expenseToEdit) return (expenseToEdit.location.split(" | ")[0] || "");
    const draft = getDraft();
    return draft ? draft.location : "";
  });
  const [tags, setTags] = useState(() => {
    if (expenseToEdit && expenseToEdit.tags) return expenseToEdit.tags;
    const draft = getDraft();
    return draft ? draft.tags : [];
  });
  const [tagInput, setTagInput] = useState("");
  const [spreadExpense, setSpreadExpense] = useState(false);
  const getFutureDateString = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-CA');
  };
  const [spreadStart, setSpreadStart] = useState(new Date().toLocaleDateString('en-CA'));
  const [spreadEnd, setSpreadEnd] = useState(getFutureDateString(6));
  const [expenseDate, setExpenseDate] = useState(
    expenseToEdit 
      ? new Date(expenseToEdit.timestamp).toLocaleDateString('en-CA') 
      : new Date().toLocaleDateString('en-CA')
  );

  // Sync inputs with expenseToEdit changes (e.g. from async speech parser)
  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount !== undefined ? expenseToEdit.amount : "");
      setNote(expenseToEdit.note !== undefined ? expenseToEdit.note : "");
      setCategory(expenseToEdit.category || "Everything Else");
      setWorthIt(!!expenseToEdit.worthIt);
      setCurrency(expenseToEdit.currency || trip.localCurrency);
      setLocation(expenseToEdit.location ? (expenseToEdit.location.split(" | ")[0] || "") : "");
      setTags(expenseToEdit.tags || []);
      setExpenseDate(
        expenseToEdit.timestamp 
          ? new Date(expenseToEdit.timestamp).toLocaleDateString('en-CA') 
          : new Date().toLocaleDateString('en-CA')
      );
    }
  }, [expenseToEdit, trip.localCurrency]);

  // Auto-save draft as the user types (only for new expenses)
  useEffect(() => {
    if (!expenseToEdit) {
      const draftObj = { amount, note, category, worthIt, currency, location, tags };
      localStorage.setItem("tracker_expense_draft", JSON.stringify(draftObj));
    }
  }, [amount, note, category, worthIt, currency, location, tags, expenseToEdit]);

  const handleCloseWithX = () => {
    localStorage.removeItem("tracker_expense_draft");
    onClose();
  };

  const removeTag = (idx) => {
    setTags(tags.filter((_, i) => i !== idx));
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 2000,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center"
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          width: "100%",
          maxWidth: "480px",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          padding: "24px",
          animation: "slideUp 0.3s ease-out",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
      >
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <h3 style={{
            fontSize: "1.15rem",
            fontWeight: 800,
            color: "var(--color-purple)"
          }}>
            {expenseToEdit?.id ? "Edit Expense" : "Log Expense"}
          </h3>
          <button 
            type="button"
            onClick={handleCloseWithX} 
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              color: "#9CA3AF",
              cursor: "pointer"
            }}
          >✕</button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const val = parseFloat(amount);
            if (!amount || isNaN(val) || val <= 0) {
              alert("Please enter a valid positive amount.");
              return;
            }
            const start = new Date(spreadStart);
            const end = new Date(spreadEnd);
            let days = 1;
            if (spreadExpense && !isNaN(start) && !isNaN(end) && end >= start) {
              days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            }

            let finalTimestamp;
            if (expenseToEdit) {
              const origDateStr = new Date(expenseToEdit.timestamp).toLocaleDateString('en-CA');
              if (expenseDate === origDateStr) {
                finalTimestamp = expenseToEdit.timestamp;
              } else {
                finalTimestamp = new Date(expenseDate + "T12:00:00").toISOString();
              }
            } else {
              const todayCA = new Date().toLocaleDateString('en-CA');
              if (expenseDate === todayCA) {
                finalTimestamp = new Date().toISOString();
              } else {
                finalTimestamp = new Date(expenseDate + "T12:00:00").toISOString();
              }
            }

            // Save last used currency and clear form draft on successful submit
            localStorage.setItem("tracker_last_used_currency", currency);
            localStorage.removeItem("tracker_expense_draft");

            onSave({
              amount: val,
              currency,
              category,
              note: note.trim() || category,
              worthIt,
              location: "", // combined in notes
              tags,
              id: expenseToEdit?.id,
              spreadDays: (!expenseToEdit?.id && spreadExpense) ? days : 1,
              spreadStart: (!expenseToEdit?.id && spreadExpense) ? spreadStart : null,
              spreadEnd: (!expenseToEdit?.id && spreadExpense) ? spreadEnd : null,
              timestamp: !spreadExpense ? finalTimestamp : null
            });
          }}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            borderBottom: "2px solid #E5E7EB",
            paddingBottom: "8px"
          }}>
            <SearchableCurrencySelect
              value={currency}
              onChange={setCurrency}
              rates={rates}
              customCurrencies={customCurrencies}
              onAddCustomCurrency={onAddCustomCurrency}
              style={{ fontSize: "1.4rem", marginRight: "10px" }}
            />
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || parseFloat(val) >= 0) {
                  setAmount(val);
                }
              }}
              placeholder="0.00"
              autoFocus={true}
              style={{
                flex: 1,
                border: "none",
                fontSize: "2.4rem",
                fontWeight: 800,
                outline: "none",
                width: "100%",
                color: "#111827"
              }}
            />
            {onVoiceStart && (
              <button
                type="button"
                onClick={onVoiceStart}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-purple)",
                  cursor: "pointer",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(133, 58, 81, 0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <MicIcon />
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#4B5563",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>Notes</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Latte, Establishment name, overpriced, etc."
              style={{
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                fontSize: "16px",
                outline: "none"
              }}
            />
          </div>

          {!spreadExpense && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#4B5563",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>Date</label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  fontSize: "16px",
                  outline: "none",
                  backgroundColor: "white",
                  color: "#374151"
                }}
              />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#4B5563",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>Category</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "20px",
                    border: "1.5px solid",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    backgroundColor: category === cat ? CATEGORY_COLORS[cat] : "white",
                    borderColor: category === cat ? CATEGORY_COLORS[cat] : "#E5E7EB",
                    color: category === cat ? "white" : "#4B5563",
                    transition: "all 0.2s"
                  }}
                >
                  {CATEGORY_EMOJIS[cat]} {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#4B5563",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>Tags (comma/enter to add)</label>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginBottom: "4px"
            }}>
              {tags.map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.78rem",
                    backgroundColor: "#F3F4F6",
                    color: "#4B5563",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    fontWeight: 600
                  }}
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => removeTag(idx)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#9CA3AF",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      padding: 0
                    }}
                  >✕</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  const val = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
                  if (val && !tags.includes(val)) {
                    setTags([...tags, val]);
                  }
                  setTagInput("");
                }
              }}
              placeholder="e.g. coffee, fuel, activity, souvenirs, etc."
              style={{
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                fontSize: "16px",
                outline: "none"
              }}
            />
          </div>

          {!expenseToEdit?.id && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              padding: "14px",
              backgroundColor: "#EFF6FF",
              borderRadius: "12px",
              border: "1px solid #BFDBFE"
            }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                userSelect: "none"
              }}>
                <input
                  type="checkbox"
                  checked={spreadExpense}
                  onChange={(e) => setSpreadExpense(e.target.checked)}
                  style={{
                    width: "20px",
                    height: "20px",
                    accentColor: "#2563EB"
                  }}
                />
                <span style={{
                  fontSize: "0.95rem",
                  color: "#1E40AF",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  🗓️ Spread across multiple days
                </span>
              </label>
              {spreadExpense && (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginTop: "8px",
                  paddingLeft: "32px"
                }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "0.75rem", color: "#1E40AF", fontWeight: 700, textTransform: "uppercase" }}>Start Date</span>
                      <input
                        type="date"
                        value={spreadStart}
                        onChange={(e) => setSpreadStart(e.target.value)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid #BFDBFE",
                          outline: "none",
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "#1E40AF",
                          backgroundColor: "white",
                          width: "100%",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "0.75rem", color: "#1E40AF", fontWeight: 700, textTransform: "uppercase" }}>End Date</span>
                      <input
                        type="date"
                        value={spreadEnd}
                        onChange={(e) => setSpreadEnd(e.target.value)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid #BFDBFE",
                          outline: "none",
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "#1E40AF",
                          backgroundColor: "white",
                          width: "100%",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                  </div>
                  {(() => {
                    const start = new Date(spreadStart + "T00:00:00");
                    const end = new Date(spreadEnd + "T00:00:00");
                    if (!isNaN(start) && !isNaN(end) && end >= start) {
                      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                      const val = parseFloat(amount);
                      const dailyPortion = !isNaN(val) && val > 0 ? (val / days).toFixed(2) : "0.00";
                      return (
                        <div style={{
                          fontSize: "0.85rem",
                          color: "#1E40AF",
                          fontWeight: 600,
                          backgroundColor: "#DBEAFE",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          marginTop: "4px"
                        }}>
                          Spreading across <strong>{days} days</strong> ({dailyPortion} {currency} / day)
                        </div>
                      );
                    } else if (end < start) {
                      return (
                        <div style={{ fontSize: "0.8rem", color: "#DC2626", fontWeight: 600, marginTop: "4px" }}>
                          ⚠️ End date must be on or after start date.
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          )}

          <label style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px",
            backgroundColor: "#FFFBEB",
            borderRadius: "12px",
            cursor: "pointer"
          }}>
            <input
              type="checkbox"
              checked={worthIt}
              onChange={(e) => setWorthIt(e.target.checked)}
              style={{
                width: "20px",
                height: "20px",
                accentColor: "#F59E0B"
              }}
            />
            <span style={{
              fontSize: "0.95rem",
              color: "#92400E",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <StarIcon filled={worthIt} /> Mark as "Worth It"
            </span>
          </label>

          <div style={{
            display: "flex",
            gap: "8px",
            marginTop: "8px"
          }}>
            {expenseToEdit?.id && (
              <button
                type="button"
                onClick={() => onSave({ id: expenseToEdit.id, delete: true })}
                style={{
                  padding: "16px",
                  backgroundColor: "#FEE2E2",
                  color: "#EF4444",
                  borderRadius: "16px",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  flex: 1
                }}
              >
                Delete
              </button>
            )}
            <button
              type="submit"
              style={{
                padding: "16px",
                backgroundColor: "var(--color-purple)",
                color: "white",
                borderRadius: "16px",
                fontSize: "1.05rem",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(133, 58, 81, 0.2)",
                flex: 2
              }}
            >
              {expenseToEdit?.id ? "Save Changes" : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
}

// Newsletter email signup gate modal is defined below

// Modal popup acting as the Newsletter email signup gate
function SubscribeModal({ onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle', 'submitting', 'error'
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (email && email.trim()) {
      setStatus("submitting");
      setErrorMessage("");
      try {
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to subscribe. Please try again.");
        }
        setStatus("idle");
        onSuccess();
      } catch (err) {
        console.error("Subscription failed:", err);
        setStatus("error");
        setErrorMessage(err.message || "Something went wrong. Please check your connection.");
      }
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(15, 23, 42, 0.75)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2000,
      padding: "20px"
    }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "420px",
          padding: "32px 24px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          position: "relative",
          border: "1px solid rgba(229, 231, 235, 0.8)",
          textAlign: "center",
          animation: "fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "rgba(133, 58, 81, 0.08)",
          color: "var(--color-purple)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.8rem",
          margin: "0 auto 20px"
        }}>
          ✈️
        </div>

        <h2 style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "#1F2937",
          marginBottom: "8px"
        }}>
          Join the Trip Ledger
        </h2>

        <p style={{
          fontSize: "0.9rem",
          color: "#6B7280",
          lineHeight: "1.5",
          marginBottom: "24px"
        }}>
          Enter your email to unlock this trip, enable real-time co-editing, and receive travel updates from Lost & Sound.
        </p>

        <form onSubmit={handleSubscribe} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            type="email"
            required={true}
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "submitting"}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1px solid #D1D5DB",
              fontSize: "16px",
              outline: "none",
              transition: "border-color 0.2s",
              color: "#1F2937"
            }}
          />
          {status === "error" && (
            <div style={{
              color: "#E24E42",
              fontSize: "0.85rem",
              fontWeight: 500,
              textAlign: "left",
              marginTop: "-4px"
            }}>
              ⚠️ {errorMessage}
            </div>
          )}
          <button
            type="submit"
            disabled={status === "submitting"}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "var(--color-purple)",
              color: "white",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              opacity: status === "submitting" ? 0.7 : 1,
              transition: "opacity 0.2s",
              boxShadow: "0 4px 6px -1px rgba(133, 58, 81, 0.15)"
            }}
          >
            {status === "submitting" ? "Joining..." : "Subscribe & Unlock"}
          </button>
        </form>

        <button
          onClick={onClose}
          disabled={status === "submitting"}
          style={{
            marginTop: "16px",
            fontSize: "0.85rem",
            color: "#9CA3AF",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: 500,
            textDecoration: "underline"
          }}
        >
          Cancel (Go back offline)
        </button>

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}

function AuthModal({ onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  
  // OTP code verification states
  const [otpToken, setOtpToken] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleMagicLogin = async (e) => {
    e.preventDefault();
    if (!email || !supabase) return;
    setLoading(true);
    setError(null);
    try {
      const redirectToUrl = `${window.location.origin}/tracker`;
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: redirectToUrl
        }
      });
      if (err) throw err;
      setSent(true);
    } catch (err) {
      console.error("Magic link error:", err);
      setError(err.message || "Failed to send magic link. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otpToken || otpToken.length !== 6 || !supabase) return;
    setVerifying(true);
    setError(null);
    try {
      const { error: err } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otpToken.trim(),
        type: 'email'
      });
      if (err) throw err;
      onSuccess();
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.message || "Invalid or expired 6-digit code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      backdropFilter: "blur(4px)",
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "24px",
        padding: "32px 24px",
        width: "100%",
        maxWidth: "360px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        border: "1px solid #E5E7EB",
        textAlign: "center",
        animation: "fadeInUp 0.3s ease-out"
      }}>
        <h3 style={{
          fontSize: "1.3rem",
          fontWeight: 800,
          color: "var(--color-purple)",
          marginBottom: "12px",
          fontFamily: "var(--font-heading)"
        }}>
          {sent ? "Check Your Email!" : "Save & Sync Your Trip"}
        </h3>
        
        {sent ? (
          <div>
            <p style={{
              fontSize: "0.85rem",
              color: "#4B5563",
              lineHeight: "1.5",
              marginBottom: "16px"
            }}>
              We sent a secure magic login link and code to <strong>{email}</strong>.
            </p>
            <p style={{
              fontSize: "0.82rem",
              color: "#6B7280",
              marginBottom: "16px",
              lineHeight: "1.4"
            }}>
              Click the link in your email, or enter the <strong>6-digit verification code</strong> below to log in directly:
            </p>
            
            <form onSubmit={handleOtpVerify} style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              <input
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                required
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="123456"
                maxLength={6}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1.5px solid #E5E7EB",
                  fontSize: "1.2rem",
                  letterSpacing: "4px",
                  outline: "none",
                  textAlign: "center",
                  fontWeight: 800,
                  color: "#1F2937"
                }}
              />
              {error && (
                <p style={{
                  color: "#EF4444",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  margin: "0 0 8px 0"
                }}>{error}</p>
              )}
              <button
                type="submit"
                disabled={verifying}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  padding: "12px",
                  fontWeight: 700
                }}
              >
                {verifying ? "Verifying..." : "Verify Code"}
              </button>
            </form>

            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "#9CA3AF",
                fontSize: "0.85rem",
                cursor: "pointer",
                padding: "8px"
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <form onSubmit={handleMagicLogin}>
            <p style={{
              fontSize: "0.85rem",
              color: "#6B7280",
              lineHeight: "1.5",
              marginBottom: "20px"
            }}>
              Sign in with your email to enable cloud sync, share co-editing links, and travel offline seamlessly.
            </p>
            
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1.5px solid #E5E7EB",
                fontSize: "0.9rem",
                outline: "none",
                marginBottom: "16px",
                textAlign: "center",
                color: "#1F2937"
              }}
            />

            {error && (
              <p style={{
                color: "#EF4444",
                fontSize: "0.8rem",
                fontWeight: 500,
                marginBottom: "16px"
              }}>{error}</p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  padding: "12px",
                  fontWeight: 700
                }}
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9CA3AF",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  padding: "8px"
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function CollaboratorsModal({ tripId, onClose }) {
  const [email, setEmail] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (tripId) {
      fetchMembers();
    }
  }, [tripId]);

  const fetchMembers = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("trip_members")
        .select("*")
        .eq("trip_id", tripId);
      if (error) throw error;
      setMembers(data);
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email || !supabase || !tripId) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const { error: inviteErr } = await supabase
        .from("trip_members")
        .insert({
          trip_id: tripId,
          email: email.trim().toLowerCase(),
          role: "editor"
        });
      if (inviteErr) throw inviteErr;
      setSuccess(true);
      setEmail("");
      fetchMembers();
    } catch (err) {
      console.error("Invite error:", err);
      setError(err.message || "Failed to invite partner.");
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      const link = `${window.location.origin}/tracker/trip/${tripId}`;
      navigator.clipboard.writeText(link);
      alert("Share link copied! Send it to your travel partner so they can access the trip.");
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      backdropFilter: "blur(4px)",
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "24px",
        padding: "32px 24px",
        width: "100%",
        maxWidth: "380px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        border: "1px solid #E5E7EB",
        textAlign: "left",
        animation: "fadeInUp 0.3s ease-out"
      }}>
        <h3 style={{
          fontSize: "1.2rem",
          fontWeight: 800,
          color: "var(--color-purple)",
          marginBottom: "16px",
          textAlign: "center",
          fontFamily: "var(--font-heading)"
        }}>
          Share & Collaborate
        </h3>

        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={copyShareLink}
            className="btn btn-primary"
            style={{
              width: "100%",
              borderRadius: "12px",
              padding: "10px",
              fontSize: "0.85rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            🔗 Copy Private Invite Link
          </button>
        </div>

        <form onSubmit={handleInvite} style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#4B5563", marginBottom: "6px" }}>
            Add Travel Partner (Email)
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@travel.com"
              required
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "10px",
                border: "1px solid #E5E7EB",
                fontSize: "0.85rem",
                outline: "none",
                color: "#1F2937"
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                borderRadius: "10px",
                padding: "8px 16px",
                fontSize: "0.85rem"
              }}
            >
              {loading ? "Inviting..." : "Invite"}
            </button>
          </div>
          {success && <p style={{ color: "#10B981", fontSize: "0.8rem", marginTop: "6px", fontWeight: 500 }}>Partner added to editor list!</p>}
          {error && <p style={{ color: "#EF4444", fontSize: "0.8rem", marginTop: "6px", fontWeight: 500 }}>{error}</p>}
        </form>

        <div style={{ maxHeight: "150px", overflowY: "auto", marginBottom: "20px" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#4B5563", marginBottom: "8px" }}>Members</p>
          {members.map(m => (
            <div key={m.id} style={{ display: "flex", justifycontent: "space-between", fontSize: "0.8rem", padding: "6px 0", borderBottom: "1px solid #F3F4F6" }}>
              <span style={{ color: "#374151" }}>{m.email}</span>
              <span style={{ fontWeight: 600, color: "var(--color-purple)", textTransform: "capitalize" }}>{m.role}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            background: "transparent",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            padding: "10px",
            fontSize: "0.85rem",
            color: "#6B7280",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

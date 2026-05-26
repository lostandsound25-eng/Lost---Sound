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

const CameraIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
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
  const [historyViewMode, setHistoryViewMode] = useState("cards"); // 'cards' or 'spreadsheet'
  const [drillDownExpenses, setDrillDownExpenses] = useState(null);

  const getDrillDownList = () => {
    if (!drillDownExpenses) return [];
    const { tag, dateKey, category, list } = drillDownExpenses;
    const nowLimit = new Date();
    if (tag) {
      return expenses.filter(e => {
        const cleanTags = e.tags ? e.tags.filter(t => !t.startsWith("spread-")) : [];
        return cleanTags.includes(tag) && new Date(e.timestamp) <= nowLimit;
      });
    }
    if (dateKey) {
      return expenses.filter(e => {
        const d = new Date(e.timestamp);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const matchesDate = k === dateKey && d <= nowLimit;
        if (!matchesDate) return false;
        if (category && category !== "ALL") {
          return e.category === category;
        }
        return true;
      });
    }
    return list || [];
  };
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
  const [showAllTags, setShowAllTags] = useState(false);
  const [isEditingLocale, setIsEditingLocale] = useState(false);
  const [localeSearchQuery, setLocaleSearchQuery] = useState("");
  const [localeResults, setLocaleResults] = useState([]);

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
      const cacheExpenses = localStorage.getItem(`tracker_expenses_${tripId}`);
      if (cacheTrip) {
        setTrip(JSON.parse(cacheTrip));
        if (cacheExpenses) {
          setExpenses(JSON.parse(cacheExpenses));
        }
        setIsMounted(true);
      }

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
    setIsSyncing(true);
    const queue = [...syncQueue];
    let successCount = 0;

    try {
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
    } finally {
      setIsSyncing(false);
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
              locationLocale: newRow.location_locale || "",
              tags: newRow.tags || [],
              photoUrl: newRow.photo_url || ""
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
              locationLocale: newRow.location_locale || "",
              tags: newRow.tags || [],
              photoUrl: newRow.photo_url || ""
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
          created_at: e.timestamp,
          photo_url: e.photoUrl || null
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

  const fetchLatestRates = async (force = false) => {
    const lastUpdated = localStorage.getItem("tracker_rates_last_updated");
    const now = Date.now();
    // 3 hours cache time
    if (!force && lastUpdated && (now - parseInt(lastUpdated, 10) < 3 * 60 * 60 * 1000)) {
      return;
    }
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
          localStorage.setItem("tracker_rates_last_updated", now.toString());
          return merged;
        });
      }
    } catch (e) {
      console.error("Error fetching latest rates:", e);
    }
  };

  const handleAutoSubscribe = async (userEmail) => {
    if (!userEmail) return;
    const cacheKey = `tracker_subscribed_${userEmail}`;
    if (localStorage.getItem(cacheKey) === "true") return;

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: userEmail })
      });
      if (res.ok) {
        localStorage.setItem(cacheKey, "true");
        console.log("Automatically subscribed collaborator to mailer list:", userEmail);
      }
    } catch (err) {
      console.error("Auto-subscribe error:", err);
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
        locationLocale: e.location_locale || "",
        tags: e.tags || [],
        photoUrl: e.photo_url || ""
      }));
      setExpenses(mappedExpenses);

      localStorage.setItem(`tracker_trip_${tripId}`, JSON.stringify(newTrip));
      localStorage.setItem(`tracker_expenses_${tripId}`, JSON.stringify(mappedExpenses));
      
      // Auto-subscribe to mailer list on successful trip load
      const { data: { session: currentSess } } = await supabase.auth.getSession();
      if (currentSess?.user?.email) {
        handleAutoSubscribe(currentSess.user.email);
      }
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

  const searchLocaleNominatim = async (query) => {
    if (!query || query.trim().length < 2) {
      setLocaleResults([]);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setLocaleResults(data.map(item => ({
          display_name: item.display_name,
          name: item.name || item.display_name.split(",")[0]
        })));
      }
    } catch (err) {
      console.error("Error searching locale:", err);
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
      if (expense.deleteEntireGroup && expense.groupTag) {
        const siblings = expenses.filter(e => e.tags && e.tags.includes(expense.groupTag));
        const siblingIds = siblings.map(s => s.id);
        setExpenses((prev) => prev.filter((e) => !siblingIds.includes(e.id)));
        if (!isDemo && tripId) {
          siblings.forEach(s => {
            performCloudAction("delete", { id: s.id });
          });
        }
      } else {
        setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
        if (!isDemo && tripId) {
          performCloudAction("delete", { id: expense.id });
        }
      }
      setActiveModal(null);
      setEditingExpense(null);
      return;
    }

    if (expense.id) {
      if (expense.editEntireGroup && expense.groupTag) {
        // 1. Find all sibling expenses in the group
        const siblings = expenses.filter(e => e.tags && e.tags.includes(expense.groupTag));
        const siblingIds = siblings.map(s => s.id);

        // 2. Delete them from state and cloud database
        setExpenses((prev) => prev.filter((e) => !siblingIds.includes(e.id)));
        if (!isDemo && tripId) {
          siblings.forEach(s => {
            performCloudAction("delete", { id: s.id });
          });
        }

        // 3. Re-generate new expenses for the new range/amount
        const newGroupTag = expense.groupTag;
        const N = expense.spreadDays;
        const totalAmount = expense.amount;
        const isRepeat = expense.spreadMode === "repeat";
        const dailyAmount = isRepeat ? totalAmount : parseFloat((totalAmount / N).toFixed(2));
        const remainder = isRepeat ? 0 : parseFloat((totalAmount - dailyAmount * N).toFixed(2));

        const newExpenses = [];
        const dbInserts = [];
        const startD = expense.spreadStart ? new Date(expense.spreadStart + "T00:00:00") : new Date();

        const baseTags = expense.tags.filter(t => !t.startsWith("spread-"));
        const finalLocation = expense.location || "";
        const finalLocale = trip.currentLocation || "";

        for (let i = 0; i < N; i++) {
          const amt = isRepeat ? totalAmount : ((i === N - 1) ? parseFloat((dailyAmount + remainder).toFixed(2)) : dailyAmount);
          const newId = crypto.randomUUID ? crypto.randomUUID() : (Date.now() + i).toString();
          
          const d = new Date(startD);
          d.setDate(d.getDate() + i);
          const timestamp = d.toISOString();

          const startStr = expense.spreadStart ? new Date(expense.spreadStart + "T00:00:00").toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "";
          const endStr = expense.spreadEnd ? new Date(expense.spreadEnd + "T00:00:00").toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "";
          const baseNote = expense.note || expense.category;
          const cleanBaseNote = baseNote.replace(/\s*\(Day\s+\d+\/\d+.*\)$/, "");

          const noteWithSuffix = startStr && endStr 
            ? `${cleanBaseNote} (Day ${i + 1}/${N}, ${startStr} - ${endStr})` 
            : `${cleanBaseNote} (Day ${i + 1}/${N})`;

          const entryTags = [
            ...baseTags,
            newGroupTag,
            `spread-mode-${expense.spreadMode}`,
            `spread-start-${expense.spreadStart}`,
            `spread-end-${expense.spreadEnd}`,
            `spread-amount-${expense.amount}`
          ];

          const singleExpense = {
            amount: amt,
            currency: expense.currency,
            category: expense.category,
            note: noteWithSuffix,
            worthIt: expense.worthIt,
            location: finalLocation,
            locationLocale: finalLocale,
            tags: entryTags,
            id: newId,
            timestamp: timestamp,
            photoUrl: expense.photoUrl || ""
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
              location_locale: singleExpense.locationLocale,
              tags: singleExpense.tags,
              trip_id: tripId,
              photo_url: singleExpense.photoUrl || null
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
        const baseTags = expense.tags.filter(t => !t.startsWith("spread-"));
        const cleanNote = expense.note.replace(/\s*\(Day\s+\d+\/\d+.*\)$/, "");
        
        const finalLocation = expense.location || "";
        const finalLocale = editingExpense?.locationLocale || trip.currentLocation || "";

        const updatedExpense = {
          ...expense,
          note: cleanNote,
          tags: baseTags,
          location: finalLocation,
          locationLocale: finalLocale,
          timestamp: expense.timestamp || editingExpense?.timestamp,
          photoUrl: expense.photoUrl !== undefined ? expense.photoUrl : (editingExpense?.photoUrl || "")
        };

        setExpenses((prev) => prev.map((e) => (e.id === expense.id ? { ...e, ...updatedExpense } : e)));

        if (!isDemo && tripId) {
          performCloudAction("update", {
            id: expense.id,
            amount: expense.amount,
            currency: expense.currency,
            category: expense.category,
            note: updatedExpense.note,
            worth_it: expense.worthIt,
            location: finalLocation,
            location_locale: finalLocale,
            tags: updatedExpense.tags,
            created_at: expense.timestamp || editingExpense?.timestamp,
            updated_at: new Date().toISOString(),
            photo_url: updatedExpense.photoUrl || null
          });
        }
      }
    } else {
      // Insert
      const finalLocation = expense.location || "";
      const finalLocale = trip.currentLocation || "";

      if (expense.spreadDays && expense.spreadDays > 1) {
        const N = expense.spreadDays;
        const totalAmount = expense.amount;
        const isRepeat = expense.spreadMode === "repeat";
        const dailyAmount = isRepeat ? totalAmount : parseFloat((totalAmount / N).toFixed(2));
        const remainder = isRepeat ? 0 : parseFloat((totalAmount - dailyAmount * N).toFixed(2));

        const newExpenses = [];
        const dbInserts = [];

        const startD = expense.spreadStart ? new Date(expense.spreadStart + "T00:00:00") : new Date();
        const groupUuid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        const groupTag = `spread-group-${groupUuid}`;

        const baseTags = expense.tags.filter(t => !t.startsWith("spread-"));

        for (let i = 0; i < N; i++) {
          const amt = isRepeat ? totalAmount : ((i === N - 1) ? parseFloat((dailyAmount + remainder).toFixed(2)) : dailyAmount);
          const newId = crypto.randomUUID ? crypto.randomUUID() : (Date.now() + i).toString();
          
          const d = new Date(startD);
          d.setDate(d.getDate() + i);
          const timestamp = d.toISOString();

          const startStr = expense.spreadStart ? new Date(expense.spreadStart + "T00:00:00").toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "";
          const endStr = expense.spreadEnd ? new Date(expense.spreadEnd + "T00:00:00").toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "";
          const baseNote = expense.note || expense.category;
          const noteWithSuffix = startStr && endStr 
            ? `${baseNote} (Day ${i + 1}/${N}, ${startStr} - ${endStr})` 
            : `${baseNote} (Day ${i + 1}/${N})`;

          const entryTags = [
            ...baseTags,
            groupTag,
            `spread-mode-${expense.spreadMode}`,
            `spread-start-${expense.spreadStart}`,
            `spread-end-${expense.spreadEnd}`,
            `spread-amount-${expense.amount}`
          ];

          const singleExpense = {
            amount: amt,
            currency: expense.currency,
            category: expense.category,
            note: noteWithSuffix,
            worthIt: expense.worthIt,
            location: finalLocation,
            locationLocale: finalLocale,
            tags: entryTags,
            id: newId,
            timestamp: timestamp,
            photoUrl: expense.photoUrl || ""
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
              location_locale: singleExpense.locationLocale,
              tags: singleExpense.tags,
              trip_id: tripId,
              photo_url: singleExpense.photoUrl || null
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
          locationLocale: finalLocale,
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
            location_locale: newExpense.locationLocale,
            tags: newExpense.tags,
            trip_id: tripId,
            photo_url: newExpense.photoUrl || null
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

  const renderInsights = () => {
    if (visibleExpenses.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#9CA3AF" }}>
          <p style={{ fontSize: "1rem", fontWeight: 600 }}>No data to generate insights.</p>
          <p style={{ fontSize: "0.85rem", marginTop: "6px" }}>Add some expenses to see a breakdown of your spending!</p>
        </div>
      );
    }

    // Calculations
    const categoryTotals = CATEGORIES.map((cat) => {
      const catExpenses = visibleExpenses.filter((e) => e.category === cat);
      const catTotal = catExpenses.reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, trip.homeCurrency, rates), 0);
      return { cat, total: catTotal };
    });
    const sortedCategories = [...categoryTotals].sort((a, b) => b.total - a.total);
    const topCategory = sortedCategories[0];

    const daySpends = {};
    visibleExpenses.forEach((e) => {
      const dStr = new Date(e.timestamp).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' });
      const amt = convertCurrency(e.amount, e.currency, trip.homeCurrency, rates);
      daySpends[dStr] = (daySpends[dStr] || 0) + amt;
    });
    let maxDayStr = "-";
    let maxDayAmt = 0;
    Object.entries(daySpends).forEach(([day, total]) => {
      if (total > maxDayAmt) {
        maxDayAmt = total;
        maxDayStr = day;
      }
    });

    const tagSpends = {};
    const tagExpenses = {};
    visibleExpenses.forEach((e) => {
      const amt = convertCurrency(e.amount, e.currency, trip.homeCurrency, rates);
      const cleanTags = e.tags ? e.tags.filter(t => !t.startsWith("spread-")) : [];
      cleanTags.forEach((tag) => {
        tagSpends[tag] = (tagSpends[tag] || 0) + amt;
        if (!tagExpenses[tag]) tagExpenses[tag] = [];
        tagExpenses[tag].push(e);
      });
    });
    const sortedTags = Object.entries(tagSpends)
      .map(([tag, spend]) => ({ tag, spend }))
      .sort((a, b) => b.spend - a.spend);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px", animation: "fadeInUp 0.25s ease-out" }}>
        {/* Main Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {/* Card 1: Total Spend */}
          <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "16px", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
            <span style={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Spend</span>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--color-purple)", marginTop: "4px", marginBottom: "2px" }}>
              {formatMoney(allExpensesTotal, trip.homeCurrency)}
            </h3>
            <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>across {daysActive} days</span>
          </div>

          {/* Card 2: Daily Average */}
          <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "16px", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
            <span style={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Daily Average</span>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--color-orange)", marginTop: "4px", marginBottom: "2px" }}>
              {formatMoney(allExpensesTotal / daysActive, trip.homeCurrency)}
            </h3>
            <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>per day average</span>
          </div>

          {/* Card 3: Top Category */}
          <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "16px", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
            <span style={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Top Category</span>
            <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "#374151", marginTop: "4px", marginBottom: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
              {topCategory && topCategory.total > 0 ? (
                <>
                  <span>{CATEGORY_EMOJIS[topCategory.cat]}</span>
                  <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {topCategory.cat === "Accommodation" ? "Stay" : topCategory.cat === "Transportation" ? "Transit" : topCategory.cat === "Food & Drink" ? "Food" : "Other"}
                  </span>
                </>
              ) : "-"}
            </h4>
            <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>
              {topCategory && topCategory.total > 0 ? formatMoney(topCategory.total, trip.homeCurrency) : ""}
            </span>
          </div>

          {/* Card 4: Most Expensive Day */}
          <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "16px", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
            <span style={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Peak Day</span>
            <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#374151", marginTop: "4px", marginBottom: "2px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
              {maxDayStr}
            </h4>
            <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>
              {maxDayAmt > 0 ? formatMoney(maxDayAmt, trip.homeCurrency) : "-"}
            </span>
          </div>
        </div>

        {/* Category Breakdown list */}
        <div style={{ backgroundColor: "white", padding: "18px 16px", borderRadius: "20px", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
          <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--color-purple)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "14px" }}>
            Category Breakdown
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {sortedCategories.map((item) => {
              const pct = allExpensesTotal > 0 ? (item.total / allExpensesTotal) * 100 : 0;
              const shortLabels = {
                "Accommodation": "Stay",
                "Transportation": "Transit",
                "Food & Drink": "Food",
                "Everything Else": "Other"
              };
              const label = shortLabels[item.cat] || item.cat;
              return (
                <div key={item.cat} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, color: "#4B5563" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span>{CATEGORY_EMOJIS[item.cat]}</span>
                      <span>{label}</span>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span>{formatMoney(item.total, trip.homeCurrency)}</span>
                      <span style={{ color: "#9CA3AF", fontWeight: 500 }}>({pct.toFixed(0)}%)</span>
                    </div>
                  </div>
                  {/* Progress bar background */}
                  <div style={{ height: "8px", borderRadius: "4px", backgroundColor: "#F3F4F6", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      borderRadius: "4px",
                      backgroundColor: CATEGORY_COLORS[item.cat] || "#9CA3AF",
                      width: `${pct}%`,
                      transition: "width 0.5s ease"
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tag Spend Breakdown */}
        <div style={{ backgroundColor: "white", padding: "18px 16px", borderRadius: "20px", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.01)", marginBottom: "12px" }}>
          <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--color-purple)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "14px" }}>
            Spend by Tags (#)
          </h4>
          {sortedTags.length === 0 ? (
            <p style={{ fontSize: "0.8rem", color: "#9CA3AF", textAlign: "center", padding: "10px 0" }}>
              No hashtags found. Add #tag in your expense titles to track specific items (e.g. #coffee, #scooter).
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {sortedTags.slice(0, showAllTags ? sortedTags.length : 5).map((item) => {
                const pct = allExpensesTotal > 0 ? (item.spend / allExpensesTotal) * 100 : 0;
                return (
                  <div 
                    key={item.tag} 
                    onClick={() => setDrillDownExpenses({
                      title: `Expenses for #${item.tag}`,
                      tag: item.tag
                    })}
                    style={{ display: "flex", flexDirection: "column", gap: "4px", cursor: "pointer" }}
                    title="Click to view transactions"
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, color: "#4B5563" }}>
                      <span style={{ color: "var(--color-purple)" }}>#{item.tag}</span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <span>{formatMoney(item.spend, trip.homeCurrency)}</span>
                        <span style={{ color: "#9CA3AF", fontWeight: 500 }}>({pct.toFixed(0)}%)</span>
                      </div>
                    </div>
                    {/* Progress bar background */}
                    <div style={{ height: "8px", borderRadius: "4px", backgroundColor: "#F3F4F6", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        borderRadius: "4px",
                        backgroundColor: "var(--color-orange)",
                        width: `${pct}%`,
                        transition: "width 0.5s ease"
                      }} />
                    </div>
                  </div>
                );
              })}
              {sortedTags.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllTags(!showAllTags)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "var(--color-purple)",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    padding: "8px 0 4px",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px"
                  }}
                >
                  {showAllTags ? "Show Less ▲" : `Load More (${sortedTags.length - 5} more) ▼`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const nameLength = trip.name ? trip.name.length : 0;
  const dynamicFontSize = nameLength > 24 
    ? "1.1rem" 
    : nameLength > 18 
      ? "1.25rem" 
      : nameLength > 12 
        ? "1.4rem" 
        : "1.6rem";

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
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    <button
                      onClick={handleSaveSyncClick}
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        color: "white",
                        backgroundColor: "var(--color-orange)",
                        border: "none",
                        borderRadius: "10px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        boxShadow: "0 2px 6px rgba(232, 107, 50, 0.2)"
                      }}
                    >
                      ☁️ Save & Sync
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    <button
                      onClick={() => setActiveModal("collaborators")}
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        color: "var(--color-purple)",
                        backgroundColor: "rgba(133, 58, 81, 0.08)",
                        border: "none",
                        borderRadius: "10px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      👥 Share
                    </button>
                    {(() => {
                      let statusText = "Synced";
                      let statusEmoji = "🟢";
                      let badgeColor = "#10B981";
                      let badgeBg = "#ECFDF5";
                      let glow = "0 0 4px rgba(16, 185, 129, 0.25)";
                      
                      if (!isOnline) {
                        statusText = "Offline";
                        statusEmoji = "✈️";
                        badgeColor = "#D97706";
                        badgeBg = "#FEF3C7";
                        glow = "0 0 4px rgba(217, 119, 6, 0.25)";
                      } else if (isSyncing || syncQueue.length > 0) {
                        statusText = "Syncing...";
                        statusEmoji = "🔄";
                        badgeColor = "#2563EB";
                        badgeBg = "#EFF6FF";
                        glow = "0 0 4px rgba(37, 99, 235, 0.25)";
                      }
                      
                      return (
                        <span style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: badgeColor,
                          backgroundColor: badgeBg,
                          padding: "3px 6px",
                          borderRadius: "10px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "2px",
                          boxShadow: glow,
                          transition: "all 0.3s ease"
                        }}>
                          {statusEmoji} {statusText}
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main Stats container */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            marginTop: "12px"
          }}>
            {/* Today Total & Daily Average side by side */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              padding: "0 12px"
            }}>
              {/* Today */}
              <div 
                onClick={() => setTodaySectionExpanded(!todaySectionExpanded)}
                style={{
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  backgroundColor: todaySectionExpanded ? "rgba(133, 58, 81, 0.05)" : "transparent",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1
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
                <span style={{
                  fontSize: "0.72rem",
                  color: "#6B7280",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "2px"
                }}>
                  Today
                  <span style={{
                    fontSize: "0.6rem",
                    color: "#9CA3AF",
                    transform: todaySectionExpanded ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                    display: "inline-block"
                  }}>▼</span>
                </span>
                <h1 style={{
                  fontSize: "2.4rem",
                  fontWeight: 900,
                  color: "#111827",
                  lineHeight: 1.1,
                  margin: 0,
                  fontFamily: "var(--font-heading)"
                }}>
                  {formatMoney(todayTotal, trip.homeCurrency)}
                </h1>
              </div>

              {/* Daily Average */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                flex: 1
              }}>
                <span style={{
                  fontSize: "0.72rem",
                  color: "#6B7280",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "2px"
                }}>
                  Daily Avg ({daysActive}d)
                </span>
                <p style={{
                  fontSize: "1.25rem",
                  fontWeight: 900,
                  color: "var(--color-purple)",
                  fontFamily: "var(--font-heading)",
                  margin: 0,
                  lineHeight: 1.1
                }}>
                  {formatMoney(allExpensesTotal / daysActive, trip.homeCurrency)}
                </p>
              </div>
            </div>

            {/* Town/City Locale search field underneath */}
            <div style={{ padding: "0 20px" }}>
              {!isEditingLocale ? (
                <div 
                  onClick={() => {
                    setLocaleSearchQuery(trip.currentLocation || "");
                    setIsEditingLocale(true);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.82rem",
                    color: "#6B7280",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                  title="Tap to change locale"
                >
                  <span>📍 {trip.currentLocation || "Where are you today?"}</span>
                  <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>✏️</span>
                </div>
              ) : (
                <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <input
                      type="text"
                      value={localeSearchQuery}
                      onChange={(e) => {
                        setLocaleSearchQuery(e.target.value);
                        searchLocaleNominatim(e.target.value);
                      }}
                      placeholder="Search town/city..."
                      autoFocus
                      style={{
                        flex: 1,
                        padding: "4px 8px",
                        borderRadius: "10px",
                        border: "1.5px solid var(--color-purple)",
                        fontSize: "0.8rem",
                        outline: "none",
                        color: "#374151"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingLocale(false);
                        setLocaleSearchQuery("");
                        setLocaleResults([]);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#EF4444",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        fontWeight: 700
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  {localeResults.length > 0 && (
                    <div style={{
                      position: "absolute",
                      top: "32px",
                      left: 0,
                      right: 0,
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: "10px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      zIndex: 100,
                      maxHeight: "150px",
                      overflowY: "auto"
                    }}>
                      {localeResults.map((res, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            updateLocation(res.name);
                            setIsEditingLocale(false);
                            setLocaleSearchQuery("");
                            setLocaleResults([]);
                          }}
                          style={{
                            padding: "8px 12px",
                            fontSize: "0.8rem",
                            borderBottom: idx === localeResults.length - 1 ? "none" : "1px solid #F3F4F6",
                            cursor: "pointer",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            color: "#374151"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F9FAFB"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <strong>{res.name}</strong> <span style={{ color: "#9CA3AF", fontSize: "0.7rem" }}>({res.display_name})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
                    <button
                      type="button"
                      onClick={() => setLogView("insights")}
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: logView === "insights" ? 700 : 500,
                        color: logView === "insights" ? "var(--color-purple)" : "#6B7280",
                        backgroundColor: logView === "insights" ? "white" : "transparent",
                        border: "none",
                        borderRadius: "6px",
                        padding: "5px 14px",
                        cursor: "pointer",
                        boxShadow: logView === "insights" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                        transition: "all 0.15s"
                      }}
                    >
                      Insights
                    </button>
                  </div>

                  {/* Future filter toggle */}
                  {hasFutureExpenses && logView !== "insights" && (
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

                {/* History Mode Selector */}
                {logView === "history" && (
                  <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: "12px",
                    gap: "6px"
                  }}>
                    <button
                      type="button"
                      onClick={() => setHistoryViewMode("cards")}
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: historyViewMode === "cards" ? 700 : 500,
                        color: historyViewMode === "cards" ? "white" : "#6B7280",
                        backgroundColor: historyViewMode === "cards" ? "var(--color-purple)" : "rgba(133, 58, 81, 0.05)",
                        border: "none",
                        borderRadius: "16px",
                        padding: "4px 12px",
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                    >
                      🗂️ Cards
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryViewMode("spreadsheet")}
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: historyViewMode === "spreadsheet" ? 700 : 500,
                        color: historyViewMode === "spreadsheet" ? "white" : "#6B7280",
                        backgroundColor: historyViewMode === "spreadsheet" ? "var(--color-purple)" : "rgba(133, 58, 81, 0.05)",
                        border: "none",
                        borderRadius: "16px",
                        padding: "4px 12px",
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                    >
                      📊 Spreadsheet
                    </button>
                  </div>
                )}

                {/* Search Input Box */}
                {logView !== "insights" && (
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
                )}

                {logView !== "insights" && displayedExpenses.length === 0 ? (
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
                      if (logView === "insights") {
                        return renderInsights();
                      }

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
                                  const dayLocation = sameDayExpenses.map(e => e.locationLocale || (e.location ? (e.location.split(" | ")[1] || "") : "")).find(loc => loc) || "";

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
                              locationsList: []
                            };
                          }

                          const amtInHome = convertCurrency(exp.amount, exp.currency, trip.homeCurrency, rates);
                          olderGroups[dateKey].totalSpend += amtInHome;

                          if (!olderGroups[dateKey].categories[exp.category]) {
                            olderGroups[dateKey].categories[exp.category] = { total: 0, list: [] };
                          }
                          olderGroups[dateKey].categories[exp.category].total += amtInHome;
                          olderGroups[dateKey].categories[exp.category].list.push(exp);

                          const highLevelLoc = exp.locationLocale || (exp.location ? (exp.location.split(" | ")[1] || exp.location.split(" | ")[0] || "") : "");
                          if (highLevelLoc && !olderGroups[dateKey].locationsList.includes(highLevelLoc)) {
                            olderGroups[dateKey].locationsList.push(highLevelLoc);
                          }
                        });

                        // Set backward compatible single location for card rendering
                        Object.keys(olderGroups).forEach(k => {
                          olderGroups[k].location = olderGroups[k].locationsList[0] || "";
                        });

                        const olderGroupsArray = Object.values(olderGroups).sort((a, b) => b.dateKey.localeCompare(a.dateKey));

                        if (olderGroupsArray.length === 0) {
                          return (
                            <div style={{ textAlign: "center", padding: "40px 0", color: "#9CA3AF" }}>
                              <p style={{ fontSize: "1rem", fontWeight: 500 }}>No history yet.</p>
                            </div>
                          );
                        }

                        if (historyViewMode === "spreadsheet") {
                          const renderCell = (group, cat, label) => {
                            const catData = group.categories[cat];
                            const amt = catData ? catData.total : 0;
                            
                            if (amt === 0) {
                              return (
                                <td style={{ padding: "12px 12px", textAlign: "right", color: "#D1D5DB" }}>
                                  -
                                </td>
                              );
                            }
                            
                            return (
                              <td 
                                onClick={() => setDrillDownExpenses({
                                  title: `${label} on ${group.dateDisplay}`,
                                  dateKey: group.dateKey,
                                  category: cat
                                })}
                                style={{ 
                                  padding: "12px 12px", 
                                  textAlign: "right", 
                                  fontWeight: 700, 
                                  color: CATEGORY_COLORS[cat] || "var(--color-purple)",
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                  textDecorationStyle: "dotted",
                                  textUnderlineOffset: "3px"
                                }}
                                title="Click to view details"
                              >
                                {formatMoney(amt, trip.homeCurrency)}
                              </td>
                            );
                          };

                          return (
                            <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "10px" }}>
                              <div style={{ fontSize: "0.75rem", color: "#6B7280", display: "flex", alignItems: "center", gap: "4px", padding: "0 4px" }}>
                                <span>💡 Scroll horizontally. Tap underlined amounts to drill down.</span>
                              </div>
                              <div style={{
                                width: "100%",
                                overflowX: "auto",
                                borderRadius: "16px",
                                border: "1.5px solid #E5E7EB",
                                backgroundColor: "white",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.01)",
                                WebkitOverflowScrolling: "touch"
                              }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "550px", fontSize: "0.82rem", textAlign: "left" }}>
                                  <thead>
                                    <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                                      <th style={{ padding: "10px 12px", fontWeight: 700, color: "#4B5563" }}>Date</th>
                                      <th style={{ padding: "10px 12px", fontWeight: 700, color: "#4B5563" }}>Location(s)</th>
                                      <th style={{ padding: "10px 12px", fontWeight: 700, color: "#4B5563", textAlign: "right" }}>Stay</th>
                                      <th style={{ padding: "10px 12px", fontWeight: 700, color: "#4B5563", textAlign: "right" }}>Transit</th>
                                      <th style={{ padding: "10px 12px", fontWeight: 700, color: "#4B5563", textAlign: "right" }}>Food</th>
                                      <th style={{ padding: "10px 12px", fontWeight: 700, color: "#4B5563", textAlign: "right" }}>Other</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {olderGroupsArray.map((group) => {
                                      const locString = group.locationsList.map(loc => `📍 ${loc}`).join(" ") || "-";
                                      return (
                                        <tr key={group.dateKey} style={{ borderBottom: "1px solid #F3F4F6", transition: "background-color 0.15s" }}>
                                          <td 
                                            onClick={() => setDrillDownExpenses({
                                              title: `Expenses on ${group.dateDisplay}`,
                                              dateKey: group.dateKey,
                                              category: "ALL"
                                            })}
                                            style={{ 
                                              padding: "12px 12px", 
                                              fontWeight: 700, 
                                              color: "#374151",
                                              cursor: "pointer",
                                              textDecoration: "underline",
                                              textDecorationStyle: "dotted",
                                              textUnderlineOffset: "3px",
                                              whiteSpace: "nowrap"
                                            }}
                                            title="Click to view all expenses"
                                          >
                                            {group.dateDisplay}
                                          </td>
                                          <td style={{ 
                                            padding: "12px 12px", 
                                            color: group.locationsList.length > 0 ? "var(--color-orange)" : "#9CA3AF", 
                                            fontWeight: group.locationsList.length > 0 ? 600 : 400,
                                            maxWidth: "180px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                          }}>
                                            {locString}
                                          </td>
                                          {renderCell(group, "Accommodation", "Stay")}
                                          {renderCell(group, "Transportation", "Transit")}
                                          {renderCell(group, "Food & Drink", "Food")}
                                          {renderCell(group, "Everything Else", "Other")}
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
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
          expenses={expenses}
          onRefreshRates={() => fetchLatestRates(true)}
        />
      )}

      {drillDownExpenses && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 1500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        }}
        onClick={() => setDrillDownExpenses(null)}
        >
          <div style={{
            backgroundColor: "white",
            borderRadius: "24px",
            width: "100%",
            maxWidth: "420px",
            maxHeight: "85vh",
            maxHeight: "85dvh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            border: "1px solid #E5E7EB",
            overflow: "hidden",
            animation: "fadeInUp 0.25s ease-out"
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: "18px 20px",
              borderBottom: "1px solid #F3F4F6",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0
            }}>
              <h3 style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "var(--color-purple)",
                margin: 0,
                fontFamily: "var(--font-heading)"
              }}>
                {drillDownExpenses.title}
              </h3>
              <button
                type="button"
                onClick={() => setDrillDownExpenses(null)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "1.15rem",
                  color: "#9CA3AF",
                  cursor: "pointer",
                  padding: "4px"
                }}
              >
                ✕
              </button>
            </div>

            {/* List Content */}
            <div style={{
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              flex: 1,
              backgroundColor: "#F9F6ED"
            }}>
              {(() => {
                const list = getDrillDownList();
                if (list.length === 0) {
                  return (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: "#9CA3AF" }}>
                      <p style={{ fontSize: "0.9rem", fontWeight: 500 }}>No transactions found.</p>
                    </div>
                  );
                }
                return list.map((exp) => (
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
                ));
              })()}
            </div>

            {/* Footer Close Button */}
            <div style={{
              padding: "14px 20px",
              borderTop: "1px solid #F3F4F6",
              display: "flex",
              justifyContent: "flex-end",
              flexShrink: 0
            }}>
              <button
                type="button"
                onClick={() => setDrillDownExpenses(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "1px solid #E5E7EB",
                  backgroundColor: "white",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#4B5563",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
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
          tripName={trip.name}
          onClose={() => setActiveModal(null)}
        />
      )}
      <style>{`
        @keyframes goldGlowPulse {
          0% {
            box-shadow: 0 0 10px rgba(245, 158, 11, 0.2);
            border-color: rgba(245, 158, 11, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.45);
            border-color: rgba(245, 158, 11, 0.6);
          }
          100% {
            box-shadow: 0 0 10px rgba(245, 158, 11, 0.2);
            border-color: rgba(245, 158, 11, 0.3);
          }
        }
        
        .worth-it-shimmer-modal {
          background-color: #FFFDF9 !important;
          border: 2px solid rgba(245, 158, 11, 0.4) !important;
          animation: goldGlowPulse 4s infinite ease-in-out !important;
        }
        
        .worth-it-shimmer-card {
          background-color: #FFFDF5 !important;
          border: 1.5px solid rgba(245, 158, 11, 0.35) !important;
          animation: goldGlowPulse 4s infinite ease-in-out !important;
        }
      `}</style>
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

  // Parse custom note suffix for spread/repeat details if present: e.g. "Hotel Booking (Day 1/7, May 23 - May 29)"
  const spreadMatch = expense.note ? expense.note.match(/(.*)\s\(Day\s(\d+)\/(\d+),\s(.*)\)/) : null;
  const displayNote = spreadMatch ? spreadMatch[1].trim() : (expense.note || expense.category);
  const isRepeat = expense.tags?.includes("spread-mode-repeat");
  const spreadInfo = spreadMatch 
    ? `${isRepeat ? "Repeat" : "Spread"}: Day ${spreadMatch[2]}/${spreadMatch[3]} (${spreadMatch[4]})` 
    : null;

  const truncatedNote = displayNote.length > 30 ? `${displayNote.slice(0, 30)}...` : displayNote;

  return (
    <div 
      className={expense.worthIt ? "worth-it-shimmer-card" : ""}
      style={{
        borderRadius: "16px",
        marginBottom: "12px",
        boxShadow: expense.worthIt ? undefined : "0 4px 10px rgba(0,0,0,0.02)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      <div style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "16px"
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
            backgroundColor: expense.worthIt ? "#FFFDF5" : "white",
            borderRadius: "16px",
            border: "1.5px solid transparent",
            padding: "15px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 2,
            transition: isDragging ? "none" : "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: `translateX(-${offsetX}px)`,
            cursor: "pointer"
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
            paddingLeft: "8px",
            flex: 1,
            minWidth: 0
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{
                fontWeight: 700,
                color: "#111827",
                fontSize: "1rem"
              }}>{truncatedNote}</span>
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
              {(() => {
                const dbLoc = expense.location || "";
                const locale = expense.locationLocale || dbLoc.split(" | ")[1] || "";
                const establishment = dbLoc.includes(" | ") ? dbLoc.split(" | ")[0] : dbLoc;
                
                const parts = [];
                if (establishment.trim()) parts.push(establishment.trim());
                if (locale.trim() && locale.trim() !== establishment.trim()) parts.push(locale.trim());
                const displayLoc = parts.join(", ");
                if (!displayLoc) return null;
                return (
                  <span style={{
                    fontSize: "0.78rem",
                    color: "#9CA3AF",
                    display: "flex",
                    alignItems: "center",
                    gap: "2px"
                  }}>
                    📍 {displayLoc}
                  </span>
                );
              })()}
            </div>

            {expense.tags && expense.tags.filter(t => !t.startsWith("spread-")).length > 0 && (
              <div style={{
                display: "flex",
                gap: "4px",
                marginTop: "4px",
                flexWrap: "wrap"
              }}>
                {expense.tags.filter(t => !t.startsWith("spread-")).map((tag, tIdx) => (
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
  onVoiceStart,
  expenses = [],
  onRefreshRates
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

  // Group metadata checking
  const groupTag = expenseToEdit?.tags?.find(t => t.startsWith("spread-group-"));
  const groupExpenses = groupTag ? expenses.filter(e => e.tags?.includes(groupTag)) : [];
  const isGroup = groupTag && groupExpenses.length > 1;

  const origMode = expenseToEdit?.tags?.find(t => t.startsWith("spread-mode-"))?.replace("spread-mode-", "") || "divide";
  const origStart = expenseToEdit?.tags?.find(t => t.startsWith("spread-start-"))?.replace("spread-start-", "") || "";
  const origEnd = expenseToEdit?.tags?.find(t => t.startsWith("spread-end-"))?.replace("spread-end-", "") || "";
  const origAmount = parseFloat(expenseToEdit?.tags?.find(t => t.startsWith("spread-amount-"))?.replace("spread-amount-", "") || (expenseToEdit?.amount || 0));

  const [editEntireGroup, setEditEntireGroup] = useState(false);

  const fileInputRef = useRef(null);
  const [showHashtagsDropdown, setShowHashtagsDropdown] = useState(false);
  const [showLocSearchInput, setShowLocSearchInput] = useState(false);
  const [locSearchQuery, setLocSearchQuery] = useState("");
  const [locSearchResults, setLocSearchResults] = useState([]);
  const [searchingLoc, setSearchingLoc] = useState(false);
  const [coords, setCoords] = useState(null);

  // Get user geolocation coordinates to restrict search within 50km
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          });
        },
        (err) => {
          console.warn("Geolocation permission denied or error:", err);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const searchEstablishmentBounded = async (query) => {
    if (!query || query.trim().length < 2) {
      setLocSearchResults([]);
      return;
    }
    setSearchingLoc(true);
    try {
      let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8`;
      if (coords) {
        const latDiff = 50 / 111.0;
        const lonDiff = 50 / (111.0 * Math.cos(coords.lat * Math.PI / 180));
        const left = coords.lon - lonDiff;
        const right = coords.lon + lonDiff;
        const top = coords.lat + latDiff;
        const bottom = coords.lat - latDiff;
        url += `&viewbox=${left},${top},${right},${bottom}&bounded=1`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLocSearchResults(data.map(item => ({
          display_name: item.display_name,
          name: item.name || item.display_name.split(",")[0]
        })));
      }
    } catch (err) {
      console.error("Error searching establishment:", err);
    } finally {
      setSearchingLoc(false);
    }
  };

  const tripHashtags = (() => {
    const tagsSet = new Set();
    expenses.forEach(e => {
      if (e.tags) {
        e.tags.forEach(t => {
          if (!t.startsWith("spread-") && !t.startsWith("spread-group-")) {
            tagsSet.add(t);
          }
        });
      }
    });
    return Array.from(tagsSet);
  })();

  const [amount, setAmount] = useState(() => {
    if (expenseToEdit) return expenseToEdit.amount;
    const draft = getDraft();
    return draft ? draft.amount : "";
  });
  const [title, setTitle] = useState(() => {
    if (expenseToEdit) {
      const cleanNote = expenseToEdit.note.replace(/\s*\(Day\s+\d+\/\d+.*\)$/, "");
      const parts = cleanNote.split("\n\n");
      const baseTitle = parts[0];
      const editTags = expenseToEdit.tags?.filter(t => !t.startsWith("spread-")) || [];
      return baseTitle + (editTags.length > 0 ? " " + editTags.map(t => `#${t}`).join(" ") : "");
    }
    const draft = getDraft();
    return draft ? draft.title || "" : "";
  });
  const [extraNotes, setExtraNotes] = useState(() => {
    if (expenseToEdit) {
      const cleanNote = expenseToEdit.note.replace(/\s*\(Day\s+\d+\/\d+.*\)$/, "");
      const parts = cleanNote.split("\n\n");
      return parts.length > 1 ? parts.slice(1).join("\n\n") : "";
    }
    const draft = getDraft();
    return draft ? draft.extraNotes || "" : "";
  });
  const [photoUrl, setPhotoUrl] = useState(() => {
    if (expenseToEdit) return expenseToEdit.photoUrl || "";
    const draft = getDraft();
    return draft ? draft.photoUrl || "" : "";
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
  const [establishment, setEstablishment] = useState(() => {
    if (expenseToEdit) return (expenseToEdit.location.split(" | ")[0] || "");
    const draft = getDraft();
    return draft ? draft.location : "";
  });
  const [spreadExpense, setSpreadExpense] = useState(() => {
    if (expenseToEdit && expenseToEdit.tags?.some(t => t.startsWith("spread-group-"))) {
      return true;
    }
    return false;
  });
  const [isDateExpanded, setIsDateExpanded] = useState(false);

  const [spreadMode, setSpreadMode] = useState(() => {
    if (expenseToEdit) {
      return expenseToEdit.tags?.find(t => t.startsWith("spread-mode-"))?.replace("spread-mode-", "") || "divide";
    }
    return "divide";
  });

  const getFutureDateString = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-CA');
  };
  const [spreadStart, setSpreadStart] = useState(() => {
    if (expenseToEdit) {
      return expenseToEdit.tags?.find(t => t.startsWith("spread-start-"))?.replace("spread-start-", "") || new Date().toLocaleDateString('en-CA');
    }
    return new Date().toLocaleDateString('en-CA');
  });
  const [spreadEnd, setSpreadEnd] = useState(() => {
    if (expenseToEdit) {
      return expenseToEdit.tags?.find(t => t.startsWith("spread-end-"))?.replace("spread-end-", "") || getFutureDateString(6);
    }
    return getFutureDateString(6);
  });

  const [expenseDate, setExpenseDate] = useState(
    expenseToEdit 
      ? new Date(expenseToEdit.timestamp).toLocaleDateString('en-CA') 
      : new Date().toLocaleDateString('en-CA')
  );

  // Sync editEntireGroup changes
  useEffect(() => {
    if (isGroup && editEntireGroup) {
      setSpreadExpense(true);
      setAmount(origAmount.toString());
    } else if (isGroup && !editEntireGroup) {
      setSpreadExpense(false);
      setAmount(expenseToEdit.amount.toString());
    }
  }, [editEntireGroup, isGroup, expenseToEdit, origAmount]);

  // Sync inputs with expenseToEdit changes (e.g. from async speech parser)
  useEffect(() => {
    if (expenseToEdit) {
      const cleanNote = expenseToEdit.note !== undefined ? expenseToEdit.note.replace(/\s*\(Day\s+\d+\/\d+.*\)$/, "") : "";
      const parts = cleanNote.split("\n\n");
      const baseTitle = parts[0];
      const editTags = expenseToEdit.tags?.filter(t => !t.startsWith("spread-")) || [];
      const titleWithTags = baseTitle + (editTags.length > 0 ? " " + editTags.map(t => `#${t}`).join(" ") : "");
      const baseExtraNotes = parts.length > 1 ? parts.slice(1).join("\n\n") : "";

      setAmount(expenseToEdit.amount !== undefined ? expenseToEdit.amount : "");
      setTitle(titleWithTags);
      setExtraNotes(baseExtraNotes);
      setCategory(expenseToEdit.category || "Everything Else");
      setWorthIt(!!expenseToEdit.worthIt);
      setCurrency(expenseToEdit.currency || trip.localCurrency);
      setEstablishment(expenseToEdit.location ? (expenseToEdit.location.split(" | ")[0] || "") : "");
      setPhotoUrl(expenseToEdit.photoUrl || "");
      setExpenseDate(
        expenseToEdit.timestamp 
          ? new Date(expenseToEdit.timestamp).toLocaleDateString('en-CA') 
          : new Date().toLocaleDateString('en-CA')
      );
      if (expenseToEdit.tags?.some(t => t.startsWith("spread-group-"))) {
        setSpreadExpense(true);
      } else {
        setSpreadExpense(false);
      }
    }
  }, [expenseToEdit, trip.localCurrency]);

  // Auto-save draft as the user types (only for new expenses)
  useEffect(() => {
    if (!expenseToEdit) {
      const draftObj = { amount, title, extraNotes, category, worthIt, currency, location: establishment, photoUrl };
      localStorage.setItem("tracker_expense_draft", JSON.stringify(draftObj));
    }
  }, [amount, title, extraNotes, category, worthIt, currency, establishment, photoUrl, expenseToEdit]);

  const handleCloseWithX = () => {
    localStorage.removeItem("tracker_expense_draft");
    onClose();
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthName = months[monthIdx] || parts[1];
    return `${monthName} ${day}, ${year}`;
  };

  const getDateLabel = () => {
    if (spreadExpense) {
      return `${formatDateLabel(spreadStart)} - ${formatDateLabel(spreadEnd)}`;
    }
    const today = new Date().toLocaleDateString('en-CA');
    const yesterday = (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toLocaleDateString('en-CA');
    })();
    if (expenseDate === today) {
      return "Today";
    } else if (expenseDate === yesterday) {
      return "Yesterday";
    } else {
      return formatDateLabel(expenseDate);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Compress as JPEG with 0.7 quality
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setPhotoUrl(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const searchLocation = async () => {
    if (!location || !location.trim()) return;
    setSearchingMap(true);
    setMapResults([]);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setMapResults(data.map(item => ({
          display_name: item.display_name,
          name: item.name || item.display_name.split(",")[0]
        })));
      }
    } catch (err) {
      console.error("Error searching location:", err);
    } finally {
      setSearchingMap(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      onTouchMove={() => {
        if (typeof document !== 'undefined' && document.activeElement && 
            (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
          document.activeElement.blur();
        }
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px"
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        onScroll={() => {
          if (typeof document !== 'undefined' && document.activeElement && 
              (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
            document.activeElement.blur();
          }
        }}
        onTouchMove={() => {
          if (typeof document !== 'undefined' && document.activeElement && 
              (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
            document.activeElement.blur();
          }
        }}
        className={worthIt ? "worth-it-shimmer-modal" : ""}
        style={{
          backgroundColor: worthIt ? "#FFFDF2" : "white",
          width: "100%",
          maxWidth: "400px",
          borderRadius: "24px",
          padding: "20px 18px",
          animation: "fadeInUp 0.25s ease-out",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: worthIt ? "0 20px 50px rgba(245, 158, 11, 0.25)" : "0 20px 40px rgba(0,0,0,0.12)",
          border: worthIt ? "2.5px solid #FCD34D" : "1.5px solid transparent",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px"
        }}>
          <h3 style={{
            fontSize: "1.1rem",
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
              fontSize: "1.3rem",
              color: "#9CA3AF",
              cursor: "pointer",
              padding: "4px"
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

            // Combine title and extra notes for full text
            const fullNoteText = extraNotes.trim() ? `${title.trim()}\n\n${extraNotes.trim()}` : title.trim();

            // Extract tags from the note text (do not strip them!)
            const hashtagRegex = /#([a-zA-Z0-9_-]+)/g;
            const parsedTags = [];
            let match;
            while ((match = hashtagRegex.exec(fullNoteText)) !== null) {
              parsedTags.push(match[1].toLowerCase());
            }

            const originalSpreadTags = expenseToEdit?.tags 
              ? expenseToEdit.tags.filter(t => t.startsWith("spread-") && !t.startsWith("spread-mode-") && !t.startsWith("spread-start-") && !t.startsWith("spread-end-") && !t.startsWith("spread-amount-")) 
              : [];
            
            const finalTags = [...parsedTags, ...originalSpreadTags];

            onSave({
              amount: val,
              currency,
              category,
              note: fullNoteText || category,
              worthIt,
              location: establishment, // Pass parsed location
              photoUrl: photoUrl,
              tags: finalTags,
              id: expenseToEdit?.id,
              editEntireGroup,
              groupTag,
              spreadDays: spreadExpense ? days : 1,
              spreadStart: spreadExpense ? spreadStart : null,
              spreadEnd: spreadExpense ? spreadEnd : null,
              spreadMode: spreadExpense ? spreadMode : "divide",
              timestamp: !spreadExpense ? finalTimestamp : null
            });
          }}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          {/* Title (Notes Description) at the very top */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <label style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#4B5563",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Coffee before train"
              required
              style={{
                padding: "10px 12px",
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                fontSize: "15px",
                outline: "none"
              }}
            />
          </div>

          {/* Amount input block below Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <label style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#4B5563",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>Amount</label>
            <div style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#F9F6ED",
              borderRadius: "16px",
              padding: "6px 10px",
              border: "1.5px solid rgba(133, 58, 81, 0.15)",
              marginBottom: "4px"
            }}>
              <SearchableCurrencySelect
                value={currency}
                onChange={setCurrency}
                rates={rates}
                customCurrencies={customCurrencies}
                onAddCustomCurrency={onAddCustomCurrency}
                style={{ fontSize: "1rem", fontWeight: 700, marginRight: "4px" }}
              />
              {(() => {
                const val = parseFloat(amount);
                const showConversion = currency !== trip.homeCurrency && !isNaN(val) && val > 0;
                const convertedVal = showConversion ? convertCurrency(val, currency, trip.homeCurrency, rates) : 0;
                if (!showConversion) return null;
                return (
                  <span style={{
                    fontSize: "0.82rem",
                    color: "#6B7280",
                    fontWeight: 600,
                    marginLeft: "4px",
                    whiteSpace: "nowrap"
                  }}>
                    ≈ {formatMoney(convertedVal, trip.homeCurrency)}
                  </span>
                );
              })()}
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
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  outline: "none",
                  width: "100%",
                  color: "#111827",
                  textAlign: "right",
                  paddingRight: "6px"
                }}
              />
              
              {/* Photo attachment camera button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-purple)",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  marginRight: "4px"
                }}
              >
                <CameraIcon />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
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
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%"
                  }}
                >
                  <MicIcon />
                </button>
              )}
            </div>
            
            {/* Rates time and refresh inside manual entry modal */}
            {(() => {
              const lastRates = localStorage.getItem("tracker_rates_last_updated");
              if (!lastRates) return null;
              const diffMs = Date.now() - parseInt(lastRates, 10);
              const diffMin = Math.round(diffMs / 60000);
              const ratesTimeText = diffMin < 60 ? `${diffMin}m ago` : `${Math.round(diffMin / 60)}h ago`;
              
              const rateVal = convertCurrency(1, currency, trip.homeCurrency, rates);
              const inverseRateVal = rateVal > 0 ? 1 / rateVal : 0;
              
              let rateText = "";
              if (currency !== trip.homeCurrency && rateVal > 0) {
                if (rateVal >= 1) {
                  rateText = `1 ${currency} ≈ ${rateVal.toFixed(2)} ${trip.homeCurrency}`;
                } else {
                  rateText = `1 ${trip.homeCurrency} ≈ ${inverseRateVal.toFixed(2)} ${currency}`;
                }
              }

              return (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.75rem",
                  color: "#6B7280",
                  marginTop: "-2px",
                  padding: "0 4px",
                  marginBottom: "6px"
                }}>
                  <span>{rateText}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span>Rates: {ratesTimeText}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (onRefreshRates) {
                          await onRefreshRates();
                        }
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        color: "var(--color-purple)",
                        display: "flex",
                        alignItems: "center"
                      }}
                      title="Refresh exchange rates"
                    >
                      🔄
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Compressed photo preview */}
            {photoUrl && (
              <div style={{
                position: "relative",
                width: "80px",
                height: "80px",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #E5E7EB",
                marginTop: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
              }}>
                <img src={photoUrl} alt="Receipt" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button
                  type="button"
                  onClick={() => setPhotoUrl("")}
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    fontSize: "10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >✕</button>
              </div>
            )}
          </div>

          {isGroup && (
            <div style={{
              padding: "12px",
              backgroundColor: "#FEF3C7",
              border: "1.5px solid #FCD34D",
              borderRadius: "16px",
              marginBottom: "4px",
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#92400E", display: "flex", alignItems: "center", gap: "4px" }}>
                🗓️ Multi-Day Expense Group
              </span>
              <span style={{ fontSize: "0.75rem", color: "#B45309", lineHeight: "1.3" }}>
                This entry belongs to a range from <strong>{origStart}</strong> to <strong>{origEnd}</strong>.
              </span>
              <div style={{ display: "flex", gap: "16px", marginTop: "2px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", fontWeight: 700, color: "#92400E", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="editGroupChoice"
                    checked={!editEntireGroup}
                    onChange={() => setEditEntireGroup(false)}
                    style={{ accentColor: "#B45309", width: "16px", height: "16px" }}
                  />
                  This day only
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", fontWeight: 700, color: "#92400E", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="editGroupChoice"
                    checked={editEntireGroup}
                    onChange={() => setEditEntireGroup(true)}
                    style={{ accentColor: "#B45309", width: "16px", height: "16px" }}
                  />
                  Entire range
                </label>
              </div>
            </div>
          )}

          {/* 1. Category in 4-column row */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <label style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#4B5563",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>Category</label>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "6px"
            }}>
              {CATEGORIES.map((cat) => {
                const shortLabels = {
                  "Accommodation": "Stay",
                  "Transportation": "Transit",
                  "Food & Drink": "Food",
                  "Everything Else": "Other"
                };
                const displayLabel = shortLabels[cat] || cat;
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "8px 4px",
                      borderRadius: "12px",
                      border: "1.5px solid",
                      cursor: "pointer",
                      backgroundColor: isSelected ? CATEGORY_COLORS[cat] : "white",
                      borderColor: isSelected ? CATEGORY_COLORS[cat] : "#E5E7EB",
                      color: isSelected ? "white" : "#4B5563",
                      transition: "all 0.2s",
                      minWidth: 0,
                      flex: 1
                    }}
                  >
                    <span style={{ fontSize: "1.15rem", marginBottom: "2px" }}>{CATEGORY_EMOJIS[cat]}</span>
                    <span style={{ 
                      fontSize: "0.68rem", 
                      fontWeight: 700, 
                      textAlign: "center", 
                      width: "100%", 
                      whiteSpace: "nowrap", 
                      overflow: "hidden", 
                      textOverflow: "ellipsis" 
                    }}>
                      {displayLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Side-by-Side Row: When? and Worth it */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px"
          }}>
            {/* When? Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <label style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#4B5563",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>When?</label>
              <button
                type="button"
                onClick={() => setIsDateExpanded(!isDateExpanded)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "white",
                  borderRadius: "14px",
                  padding: "10px 12px",
                  border: "1.5px solid rgba(133, 58, 81, 0.12)",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "var(--color-purple)",
                  outline: "none",
                  width: "100%",
                  textAlign: "center"
                }}
              >
                📅 {getDateLabel()}
              </button>
            </div>

            {/* Worth It Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" }}>
              <label style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: worthIt ? "#B45309" : "#4B5563",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                {worthIt ? "Worth it." : "Worth it?"}
              </label>
              <div 
                onClick={() => {
                  const newValue = !worthIt;
                  setWorthIt(newValue);
                  if (typeof window !== "undefined" && navigator.vibrate) {
                    navigator.vibrate(15);
                  }
                }}
                style={{
                  width: "52px",
                  height: "28px",
                  borderRadius: "15px",
                  backgroundColor: worthIt ? "#F59E0B" : "#D1D5DB",
                  padding: "3px",
                  cursor: "pointer",
                  transition: "background-color 0.25s ease",
                  display: "flex",
                  alignItems: "center",
                  boxShadow: worthIt ? "0 2px 8px rgba(245, 158, 11, 0.3)" : "none"
                }}
              >
                <div style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  backgroundColor: "white",
                  transform: worthIt ? "translateX(24px)" : "translateX(0)",
                  transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)"
                }}>
                  {worthIt ? "🌟" : "💸"}
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible Date Picker */}
          {isDateExpanded && (
            <div style={{
              padding: "12px",
              backgroundColor: "#F9F6ED",
              borderRadius: "16px",
              border: "1.5px solid rgba(133, 58, 81, 0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              animation: "fadeInUp 0.2s ease-out"
            }}>
              {/* Single Date Picker */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.72rem", color: "#4B5563", fontWeight: 700, textTransform: "uppercase" }}>Single Date</span>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => {
                    setExpenseDate(e.target.value);
                    setSpreadExpense(false);
                  }}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    outline: "none",
                    fontSize: "15px",
                    backgroundColor: "white",
                    color: "#374151"
                  }}
                />
              </div>

              {/* Range toggle checkbox */}
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                userSelect: "none",
                padding: "8px 0 0",
                borderTop: "1px dashed rgba(133, 58, 81, 0.15)"
              }}>
                <input
                  type="checkbox"
                  checked={spreadExpense}
                  onChange={(e) => setSpreadExpense(e.target.checked)}
                  style={{
                    width: "16px",
                    height: "16px",
                    accentColor: "var(--color-orange)"
                  }}
                />
                <span style={{
                  fontSize: "0.8rem",
                  color: "var(--color-purple)",
                  fontWeight: 700
                }}>
                  🗓️ Spread/Repeat across multiple days
                </span>
              </label>

              {spreadExpense && (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  padding: "10px",
                  backgroundColor: "rgba(30, 64, 175, 0.03)",
                  borderRadius: "12px",
                  borderLeft: "3px solid #BFDBFE"
                }}>
                  {/* Mode selector */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "0.72rem", color: "#1E40AF", fontWeight: 700, textTransform: "uppercase" }}>Distribution Mode</span>
                    <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                      <button
                        type="button"
                        onClick={() => setSpreadMode("divide")}
                        style={{
                          flex: 1,
                          padding: "6px 8px",
                          borderRadius: "8px",
                          border: "1.5px solid",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          backgroundColor: spreadMode === "divide" ? "#2563EB" : "white",
                          borderColor: spreadMode === "divide" ? "#2563EB" : "#BFDBFE",
                          color: spreadMode === "divide" ? "white" : "#1E40AF",
                          transition: "all 0.2s"
                        }}
                      >
                        ⚖️ Spread Evenly
                      </button>
                      <button
                        type="button"
                        onClick={() => setSpreadMode("repeat")}
                        style={{
                          flex: 1,
                          padding: "6px 8px",
                          borderRadius: "8px",
                          border: "1.5px solid",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          backgroundColor: spreadMode === "repeat" ? "#2563EB" : "white",
                          borderColor: spreadMode === "repeat" ? "#2563EB" : "#BFDBFE",
                          color: spreadMode === "repeat" ? "white" : "#1E40AF",
                          transition: "all 0.2s"
                        }}
                      >
                        🔄 Repeat Daily
                      </button>
                    </div>
                  </div>

                  {/* Dates */}
                  <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
                      <span style={{ fontSize: "0.72rem", color: "#1E40AF", fontWeight: 700, textTransform: "uppercase" }}>Start Date</span>
                      <input
                        type="date"
                        value={spreadStart}
                        onChange={(e) => setSpreadStart(e.target.value)}
                        style={{
                          padding: "6px 8px",
                          borderRadius: "8px",
                          border: "1px solid #BFDBFE",
                          outline: "none",
                          fontSize: "15px",
                          fontWeight: 600,
                          color: "#1E40AF",
                          backgroundColor: "white",
                          width: "100%",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
                      <span style={{ fontSize: "0.72rem", color: "#1E40AF", fontWeight: 700, textTransform: "uppercase" }}>End Date</span>
                      <input
                        type="date"
                        value={spreadEnd}
                        onChange={(e) => setSpreadEnd(e.target.value)}
                        style={{
                          padding: "6px 8px",
                          borderRadius: "8px",
                          border: "1px solid #BFDBFE",
                          outline: "none",
                          fontSize: "15px",
                          fontWeight: 600,
                          color: "#1E40AF",
                          backgroundColor: "white",
                          width: "100%",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                  </div>

                  {/* Dynamic Explanation */}
                  {(() => {
                    const start = new Date(spreadStart + "T00:00:00");
                    const end = new Date(spreadEnd + "T00:00:00");
                    if (!isNaN(start) && !isNaN(end) && end >= start) {
                      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                      const val = parseFloat(amount);
                      const dailyPortion = !isNaN(val) && val > 0 
                        ? (spreadMode === "repeat" ? val : val / days).toFixed(2) 
                        : "0.00";
                      const totalCost = !isNaN(val) && val > 0 
                        ? (spreadMode === "repeat" ? val * days : val).toFixed(2) 
                        : "0.00";
                      return (
                        <div style={{
                          fontSize: "0.78rem",
                          color: "#1E40AF",
                          fontWeight: 600,
                          backgroundColor: "#DBEAFE",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          marginTop: "4px",
                          lineHeight: "1.3"
                        }}>
                          {spreadMode === "repeat" ? (
                            <>
                              Logging <strong>{dailyPortion} {currency} / day</strong> for {days} days.<br />
                              Total cost will be <strong>{totalCost} {currency}</strong>.
                            </>
                          ) : (
                            <>
                              Spreading <strong>{val} {currency}</strong> across <strong>{days} days</strong> ({dailyPortion} {currency} / day).
                            </>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          )}



          {/* Notes Input at the bottom */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#4B5563",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>Notes</label>
            
            <textarea
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              placeholder="Any additional details or thoughts..."
              rows={2}
              style={{
                padding: "10px 12px",
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                fontSize: "15px",
                outline: "none",
                resize: "none",
                fontFamily: "inherit"
              }}
            />

            <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", marginTop: "2px" }}>
              <button
                type="button"
                onClick={() => setShowHashtagsDropdown(!showHashtagsDropdown)}
                style={{
                  backgroundColor: "#F3F4F6",
                  border: "1px solid #D1D5DB",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  color: "var(--color-purple)",
                  fontWeight: "bold",
                  outline: "none"
                }}
                title="Attach tag"
              >
                #
              </button>
              <button
                type="button"
                onClick={() => setShowLocSearchInput(!showLocSearchInput)}
                style={{
                  backgroundColor: "#F3F4F6",
                  border: "1px solid #D1D5DB",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  outline: "none"
                }}
                title="Attach establishment"
              >
                📍
              </button>
            </div>

            {/* Hashtags Dropdown */}
            {showHashtagsDropdown && (
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25 rgba(0, 0, 0, 0.1)",
                  zIndex: 200,
                  maxHeight: "150px",
                  overflowY: "auto",
                  padding: "6px",
                  marginTop: "4px"
                }}>
                  {tripHashtags.length === 0 ? (
                    <div style={{ padding: "8px", fontSize: "0.8rem", color: "#9CA3AF", textAlign: "center" }}>
                      No tags used yet. Type #tag manually!
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "4px" }}>
                      {tripHashtags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (!extraNotes.includes(`#${tag}`)) {
                              setExtraNotes(prev => prev.trim() + ` #${tag}`);
                            }
                            setShowHashtagsDropdown(false);
                          }}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            backgroundColor: "#F3F4F6",
                            border: "none",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            color: "var(--color-purple)",
                            cursor: "pointer"
                          }}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location Autocomplete Search */}
            {showLocSearchInput && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                marginTop: "4px",
                padding: "10px",
                backgroundColor: "#F9FAFB",
                borderRadius: "12px",
                border: "1px solid #E5E7EB"
              }}>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <input
                    type="text"
                    value={locSearchQuery}
                    onChange={(e) => {
                      setLocSearchQuery(e.target.value);
                      searchEstablishmentBounded(e.target.value);
                    }}
                    placeholder="Search establishment (e.g. Common Ground Cafe)..."
                    autoFocus
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: "1px solid #D1D5DB",
                      fontSize: "14px",
                      outline: "none"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowLocSearchInput(false);
                      setLocSearchQuery("");
                      setLocSearchResults([]);
                    }}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#9CA3AF",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                  >
                    Cancel
                  </button>
                </div>
                {locSearchResults.length > 0 && (
                  <div style={{
                    backgroundColor: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    maxHeight: "150px",
                    overflowY: "auto"
                  }}>
                    {locSearchResults.map((result, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setEstablishment(result.name);
                          setShowLocSearchInput(false);
                          setLocSearchQuery("");
                          setLocSearchResults([]);
                        }}
                        style={{
                          padding: "8px 12px",
                          fontSize: "0.82rem",
                          borderBottom: idx === locSearchResults.length - 1 ? "none" : "1px solid #F3F4F6",
                          cursor: "pointer",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          lineHeight: "1.3"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F9FAFB"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <strong>{result.name}</strong> <span style={{ color: "#9CA3AF", fontSize: "0.75rem" }}>({result.display_name})</span>
                      </div>
                    ))}
                  </div>
                )}
                {searchingLoc && (
                  <div style={{ fontSize: "0.75rem", color: "#6B7280", paddingLeft: "4px" }}>Searching...</div>
                )}
              </div>
            )}

            {establishment && (
              <div style={{ display: "flex", marginTop: "4px" }}>
                <span style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#B45309",
                  backgroundColor: "#FEF3C7",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  📍 {establishment}
                  <button
                    type="button"
                    onClick={() => setEstablishment("")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#B45309",
                      fontWeight: 800,
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "0.85rem"
                    }}
                  >
                    [✕]
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* 6. Save / Delete Buttons */}
          <div style={{
            display: "flex",
            gap: "8px",
            marginTop: "4px"
          }}>
            {expenseToEdit?.id && (
              <button
                type="button"
                onClick={() => {
                  if (groupTag && groupExpenses.length > 1) {
                    const deleteEntire = window.confirm("This expense is part of a multi-day range. Click OK to delete the ENTIRE range, or Cancel to delete ONLY this day's entry.");
                    onSave({ id: expenseToEdit.id, delete: true, deleteEntireGroup: deleteEntire, groupTag });
                  } else {
                    onSave({ id: expenseToEdit.id, delete: true });
                  }
                }}
                style={{
                  padding: "12px",
                  backgroundColor: "#FEE2E2",
                  color: "#EF4444",
                  borderRadius: "14px",
                  fontSize: "0.95rem",
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
                padding: "12px",
                backgroundColor: "var(--color-purple)",
                color: "white",
                borderRadius: "14px",
                fontSize: "0.95rem",
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
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
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
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", alignItems: "center" }}>
            <span style={{ fontSize: "2.5rem", margin: "10px 0" }}>✉️</span>
            <p style={{
              fontSize: "0.85rem",
              color: "#4B5563",
              lineHeight: "1.5",
              margin: 0
            }}>
              We sent a secure magic login link to <strong>{email}</strong>.
            </p>
            <p style={{
              fontSize: "0.8rem",
              color: "#6B7280",
              lineHeight: "1.4",
              margin: 0
            }}>
              Please check your email inbox (and spam folder) on your device and click the link to log in directly.
            </p>
            
            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{
                width: "100%",
                borderRadius: "12px",
                padding: "12px",
                fontWeight: 700,
                marginTop: "12px"
              }}
            >
              Okay, I'll check my email
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

function CollaboratorsModal({ tripId, tripName, onClose }) {
  const [email, setEmail] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  useEffect(() => {
    if (tripId) {
      fetchMembers();
    }
  }, [tripId]);

  useEffect(() => {
    const getUserEmail = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email.toLowerCase().trim());
      }
    };
    getUserEmail();
  }, []);

  const isOwner = members.some(
    m => m.email.toLowerCase().trim() === currentUserEmail && m.role === "owner"
  );

  const handleRemoveMember = async (memberId) => {
    if (!supabase) return;
    const confirmRemove = window.confirm("Are you sure you want to remove this collaborator?");
    if (!confirmRemove) return;
    try {
      const { error } = await supabase
        .from("trip_members")
        .delete()
        .eq("id", memberId);
      if (error) throw error;
      fetchMembers();
    } catch (err) {
      console.error("Error removing member:", err);
      alert("Failed to remove collaborator: " + err.message);
    }
  };

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
      const cleanEmail = email.trim().toLowerCase();
      const { error: inviteErr } = await supabase
        .from("trip_members")
        .insert({
          trip_id: tripId,
          email: cleanEmail,
          role: "editor"
        });
      if (inviteErr) throw inviteErr;

      // Trigger invitation email via Resend API route
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const inviterEmail = session?.user?.email || "Your travel partner";
        const origin = typeof window !== "undefined" ? window.location.origin : "https://lostandsound.org";

        await fetch("/api/invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
            tripId,
            tripName,
            inviterEmail,
            origin
          })
        });
      } catch (emailErr) {
        console.error("Invite email send error:", emailErr);
      }

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
          <span style={{ display: "block", fontSize: "0.72rem", color: "#6B7280", marginTop: "4px", lineHeight: "1.3" }}>
            This whitelists their email address. Make sure to copy the invite link above and send it to them.
          </span>
          {success && (
            <p style={{ color: "#10B981", fontSize: "0.8rem", marginTop: "8px", fontWeight: 600, lineHeight: "1.3" }}>
              ✅ Whitelisted and invite email sent! They can click the link in their email to join.
            </p>
          )}
          {error && <p style={{ color: "#EF4444", fontSize: "0.8rem", marginTop: "6px", fontWeight: 500 }}>{error}</p>}
        </form>

        <div style={{ maxHeight: "150px", overflowY: "auto", marginBottom: "20px" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#4B5563", marginBottom: "8px" }}>Members</p>
          {members.map(m => (
            <div key={m.id} style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              fontSize: "0.85rem", 
              padding: "8px 0", 
              borderBottom: "1px solid #F3F4F6",
              gap: "10px"
            }}>
              <span style={{ 
                color: "#374151",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                flex: 1
              }} title={m.email}>{m.email}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <span style={{ 
                  fontWeight: 600, 
                  color: "var(--color-purple)", 
                  textTransform: "capitalize"
                }}>{m.role}</span>
                {isOwner && m.role !== "owner" && (
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#EF4444",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: "4px",
                      backgroundColor: "#FEE2E2",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FCA5A5"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#FEE2E2"}
                  >
                    Remove
                  </button>
                )}
              </div>
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

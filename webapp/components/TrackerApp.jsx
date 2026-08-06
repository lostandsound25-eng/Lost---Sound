'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
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

const UndoIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
);

const RedoIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
  </svg>
);

const parseCurrentLocation = (currentLocationVal) => {
  if (!currentLocationVal) return { location: "", date: "" };
  const parts = currentLocationVal.split("|");
  if (parts.length > 1) {
    const datePart = parts[parts.length - 1];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return {
        location: parts.slice(0, -1).join("|"),
        date: datePart
      };
    }
  }
  return { location: currentLocationVal, date: "" };
};

const appendCacheBuster = (url) => {
  if (!url) return "";
  if (typeof url !== "string") return url;
  if (url.includes("supabase.co/storage") && !url.includes("?v=")) {
    return `${url}?v=2`;
  }
  return url;
};

const getMergedExpenses = (cloudExpenses, queue) => {
  if (!queue || queue.length === 0) return cloudExpenses;
  
  const pendingInserts = [];
  const pendingDeletes = new Set();
  const pendingUpdates = new Map();

  queue.forEach(op => {
    if (op.type === "insert") {
      pendingInserts.push(op.payload);
    } else if (op.type === "delete") {
      pendingDeletes.add(op.payload.id);
    } else if (op.type === "update") {
      pendingUpdates.set(op.payload.id, op.payload);
    }
  });

  // 1. Start with cloud expenses, filter out pending deletes
  let merged = (cloudExpenses || []).filter(e => !pendingDeletes.has(e.id));

  // 2. Apply pending updates
  merged = merged.map(e => {
    const update = pendingUpdates.get(e.id);
    if (update) {
      return {
        ...e,
        amount: update.amount !== undefined ? parseFloat(update.amount) : e.amount,
        currency: update.currency || e.currency,
        category: update.category || e.category,
        title: update.title || e.title,
        notes: update.notes !== undefined ? update.notes : e.notes,
        worthIt: update.worth_it !== undefined ? update.worth_it : e.worthIt,
        establishment: update.establishment || e.establishment,
        tags: update.tags || e.tags,
        photoUrl: update.photo_url || e.photoUrl,
        photoUrls: update.photo_urls || e.photoUrls,
        photoUrlsFull: update.photo_urls_full || e.photoUrlsFull,
        deletedAt: update.deleted_at !== undefined ? update.deleted_at : e.deletedAt
      };
    }
    return e;
  });

  // 3. Add pending inserts
  pendingInserts.forEach(ins => {
    if (!merged.some(e => e.id === ins.id)) {
      merged.push({
        id: ins.id,
        timestamp: ins.created_at || new Date().toISOString(),
        amount: parseFloat(ins.amount),
        currency: ins.currency,
        category: ins.category,
        title: ins.title || ins.note || "",
        notes: ins.notes || "",
        worthIt: ins.worth_it,
        establishment: ins.establishment || ins.location || "",
        tags: ins.tags || [],
        photoUrl: ins.photo_url || "",
        photoUrls: ins.photo_urls || (ins.photo_url ? [ins.photo_url] : []),
        photoUrlsFull: ins.photo_urls_full || [],
        deletedAt: ins.deleted_at || null
      });
    }
  });

  // 4. Sort chronologically (most recent first)
  const sorted = merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return sorted.map(e => ({
    ...e,
    photoUrl: appendCacheBuster(e.photoUrl),
    photoUrls: Array.isArray(e.photoUrls) ? e.photoUrls.map(appendCacheBuster) : []
  }));
};

const COUNTRY_CURRENCY_MAP = {
  "japan": "JPY", "japanese": "JPY",
  "vietnam": "VND", "vietnamese": "VND",
  "united states": "USD", "usa": "USD", "america": "USD", "american": "USD", "us": "USD",
  "thailand": "THB", "thai": "THB",
  "europe": "EUR", "euro": "EUR", "european": "EUR", "germany": "EUR", "france": "EUR", "italy": "EUR", "spain": "EUR", "netherlands": "EUR", "greece": "EUR", "portugal": "EUR", "austria": "EUR", "belgium": "EUR", "ireland": "EUR", "finland": "EUR",
  "philippines": "PHP", "philippine": "PHP", "filipino": "PHP", "manila": "PHP", "siargao": "PHP",
  "indonesia": "IDR", "indonesian": "IDR", "bali": "IDR", "jakarta": "IDR",
  "canada": "CAD", "canadian": "CAD",
  "mexico": "MXN", "mexican": "MXN", "peso": "MXN",
  "australia": "AUD", "australian": "AUD",
  "united kingdom": "GBP", "uk": "GBP", "great britain": "GBP", "england": "GBP", "london": "GBP", "british": "GBP", "pound": "GBP",
  "singapore": "SGD", "singaporean": "SGD",
  "malaysia": "MYR", "malaysian": "MYR",
  "new zealand": "NZD", "kiwi": "NZD",
  "switzerland": "CHF", "swiss": "CHF", "franc": "CHF",
  "china": "CNY", "chinese": "CNY", "yuan": "CNY", "renminbi": "CNY",
  "hong kong": "HKD",
  "taiwan": "TWD", "taiwanese": "TWD",
  "south korea": "KRW", "korea": "KRW", "korean": "KRW", "won": "KRW",
  "india": "INR", "indian": "INR", "rupee": "INR",
  "brazil": "BRL", "brazilian": "BRL", "real": "BRL",
  "south africa": "ZAR", "south african": "ZAR", "rand": "ZAR",
  "norway": "NOK", "norwegian": "NOK", "krone": "NOK",
  "sweden": "SEK", "swedish": "SEK", "krona": "SEK",
  "denmark": "DKK", "danish": "DKK",
  "turkey": "TRY", "turkish": "TRY", "lira": "TRY",
  "russia": "RUB", "russian": "RUB", "ruble": "RUB",
  "united arab emirates": "AED", "uae": "AED", "dubai": "AED", "dirham": "AED",
  "saudi arabia": "SAR", "saudi": "SAR", "riyal": "SAR",
  "argentina": "ARS", "argentine": "ARS", "argentinian": "ARS",
  "chile": "CLP", "chilean": "CLP",
  "colombia": "COP", "colombian": "COP",
  "peru": "PEN", "peruvian": "PEN", "sol": "PEN",
  "costa rica": "CRC", "costan rican": "CRC", "colon": "CRC",
  "croatia": "HRK", "croatian": "HRK", "kuna": "HRK",
  "czech republic": "CZK", "czech": "CZK", "czechia": "CZK", "koruna": "CZK",
  "egypt": "EGP", "egyptian": "EGP",
  "hungary": "HUF", "hungarian": "HUF", "forint": "HUF",
  "israel": "ILS", "israeli": "ILS", "shekel": "ILS",
  "morocco": "MAD", "moroccan": "MAD",
  "poland": "PLN", "polish": "PLN", "zloty": "PLN",
  "romania": "RON", "romanian": "RON", "leu": "RON",
  "sri lanka": "LKR", "sri lankan": "LKR",
  "ukraine": "UAH", "ukrainian": "UAH", "hryvnia": "UAH",
  "uruguay": "UYU", "uruguayan": "UYU"
};

const resolveCurrency = (text) => {
  if (!text) return null;
  const q = text.trim().toLowerCase();
  if (q.length === 3) {
    return q.toUpperCase();
  }
  if (COUNTRY_CURRENCY_MAP[q]) {
    return COUNTRY_CURRENCY_MAP[q];
  }
  const matchKey = Object.keys(COUNTRY_CURRENCY_MAP).find(k => k.includes(q) || q.includes(k));
  if (matchKey) {
    return COUNTRY_CURRENCY_MAP[matchKey];
  }
  return null;
};

const getHashtagSuggestions = (text, allTags = []) => {
  if (!text) return [];
  const words = text.trim().split(/\s+/);
  const lastWord = words[words.length - 1];
  if (!lastWord || lastWord.length < 2) return [];

  if (lastWord.startsWith("#")) return [];

  const cleanWord = lastWord.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  if (!cleanWord) return [];

  const suggestions = [];
  
  // 1. Check if it matches any historical tag
  const matchingHist = allTags.find(t => t.toLowerCase() === cleanWord || t.toLowerCase().startsWith(cleanWord));
  if (matchingHist) {
    suggestions.push(`#${matchingHist}`);
  }

  // 2. Otherwise suggest the cleaned word itself
  const selfTag = `#${cleanWord}`;
  if (!suggestions.includes(selfTag)) {
    suggestions.push(selfTag);
  }

  return suggestions.slice(0, 3);
};

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

const evaluateMathExpression = (expr) => {
  if (typeof expr === 'number') return expr.toString();
  if (typeof expr !== 'string') return "";
  let clean = expr.replace(/\s+/g, '');
  if (!clean) return "";
  if (!/^[0-9+\-*/().]+$/.test(clean)) {
    return expr;
  }
  try {
    const result = new Function(`return (${clean})`)();
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return result >= 0 ? parseFloat(result.toFixed(2)).toString() : "0.00";
    }
  } catch (e) {
    console.error("Math evaluation failed:", e);
  }
  return expr;
};

const formatInputWithCommas = (str) => {
  if (!str) return "";
  const parts = str.split(/([+\-*/()])/);
  const formattedParts = parts.map(part => {
    if (/[+\-*/()]/.test(part)) return part;
    const numParts = part.split('.');
    let integerPart = numParts[0].replace(/\D/g, '');
    if (integerPart) {
      integerPart = parseInt(integerPart, 10).toLocaleString('en-US');
    }
    if (numParts.length > 1) {
      const decimalPart = numParts[1].replace(/\D/g, '');
      return `${integerPart}.${decimalPart}`;
    }
    return integerPart;
  });
  return formattedParts.join('');
};

// Formatting & Conversion Helpers
const formatMoney = (amount, currency) => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return symbol.length > 1 ? `${symbol} ${amount.toFixed(2)}` : `${symbol}${amount.toFixed(2)}`;
};

const formatMoneyAbbrev = (amount, currency) => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const absVal = Math.abs(amount);
  let formattedVal = "";
  if (absVal >= 1000000) {
    const abbreviated = (amount / 1000000).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    formattedVal = `${abbreviated}M`;
  } else if (absVal >= 1000) {
    const abbreviated = (amount / 1000).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    formattedVal = `${abbreviated}K`;
  } else {
    formattedVal = amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  return symbol.length > 1 ? `${symbol}${formattedVal}` : `${symbol}${formattedVal}`;
};

const formatLocalCurrency = (amount, currency) => {
  const absVal = Math.abs(amount);
  let formattedVal = "";
  if (absVal >= 1000000) {
    const abbreviated = (amount / 1000000).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    formattedVal = `${abbreviated}M`;
  } else {
    formattedVal = amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return symbol.length > 1 ? `${formattedVal} ${symbol}` : `${symbol}${formattedVal}`;
};

const convertCurrency = (amount, fromCurrency, toCurrency, rates) => {
  return (amount * (rates[fromCurrency] || 1)) / (rates[toCurrency] || 1);
};

const safeSetLocalStorage = (key, value) => {
  if (typeof window === "undefined") return;

  let valueToWrite = value;

  // Strip massive base64 image strings from cached expenses to prevent exceeding the browser quota limit
  if (key.startsWith("tracker_expenses_") && typeof value === "string") {
    try {
      const expenses = JSON.parse(value);
      if (Array.isArray(expenses)) {
        const optimized = expenses.map(e => {
          const hasBase64Url = typeof e.photoUrl === "string" && e.photoUrl.startsWith("data:image/");
          const hasBase64Urls = Array.isArray(e.photoUrls) && e.photoUrls.some(url => typeof url === "string" && url.startsWith("data:image/"));
          const hasBase64UrlsFull = Array.isArray(e.photoUrlsFull) && e.photoUrlsFull.some(url => typeof url === "string" && url.startsWith("data:image/"));
          
          if (hasBase64Url || hasBase64Urls || hasBase64UrlsFull) {
            return {
              ...e,
              photoUrl: hasBase64Url ? "" : e.photoUrl,
              photoUrls: [],
              photoUrlsFull: []
            };
          }
          return e;
        });
        valueToWrite = JSON.stringify(optimized);
      }
    } catch (parseError) {
      console.warn("Failed to optimize expenses for local cache:", parseError);
    }
  }

  try {
    localStorage.setItem(key, valueToWrite);
  } catch (e) {
    console.warn("localStorage write failed, attempting cleanup...", e);
    if (e.name === "QuotaExceededError" || e.code === 22) {
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k !== key && (k.startsWith("tracker_expenses_") || k.startsWith("tracker_trip_"))) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        console.log(`Cleaned up ${keysToRemove.length} cached keys to free up space.`);
        localStorage.setItem(key, valueToWrite);
        console.log("Successfully wrote key after cleanup:", key);
      } catch (retryError) {
        console.error("localStorage write failed even after cleanup:", retryError);
        try {
          console.group("LocalStorage Usage Diagnostics");
          let total = 0;
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            const val = localStorage.getItem(k) || "";
            const size = val.length * 2;
            total += size;
            console.log(`- ${k}: ${(size / 1024).toFixed(2)} KB`);
          }
          console.log(`Total LocalStorage Size: ${(total / 1024).toFixed(2)} KB`);
          console.groupEnd();
        } catch (diagError) {
          console.error("Failed to run storage diagnostics:", diagError);
        }
      }
    }
  }
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
  if (!query || !exp) return true;
  let q = query.trim().toLowerCase();
  if (!q) return true;

  // 1. Convert English phrase comparisons to mathematical operators
  q = q.replace(/more\s+than/g, '>');
  q = q.replace(/less\s+than/g, '<');
  q = q.replace(/\bover\b/g, '>');
  q = q.replace(/\babove\b/g, '>');
  q = q.replace(/\bunder\b/g, '<');
  q = q.replace(/\bbelow\b/g, '<');

  // 2. Normalize spaces and dollar signs around operators.
  q = q.replace(/(>=|<=|>|<|==|=)\s*\$?\s*(?=[0-9])/g, '$1');

  // Split into whitespace separated terms
  const terms = q.split(/\s+/).filter(t => t);
  if (terms.length === 0) return true;

  const titleText = (exp.title || "").toString().toLowerCase();
  const notesText = (exp.notes || exp.note || exp.extraNotes || "").toString().toLowerCase();
  const locationText = (exp.establishment || exp.location || exp.city || exp.country || exp.place || "").toString().toLowerCase();
  const categoryText = (exp.category || "").toString().toLowerCase();
  const currencyText = (exp.currency || "").toString().toLowerCase();

  const safeTags = Array.isArray(exp.tags)
    ? exp.tags.map(t => (t ? String(t).toLowerCase() : "")).filter(Boolean)
    : [];

  return terms.every(term => {
    // Check if this term is an operator comparison (e.g. ">100" or "<=50.5")
    const termOpMatch = term.match(/^(>=|<=|>|<|==|=)([0-9]+(?:\.[0-9]+)?)$/);
    if (termOpMatch) {
      const op = termOpMatch[1];
      const targetVal = parseFloat(termOpMatch[2]);
      const amountInHome = convertCurrency ? convertCurrency(exp.amount || 0, exp.currency, homeCurrency, rates) : (exp.amount || 0);

      if (op === ">") return amountInHome > targetVal;
      if (op === ">=") return amountInHome >= targetVal;
      if (op === "<") return amountInHome < targetVal;
      if (op === "<=") return amountInHome <= targetVal;
      if (op === "=" || op === "==") return Math.abs(amountInHome - targetVal) < 0.01;
    }

    if (term.startsWith("#")) {
      const tag = term.slice(1);
      return (
        titleText.includes(term) ||
        notesText.includes(term) ||
        locationText.includes(term) ||
        safeTags.some(t => t === tag)
      );
    }

    return (
      titleText.includes(term) ||
      notesText.includes(term) ||
      locationText.includes(term) ||
      categoryText.includes(term) ||
      currencyText.includes(term) ||
      safeTags.some(t => t.includes(term))
    );
  });
};

const getPlannerDaysList = (startDateStr, pastOffset, futureOffset) => {
  const minDate = new Date(startDateStr + "T00:00:00");
  minDate.setDate(minDate.getDate() - pastOffset);

  const maxDate = new Date(startDateStr + "T00:00:00");
  maxDate.setDate(maxDate.getDate() + futureOffset);

  minDate.setHours(0,0,0,0);
  maxDate.setHours(23,59,59,999);

  const days = [];
  const curr = new Date(minDate);
  while (curr <= maxDate) {
    days.push({
      date: new Date(curr),
      dateStr: curr.toLocaleDateString('en-CA')
    });
    curr.setDate(curr.getDate() + 1);
  }
  return days;
};
const base64ToBlob = (base64DataUrl) => {
  const parts = base64DataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
};

const hasBase64Photos = (payload) => {
  if (!payload) return false;
  if (typeof payload.photo_url === "string" && payload.photo_url.startsWith("data:image/")) return true;
  if (Array.isArray(payload.photo_urls) && payload.photo_urls.some(url => typeof url === "string" && url.startsWith("data:image/"))) return true;
  if (Array.isArray(payload.photo_urls_full) && payload.photo_urls_full.some(url => typeof url === "string" && url.startsWith("data:image/"))) return true;
  return false;
};


export default function TrackerApp({ tripId = null, isDemo = false, isReadOnly = false, externalTourStep = 0, hideFloatingButtons = false }) {
  // Lazy initializers: read localStorage synchronously on first render
  // so cached data is available on frame 1 — eliminates the $0.00 flicker on refresh
  const [expenses, setExpenses] = useState(() => {
    if (typeof window === 'undefined') return [];
    const key = isDemo ? 'tracker_expenses_demo' : (tripId ? `tracker_expenses_${tripId}` : null);
    if (!key) return [];
    try {
      const cached = localStorage.getItem(key);
      const parsedExpenses = cached ? JSON.parse(cached) : [];
      if (isDemo) {
        const today = new Date();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        
        const seedList = parsedExpenses.length > 0 ? parsedExpenses : [
          {
            id: "demo-exp-1",
            amount: 20.69,
            currency: "USD",
            category: "Food & Drink",
            note: "Delicious Local Street Dinner in Ubud",
            tags: []
          },
          {
            id: "demo-exp-2",
            amount: 125000,
            currency: "IDR",
            category: "Transportation",
            note: "Scooter Rental Ubud",
            tags: []
          },
          {
            id: "demo-exp-3",
            amount: 75.00,
            currency: "USD",
            category: "Other",
            note: "Scuba Diving in El Nido",
            worthIt: true,
            photoUrls: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop"],
            tags: ["worth-it"]
          },
          {
            id: "demo-exp-4",
            amount: 120.00,
            currency: "USD",
            category: "Accommodation",
            note: "Beachfront Bungalow (2 nights)",
            worthIt: true,
            tags: ["worth-it"]
          },
          {
            id: "demo-exp-5",
            amount: 8.50,
            currency: "USD",
            category: "Food & Drink",
            note: "Mango Sticky Rice & Fruit Shake",
            tags: []
          }
        ];

        return seedList.map((exp, idx) => {
          let targetDate = today;
          if (idx === 1) targetDate = yesterday;
          if (idx === 2) targetDate = twoDaysAgo;
          if (idx === 3) targetDate = threeDaysAgo;
          if (idx === 4) targetDate = yesterday;
          if (idx > 4) targetDate = threeDaysAgo;
          return {
            ...exp,
            timestamp: targetDate.toISOString()
          };
        });
      }
      const savedQueue = localStorage.getItem(`sync_queue_${tripId}`);
      const parsedQueue = savedQueue ? JSON.parse(savedQueue) : [];
      return getMergedExpenses(parsedExpenses, parsedQueue);
    } catch { return []; }
  });
  const [trip, setTrip] = useState(() => {
    if (typeof window === 'undefined') {
      return { name: isDemo ? 'My Local Trip' : 'Loading Trip...', homeCurrency: 'USD', localCurrency: 'USD', currentLocation: '' };
    }
    const key = isDemo ? 'tracker_trip_demo' : (tripId ? `tracker_trip_${tripId}` : null);
    if (key) {
      try {
        const cached = localStorage.getItem(key);
        if (cached) return JSON.parse(cached);
      } catch { /* fall through */ }
    }
    return { 
      name: isDemo ? 'Demo Trip (Southeast Asia)' : 'Loading Trip...', 
      homeCurrency: 'USD', 
      localCurrency: isDemo ? 'IDR' : 'USD', 
      currentLocation: isDemo ? 'Ubud, Bali' : '',
      dailyBudgetGoal: isDemo ? 100 : 0
    };
  });
  const [locationInput, setLocationInput] = useState("");
  const [rates, setRates] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_RATES;
    try {
      const cached = localStorage.getItem('tracker_rates');
      return cached ? JSON.parse(cached) : DEFAULT_RATES;
    } catch { return DEFAULT_RATES; }
  });
  const [customCurrencies, setCustomCurrencies] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const cached = localStorage.getItem('tracker_custom_currencies');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  // isMounted: true immediately if we have cached data, otherwise wait for cloud
  const [isMounted, setIsMounted] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (isDemo) return false; // demo path sets isMounted in useEffect
    const key = tripId ? `tracker_trip_${tripId}` : null;
    if (!key) return false;
    try {
      return !!localStorage.getItem(key);
    } catch { return false; }
  });
  const [activeModal, setActiveModal] = useState(null); // 'manual', 'voice', 'subscribe', 'auth', 'collaborators'
  const [editingExpense, setEditingExpense] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedLogDates, setExpandedLogDates] = useState([]);
  const [expandedOlderCategory, setExpandedOlderCategory] = useState({});
  const [showFuture, setShowFuture] = useState(false);
  const [todaySectionExpanded, setTodaySectionExpanded] = useState(false);
  const [logView, setLogView] = useState("recent"); // 'recent', 'plan', or 'history'
  const [demoTourStep, setDemoTourStep] = useState(isDemo ? 1 : 0);

  const handleTourStepTransition = (stepNumber) => {
    if (stepNumber === 1) {
      setLogView("recent");
      setActiveModal(null);
    } else if (stepNumber === 2 || stepNumber === 3 || stepNumber === 4 || stepNumber === 5) {
      setLogView("recent");
      setEditingExpense(null);
      setActiveModal("manual");
    } else if (stepNumber === 6) {
      setActiveModal(null);
      setLogView("plan");
    } else if (stepNumber === 7) {
      setActiveModal(null);
      setLogView("history");
    }
  };
  
  useEffect(() => {
    if (isDemo && externalTourStep > 0) {
      setDemoTourStep(externalTourStep);
      handleTourStepTransition(externalTourStep);
    }
  }, [externalTourStep, isDemo]);
  const [prevViewBeforeInsights, setPrevViewBeforeInsights] = useState("recent");
  const [planMonth, setPlanMonth] = useState(new Date().getMonth());
  const [planYear, setPlanYear] = useState(new Date().getFullYear());
  const [plannerViewMode, setPlannerViewMode] = useState("monthly"); // "monthly" or "weekly"
  const [planWeekStart, setPlanWeekStart] = useState(() => new Date());
  const [planDragStart, setPlanDragStart] = useState(null);
  const [planDragEnd, setPlanDragEnd] = useState(null);
  const [isPlanDragging, setIsPlanDragging] = useState(false);
  const [planDestinationInput, setPlanDestinationInput] = useState("");
  const [showPlanDestModal, setShowPlanDestModal] = useState(false);
  const [selectedPlanDate, setSelectedPlanDate] = useState(null);
  const [historyViewMode, setHistoryViewMode] = useState("cards"); // 'cards' or 'spreadsheet'
  const [drillDownExpenses, setDrillDownExpenses] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Undo/Redo toast state
  const [toastText, setToastText] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimeoutRef = useRef(null);

  // Redesigned tag consolidation state
  const [selectedMergeTags, setSelectedMergeTags] = useState([]);
  const [mergeTargetMode, setMergeTargetMode] = useState("");
  const [mergeCustomTargetName, setMergeCustomTargetName] = useState("");
  const [showMergePanel, setShowMergePanel] = useState(false);
  const [isConsolidating, setIsConsolidating] = useState(false);

  // Insights date range filtering state
  const [insightsStartDate, setInsightsStartDate] = useState(null);
  const [insightsEndDate, setInsightsEndDate] = useState(null);
  const [showInsightsCalendar, setShowInsightsCalendar] = useState(false);
  const [insightsCalMonth, setInsightsCalMonth] = useState(new Date().getMonth());
  const [insightsCalYear, setInsightsCalYear] = useState(new Date().getFullYear());
  const [insightsCalendarTarget, setInsightsCalendarTarget] = useState("start"); // "start" | "end"
  const [worthItShowPhotosOnly, setWorthItShowPhotosOnly] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [editingItineraryDate, setEditingItineraryDate] = useState(null);
  const [itineraryInput, setItineraryInput] = useState("");
  const [selectedPlannerDates, setSelectedPlannerDates] = useState([]);
  const [editingItineraryCell, setEditingItineraryCell] = useState(null); // { date: "YYYY-MM-DD", field: "location" | "notes" }
  const [plannerClipboard, setPlannerClipboard] = useState(null); // { location: "...", notes: "..." }
  const [batchLocationInput, setBatchLocationInput] = useState("");
  const [batchNotesInput, setBatchNotesInput] = useState("");
  const [plannerStartDate, setPlannerStartDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [pastOffset, setPastOffset] = useState(0);
  const [futureOffset, setFutureOffset] = useState(6); // Default to 1 week total (Start date + 6 future days)
  const [hoveredCell, setHoveredCell] = useState(null); // { dateStr, field }
  const [dragStartCell, setDragStartCell] = useState(null); // { dateStr, field, value }
  const [dragCurrentDateStr, setDragCurrentDateStr] = useState(null);
  const [expandedSpentDate, setExpandedSpentDate] = useState(null);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && supabase) {
      window.supabase = supabase;
    }
  }, [supabase]);

  const [showPlannerCalendar, setShowPlannerCalendar] = useState(false);
  const [plannerCalMonth, setPlannerCalMonth] = useState(() => new Date().getMonth());
  const [plannerCalYear, setPlannerCalYear] = useState(() => new Date().getFullYear());
  const plannerCalendarRef = useRef(null);
  const insightsCalendarRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        plannerCalendarRef.current &&
        !plannerCalendarRef.current.contains(event.target) &&
        !event.target.closest('[data-planner-calendar-toggle="true"]')
      ) {
        setShowPlannerCalendar(false);
      }
      if (
        insightsCalendarRef.current &&
        !insightsCalendarRef.current.contains(event.target) &&
        !event.target.closest('[data-insights-calendar-toggle="true"]')
      ) {
        setShowInsightsCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const showUndoRedoToast = (text) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastText(text);
    setToastVisible(true);
    toastTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };




  const getTodayLocationOverride = () => {
    if (!trip?.currentLocation) return "";
    const parsed = parseCurrentLocation(trip.currentLocation);
    const todayStr = new Date().toLocaleDateString('en-CA');
    if (parsed.date === todayStr) {
      return parsed.location;
    }
    return "";
  };

  const getResolvedDayLocation = (dateStr, expensesForDay) => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    if (dateStr === todayStr) {
      const override = getTodayLocationOverride();
      if (override) return override;
    }
    if (trip.itinerary && trip.itinerary[dateStr] !== undefined && trip.itinerary[dateStr] !== "") {
      const item = trip.itinerary[dateStr];
      if (typeof item === "string") return item;
      return item.location || "";
    }
    return "";
  };

  const getResolvedDayNotes = (dateStr) => {
    if (trip.itinerary && trip.itinerary[dateStr] !== undefined && trip.itinerary[dateStr] !== "") {
      const item = trip.itinerary[dateStr];
      if (typeof item === "string") return "";
      return item.notes || "";
    }
    return "";
  };
  const [isHomeCurrencyLocked, setIsHomeCurrencyLocked] = useState(true);
  const calendarContainerRef = useRef(null);

  const pushToUndo = (action) => {
    setUndoStack(prev => [...prev, action]);
    setRedoStack([]);
  };

  const executeUndoRedoAction = async (action, isUndo) => {
    if (!action) return null;
    const { type, data, oldData, newData, oldItinerary, newItinerary } = action;
    try {
      if (type === 'insert') {
        if (isUndo) {
          setExpenses(prev => prev.filter(e => e.id !== data.id));
          performCloudAction("delete", { id: data.id });
          return { type: 'delete', data };
        } else {
          setExpenses(prev => [data, ...prev]);
          performCloudAction("insert", {
            id: data.id,
            created_at: data.timestamp,
            amount: data.amount,
            currency: data.currency,
            category: data.category,
            title: data.title || data.note || "",
            notes: data.notes || "",
            worth_it: data.worthIt,
            establishment: data.establishment || data.location || "",
            tags: data.tags,
            trip_id: tripId,
            photo_url: data.photoUrl || null,
            photo_urls: data.photoUrls || (data.photoUrl ? [data.photoUrl] : []),
            photo_urls_full: data.photoUrlsFull || []
          });
          return { type: 'insert', data };
        }
      }

      if (type === 'delete') {
        if (isUndo) {
          setExpenses(prev => [data, ...prev]);
          performCloudAction("insert", {
            id: data.id,
            created_at: data.timestamp,
            amount: data.amount,
            currency: data.currency,
            category: data.category,
            title: data.title || data.note || "",
            notes: data.notes || "",
            worth_it: data.worthIt,
            establishment: data.establishment || data.location || "",
            tags: data.tags,
            trip_id: tripId,
            photo_url: data.photoUrl || null,
            photo_urls: data.photoUrls || (data.photoUrl ? [data.photoUrl] : []),
            photo_urls_full: data.photoUrlsFull || []
          });
          return { type: 'insert', data };
        } else {
          setExpenses(prev => prev.filter(e => e.id !== data.id));
          performCloudAction("delete", { id: data.id });
          return { type: 'delete', data };
        }
      }

      if (type === 'update') {
        const target = isUndo ? oldData : newData;
        const reverseTarget = isUndo ? newData : oldData;
        setExpenses(prev => prev.map(e => e.id === target.id ? target : e));
        performCloudAction("update", {
          id: target.id,
          amount: target.amount,
          currency: target.currency,
          category: target.category,
          title: target.title || target.note || "",
          notes: target.notes || "",
          worth_it: target.worthIt,
          establishment: target.establishment || target.location || "",
          tags: target.tags,
          created_at: target.timestamp,
          photo_url: target.photoUrl || null,
          photo_urls: target.photoUrls || (target.photoUrl ? [target.photoUrl] : []),
          photo_urls_full: target.photoUrlsFull || []
        });
        return { type: 'update', oldData: reverseTarget, newData: target };
      }

      if (type === 'insert_bulk') {
        if (isUndo) {
          const ids = data.map(e => e.id);
          setExpenses(prev => prev.filter(e => !ids.includes(e.id)));
          ids.forEach(id => {
            performCloudAction("delete", { id });
          });
          return { type: 'delete_bulk', data };
        } else {
          setExpenses(prev => [...data, ...prev]);
          data.forEach(e => {
            performCloudAction("insert", {
              id: e.id,
              created_at: e.timestamp,
              amount: e.amount,
              currency: e.currency,
              category: e.category,
              title: e.title || e.note || "",
              notes: e.notes || "",
              worth_it: e.worthIt,
              establishment: e.establishment || e.location || "",
              tags: e.tags,
              trip_id: tripId,
              photo_url: e.photoUrl || null,
              photo_urls: e.photoUrls || (e.photoUrl ? [e.photoUrl] : []),
              photo_urls_full: e.photoUrlsFull || []
            });
          });
          return { type: 'insert_bulk', data };
        }
      }

      if (type === 'delete_bulk') {
        if (isUndo) {
          setExpenses(prev => [...data, ...prev]);
          data.forEach(e => {
            performCloudAction("insert", {
              id: e.id,
              created_at: e.timestamp,
              amount: e.amount,
              currency: e.currency,
              category: e.category,
              title: e.title || e.note || "",
              notes: e.notes || "",
              worth_it: e.worthIt,
              establishment: e.establishment || e.location || "",
              tags: e.tags,
              trip_id: tripId,
              photo_url: e.photoUrl || null,
              photo_urls: e.photoUrls || (e.photoUrl ? [e.photoUrl] : []),
              photo_urls_full: e.photoUrlsFull || []
            });
          });
          return { type: 'insert_bulk', data };
        } else {
          const ids = data.map(e => e.id);
          setExpenses(prev => prev.filter(e => !ids.includes(e.id)));
          ids.forEach(id => {
            performCloudAction("delete", { id });
          });
          return { type: 'delete_bulk', data };
        }
      }

      if (type === 'update_bulk') {
        const deleteItems = isUndo ? newData : oldData;
        const insertItems = isUndo ? oldData : newData;
        const deleteIds = deleteItems.map(e => e.id);
        setExpenses(prev => {
          const filtered = prev.filter(e => !deleteIds.includes(e.id));
          return [...insertItems, ...filtered];
        });
        deleteIds.forEach(id => {
          performCloudAction("delete", { id });
        });
        insertItems.forEach(e => {
          performCloudAction("insert", {
            id: e.id,
            created_at: e.timestamp,
            amount: e.amount,
            currency: e.currency,
            category: e.category,
            title: e.title || e.note || "",
            notes: e.notes || "",
            worth_it: e.worthIt,
            establishment: e.establishment || e.location || "",
            tags: e.tags,
            trip_id: tripId,
            photo_url: e.photoUrl || null,
            photo_urls: e.photoUrls || (e.photoUrl ? [e.photoUrl] : []),
            photo_urls_full: e.photoUrlsFull || []
          });
        });
        return { type: 'update_bulk', oldData: isUndo ? newData : oldData, newData: isUndo ? oldData : newData };
      }

      if (type === 'update_itinerary') {
        const targetItinerary = isUndo ? oldItinerary : newItinerary;
        setTrip(prev => ({ ...prev, itinerary: targetItinerary }));
        performCloudAction("update_itinerary", { itinerary: targetItinerary });
        return { type: 'update_itinerary', oldItinerary: isUndo ? newItinerary : oldItinerary, newItinerary: targetItinerary, description: action.description };
      }
    } catch (e) {
      console.error("Error executing undo/redo:", e);
    }
    return null;
  };

  const handleUndo = async () => {
    if (undoStack.length === 0) return;
    const action = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    const redoAction = await executeUndoRedoAction(action, true);
    if (redoAction) {
      setRedoStack(prev => [...prev, redoAction]);
      const desc = action.description || action.type || "action";
      showUndoRedoToast(`Undid ${desc}`);
    }
  };

  const handleRedo = async () => {
    if (redoStack.length === 0) return;
    const action = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    const undoAction = await executeUndoRedoAction(action, false);
    if (undoAction) {
      setUndoStack(prev => [...prev, undoAction]);
      const desc = action.description || action.type || "action";
      showUndoRedoToast(`Redid ${desc}`);
    }
  };

  const getDrillDownList = () => {
    if (!drillDownExpenses) return [];
    const { tag, dateKey, category, list } = drillDownExpenses;
    if (tag) {
      return expenses.filter(e => {
        const cleanTags = e.tags ? e.tags.filter(t => !t.startsWith("spread-")) : [];
        return cleanTags.includes(tag);
      });
    }
    if (dateKey) {
      return expenses.filter(e => {
        const d = new Date(e.timestamp);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const matchesDate = k === dateKey;
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
  const [historyLimit, setHistoryLimit] = useState(14);
  const [searchQuery, setSearchQuery] = useState("");
  const [manualLocalCurrency, setManualLocalCurrency] = useState(null);

  useEffect(() => {
    setManualLocalCurrency(null);
  }, [expenses]);

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

  // Rapid Expense state variables
  const [rapidTitle, setRapidTitle] = useState("");
  const [rapidAmount, setRapidAmount] = useState("");
  const [rapidCurrency, setRapidCurrency] = useState(() => {
    return trip.localCurrency || "USD";
  });
  const [rapidCategory, setRapidCategory] = useState("Everything Else");
  const [rapidWorthIt, setRapidWorthIt] = useState(false);
  const [isAddingRapid, setIsAddingRapid] = useState(false);

  useEffect(() => {
    if (trip && trip.localCurrency) {
      setRapidCurrency(trip.localCurrency);
    }
  }, [trip?.localCurrency]);

  useEffect(() => {
    if (activeModal === "manual") {
      setRapidTitle("");
      setRapidAmount("");
      setRapidCategory("Everything Else");
      setRapidWorthIt(false);
    }
  }, [activeModal]);

  // Editable trip name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);
  const [isEditingLocale, setIsEditingLocale] = useState(false);
  const [localeSearchQuery, setLocaleSearchQuery] = useState("");
  const [localeResults, setLocaleResults] = useState([]);

  // Editable trip currencies state
  const [isEditingHomeCurrency, setIsEditingHomeCurrency] = useState(false);
  const [homeCurrencyInput, setHomeCurrencyInput] = useState("");
  const [isEditingLocalCurrency, setIsEditingLocalCurrency] = useState(false);
  const [localCurrencyInput, setLocalCurrencyInput] = useState("");

  // Offline background queue state
  const [syncQueue, setSyncQueue] = useState(() => {
    if (typeof window === 'undefined') return [];
    if (isDemo || !tripId) return [];
    try {
      const savedQueue = localStorage.getItem(`sync_queue_${tripId}`);
      return savedQueue ? JSON.parse(savedQueue) : [];
    } catch { return []; }
  });

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
  const isSavingLocaleRef = useRef(false);

  // Global Lightbox state
  const [globalLightbox, setGlobalLightbox] = useState({
    isOpen: false,
    photos: [],
    index: 0
  });
  const [lightboxScale, setLightboxScale] = useState(1);
  const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 });
  const [lightboxDragStart, setLightboxDragStart] = useState(null);

  const touchStartDistanceRef = useRef(0);
  const touchStartScaleRef = useRef(1);
  const lastTapRef = useRef(0);
  const lightboxImageRef = useRef(null);
  const currentScaleRef = useRef(1);
  const currentPanRef = useRef({ x: 0, y: 0 });

  const updateLightboxImageTransform = (scale, pan) => {
    if (lightboxImageRef.current) {
      lightboxImageRef.current.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${scale})`;
    }
  };

  const handleLightboxStartDrag = (e) => {
    // Sync current values to refs for calculations
    currentScaleRef.current = lightboxScale;
    currentPanRef.current = lightboxPan;

    if (e.touches && e.touches.length === 2) {
      // Start two-finger pinch zoom
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistanceRef.current = dist;
      touchStartScaleRef.current = lightboxScale;
      setLightboxDragStart(null);
      if (lightboxImageRef.current) {
        lightboxImageRef.current.style.transition = "none";
      }
      return;
    }

    if (lightboxScale <= 1) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setLightboxDragStart({ x: clientX - lightboxPan.x, y: clientY - lightboxPan.y });
    if (lightboxImageRef.current) {
      lightboxImageRef.current.style.transition = "none";
    }
  };

  const handleLightboxDrag = (e) => {
    if (e.touches && e.touches.length === 2 && touchStartDistanceRef.current > 0) {
      // Two-finger pinch zoom active
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchStartDistanceRef.current;
      const newScale = Math.min(4, Math.max(1, touchStartScaleRef.current * ratio));
      
      currentScaleRef.current = newScale;
      if (newScale <= 1) {
        currentPanRef.current = { x: 0, y: 0 };
      }

      updateLightboxImageTransform(currentScaleRef.current, currentPanRef.current);
      return;
    }

    if (!lightboxDragStart || lightboxScale <= 1) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    currentPanRef.current = {
      x: clientX - lightboxDragStart.x,
      y: clientY - lightboxDragStart.y
    };

    updateLightboxImageTransform(currentScaleRef.current, currentPanRef.current);
  };

  const handleLightboxEndDrag = () => {
    setLightboxDragStart(null);
    touchStartDistanceRef.current = 0;

    // Apply hardware-accelerated state update at gesture completion to sync React state
    setLightboxScale(currentScaleRef.current);
    setLightboxPan(currentPanRef.current);

    if (lightboxImageRef.current) {
      lightboxImageRef.current.style.transition = "transform 0.15s ease-out";
    }
  };

  const handleLightboxDoubleTap = (e) => {
    if (!e.touches) return;
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      e.preventDefault();
      if (lightboxScale > 1) {
        currentScaleRef.current = 1;
        currentPanRef.current = { x: 0, y: 0 };
      } else {
        currentScaleRef.current = 2.5;
        currentPanRef.current = { x: 0, y: 0 };
      }
      setLightboxScale(currentScaleRef.current);
      setLightboxPan(currentPanRef.current);
      updateLightboxImageTransform(currentScaleRef.current, currentPanRef.current);
    }
    lastTapRef.current = now;
  };

  // Reset zoom whenever lightbox photo index or openness changes
  useEffect(() => {
    setLightboxScale(1);
    setLightboxPan({ x: 0, y: 0 });
    setLightboxDragStart(null);
    currentScaleRef.current = 1;
    currentPanRef.current = { x: 0, y: 0 };
    updateLightboxImageTransform(1, { x: 0, y: 0 });
  }, [globalLightbox.isOpen, globalLightbox.index]);

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
    // rates and customCurrencies are already loaded via lazy initializers (frame 1).
    // Only load things that couldn't be done lazily (e.g. subscribed flag).
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
          currentLocation: "Manila",
          itinerary: {}
        });
      }

      const savedExpenses = localStorage.getItem("tracker_expenses_demo");
      const parsedExpenses = savedExpenses ? JSON.parse(savedExpenses) : [];
      
      const today = new Date();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      
      const seedList = parsedExpenses.length > 0 ? parsedExpenses : [
        {
          id: "demo-exp-1",
          amount: 20.69,
          currency: "USD",
          category: "Food & Drink",
          note: "Delicious Local Street Dinner in Ubud",
          tags: []
        },
        {
          id: "demo-exp-2",
          amount: 125000,
          currency: "IDR",
          category: "Transportation",
          note: "Scooter Rental Ubud",
          tags: []
        },
        {
          id: "demo-exp-3",
          amount: 75.00,
          currency: "USD",
          category: "Other",
          note: "Scuba Diving in El Nido",
          worthIt: true,
          photoUrls: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop"],
          tags: ["worth-it"]
        },
        {
          id: "demo-exp-4",
          amount: 120.00,
          currency: "USD",
          category: "Accommodation",
          note: "Beachfront Bungalow (2 nights)",
          worthIt: true,
          tags: ["worth-it"]
        },
        {
          id: "demo-exp-5",
          amount: 8.50,
          currency: "USD",
          category: "Food & Drink",
          note: "Mango Sticky Rice & Fruit Shake",
          tags: []
        }
      ];

      const mappedExpenses = seedList.map((exp, idx) => {
        let targetDate = today;
        if (idx === 1) targetDate = yesterday;
        if (idx === 2) targetDate = twoDaysAgo;
        if (idx === 3) targetDate = threeDaysAgo;
        if (idx === 4) targetDate = yesterday;
        if (idx > 4) targetDate = threeDaysAgo;
        return {
          ...exp,
          timestamp: targetDate.toISOString()
        };
      });

      setExpenses(mappedExpenses);
      localStorage.setItem("tracker_expenses_demo", JSON.stringify(mappedExpenses));

      if (parsedTrip && !parsedTrip.currentLocation && parsedExpenses.length > 0) {
        const lastExp = parsedExpenses.find((e) => e.location);
        if (lastExp) {
          setTrip((prev) => ({ ...prev, currentLocation: lastExp.location }));
        }
      }
      setIsMounted(true);
    } else if (tripId && supabase) {
      // State is already pre-populated from lazy initializers (frame 1).
      // isMounted was set to true synchronously if cache existed.
      // Just ensure isMounted is set in case there was no cache.
      setIsMounted(true);

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
    if (isDemo) return;
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
      setLocationInput(parseCurrentLocation(trip.currentLocation).location);
    }
  }, [trip?.currentLocation]);

  // Save changes locally
  useEffect(() => {
    if (isMounted) {
      const key = isDemo ? "tracker_trip_demo" : `tracker_trip_${tripId}`;
      safeSetLocalStorage(key, JSON.stringify(trip));
    }
  }, [trip, isMounted, isDemo, tripId]);

  useEffect(() => {
    if (isMounted) {
      const key = isDemo ? "tracker_expenses_demo" : `tracker_expenses_${tripId}`;
      safeSetLocalStorage(key, JSON.stringify(expenses));
    }
  }, [expenses, isMounted, isDemo, tripId]);

  // Auto-sync stale/empty current_location in the database when the day changes
  const [activeDateKey, setActiveDateKey] = useState("");

  useEffect(() => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    setActiveDateKey(todayStr);
    
    // Set up a timer to update activeDateKey at midnight
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const msToMidnight = midnight.getTime() - now.getTime();
    
    const timer = setTimeout(() => {
      setActiveDateKey(new Date().toLocaleDateString('en-CA'));
    }, msToMidnight);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isDemo || !tripId || !supabase || !isMounted || !trip || !activeDateKey) return;

    const parsedCurrent = parseCurrentLocation(trip.currentLocation);
    
    // Only auto-sync if the database current_location date is stale (not today)
    if (parsedCurrent.date !== activeDateKey) {
      console.log("[Sync] Stale database current_location date detected. Auto-syncing with itinerary...");
      let todayLocation = "";
      if (trip.itinerary && trip.itinerary[activeDateKey]) {
        const item = trip.itinerary[activeDateKey];
        todayLocation = typeof item === "string" ? item : (item.location || "");
      }

      const targetLocWithDate = todayLocation ? `${todayLocation}|${activeDateKey}` : "";
      setTrip(prev => ({ ...prev, currentLocation: targetLocWithDate }));
      
      supabase
        .from("trips")
        .update({ current_location: targetLocWithDate })
        .eq("id", tripId)
        .then(({ error }) => {
          if (error) console.error("Failed to auto-update current_location:", error);
          else console.log("Successfully auto-updated current_location in DB.");
        });
    }
  }, [activeDateKey, isMounted, tripId, isDemo]);

  // Offline background queue storage & processing
  const [isOnline, setIsOnline] = useState(typeof window !== "undefined" ? navigator.onLine : true);



  const syncQueueRef = useRef(syncQueue);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    syncQueueRef.current = syncQueue;
  }, [syncQueue]);

  useEffect(() => {
    if (!isDemo && tripId && isMounted) {
      safeSetLocalStorage(`sync_queue_${tripId}`, JSON.stringify(syncQueue));
    }
  }, [syncQueue, tripId, isMounted, isDemo]);

  const processSyncQueue = async (customQueue = null) => {
    const queue = customQueue || syncQueueRef.current || [];
    console.log("[Sync] processSyncQueue called. Queue length:", queue.length);
    if (isDemo || queue.length === 0 || !navigator.onLine || !supabase || isSyncingRef.current) {
      console.log("[Sync] processSyncQueue returning early:", { isDemo, queueLength: queue.length, onLine: navigator.onLine, hasSupabase: !!supabase, isSyncingRef: isSyncingRef.current });
      return;
    }

    isSyncingRef.current = true;
    setIsSyncing(true);
    let successCount = 0;
    let syncFailedWith = null;

    console.log("[Sync] Start processing queue of", queue.length, "items");
    try {
      for (const op of queue) {
        console.log("[Sync] Processing op:", op.type, op.payload?.id || op.payload);
        try {
          if (op.payload) {
            const payloadCopy = { ...op.payload };
            
            // Backward-compatibility mappings for older database column structures
            if (payloadCopy.location !== undefined && payloadCopy.establishment === undefined) {
              payloadCopy.establishment = payloadCopy.location;
              delete payloadCopy.location;
            }
            if (payloadCopy.note !== undefined && payloadCopy.title === undefined) {
              payloadCopy.title = payloadCopy.note;
              delete payloadCopy.note;
            }
            if (payloadCopy.location_locale !== undefined) {
              delete payloadCopy.location_locale;
            }
            
            // Upload thumbnails (photo_urls)
            if (Array.isArray(payloadCopy.photo_urls) && payloadCopy.photo_urls.length > 0) {
              const uploadedUrls = [];
              for (let i = 0; i < payloadCopy.photo_urls.length; i++) {
                const url = payloadCopy.photo_urls[i];
                if (typeof url === "string" && url.startsWith("data:image/")) {
                  try {
                    const blob = base64ToBlob(url);
                    const path = `${tripId}/${payloadCopy.id || 'unassigned'}_${i}_thumb.jpg`;
                    const { error: uploadErr } = await supabase.storage.from("receipts").upload(path, blob, { contentType: "image/jpeg", upsert: true });
                    if (uploadErr) throw uploadErr;
                    
                    const { data: { publicUrl } } = supabase.storage.from("receipts").getPublicUrl(path);
                    uploadedUrls.push(publicUrl);
                    console.log("[Sync] Successfully uploaded thumbnail to storage:", publicUrl);
                  } catch (e) {
                    console.error("Failed to upload thumbnail to storage:", e);
                    throw e;
                  }
                } else {
                  uploadedUrls.push(url);
                }
              }
              payloadCopy.photo_urls = uploadedUrls;
              if (uploadedUrls.length > 0) {
                payloadCopy.photo_url = uploadedUrls[0];
              }
            }

            // Upload full-resolution images (photo_urls_full)
            if (Array.isArray(payloadCopy.photo_urls_full) && payloadCopy.photo_urls_full.length > 0) {
              const uploadedUrls = [];
              for (let i = 0; i < payloadCopy.photo_urls_full.length; i++) {
                const url = payloadCopy.photo_urls_full[i];
                if (typeof url === "string" && url.startsWith("data:image/")) {
                  try {
                    const blob = base64ToBlob(url);
                    const path = `${tripId}/${payloadCopy.id || 'unassigned'}_${i}_full.jpg`;
                    const { error: uploadErr } = await supabase.storage.from("receipts").upload(path, blob, { contentType: "image/jpeg", upsert: true });
                    if (uploadErr) throw uploadErr;
                    
                    const { data: { publicUrl } } = supabase.storage.from("receipts").getPublicUrl(path);
                    uploadedUrls.push(publicUrl);
                    console.log("[Sync] Successfully uploaded full-res photo to storage:", publicUrl);
                  } catch (e) {
                    console.error("Failed to upload full-res photo to storage:", e);
                    throw e;
                  }
                } else {
                  uploadedUrls.push(url);
                }
              }
              payloadCopy.photo_urls_full = uploadedUrls;
            }

            op.payload = payloadCopy;
          }

          let error = null;
          if (op.type === "insert") {
            console.log("[Sync] Upserting entry...");
            const { error: err } = await supabase.from("trip_entries").upsert(op.payload);
            error = err;
          } else if (op.type === "update") {
            console.log("[Sync] Updating entry...");
            const { error: err } = await supabase.from("trip_entries").update(op.payload).eq("id", op.payload.id);
            error = err;
          } else if (op.type === "delete") {
            console.log("[Sync] Deleting entry...");
            const { error: err } = await supabase.from("trip_entries").delete().eq("id", op.payload.id);
            error = err;
          } else if (op.type === "update_itinerary") {
            console.log("[Sync] Updating itinerary...");
            const updateObj = { itinerary: op.payload.itinerary };
            if (op.payload.current_location !== undefined) {
              updateObj.current_location = op.payload.current_location;
            }
            const { error: err } = await supabase.from("trips").update(updateObj).eq("id", tripId);
            error = err;
          }
          if (error) {
            console.error("[Sync] Supabase error:", error);
            throw error;
          }
          console.log("[Sync] Op succeeded!");
          successCount++;
        } catch (err) {
          console.error("Queue execution error:", err);
          syncFailedWith = err;
          break; // Stop sequencing to maintain order of operations
        }
      }

      console.log("[Sync] Queue processed. Success count:", successCount);
      if (successCount > 0) {
        setSyncQueue((prev) => prev.slice(successCount));
      }
      
      const updatedQueue = (syncQueueRef.current || []).slice(successCount);
      if (updatedQueue.length === 0) {
        setSyncError(null);
      } else if (syncFailedWith) {
        setSyncError(`Sync error: ${syncFailedWith.message || syncFailedWith.toString()}`);
      } else {
        setSyncError("Sync pending. Action queued.");
      }
    } finally {
      setIsSyncing(false);
      isSyncingRef.current = false;
      console.log("[Sync] Finished processSyncQueue run");
      if (successCount > 0) {
        setTimeout(() => {
          if (syncQueueRef.current && syncQueueRef.current.length > 0 && !isSyncingRef.current && navigator.onLine) {
            console.log("[Sync] More items found in queue after run, triggering processSyncQueue");
            processSyncQueue();
          }
        }, 0);
      }
    }
  };

  useEffect(() => {
    if (!isDemo && tripId) {
      if (syncQueue.length > 0 && navigator.onLine) {
        processSyncQueue(syncQueue);
      }
    }
  }, [tripId, isDemo]);

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
  }, []);

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
              title: newRow.title || newRow.note || "",
              notes: newRow.notes || "",
              worthIt: newRow.worth_it,
              establishment: newRow.establishment || newRow.location || "",
              tags: newRow.tags || [],
              hasPhoto: newRow.has_photo || false,
              photoUrl: appendCacheBuster(newRow.photo_url || ""),
              photoUrls: Array.isArray(newRow.photo_urls) 
                ? newRow.photo_urls.map(appendCacheBuster) 
                : (newRow.photo_url ? [appendCacheBuster(newRow.photo_url)] : []),
              photoUrlsFull: newRow.photo_urls_full || [],
              deletedAt: newRow.deleted_at || null
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
              title: newRow.title || newRow.note || "",
              notes: newRow.notes || "",
              worthIt: newRow.worth_it,
              establishment: newRow.establishment || newRow.location || "",
              tags: newRow.tags || [],
              hasPhoto: newRow.has_photo || false,
              photoUrl: appendCacheBuster(newRow.photo_url || ""),
              photoUrls: Array.isArray(newRow.photo_urls) 
                ? newRow.photo_urls.map(appendCacheBuster) 
                : (newRow.photo_url ? [appendCacheBuster(newRow.photo_url)] : []),
              photoUrlsFull: newRow.photo_urls_full || [],
              deletedAt: newRow.deleted_at || null
            };
            setExpenses((prev) => prev.map(e => e.id === mapped.id ? mapped : e));
          } else if (eventType === "DELETE") {
            setExpenses((prev) => prev.filter(e => e.id !== oldRow.id));
          }
        }
      )
      .subscribe();

    const tripChannel = supabase
      .channel(`realtime:trips:${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trips",
          filter: `id=eq.${tripId}`
        },
        (payload) => {
          const { new: newRow } = payload;
          if (newRow) {
            setTrip((prev) => {
              if (!prev) return prev;
              const hasUnsyncedItinerary = syncQueueRef.current?.some(q => q.type === "update_itinerary");
              return {
                ...prev,
                name: newRow.name || prev.name,
                homeCurrency: newRow.home_currency || prev.homeCurrency || "USD",
                localCurrency: newRow.local_currency || prev.localCurrency || "USD",
                currentLocation: newRow.current_location !== undefined ? newRow.current_location : prev.currentLocation,
                itinerary: hasUnsyncedItinerary ? prev.itinerary : (newRow.itinerary || prev.itinerary || {})
              };
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(tripChannel);
    };
  }, [tripId, isDemo]);

  // Helper for background cloud syncing
  const performCloudAction = async (type, payload) => {
    if (isDemo || !tripId || !supabase) return;

    const currentQueue = syncQueueRef.current || [];
    const hasBase64 = hasBase64Photos(payload);

    if (currentQueue.length > 0 || !navigator.onLine || hasBase64) {
      const newItem = { type, payload, timestamp: Date.now() };
      const nextQueue = [...currentQueue, newItem];
      setSyncQueue(nextQueue);
      if (!navigator.onLine) {
        setSyncError("Working offline. Action queued.");
      } else {
        setSyncError("Sync pending. Action queued.");
        processSyncQueue(nextQueue);
      }
      return;
    }

    try {
      let error = null;
      if (type === "insert") {
        const { error: err } = await supabase.from("trip_entries").upsert(payload);
        error = err;
      } else if (type === "update") {
        const { error: err } = await supabase.from("trip_entries").update(payload).eq("id", payload.id);
        error = err;
      } else if (type === "delete") {
        const { error: err } = await supabase.from("trip_entries").delete().eq("id", payload.id);
        error = err;
      } else if (type === "update_itinerary") {
        const updateObj = { itinerary: payload.itinerary };
        if (payload.current_location !== undefined) {
          updateObj.current_location = payload.current_location;
        }
        const { error: err } = await supabase.from("trips").update(updateObj).eq("id", tripId);
        error = err;
      }
      if (error) throw error;
    } catch (err) {
      console.error("Cloud action failed, queuing:", err);
      const newItem = { type, payload, timestamp: Date.now() };
      const nextQueue = [...currentQueue, newItem];
      setSyncQueue(nextQueue);
      setSyncError("Sync pending. Action queued.");
      processSyncQueue(nextQueue);
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
        const dbEntries = expenses.map((e) => {
          const entry = {
            trip_id: tripData.id,
            created_by: user.id,
            amount: e.amount,
            currency: e.currency,
            category: e.category,
            title: e.title || e.note || "",
            notes: e.notes || "",
            worth_it: e.worthIt,
            establishment: e.establishment || e.location || "",
            tags: e.tags,
            created_at: e.timestamp,
            photo_url: e.photoUrl || null,
            photo_urls: e.photoUrls || [],
            photo_urls_full: e.photoUrlsFull || []
          };
          if (e.id && !e.id.startsWith("demo-")) {
            entry.id = e.id;
          }
          return entry;
        });
        const { error: expErr } = await supabase.from("trip_entries").insert(dbEntries);
        if (expErr) throw expErr;
      }

      localStorage.removeItem("tracker_trip_demo");
      localStorage.removeItem("tracker_expenses_demo");

      safeSetLocalStorage(`tracker_trip_${tripData.id}`, JSON.stringify({
        id: tripData.id,
        name: tripData.name,
        homeCurrency: trip.homeCurrency,
        localCurrency: trip.localCurrency,
        currentLocation: trip.currentLocation
      }));
      safeSetLocalStorage(`tracker_expenses_${tripData.id}`, JSON.stringify(expenses));

      alert("Trip saved to cloud successfully!");
      window.location.href = `/tracker/trip/${tripData.id}`;
    } catch (err) {
      console.error("Migration failed:", err);
      alert("Failed to migrate demo data to the cloud: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Excel-style drag-to-fill mouseup handler
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (dragStartCell && dragCurrentDateStr) {
        const daysList = getPlannerDaysList(plannerStartDate, pastOffset, futureOffset);
        const idx1 = daysList.findIndex(d => d.dateStr === dragStartCell.dateStr);
        const idx2 = daysList.findIndex(d => d.dateStr === dragCurrentDateStr);
        if (idx1 !== -1 && idx2 !== -1) {
          const startIdx = Math.min(idx1, idx2);
          const endIdx = Math.max(idx1, idx2);
          const updates = {};
          for (let i = startIdx; i <= endIdx; i++) {
            const dStr = daysList[i].dateStr;
            if (dragStartCell.field === "location") {
              updates[dStr] = { location: dragStartCell.value };
            } else {
              updates[dStr] = { notes: dragStartCell.value };
            }
          }
          updateItineraryLocationsBatch(updates);
        }
      }
      setDragStartCell(null);
      setDragCurrentDateStr(null);
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchend", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, [dragStartCell, dragCurrentDateStr, plannerStartDate, pastOffset, futureOffset]);

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
          safeSetLocalStorage("tracker_rates", JSON.stringify(merged));
          safeSetLocalStorage("tracker_rates_last_updated", now.toString());
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
        safeSetLocalStorage(cacheKey, "true");
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
      const tripResult = await supabase
        .from("trips")
        .select("*")
        .eq("id", tripId)
        .single();

      if (tripResult.error) throw tripResult.error;

      let expensesResult = await supabase
        .from("trip_entries")
        .select("id, trip_id, created_by, amount, currency, category, title, notes, worth_it, establishment, tags, created_at, updated_at, has_photo, photo_url, photo_urls, deleted_at")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: false });

      if (expensesResult.error && expensesResult.error.message?.includes("deleted_at")) {
        console.warn("deleted_at column missing, falling back to legacy select");
        expensesResult = await supabase
          .from("trip_entries")
          .select("id, trip_id, created_by, amount, currency, category, title, notes, worth_it, establishment, tags, created_at, updated_at, has_photo, photo_url, photo_urls")
          .eq("trip_id", tripId)
          .order("created_at", { ascending: false });
      }

      if (expensesResult.error) throw expensesResult.error;

      const tripData = tripResult.data;
      const expensesData = expensesResult.data;

      const newTrip = {
        id: tripData.id,
        name: tripData.name,
        homeCurrency: tripData.home_currency || "USD",
        localCurrency: tripData.local_currency || "USD",
        currentLocation: tripData.current_location || "",
        itinerary: tripData.itinerary || {}
      };
      setTrip(newTrip);

      const mappedExpenses = expensesData.map((e) => ({
        id: e.id,
        timestamp: e.created_at || new Date().toISOString(),
        amount: parseFloat(e.amount),
        currency: e.currency,
        category: e.category,
        title: e.title || e.note || "",
        notes: e.notes || "",
        worthIt: e.worth_it,
        establishment: e.establishment || e.location || "",
        tags: e.tags || [],
        hasPhoto: e.has_photo || false,
        photoUrl: e.photo_url || "",
        photoUrls: e.photo_urls || (e.photo_url ? [e.photo_url] : []),
        photoUrlsFull: [],
        deletedAt: e.deleted_at || null
      }));
      const latestQueue = (() => {
        try {
          const saved = localStorage.getItem(`sync_queue_${tripId}`);
          return saved ? JSON.parse(saved) : (syncQueueRef.current || []);
        } catch {
          return syncQueueRef.current || [];
        }
      })();
      const merged = getMergedExpenses(mappedExpenses, latestQueue);
      setExpenses(merged);

      safeSetLocalStorage(`tracker_trip_${tripId}`, JSON.stringify(newTrip));
      safeSetLocalStorage(`tracker_expenses_${tripId}`, JSON.stringify(merged));
      
      // Auto-subscribe to mailer list on successful trip load (non-blocking)
      supabase.auth.getSession().then(({ data: { session: currentSess } }) => {
        if (currentSess?.user?.email) {
          handleAutoSubscribe(currentSess.user.email);
        }
      }).catch(err => console.error("Session load error in background:", err));
    } catch (e) {
      console.error("Supabase sync failed, loading locally.", e);
      setSyncError(`Cloud connection error: ${e.message || e.toString()}`);
    } finally {
      setIsSyncing(false);
      setIsMounted(true);
    }
  };

  const updateLocation = async (loc) => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const locWithDate = loc ? `${loc}|${todayStr}` : "";

    let updatedItinerary = trip.itinerary || {};
    let shouldUpdateItinerary = false;

    if (loc) {
      const oldItinerary = trip.itinerary || {};
      const existing = oldItinerary[todayStr];
      const existingObj = typeof existing === "string"
        ? { location: existing, notes: "" }
        : (existing || { location: "", notes: "" });

      updatedItinerary = {
        ...oldItinerary,
        [todayStr]: {
          ...existingObj,
          location: loc
        }
      };
      shouldUpdateItinerary = true;

      pushToUndo({
        type: 'update_itinerary',
        oldItinerary,
        newItinerary: updatedItinerary,
        description: "manual location override"
      });
    }

    setTrip((prev) => {
      const nextTrip = { ...prev, currentLocation: locWithDate };
      if (shouldUpdateItinerary) {
        nextTrip.itinerary = updatedItinerary;
      }
      return nextTrip;
    });

    const payload = { current_location: locWithDate };
    if (shouldUpdateItinerary) {
      payload.itinerary = updatedItinerary;
    }
    performCloudAction("update_itinerary", payload);
  };

  const saveLocaleAndSyncItinerary = async (loc) => {
    if (isSavingLocaleRef.current) return;
    isSavingLocaleRef.current = true;
    setIsEditingLocale(false);
    try {
      await updateLocation(loc.trim());
    } finally {
      isSavingLocaleRef.current = false;
    }
  };

  const updateItineraryLocation = async (dateKey, locationText) => {
    const oldItinerary = trip.itinerary || {};
    const existing = oldItinerary[dateKey];
    const existingObj = typeof existing === "string"
      ? { location: existing, notes: "" }
      : (existing || { location: "", notes: "" });

    const updatedItinerary = {
      ...oldItinerary,
      [dateKey]: {
        ...existingObj,
        location: locationText
      }
    };
    pushToUndo({
      type: 'update_itinerary',
      oldItinerary,
      newItinerary: updatedItinerary,
      description: "planned location"
    });

    const todayStr = new Date().toLocaleDateString('en-CA');
    const locWithDate = locationText ? `${locationText}|${todayStr}` : "";

    setTrip((prev) => {
      const nextTrip = { ...prev, itinerary: updatedItinerary };
      if (dateKey === todayStr) {
        nextTrip.currentLocation = locWithDate;
      }
      return nextTrip;
    });

    const payload = { itinerary: updatedItinerary };
    if (dateKey === todayStr) {
      payload.current_location = locWithDate;
    }
    performCloudAction("update_itinerary", payload);
  };

  const updateItineraryNotes = async (dateKey, notesText) => {
    const oldItinerary = trip.itinerary || {};
    const existing = oldItinerary[dateKey];
    const existingObj = typeof existing === "string"
      ? { location: existing, notes: "" }
      : (existing || { location: "", notes: "" });

    const updatedItinerary = {
      ...oldItinerary,
      [dateKey]: {
        ...existingObj,
        notes: notesText
      }
    };
    pushToUndo({
      type: 'update_itinerary',
      oldItinerary,
      newItinerary: updatedItinerary,
      description: "planned notes"
    });
    setTrip((prev) => ({ ...prev, itinerary: updatedItinerary }));
    performCloudAction("update_itinerary", { itinerary: updatedItinerary });
  };

  const updateItineraryLocationsBatch = async (updates) => {
    const oldItinerary = trip.itinerary || {};
    const updatedItinerary = { ...oldItinerary };
    Object.entries(updates).forEach(([dateKey, val]) => {
      const existing = updatedItinerary[dateKey];
      const existingObj = typeof existing === "string"
        ? { location: existing, notes: "" }
        : (existing || { location: "", notes: "" });

      if (typeof val === "string") {
        updatedItinerary[dateKey] = {
          ...existingObj,
          location: val
        };
      } else {
        updatedItinerary[dateKey] = {
          ...existingObj,
          ...val
        };
      }
    });

    pushToUndo({
      type: 'update_itinerary',
      oldItinerary,
      newItinerary: updatedItinerary,
      description: "fill planned location"
    });

    const todayStr = new Date().toLocaleDateString('en-CA');
    let locWithDate = undefined;
    if (updates[todayStr] !== undefined) {
      const val = updates[todayStr];
      const newLoc = typeof val === "string" ? val : (val.location || "");
      locWithDate = newLoc ? `${newLoc}|${todayStr}` : "";
    }

    setTrip((prev) => {
      const nextTrip = { ...prev, itinerary: updatedItinerary };
      if (locWithDate !== undefined) {
        nextTrip.currentLocation = locWithDate;
      }
      return nextTrip;
    });

    const payload = { itinerary: updatedItinerary };
    if (locWithDate !== undefined) {
      payload.current_location = locWithDate;
    }
    performCloudAction("update_itinerary", payload);
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
    const cleanName = nameInput.trim().slice(0, 30);
    if (!cleanName) return;
    setTrip((prev) => ({ ...prev, name: cleanName }));
    if (!isDemo && tripId && supabase) {
      try {
        await supabase
          .from("trips")
          .update({ name: cleanName })
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

  const updateTripVisibility = async (isPublicVal) => {
    setTrip((prev) => ({ ...prev, isPublic: isPublicVal }));
    if (!isDemo && tripId && supabase) {
      try {
        await supabase.from("trips").update({ is_public: isPublicVal }).eq("id", tripId);
      } catch (e) {
        console.error("Failed to sync visibility to cloud:", e);
      }
    }
  };

  const updateDailyBudgetGoal = async (goalVal) => {
    const val = parseFloat(goalVal) || 0;
    setTrip((prev) => ({ ...prev, dailyBudgetGoal: val }));
    const key = isDemo ? 'tracker_trip_demo' : (tripId ? `tracker_trip_${tripId}` : null);
    if (key) {
      try {
        const updated = { ...trip, dailyBudgetGoal: val };
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save daily budget goal locally:", e);
      }
    }
    if (!isDemo && tripId && supabase) {
      try {
        await supabase.from("trips").update({ daily_budget_goal: val }).eq("id", tripId);
      } catch (e) {
        console.error("Failed to sync daily budget goal to cloud:", e);
      }
    }
  };

  const addCustomCurrency = (curr) => {
    setCustomCurrencies((prev) => {
      const merged = [...new Set([...prev, curr])];
      safeSetLocalStorage("tracker_custom_currencies", JSON.stringify(merged));
      return merged;
    });
  };

  const handleSaveHomeCurrency = () => {
    const resolved = resolveCurrency(homeCurrencyInput);
    if (resolved) {
      updateHomeCurrency(resolved);
      if (!DEFAULT_RATES[resolved]) {
        addCustomCurrency(resolved);
      }
    }
    setIsEditingHomeCurrency(false);
  };

  const handleSaveLocalCurrency = () => {
    const resolved = resolveCurrency(localCurrencyInput);
    if (resolved) {
      updateLocalCurrency(resolved);
      setManualLocalCurrency(resolved);
      safeSetLocalStorage("tracker_last_used_currency", resolved);
      if (!DEFAULT_RATES[resolved]) {
        addCustomCurrency(resolved);
      }
    }
    setIsEditingLocalCurrency(false);
  };

  const activeExpenses = useMemo(() => expenses.filter(e => !e.deletedAt), [expenses]);

  const allHistoricalTags = (() => {
    const tagCounts = {};
    activeExpenses.forEach(e => {
      if (e.tags) {
        e.tags.forEach(t => {
          if (!t.startsWith("spread-") && !t.startsWith("spread-group-")) {
            tagCounts[t] = (tagCounts[t] || 0) + 1;
          }
        });
      }
    });
    return Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);
  })();

  const saveExpense = async (expense) => {
    if (expense.delete) {
      const nowStr = new Date().toISOString();
      if (expense.deleteEntireGroup && expense.groupTag) {
        const siblings = expenses.filter(e => e.tags && e.tags.includes(expense.groupTag));
        pushToUndo({ type: 'delete_bulk', data: siblings, description: "delete group expenses" });
        const siblingIds = siblings.map(s => s.id);
        setExpenses((prev) => prev.map((e) => siblingIds.includes(e.id) ? { ...e, deletedAt: nowStr } : e));
        if (!isDemo && tripId) {
          siblings.forEach(s => {
            performCloudAction("update", { id: s.id, deleted_at: nowStr });
          });
        }
      } else {
        const oldExp = expenses.find(e => e.id === expense.id);
        if (oldExp) {
          pushToUndo({ type: 'delete', data: oldExp, description: "delete expense" });
        }
        setExpenses((prev) => prev.map((e) => e.id === expense.id ? { ...e, deletedAt: nowStr } : e));
        if (!isDemo && tripId) {
          performCloudAction("update", { id: expense.id, deleted_at: nowStr });
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

        const oldStartTag = siblings[0]?.tags?.find(t => t.startsWith("spread-start-"));
        const oldN = siblings.length;
        const newStartStr = `spread-start-${expense.spreadStart}`;
        const newN = expense.spreadDays;

        if (oldN === newN && oldStartTag === newStartStr) {
          // SAFE UPDATE IN-PLACE! (Failsafe to prevent data loss when only photos or details are changed)
          const sortedSiblings = [...siblings].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

          const totalAmount = expense.amount;
          const isRepeat = expense.spreadMode === "repeat";
          const dailyAmount = isRepeat ? totalAmount : parseFloat((totalAmount / newN).toFixed(2));
          const remainder = isRepeat ? 0 : parseFloat((totalAmount - dailyAmount * newN).toFixed(2));

          const baseTags = expense.tags.filter(t => !t.startsWith("spread-"));
          const finalEst = expense.establishment || "";
          
          const updatedSiblings = [];
          
          for (let i = 0; i < newN; i++) {
            const oldSibling = sortedSiblings[i];
            const amt = isRepeat ? totalAmount : ((i === newN - 1) ? parseFloat((dailyAmount + remainder).toFixed(2)) : dailyAmount);
            
            const startStr = expense.spreadStart ? new Date(expense.spreadStart + "T00:00:00").toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "";
            const endStr = expense.spreadEnd ? new Date(expense.spreadEnd + "T00:00:00").toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "";
            const baseTitle = expense.title || expense.category;
            const cleanBaseTitle = baseTitle.replace(/\s*\(Day\s+\d+\/\d+.*\)$/, "");

            const titleWithSuffix = startStr && endStr 
              ? `${cleanBaseTitle} (Day ${i + 1}/${newN}, ${startStr} - ${endStr})` 
              : `${cleanBaseTitle} (Day ${i + 1}/${newN})`;

            const entryTags = [
              ...baseTags,
              expense.groupTag,
              `spread-mode-${expense.spreadMode}`,
              `spread-start-${expense.spreadStart}`,
              `spread-end-${expense.spreadEnd}`,
              `spread-amount-${expense.amount}`
            ];

            const updatedPhotoUrl = expense.photoUrl !== undefined ? expense.photoUrl : (oldSibling.photoUrl || "");
            const updatedPhotoUrls = expense.photoUrls !== undefined ? expense.photoUrls : (oldSibling.photoUrls || []);
            const updatedPhotoUrlsFull = expense.photoUrlsFull !== undefined ? expense.photoUrlsFull : (oldSibling.photoUrlsFull || []);
            const updatedHasPhoto = (updatedPhotoUrl || (updatedPhotoUrls && updatedPhotoUrls.length > 0)) ? true : false;

            const updatedSibling = {
              ...oldSibling,
              amount: amt,
              currency: expense.currency,
              category: expense.category,
              title: titleWithSuffix,
              notes: expense.notes || "",
              worthIt: expense.worthIt,
              establishment: finalEst,
              tags: entryTags,
              hasPhoto: updatedHasPhoto,
              photoUrl: updatedPhotoUrl,
              photoUrls: updatedPhotoUrls,
              photoUrlsFull: updatedPhotoUrlsFull
            };
            
            updatedSiblings.push(updatedSibling);
          }

          pushToUndo({ type: 'update_bulk', oldData: siblings, newData: updatedSiblings, description: "update group expenses in-place" });
          
          setExpenses((prev) => prev.map(e => {
            const found = updatedSiblings.find(u => u.id === e.id);
            return found ? found : e;
          }));

          if (!isDemo && tripId) {
            updatedSiblings.forEach((sibling) => {
              performCloudAction("update", {
                id: sibling.id,
                amount: sibling.amount,
                currency: sibling.currency,
                category: sibling.category,
                title: sibling.title,
                notes: sibling.notes,
                worth_it: sibling.worthIt,
                establishment: sibling.establishment,
                tags: sibling.tags,
                photo_url: sibling.photoUrl || null,
                photo_urls: sibling.photoUrls || [],
                photo_urls_full: sibling.photoUrlsFull || [],
                has_photo: sibling.hasPhoto
              });
            });
          }
        } else {
          // Range changed: Soft-delete old siblings (failsafe instead of hard-deleting)
          const nowStr = new Date().toISOString();
          setExpenses((prev) => prev.map((e) => siblingIds.includes(e.id) ? { ...e, deletedAt: nowStr } : e));
          if (!isDemo && tripId) {
            siblings.forEach(s => {
              performCloudAction("update", { id: s.id, deleted_at: nowStr });
            });
          }

          // Re-generate new expenses for the new range/amount
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
          const finalEst = expense.establishment || "";

          for (let i = 0; i < N; i++) {
            const amt = isRepeat ? totalAmount : ((i === N - 1) ? parseFloat((dailyAmount + remainder).toFixed(2)) : dailyAmount);
            const newId = crypto.randomUUID ? crypto.randomUUID() : (Date.now() + i).toString();
            
            const d = new Date(startD);
            d.setDate(d.getDate() + i);
            const timestamp = d.toISOString();

            const startStr = expense.spreadStart ? new Date(expense.spreadStart + "T00:00:00").toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "";
            const endStr = expense.spreadEnd ? new Date(expense.spreadEnd + "T00:00:00").toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "";
            const baseTitle = expense.title || expense.category;
            const cleanBaseTitle = baseTitle.replace(/\s*\(Day\s+\d+\/\d+.*\)$/, "");

            const titleWithSuffix = startStr && endStr 
              ? `${cleanBaseTitle} (Day ${i + 1}/${N}, ${startStr} - ${endStr})` 
              : `${cleanBaseTitle} (Day ${i + 1}/${N})`;

            const entryTags = [
              ...baseTags,
              newGroupTag,
              `spread-mode-${expense.spreadMode}`,
              `spread-start-${expense.spreadStart}`,
              `spread-end-${expense.spreadEnd}`,
              `spread-amount-${expense.amount}`
            ];

            const hasPhoto = (expense.photoUrl || (expense.photoUrls && expense.photoUrls.length > 0)) ? true : false;
            const singleExpense = {
              amount: amt,
              currency: expense.currency,
              category: expense.category,
              title: titleWithSuffix,
              notes: expense.notes || "",
              worthIt: expense.worthIt,
              establishment: finalEst,
              tags: entryTags,
              id: newId,
              timestamp: timestamp,
              hasPhoto: hasPhoto,
              photoUrl: expense.photoUrl || "",
              photoUrls: expense.photoUrls || [],
              photoUrlsFull: expense.photoUrlsFull || []
            };

            newExpenses.push(singleExpense);

            if (!isDemo && tripId) {
              dbInserts.push({
                id: singleExpense.id,
                created_at: singleExpense.timestamp,
                amount: singleExpense.amount,
                currency: singleExpense.currency,
                category: singleExpense.category,
                title: singleExpense.title,
                notes: singleExpense.notes,
                worth_it: singleExpense.worthIt,
                establishment: singleExpense.establishment,
                tags: singleExpense.tags,
                trip_id: tripId,
                photo_url: singleExpense.photoUrl || null,
                photo_urls: singleExpense.photoUrls || [],
                photo_urls_full: singleExpense.photoUrlsFull || [],
                has_photo: singleExpense.hasPhoto
              });
            }
          }

          pushToUndo({ type: 'update_bulk', oldData: siblings, newData: newExpenses, description: "update group expenses range" });
          setExpenses((prev) => [...newExpenses, ...prev]);

          if (!isDemo && tripId && dbInserts.length > 0) {
            dbInserts.forEach((dbEntry) => {
              performCloudAction("insert", dbEntry);
            });
          }
        }
      } else if (expense.spreadDays && expense.spreadDays > 1) {
        // 1. Upgrading a single expense to a range: delete the original single expense
        setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
        if (!isDemo && tripId) {
          performCloudAction("delete", { id: expense.id });
        }

        // 2. Generate new range entries starting from start to end date
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
        const finalEst = expense.establishment || "";

        for (let i = 0; i < N; i++) {
          const amt = isRepeat ? totalAmount : ((i === N - 1) ? parseFloat((dailyAmount + remainder).toFixed(2)) : dailyAmount);
          const newId = crypto.randomUUID ? crypto.randomUUID() : (Date.now() + i).toString();
          
          const d = new Date(startD);
          d.setDate(d.getDate() + i);
          const timestamp = d.toISOString();

          const startStr = expense.spreadStart ? new Date(expense.spreadStart + "T00:00:00").toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "";
          const endStr = expense.spreadEnd ? new Date(expense.spreadEnd + "T00:00:00").toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "";
          const baseTitle = expense.title || expense.category;
          const cleanBaseTitle = baseTitle.replace(/\s*\(Day\s+\d+\/\d+.*\)$/, "");

          const titleWithSuffix = startStr && endStr 
            ? `${cleanBaseTitle} (Day ${i + 1}/${N}, ${startStr} - ${endStr})` 
            : `${cleanBaseTitle} (Day ${i + 1}/${N})`;

          const entryTags = [
            ...baseTags,
            groupTag,
            `spread-mode-${expense.spreadMode}`,
            `spread-start-${expense.spreadStart}`,
            `spread-end-${expense.spreadEnd}`,
            `spread-amount-${expense.amount}`
          ];

          const hasPhoto = (expense.photoUrl || (expense.photoUrls && expense.photoUrls.length > 0)) ? true : false;
          const singleExpense = {
            amount: amt,
            currency: expense.currency,
            category: expense.category,
            title: titleWithSuffix,
            notes: expense.notes || "",
            worthIt: expense.worthIt,
            establishment: finalEst,
            tags: entryTags,
            id: newId,
            timestamp: timestamp,
            hasPhoto: hasPhoto,
            photoUrl: expense.photoUrl || "",
            photoUrls: expense.photoUrls || [],
            photoUrlsFull: expense.photoUrlsFull || []
          };

          newExpenses.push(singleExpense);

          if (!isDemo && tripId) {
            dbInserts.push({
              id: singleExpense.id,
              created_at: singleExpense.timestamp,
              amount: singleExpense.amount,
              currency: singleExpense.currency,
              category: singleExpense.category,
              title: singleExpense.title,
              notes: singleExpense.notes,
              worth_it: singleExpense.worthIt,
              establishment: singleExpense.establishment,
              tags: singleExpense.tags,
              trip_id: tripId,
              photo_url: singleExpense.photoUrl || null,
              photo_urls: singleExpense.photoUrls || [],
              photo_urls_full: singleExpense.photoUrlsFull || [],
              has_photo: singleExpense.hasPhoto
            });
          }
        }

        pushToUndo({ type: 'insert_bulk', data: newExpenses, description: "add group expenses" });
        setExpenses((prev) => [...newExpenses, ...prev]);

        if (!isDemo && tripId && dbInserts.length > 0) {
          dbInserts.forEach((dbEntry) => {
            performCloudAction("insert", dbEntry);
          });
        }
      } else {
        const baseTags = expense.tags.filter(t => !t.startsWith("spread-"));
        const baseTitle = expense.title || expense.category;
        const cleanTitle = baseTitle.replace(/\s*\(Day\s+\d+\/\d+.*\)$/, "");
        
        const finalEst = expense.establishment || "";
        const ts = expense.timestamp || editingExpense?.timestamp || new Date().toISOString();

        const updatedPhotoUrl = expense.photoUrl !== undefined ? expense.photoUrl : (editingExpense?.photoUrl || "");
        const updatedPhotoUrls = expense.photoUrls !== undefined ? expense.photoUrls : (editingExpense?.photoUrls || []);
        const updatedPhotoUrlsFull = expense.photoUrlsFull !== undefined ? expense.photoUrlsFull : (editingExpense?.photoUrlsFull || []);
        const updatedHasPhoto = (updatedPhotoUrl || (updatedPhotoUrls && updatedPhotoUrls.length > 0)) ? true : false;

        const updatedExpense = {
          ...expense,
          title: cleanTitle,
          notes: expense.notes || "",
          tags: baseTags,
          establishment: finalEst,
          timestamp: ts,
          hasPhoto: updatedHasPhoto,
          photoUrl: updatedPhotoUrl,
          photoUrls: updatedPhotoUrls,
          photoUrlsFull: updatedPhotoUrlsFull
        };

        const oldExp = expenses.find(e => e.id === expense.id);
        if (oldExp) {
          pushToUndo({ type: 'update', oldData: oldExp, newData: updatedExpense, description: "update expense" });
        }
        setExpenses((prev) => prev.map((e) => (e.id === expense.id ? { ...e, ...updatedExpense } : e)));

        if (!isDemo && tripId) {
          performCloudAction("update", {
            id: expense.id,
            amount: expense.amount,
            currency: expense.currency,
            category: expense.category,
            title: updatedExpense.title,
            notes: updatedExpense.notes,
            worth_it: expense.worthIt,
            establishment: finalEst,
            tags: updatedExpense.tags,
            created_at: expense.timestamp || editingExpense?.timestamp,
            updated_at: new Date().toISOString(),
            photo_url: updatedExpense.photoUrl || null,
            photo_urls: updatedExpense.photoUrls || [],
            photo_urls_full: updatedExpense.photoUrlsFull || [],
            has_photo: updatedExpense.hasPhoto
          });
        }
      }
    } else {
      // Insert
      const finalEst = expense.establishment || "";
      const tsForInsert = expense.timestamp || new Date().toISOString();

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
          const baseTitle = expense.title || expense.category;
          const titleWithSuffix = startStr && endStr 
            ? `${baseTitle} (Day ${i + 1}/${N}, ${startStr} - ${endStr})` 
            : `${baseTitle} (Day ${i + 1}/${N})`;

          const entryTags = [
            ...baseTags,
            groupTag,
            `spread-mode-${expense.spreadMode}`,
            `spread-start-${expense.spreadStart}`,
            `spread-end-${expense.spreadEnd}`,
            `spread-amount-${expense.amount}`
          ];

          const hasPhoto = (expense.photoUrl || (expense.photoUrls && expense.photoUrls.length > 0)) ? true : false;
          const singleExpense = {
            amount: amt,
            currency: expense.currency,
            category: expense.category,
            title: titleWithSuffix,
            notes: expense.notes || "",
            worthIt: expense.worthIt,
            establishment: finalEst,
            tags: entryTags,
            id: newId,
            timestamp: timestamp,
            hasPhoto: hasPhoto,
            photoUrl: expense.photoUrl || "",
            photoUrls: expense.photoUrls || [],
            photoUrlsFull: expense.photoUrlsFull || []
          };

          newExpenses.push(singleExpense);

          if (!isDemo && tripId) {
            dbInserts.push({
              id: singleExpense.id,
              created_at: singleExpense.timestamp,
              amount: singleExpense.amount,
              currency: singleExpense.currency,
              category: singleExpense.category,
              title: singleExpense.title,
              notes: singleExpense.notes,
              worth_it: singleExpense.worthIt,
              establishment: singleExpense.establishment,
              tags: singleExpense.tags,
              trip_id: tripId,
              photo_url: singleExpense.photoUrl || null,
              photo_urls: singleExpense.photoUrls || [],
              photo_urls_full: singleExpense.photoUrlsFull || [],
              has_photo: singleExpense.hasPhoto
            });
          }
        }

        pushToUndo({ type: 'insert_bulk', data: newExpenses, description: "add group expenses" });
        setExpenses((prev) => [...newExpenses, ...prev]);

        if (!isDemo && tripId && dbInserts.length > 0) {
          dbInserts.forEach((dbEntry) => {
            performCloudAction("insert", dbEntry);
          });
        }
      } else {
        const newId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
        const baseTitle = expense.title || expense.category;
        const cleanTitle = baseTitle.replace(/\s*\(Day\s+\d+\/\d+.*\)$/, "");
        
        const hasPhoto = (expense.photoUrl || (expense.photoUrls && expense.photoUrls.length > 0)) ? true : false;
        const newExpense = {
          ...expense,
          title: cleanTitle,
          notes: expense.notes || "",
          establishment: finalEst,
          id: newId,
          timestamp: tsForInsert,
          hasPhoto: hasPhoto,
          photoUrl: expense.photoUrl || "",
          photoUrls: expense.photoUrls || [],
          photoUrlsFull: expense.photoUrlsFull || []
        };
        pushToUndo({ type: 'insert', data: newExpense, description: "add expense" });
        setExpenses((prev) => [newExpense, ...prev]);

        if (!isDemo && tripId) {
          performCloudAction("insert", {
            id: newExpense.id,
            created_at: newExpense.timestamp,
            amount: newExpense.amount,
            currency: newExpense.currency,
            category: newExpense.category,
            title: newExpense.title,
            notes: newExpense.notes,
            worth_it: newExpense.worthIt,
            establishment: newExpense.establishment,
            tags: newExpense.tags,
            trip_id: tripId,
            photo_url: newExpense.photoUrl || null,
            photo_urls: newExpense.photoUrls || [],
            photo_urls_full: newExpense.photoUrlsFull || [],
            has_photo: newExpense.hasPhoto
          });
        }
      }
    }
    setActiveModal(null);
    setEditingExpense(null);
  };

  const deleteExpense = async (id) => {
    const oldExp = expenses.find(e => e.id === id);
    const nowStr = new Date().toISOString();
    if (oldExp) {
      pushToUndo({ type: 'delete', data: oldExp, description: "delete expense" });
    }
    setExpenses((prev) => prev.map((e) => e.id === id ? { ...e, deletedAt: nowStr } : e));
    if (!isDemo && tripId) {
      performCloudAction("update", { id, deleted_at: nowStr });
    }
  };

  const handleRestoreExpense = async (id) => {
    const expenseToRestore = expenses.find(e => e.id === id);
    if (!expenseToRestore) return;

    setExpenses(prev => prev.map(e => e.id === id ? { ...e, deletedAt: null } : e));

    if (!isDemo && tripId) {
      performCloudAction("update", { id, deleted_at: null });
    }
    pushToUndo({ type: 'insert', data: { ...expenseToRestore, deletedAt: null }, description: "restore expense" });
  };

  const handleDeleteExpensePermanent = async (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));

    if (!isDemo && tripId) {
      performCloudAction("delete", { id });
    }
  };

  const handleEmptyBin = async () => {
    const deletedItems = expenses.filter(e => e.deletedAt);
    if (deletedItems.length === 0) return;

    setExpenses(prev => prev.filter(e => !e.deletedAt));

    if (!isDemo && tripId) {
      deletedItems.forEach(item => {
        performCloudAction("delete", { id: item.id });
      });
    }
  };

  const handleBatchMergeTags = async () => {
    if (selectedMergeTags.length < 2) {
      alert("Please select at least 2 tags to combine.");
      return;
    }
    const finalTarget = mergeTargetMode === "[custom]" ? mergeCustomTargetName.trim().toLowerCase() : mergeTargetMode;
    if (!finalTarget) {
      alert("Please specify a target tag.");
      return;
    }

    setIsConsolidating(true);
    try {
      const expensesToUpdate = [];
      const updatedExpenses = expenses.map(exp => {
        if (exp.tags && exp.tags.some(t => selectedMergeTags.includes(t))) {
          let newTags = exp.tags.filter(t => !selectedMergeTags.includes(t));
          if (!newTags.includes(finalTarget)) {
            newTags.push(finalTarget);
          }

          let newTitle = exp.title || "";
          let newNotes = exp.notes || "";
          
          selectedMergeTags.forEach(sourceTag => {
            if (sourceTag !== finalTarget) {
              const sourceRegex = new RegExp(`#${sourceTag}\\b`, 'gi');
              const targetHashtag = `#${finalTarget}`;
              newTitle = newTitle.replace(sourceRegex, targetHashtag);
              newNotes = newNotes.replace(sourceRegex, targetHashtag);
            }
          });

          const updated = {
            ...exp,
            tags: newTags,
            title: newTitle,
            notes: newNotes
          };
          expensesToUpdate.push(updated);
          return updated;
        }
        return exp;
      });

      if (expensesToUpdate.length === 0) {
        alert("No transactions found with the selected tags.");
        setIsConsolidating(false);
        return;
      }

      setExpenses(updatedExpenses);

      if (!isDemo && tripId) {
        for (const exp of expensesToUpdate) {
          await performCloudAction("update", {
            id: exp.id,
            amount: exp.amount,
            currency: exp.currency,
            category: exp.category,
            title: exp.title,
            notes: exp.notes,
            worth_it: exp.worthIt,
            establishment: exp.establishment,
            tags: exp.tags,
            created_at: exp.timestamp
          });
        }
      }

      showUndoRedoToast(`Combined ${selectedMergeTags.map(t => `#${t}`).join(", ")} into #${finalTarget}`);
      setSelectedMergeTags([]);
      setMergeTargetMode("");
      setMergeCustomTargetName("");
      setShowMergePanel(false);
    } catch (e) {
      console.error("Failed to batch merge tags:", e);
      alert("Error combining tags. Please try again.");
    } finally {
      setIsConsolidating(false);
    }
  };

  const now = new Date();
  const todayLocalStr = now.toLocaleDateString('en-CA');
  
  const visibleExpenses = activeExpenses.filter((e) => {
    try {
      const expDateStr = new Date(e.timestamp).toLocaleDateString('en-CA');
      if (expDateStr <= todayLocalStr) return true;
      // Allow a 15-minute clock skew buffer for freshly created expenses
      return new Date(e.timestamp).getTime() <= now.getTime() + 15 * 60 * 1000;
    } catch (err) {
      return true;
    }
  });

  const todayExpenses = visibleExpenses.filter((e) => {
    try {
      return new Date(e.timestamp).toLocaleDateString('en-CA') === todayLocalStr;
    } catch (err) {
      return false;
    }
  });
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

  const handleAddRapidExpense = async (e) => {
    e.preventDefault();
    if (isAddingRapid) return;
    const evaluatedAmount = evaluateMathExpression(rapidAmount.replace(/,/g, ''));
    const val = parseFloat(evaluatedAmount);
    if (!rapidTitle.trim()) {
      alert("Please enter a title.");
      return;
    }
    if (!rapidAmount || isNaN(val) || val <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    setIsAddingRapid(true);
    try {
      const timestamp = new Date().toISOString();
      const hashtagRegex = /#([a-zA-Z0-9_-]+)/g;
      const parsedTags = [];
      let match;
      while ((match = hashtagRegex.exec(rapidTitle)) !== null) {
        parsedTags.push(match[1].toLowerCase());
      }
      
      const cleanNote = rapidTitle.replace(/#[a-zA-Z0-9_-]+/g, "").replace(/\s+/g, " ").trim();
      await saveExpense({
        amount: val,
        currency: rapidCurrency,
        category: rapidCategory,
        note: cleanNote || rapidCategory,
        worthIt: rapidWorthIt,
        location: "",
        tags: parsedTags,
        timestamp: timestamp
      });
      
      setRapidTitle("");
      setRapidAmount("");
      setRapidWorthIt(false);
    } catch (err) {
      console.error("Error adding rapid expense:", err);
    } finally {
      setIsAddingRapid(false);
    }
  };

  const renderRapidExpenseArea = () => {
    return (
      <div style={{
        padding: "0 24px",
        margin: "0 0 20px 0",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 850, color: "#E86B32", textTransform: "uppercase", letterSpacing: "1px" }}>
            Quick Expense
          </span>
        </div>

        <form onSubmit={handleAddRapidExpense} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Title & Amount Row */}
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="What did you buy?"
              value={rapidTitle}
              onChange={(e) => setRapidTitle(e.target.value)}
              style={{
                flex: 1.6,
                padding: "8px 12px",
                borderRadius: "10px",
                border: "1.5px solid rgba(133, 58, 81, 0.08)",
                fontSize: "0.85rem",
                outline: "none",
                color: "#374151",
                backgroundColor: "white",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.01)"
              }}
            />
            
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              border: "1.5px solid rgba(133, 58, 81, 0.08)",
              borderRadius: "10px",
              padding: "0 8px",
              backgroundColor: "white",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.01)"
            }}>
              <input
                type="text"
                placeholder={(() => {
                  if (rapidCurrency === trip.homeCurrency) return "0.00";
                  const rateVal = convertCurrency(1, trip.homeCurrency, rapidCurrency, rates);
                  if (rateVal > 0) {
                    const formattedRate = rateVal < 1 ? rateVal.toFixed(4) : rateVal.toFixed(2);
                    return `1 ${trip.homeCurrency} ≈ ${formattedRate} ${rapidCurrency}`;
                  }
                  return "0.00";
                })()}
                value={rapidAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[0-9+\-*/().\s,]*$/.test(val)) {
                    const cleanVal = val.replace(/,/g, '');
                    setRapidAmount(formatInputWithCommas(cleanVal));
                  }
                }}
                onBlur={() => {
                  const cleanAmt = rapidAmount.replace(/,/g, '');
                  const evaluated = evaluateMathExpression(cleanAmt);
                  setRapidAmount(formatInputWithCommas(evaluated));
                }}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  outline: "none",
                  color: "#374151"
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                {rapidCurrency !== trip.homeCurrency && (
                  <button
                    type="button"
                    onClick={() => setRapidCurrency(trip.homeCurrency)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#6B7280",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      padding: "2px",
                      outline: "none",
                      display: "flex",
                      alignItems: "center"
                    }}
                    title={`Reset to home currency (${trip.homeCurrency})`}
                  >
                    🏠
                  </button>
                )}
                <SearchableCurrencySelect
                  value={rapidCurrency}
                  onChange={(val) => setRapidCurrency(val)}
                  rates={rates}
                  customCurrencies={customCurrencies}
                  onAddCustomCurrency={addCustomCurrency}
                  style={{ fontSize: "0.8rem", fontWeight: 700 }}
                  recentCurrencies={(() => {
                    const unique = Array.from(new Set(expenses.map(e => e.currency)));
                    return unique.slice(0, 5);
                  })()}
                  customTrigger={({ onClick, value }) => (
                    <button
                      type="button"
                      onClick={onClick}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--color-purple)",
                        fontSize: "0.8rem",
                        fontWeight: 800,
                        cursor: "pointer",
                        padding: "4px 2px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "1px",
                        outline: "none"
                      }}
                    >
                      {CURRENCY_SYMBOLS[value] || value} <span style={{ fontSize: "0.6rem", opacity: 0.7 }}>▼</span>
                    </button>
                  )}
                />
              </div>
            </div>
          </div>

          {(() => {
            const rapidSuggestions = getHashtagSuggestions(rapidTitle, allHistoricalTags);
            if (rapidSuggestions.length === 0) return null;
            return (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "-2px", marginBottom: "4px" }}>
                {rapidSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      const trimmed = rapidTitle.trim();
                      setRapidTitle(trimmed ? `${trimmed} ${s}` : s);
                    }}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      border: "none",
                      backgroundColor: "rgba(133, 58, 81, 0.08)",
                      color: "var(--color-purple)",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.1s"
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            );
          })()}

          {/* Category & Save Button Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              {CATEGORIES.map(cat => {
                const isSelected = rapidCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setRapidCategory(cat)}
                    style={{
                      border: "none",
                      backgroundColor: isSelected ? CATEGORY_COLORS[cat] : "rgba(133, 58, 81, 0.04)",
                      borderRadius: "8px",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      transition: "all 0.15s ease",
                      outline: "none"
                    }}
                    title={cat}
                  >
                    {CATEGORY_EMOJIS[cat]}
                  </button>
                );
              })}

              <div style={{ width: "1px", height: "20px", backgroundColor: "rgba(133, 58, 81, 0.12)", margin: "0 4px" }} />

              <button
                type="button"
                onClick={() => setRapidWorthIt(!rapidWorthIt)}
                style={{
                  border: "none",
                  backgroundColor: rapidWorthIt ? "rgba(245, 158, 11, 0.12)" : "rgba(133, 58, 81, 0.04)",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: rapidWorthIt ? "#F59E0B" : "#9CA3AF",
                  transition: "all 0.15s ease",
                  outline: "none"
                }}
                title={rapidWorthIt ? "Marked as Worth It!" : "Mark as Worth It"}
              >
                <StarIcon filled={rapidWorthIt} />
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {(rapidTitle || rapidAmount) && (
                <button
                  type="button"
                  onClick={() => {
                    setRapidTitle("");
                    setRapidAmount("");
                    setRapidCategory("Everything Else");
                    setRapidWorthIt(false);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "0.8rem",
                    color: "#9CA3AF",
                    cursor: "pointer",
                    padding: "4px 8px",
                    fontWeight: 650,
                    outline: "none"
                  }}
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                disabled={isAddingRapid}
                style={{
                  backgroundColor: "var(--color-orange)",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  padding: "8px 20px",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(232, 107, 50, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  outline: "none",
                  transition: "opacity 0.2s"
                }}
              >
                {isAddingRapid ? "Adding..." : "⚡ Add"}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
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

    // 1. Filter expenses based on selected date range
    const filteredInsightsExpenses = activeExpenses.filter((e) => {
      // Filter out future expenses unless showFuture is active
      const isFuture = new Date(e.timestamp) > now;
      if (isFuture && !showFuture) return false;

      const expDateStr = new Date(e.timestamp).toLocaleDateString('en-CA');
      if (insightsStartDate && expDateStr < insightsStartDate) return false;
      if (insightsEndDate && expDateStr > insightsEndDate) return false;
      return true;
    });

    const filteredExpensesTotal = filteredInsightsExpenses.reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, trip.homeCurrency, rates), 0);
    const filteredDaysActive = getDaysActive(filteredInsightsExpenses);

    // Calculations using filteredInsightsExpenses
    const categoryTotals = CATEGORIES.map((cat) => {
      const catExpenses = filteredInsightsExpenses.filter((e) => e.category === cat);
      const catTotal = catExpenses.reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, trip.homeCurrency, rates), 0);
      return { cat, total: catTotal };
    });
    const sortedCategories = [...categoryTotals].sort((a, b) => b.total - a.total);
    const topCategory = sortedCategories[0];

    const daySpends = {};
    filteredInsightsExpenses.forEach((e) => {
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
    filteredInsightsExpenses.forEach((e) => {
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

    const seenGroups = new Set();
    const worthItExpenses = filteredInsightsExpenses.filter((e) => {
      if (!e.worthIt) return false;
      if (worthItShowPhotosOnly) {
        const photos = e.photoUrls || (e.photoUrl ? [e.photoUrl] : []);
        if (photos.length === 0) return false;
      }
      const groupTag = e.tags?.find((t) => t.startsWith("spread-group-"));
      if (groupTag) {
        if (seenGroups.has(groupTag)) return false;
        seenGroups.add(groupTag);
      }
      return true;
    });

    const dailyAverage = filteredExpensesTotal / filteredDaysActive;
    const hasBudgetGoal = trip.dailyBudgetGoal && trip.dailyBudgetGoal > 0;
    
    let budgetPacingMessage = "";
    let isOverBudget = false;
    let budgetDiffPct = 0;
    
    if (hasBudgetGoal) {
      isOverBudget = dailyAverage > trip.dailyBudgetGoal;
      budgetDiffPct = Math.round((Math.abs(dailyAverage - trip.dailyBudgetGoal) / trip.dailyBudgetGoal) * 100);
      if (isOverBudget) {
        const recoveryGoal = Math.max(0, Math.round(trip.dailyBudgetGoal - (dailyAverage - trip.dailyBudgetGoal)));
        budgetPacingMessage = `You are currently spending ${formatMoney(dailyAverage, trip.homeCurrency)}/day, that is ${budgetDiffPct}% over your goal of ${formatMoney(trip.dailyBudgetGoal, trip.homeCurrency)}/day. Try spending ${formatMoney(recoveryGoal, trip.homeCurrency)} daily for the next week to get back on track.`;
      } else {
        const extra = Math.round(trip.dailyBudgetGoal - dailyAverage);
        budgetPacingMessage = `Amazing! You are averaging ${formatMoney(dailyAverage, trip.homeCurrency)}/day, which is under your ${formatMoney(trip.dailyBudgetGoal, trip.homeCurrency)}/day goal. You have an extra ${formatMoney(extra, trip.homeCurrency)} daily to play with!`;
      }
    }

    const handleQuickFilter = (type) => {
      const today = new Date();
      const todayStr = today.toLocaleDateString('en-CA');
      
      if (type === "7d") {
        const past = new Date();
        past.setDate(past.getDate() - 7);
        setInsightsStartDate(past.toLocaleDateString('en-CA'));
        setInsightsEndDate(todayStr);
      } else if (type === "30d") {
        const past = new Date();
        past.setDate(past.getDate() - 30);
        setInsightsStartDate(past.toLocaleDateString('en-CA'));
        setInsightsEndDate(todayStr);
      } else if (type === "month") {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setInsightsStartDate(startOfMonth.toLocaleDateString('en-CA'));
        setInsightsEndDate(endOfMonth.toLocaleDateString('en-CA'));
      } else if (type === "all") {
        setInsightsStartDate(null);
        setInsightsEndDate(null);
      }
      setShowInsightsCalendar(false);
    };
    
    const changeInsightsMonth = (direction) => {
      if (direction === -1) {
        if (insightsCalMonth === 0) {
          setInsightsCalMonth(11);
          setInsightsCalYear(prev => prev - 1);
        } else {
          setInsightsCalMonth(prev => prev - 1);
        }
      } else {
        if (insightsCalMonth === 11) {
          setInsightsCalMonth(0);
          setInsightsCalYear(prev => prev + 1);
        } else {
          setInsightsCalMonth(prev => prev + 1);
        }
      }
    };

    const renderInsightsCalendarGrid = () => {
      const firstDay = new Date(insightsCalYear, insightsCalMonth, 1).getDay();
      const totalDays = new Date(insightsCalYear, insightsCalMonth + 1, 0).getDate();
      const prevMonthTotalDays = new Date(insightsCalYear, insightsCalMonth, 0).getDate();
      const daysGrid = [];
      
      for (let i = firstDay - 1; i >= 0; i--) {
        const d = new Date(insightsCalYear, insightsCalMonth - 1, prevMonthTotalDays - i);
        daysGrid.push({
          day: prevMonthTotalDays - i,
          isCurrentMonth: false,
          dateStr: d.toLocaleDateString('en-CA')
        });
      }
      
      for (let i = 1; i <= totalDays; i++) {
        const d = new Date(insightsCalYear, insightsCalMonth, i);
        daysGrid.push({
          day: i,
          isCurrentMonth: true,
          dateStr: d.toLocaleDateString('en-CA')
        });
      }
      
      const remaining = 42 - daysGrid.length;
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(insightsCalYear, insightsCalMonth + 1, i);
        daysGrid.push({
          day: i,
          isCurrentMonth: false,
          dateStr: d.toLocaleDateString('en-CA')
        });
      }

      const handleInsightsDayClick = (dayStr) => {
        if (insightsCalendarTarget === "start") {
          setInsightsStartDate(dayStr);
          setInsightsEndDate(null);
          setInsightsCalendarTarget("end");
        } else {
          if (dayStr >= insightsStartDate) {
            setInsightsEndDate(dayStr);
            setShowInsightsCalendar(false);
            setInsightsCalendarTarget("start");
          } else {
            setInsightsStartDate(dayStr);
            setInsightsEndDate(null);
            setInsightsCalendarTarget("end");
          }
        }
      };

      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const monthLabel = `${months[insightsCalMonth]} ${insightsCalYear}`;

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <button
              type="button"
              onClick={() => changeInsightsMonth(-1)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.95rem", padding: "4px", color: "var(--color-purple)", fontWeight: 700 }}
            >
              ◀
            </button>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--color-purple)" }}>{monthLabel}</span>
            <button
              type="button"
              onClick={() => changeInsightsMonth(1)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.95rem", padding: "4px", color: "var(--color-purple)", fontWeight: 700 }}
            >
              ▶
            </button>
          </div>

          <div style={{ fontSize: "0.7rem", color: "#6B7280", textAlign: "center", marginBottom: "4px", fontWeight: 600 }}>
            {insightsCalendarTarget === "start"
              ? "Select start date"
              : `Select end date (after ${new Date(insightsStartDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })})`
            }
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontSize: "0.7rem", fontWeight: 700, color: "#9CA3AF", marginBottom: "2px" }}>
            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
            {daysGrid.map((dGrid, idx) => {
              const isSelectedStart = dGrid.dateStr === insightsStartDate;
              const isSelectedEnd = dGrid.dateStr === insightsEndDate;
              const isSelected = isSelectedStart || isSelectedEnd;
              const isInRange = insightsStartDate && insightsEndDate && dGrid.dateStr > insightsStartDate && dGrid.dateStr < insightsEndDate;
              
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleInsightsDayClick(dGrid.dateStr)}
                  disabled={!dGrid.isCurrentMonth}
                  style={{
                    aspectRatio: "1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    border: "none",
                    cursor: dGrid.isCurrentMonth ? "pointer" : "default",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    backgroundColor: isSelected
                      ? "var(--color-purple)"
                      : isInRange
                        ? "rgba(133, 58, 81, 0.08)"
                        : "transparent",
                    color: isSelected
                      ? "white"
                      : dGrid.isCurrentMonth
                        ? "var(--color-purple)"
                        : "#D1D5DB",
                    opacity: dGrid.isCurrentMonth ? 1 : 0.2
                  }}
                >
                  {dGrid.day}
                </button>
              );
            })}
          </div>
        </div>
      );
    };

    const dateFilterLabel = insightsStartDate && insightsEndDate
      ? `${new Date(insightsStartDate + "T00:00:00").toLocaleDateString("en-US", { month: 'short', day: 'numeric' })} - ${new Date(insightsEndDate + "T00:00:00").toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}`
      : "All Time";

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px", animation: "fadeInUp 0.25s ease-out" }}>
        {/* Worth It Highlights Memories card placed right at the top! */}
        <div style={{ backgroundColor: "white", padding: "18px 16px", borderRadius: "20px", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--color-purple)", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
              <span>✨ Worth It Highlights</span>
              <span style={{ fontSize: "0.72rem", color: "#9CA3AF", textTransform: "none", fontWeight: 500 }}>({worthItExpenses.length})</span>
            </h4>
            
            {/* Photos Only Toggle */}
            <button
              type="button"
              onClick={() => setWorthItShowPhotosOnly(!worthItShowPhotosOnly)}
              style={{
                backgroundColor: worthItShowPhotosOnly ? "rgba(245, 158, 11, 0.12)" : "rgba(0, 0, 0, 0.04)",
                border: worthItShowPhotosOnly ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(0, 0, 0, 0.08)",
                borderRadius: "20px",
                padding: "2px 8px",
                fontSize: "0.65rem",
                fontWeight: 700,
                color: worthItShowPhotosOnly ? "var(--color-orange)" : "#6B7280",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.15s ease"
              }}
            >
              <span>📷</span>
              <span>{worthItShowPhotosOnly ? "Photos Only" : "Show All"}</span>
            </button>
          </div>

          {worthItExpenses.length === 0 ? (
            <p style={{ fontSize: "0.8rem", color: "#9CA3AF", textAlign: "center", padding: "12px 0", margin: 0 }}>
              {worthItShowPhotosOnly 
                ? "No 'Worth It' memories with photos found in this range. Toggle to Show All or add some photos!" 
                : "No 'Worth It' expenses found in this range. Flag expenses as 'Worth It' to build your memory board!"
              }
            </p>
          ) : (
            <div style={{
              display: "flex",
              gap: "12px",
              overflowX: "auto",
              paddingBottom: "4px",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none"
            }} className="no-scrollbar">
              <style>{`
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {worthItExpenses.map((exp) => {
                const photos = exp.photoUrls || (exp.photoUrl ? [exp.photoUrl] : []);
                const hasPhoto = photos.length > 0;
                
                // Inherited day location resolution & cleanup
                const dateKey = new Date(exp.timestamp).toLocaleDateString('en-CA');
                const resolvedLoc = getResolvedDayLocation(dateKey);
                const rawEst = exp.establishment || exp.location || "";
                const displayLoc = rawEst 
                  ? rawEst.replace(/^\s*\|\s*/, "").split(" | ")[0].trim() 
                  : (resolvedLoc ? resolvedLoc.replace(/^\s*\|\s*/, "").split(" | ")[0].trim() : "");

                return (
                  <div
                    key={exp.id}
                    onClick={() => {
                      setEditingExpense(exp);
                      setActiveModal("manual");
                    }}
                    style={{
                      flexShrink: 0,
                      width: "160px",
                      borderRadius: "14px",
                      border: "1.5px solid rgba(245, 158, 11, 0.18)",
                      backgroundColor: "#FFFDF2",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.01)"
                    }}
                  >
                    {/* Photo Box */}
                    {hasPhoto ? (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setGlobalLightbox({
                            isOpen: true,
                            photos: photos,
                            index: 0
                          });
                        }}
                        style={{ width: "100%", height: "100px", position: "relative", backgroundColor: "#F3F4F6", cursor: "zoom-in" }}
                      >
                        <img
                          src={photos[0]}
                          alt={exp.title || exp.category}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        {photos.length > 1 && (
                          <div style={{
                            position: "absolute",
                            bottom: "6px",
                            left: "6px",
                            backgroundColor: "rgba(0,0,0,0.5)",
                            color: "white",
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backdropFilter: "blur(2px)"
                          }}>
                            📷 {photos.length}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{
                        width: "100%",
                        height: "100px",
                        backgroundColor: "rgba(245, 158, 11, 0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2.5rem"
                      }}>
                        {CATEGORY_EMOJIS[exp.category] || "💸"}
                      </div>
                    )}

                    {/* Metadata Content */}
                    <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between", gap: "4px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          color: "#374151",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          lineHeight: "1.2",
                          minHeight: "2.4em"
                        }}>
                          {exp.title || exp.note || exp.category}
                        </span>

                        {/* Resolved Location on own line */}
                        {displayLoc ? (
                          <span style={{
                            fontSize: "0.65rem",
                            fontWeight: 750,
                            color: "var(--color-purple)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            marginTop: "2px"
                          }} title={displayLoc}>
                            📍 {displayLoc}
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.65rem", visibility: "hidden", marginTop: "2px" }}>📍 None</span>
                        )}
                      </div>
                      
                      {/* Footer: Date & Home Currency Cost */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(245, 158, 11, 0.08)", paddingTop: "4px", marginTop: "2px" }}>
                        <span style={{ fontSize: "0.58rem", color: "#9CA3AF", fontWeight: 500 }}>
                          {new Date(exp.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--color-orange)" }}>
                          {formatMoney(convertCurrency(exp.amount, exp.currency, trip.homeCurrency, rates), trip.homeCurrency)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
            <span style={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Date Filter</span>
            {(insightsStartDate || insightsEndDate) && (
              <button
                type="button"
                onClick={() => {
                  setInsightsStartDate(null);
                  setInsightsEndDate(null);
                  setShowInsightsCalendar(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-orange)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: "2px 6px"
                }}
              >
                Clear Filter
              </button>
            )}
          </div>

          <button
            type="button"
            data-insights-calendar-toggle="true"
            onClick={() => setShowInsightsCalendar(!showInsightsCalendar)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "12px 16px",
              backgroundColor: "white",
              borderRadius: "16px",
              border: "1.5px solid #E5E7EB",
              boxShadow: "0 2px 8px rgba(0,0,0,0.01)",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "#374151",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>📅</span>
              <span>{dateFilterLabel}</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{showInsightsCalendar ? "▲" : "▼"}</span>
          </button>

          {/* Quick presets row */}
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px", scrollbarWidth: "none" }} className="no-scrollbar">
            {[
              { key: "7d", label: "Last 7 Days" },
              { key: "30d", label: "Last 30 Days" },
              { key: "month", label: "This Month" },
              { key: "all", label: "All Time" }
            ].map((preset) => {
              let isActive = false;
              const todayStr = new Date().toLocaleDateString('en-CA');
              if (preset.key === "7d") {
                const past = new Date();
                past.setDate(past.getDate() - 7);
                isActive = insightsStartDate === past.toLocaleDateString('en-CA') && insightsEndDate === todayStr;
              } else if (preset.key === "30d") {
                const past = new Date();
                past.setDate(past.getDate() - 30);
                isActive = insightsStartDate === past.toLocaleDateString('en-CA') && insightsEndDate === todayStr;
              } else if (preset.key === "month") {
                const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-CA');
                const end = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString('en-CA');
                isActive = insightsStartDate === start && insightsEndDate === end;
              } else if (preset.key === "all") {
                isActive = !insightsStartDate && !insightsEndDate;
              }

              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => handleQuickFilter(preset.key)}
                  style={{
                    flexShrink: 0,
                    padding: "6px 10px",
                    borderRadius: "10px",
                    border: isActive ? "1.5px solid var(--color-purple)" : "1.5px solid rgba(133, 58, 81, 0.08)",
                    backgroundColor: isActive ? "rgba(133, 58, 81, 0.05)" : "white",
                    color: isActive ? "var(--color-purple)" : "#6B7280",
                    fontSize: "0.72rem",
                    fontWeight: isActive ? 800 : 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {showInsightsCalendar && (
            <div
              ref={insightsCalendarRef}
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "8px",
                backgroundColor: "white",
                borderRadius: "20px",
                border: "1.5px solid rgba(133, 58, 81, 0.12)",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
                padding: "16px",
                zIndex: 10,
                animation: "fadeInUp 0.15s ease-out"
              }}
            >
              {renderInsightsCalendarGrid()}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "16px", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
            <span style={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Spend</span>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--color-purple)", marginTop: "4px", marginBottom: "2px" }}>
              {formatMoney(filteredExpensesTotal, trip.homeCurrency)}
            </h3>
            <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>across {filteredDaysActive} days</span>
          </div>

          <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "16px", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
            <span style={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Daily Average</span>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--color-orange)", marginTop: "4px", marginBottom: "2px" }}>
              {formatMoney(filteredExpensesTotal / filteredDaysActive, trip.homeCurrency)}
            </h3>
            <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>per day average</span>
          </div>

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

        {hasBudgetGoal && (
          <div style={{
            backgroundColor: isOverBudget ? "rgba(232, 107, 50, 0.04)" : "rgba(16, 185, 129, 0.04)",
            border: isOverBudget ? "1.5px solid rgba(232, 107, 50, 0.25)" : "1.5px solid rgba(16, 185, 129, 0.25)",
            padding: "16px",
            borderRadius: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.01)",
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }}>
            <h4 style={{
              fontSize: "0.85rem",
              fontWeight: 800,
              color: isOverBudget ? "var(--color-orange)" : "#10B981",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <span>{isOverBudget ? "⚠️ Daily Budget Alert" : "🏆 Budget On Track"}</span>
            </h4>
            <p style={{
              fontSize: "0.82rem",
              color: "#4B5563",
              lineHeight: "1.4",
              fontWeight: 600,
              margin: 0
            }}>
              {budgetPacingMessage}
            </p>
          </div>
        )}

        {/* Category Breakdown list */}
        <div style={{ backgroundColor: "white", padding: "18px 16px", borderRadius: "20px", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
          <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--color-purple)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "14px" }}>
            Category Breakdown
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {sortedCategories.map((item) => {
              const pct = filteredExpensesTotal > 0 ? (item.total / filteredExpensesTotal) * 100 : 0;
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

        {/* Spend by Tags card (with Redesigned Merge Tag selector and Combine Panel) */}
        <div style={{ backgroundColor: "white", padding: "18px 16px", borderRadius: "20px", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.01)", marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--color-purple)", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
              Spend by Tags (#)
            </h4>
            
            {/* Combine Selected Tags Trigger */}
            {selectedMergeTags.length >= 2 && (
              <button
                type="button"
                onClick={() => setShowMergePanel(!showMergePanel)}
                style={{
                  backgroundColor: "rgba(133, 58, 81, 0.08)",
                  border: "1px solid rgba(133, 58, 81, 0.3)",
                  color: "var(--color-purple)",
                  borderRadius: "20px",
                  padding: "4px 12px",
                  fontSize: "0.75rem",
                  fontWeight: 750,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                🏷️ Combine ({selectedMergeTags.length})
              </button>
            )}
          </div>

          {/* Floating Merge Panel inside tag card */}
          {showMergePanel && selectedMergeTags.length >= 2 && (
            <div style={{
              marginBottom: "14px",
              padding: "14px",
              backgroundColor: "#FFFDF2",
              borderRadius: "16px",
              border: "1.5px dashed rgba(245, 158, 11, 0.4)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              animation: "fadeInUp 0.15s ease-out"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#6B7280", textTransform: "uppercase" }}>
                  Merging Selected Tags
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMergeTags([]);
                    setShowMergePanel(false);
                  }}
                  style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700 }}
                >
                  Clear Selection
                </button>
              </div>
              <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#374151" }}>
                Tags: {selectedMergeTags.map(t => `#${t}`).join(", ")}
              </span>

              {/* Target Dropdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.68rem", fontWeight: 700, color: "#4B5563" }}>
                  MERGE INTO:
                </label>
                <select
                  value={mergeTargetMode}
                  onChange={(e) => setMergeTargetMode(e.target.value)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "10px",
                    border: "1.5px solid rgba(133, 58, 81, 0.15)",
                    backgroundColor: "white",
                    fontSize: "0.8rem",
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="">-- Choose target tag --</option>
                  {selectedMergeTags.map(t => (
                    <option key={t} value={t}>#{t}</option>
                  ))}
                  <option value="[custom]">(Create a new tag...)</option>
                </select>
              </div>

              {/* Custom Input */}
              {mergeTargetMode === "[custom]" && (
                <input
                  type="text"
                  placeholder="New tag name (no #)"
                  value={mergeCustomTargetName}
                  onChange={(e) => setMergeCustomTargetName(e.target.value)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "10px",
                    border: "1.5px solid rgba(133, 58, 81, 0.15)",
                    backgroundColor: "white",
                    fontSize: "0.8rem",
                    outline: "none"
                  }}
                />
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleBatchMergeTags}
                disabled={isConsolidating || !mergeTargetMode || (mergeTargetMode === "[custom]" && !mergeCustomTargetName.trim())}
                style={{
                  padding: "10px",
                  backgroundColor: isConsolidating || !mergeTargetMode || (mergeTargetMode === "[custom]" && !mergeCustomTargetName.trim())
                    ? "#9CA3AF"
                    : "var(--color-purple)",
                  color: "white",
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  border: "none",
                  borderRadius: "10px",
                  cursor: isConsolidating || !mergeTargetMode || (mergeTargetMode === "[custom]" && !mergeCustomTargetName.trim()) ? "not-allowed" : "pointer",
                  marginTop: "4px"
                }}
              >
                {isConsolidating ? "Merging tags..." : "Merge Selected Tags"}
              </button>
            </div>
          )}

          {sortedTags.length === 0 ? (
            <p style={{ fontSize: "0.8rem", color: "#9CA3AF", textAlign: "center", padding: "10px 0" }}>
              No hashtags found. Add #tag in your expense titles to track specific items (e.g. #coffee, #scooter).
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {sortedTags.slice(0, showAllTags ? sortedTags.length : 5).map((item) => {
                const pct = filteredExpensesTotal > 0 ? (item.spend / filteredExpensesTotal) * 100 : 0;
                const isChecked = selectedMergeTags.includes(item.tag);
                
                const handleCheck = (e) => {
                  e.stopPropagation();
                  if (isChecked) {
                    setSelectedMergeTags(prev => prev.filter(t => t !== item.tag));
                  } else {
                    setSelectedMergeTags(prev => [...prev, item.tag]);
                  }
                };

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
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, color: "#4B5563", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {/* Selector checkbox */}
                        <div 
                          onClick={handleCheck}
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "6px",
                            border: isChecked ? "2px solid var(--color-purple)" : "2.5px solid rgba(133, 58, 81, 0.15)",
                            backgroundColor: isChecked ? "var(--color-purple)" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "0.65rem",
                            fontWeight: 900,
                            cursor: "pointer",
                            marginRight: "10px",
                            flexShrink: 0
                          }}
                        >
                          {isChecked && "✓"}
                        </div>
                        <span style={{ color: "var(--color-purple)" }}>#{item.tag}</span>
                      </div>
                      
                      <div style={{ display: "flex", gap: "6px" }}>
                        <span>{formatMoney(item.spend, trip.homeCurrency)}</span>
                        <span style={{ color: "#9CA3AF", fontWeight: 500 }}>({pct.toFixed(0)}%)</span>
                      </div>
                    </div>
                    
                    <div style={{ height: "8px", borderRadius: "4px", backgroundColor: "#F3F4F6", overflow: "hidden", marginLeft: "28px" }}>
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

  const renderPlannerCalendarGrid = () => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const firstDay = new Date(plannerCalYear, plannerCalMonth, 1).getDay();
    const totalDays = new Date(plannerCalYear, plannerCalMonth + 1, 0).getDate();
    const prevMonthTotalDays = new Date(plannerCalYear, plannerCalMonth, 0).getDate();
    const daysGrid = [];
    
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = new Date(plannerCalYear, plannerCalMonth - 1, prevMonthTotalDays - i);
      daysGrid.push({
        day: prevMonthTotalDays - i,
        isCurrentMonth: false,
        dateStr: d.toLocaleDateString('en-CA')
      });
    }
    
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(plannerCalYear, plannerCalMonth, i);
      daysGrid.push({
        day: i,
        isCurrentMonth: true,
        dateStr: d.toLocaleDateString('en-CA')
      });
    }
    
    const remaining = 42 - daysGrid.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(plannerCalYear, plannerCalMonth + 1, i);
      daysGrid.push({
        day: i,
        isCurrentMonth: false,
        dateStr: d.toLocaleDateString('en-CA')
      });
    }
    
    const handleDayClick = (dayStr) => {
      setPlannerStartDate(dayStr);
      setPastOffset(0);
      setFutureOffset(6);
      setShowPlannerCalendar(false);
    };
    
    const changeMonth = (direction) => {
      if (direction === -1) {
        if (plannerCalMonth === 0) {
          setPlannerCalMonth(11);
          setPlannerCalYear(prev => prev - 1);
        } else {
          setPlannerCalMonth(prev => prev - 1);
        }
      } else {
        if (plannerCalMonth === 11) {
          setPlannerCalMonth(0);
          setPlannerCalYear(prev => prev + 1);
        } else {
          setPlannerCalMonth(prev => prev + 1);
        }
      }
    };
    
    return (
      <div style={{ padding: "4px" }}>
        {(() => {
          const d = new Date(plannerStartDate + "T00:00:00");
          const formattedDate = d.toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' });
          return (
            <div style={{
              padding: "8px 10px",
              backgroundColor: "rgba(133, 58, 81, 0.04)",
              borderRadius: "10px",
              border: "1px solid rgba(133, 58, 81, 0.08)",
              fontSize: "0.78rem",
              fontWeight: 750,
              color: "var(--color-purple)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px"
            }}>
              <span>Planner starts: {formattedDate}</span>
              <span style={{ fontSize: "0.7rem", color: "#6B7280" }}>Select a day</span>
            </div>
          );
        })()}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <button 
            type="button" 
            onClick={() => changeMonth(-1)}
            style={{ border: "none", background: "none", fontSize: "1.1rem", cursor: "pointer", color: "var(--color-purple)", fontWeight: 800, padding: "2px 8px" }}
          >
            ◀
          </button>
          <span style={{ fontWeight: 850, color: "var(--color-purple)", fontSize: "0.95rem" }}>
            {months[plannerCalMonth]} {plannerCalYear}
          </span>
          <button 
            type="button" 
            onClick={() => changeMonth(1)}
            style={{ border: "none", background: "none", fontSize: "1.1rem", cursor: "pointer", color: "var(--color-purple)", fontWeight: 800, padding: "2px 8px" }}
          >
            ▶
          </button>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontWeight: 800, color: "#9CA3AF", fontSize: "0.72rem", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: "6px", columnGap: "3px" }}>
          {daysGrid.map((item, idx) => {
            const isToday = new Date().toLocaleDateString('en-CA') === item.dateStr;
            const isSelected = plannerStartDate === item.dateStr;
            
            let bg = "transparent";
            let color = item.isCurrentMonth ? "#374151" : "#D1D5DB";
            let fontWeight = 600;
            let borderRadius = "50%";
            
            if (isSelected) {
              bg = "var(--color-purple)";
              color = "white";
              fontWeight = 800;
            } else if (isToday) {
              bg = "rgba(133, 58, 81, 0.08)";
              color = "var(--color-purple)";
              fontWeight = 800;
            }
            
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleDayClick(item.dateStr)}
                style={{
                  border: "none",
                  background: bg,
                  color: color,
                  fontWeight: fontWeight,
                  fontSize: "0.82rem",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: borderRadius,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  outline: "none"
                }}
              >
                {item.day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPlanner = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayStr = today.toLocaleDateString('en-CA');

    const getPlannerDays = () => {
      return getPlannerDaysList(plannerStartDate, pastOffset, futureOffset);
    };

    const plannerDays = getPlannerDays();

    const toggleSelectDate = (dateStr) => {
      setSelectedPlannerDates(prev => {
        if (prev.includes(dateStr)) {
          return prev.filter(d => d !== dateStr);
        } else {
          return [...prev, dateStr];
        }
      });
    };

    const toggleSelectAll = () => {
      if (selectedPlannerDates.length === plannerDays.length) {
        setSelectedPlannerDates([]);
      } else {
        setSelectedPlannerDates(plannerDays.map(d => d.dateStr));
      }
    };

    const getNextDateStr = (dateStr) => {
      const d = new Date(dateStr + "T00:00:00");
      d.setDate(d.getDate() + 1);
      return d.toLocaleDateString('en-CA');
    };

    const handleFillDown = async (dateStr) => {
      const nextDateStr = getNextDateStr(dateStr);
      const location = getResolvedDayLocation(dateStr);
      const notes = getResolvedDayNotes(dateStr);
      await updateItineraryLocationsBatch({
        [nextDateStr]: { location, notes }
      });
    };

    const handleApplyBatchChanges = async () => {
      if (selectedPlannerDates.length === 0) return;
      const updates = {};
      selectedPlannerDates.forEach(dateStr => {
        updates[dateStr] = {
          location: batchLocationInput.trim() !== "" ? batchLocationInput.trim() : undefined,
          notes: batchNotesInput.trim() !== "" ? batchNotesInput.trim() : undefined
        };
      });
      await updateItineraryLocationsBatch(updates);
      setBatchLocationInput("");
      setBatchNotesInput("");
      setSelectedPlannerDates([]);
    };

    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        animation: "fadeInUp 0.2s ease-out"
      }}>
        {/* Top bar controls */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          backgroundColor: "rgba(133, 58, 81, 0.03)",
          border: "1px solid rgba(133, 58, 81, 0.08)",
          borderRadius: "16px",
          padding: "10px 12px"
        }}>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px"
          }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setPastOffset(prev => prev + 7)}
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 750,
                  color: "var(--color-purple)",
                  backgroundColor: "rgba(133, 58, 81, 0.05)",
                  border: "1px solid rgba(133, 58, 81, 0.15)",
                  borderRadius: "10px",
                  padding: "5px 12px",
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                🗓️ Load Earlier
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlannerStartDate(new Date().toLocaleDateString('en-CA'));
                  setPastOffset(0);
                  setFutureOffset(6);
                }}
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 750,
                  color: "var(--color-purple)",
                  backgroundColor: "rgba(133, 58, 81, 0.05)",
                  border: "1px solid rgba(133, 58, 81, 0.15)",
                  borderRadius: "10px",
                  padding: "5px 12px",
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                Reset to Today
              </button>

              <div style={{ display: "flex", gap: "6px", alignItems: "center", marginLeft: "4px" }}>
                <input 
                  type="checkbox"
                  id="planner-select-all"
                  checked={plannerDays.length > 0 && selectedPlannerDates.length === plannerDays.length}
                  onChange={toggleSelectAll}
                  style={{ cursor: "pointer", width: "14px", height: "14px" }}
                />
                <label htmlFor="planner-select-all" style={{ fontSize: "0.72rem", fontWeight: 750, color: "var(--color-purple)", cursor: "pointer" }}>
                  Select All
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px", alignItems: "center", position: "relative" }}>
              <label style={{ fontSize: "0.72rem", fontWeight: 750, color: "#4B5563" }}>Jump to Date:</label>
              <button
                type="button"
                data-planner-calendar-toggle="true"
                onClick={() => setShowPlannerCalendar(!showPlannerCalendar)}
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 750,
                  color: "#374151",
                  border: "1px solid rgba(133, 58, 81, 0.15)",
                  borderRadius: "10px",
                  padding: "5px 10px",
                  outline: "none",
                  cursor: "pointer",
                  backgroundColor: "white",
                  display: "inline-flex",
                  alignItems: "center"
                }}
              >
                {new Date(plannerStartDate + "T00:00:00").toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
              </button>

              {/* Floating Planner Calendar Dropdown */}
              {showPlannerCalendar && (
                <div
                  ref={plannerCalendarRef}
                  className="planner-calendar-popover"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "6px",
                    padding: "10px 10px",
                    backgroundColor: "#F9F6ED",
                    borderRadius: "16px",
                    border: "1.5px solid rgba(133, 58, 81, 0.15)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    zIndex: 2000,
                    width: "280px",
                    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.15)",
                    animation: "fadeInUp 0.2s ease-out"
                  }}
                >
                  {renderPlannerCalendarGrid()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* List of days */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {plannerDays.map((dayObj) => {
            const isToday = dayObj.dateStr === todayStr;
            const plannedDest = getResolvedDayLocation(dayObj.dateStr);
            const plannedNotes = getResolvedDayNotes(dayObj.dateStr);

            const dayExpenses = expenses.filter(e => {
              try {
                return new Date(e.timestamp).toLocaleDateString('en-CA') === dayObj.dateStr;
              } catch (err) {
                return false;
              }
            });

            const daySpent = dayExpenses.reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, trip.homeCurrency, rates), 0);

            const bookings = dayExpenses.filter(e => 
              (e.category === "Transport" && (e.note || "").toLowerCase().match(/flight|plane|flying|booking|train|ferry|bus|ticket/)) ||
              ((e.category === "Entertainment" || e.category === "Everything Else") && (e.note || "").toLowerCase().match(/booking|tour|ticket|activity|booking|pass|show|concert|museum|event/))
            );

            // Drag range highlight calculations
            const isLocationDraggedOver = (() => {
              if (!dragStartCell || dragStartCell.field !== "location") return false;
              if (!dragCurrentDateStr) return false;
              const idxStart = plannerDays.findIndex(d => d.dateStr === dragStartCell.dateStr);
              const idxCurr = plannerDays.findIndex(d => d.dateStr === dragCurrentDateStr);
              const idxSelf = plannerDays.findIndex(d => d.dateStr === dayObj.dateStr);
              if (idxStart === -1 || idxCurr === -1 || idxSelf === -1) return false;
              return idxSelf >= Math.min(idxStart, idxCurr) && idxSelf <= Math.max(idxStart, idxCurr);
            })();

            const isNotesDraggedOver = (() => {
              if (!dragStartCell || dragStartCell.field !== "notes") return false;
              if (!dragCurrentDateStr) return false;
              const idxStart = plannerDays.findIndex(d => d.dateStr === dragStartCell.dateStr);
              const idxCurr = plannerDays.findIndex(d => d.dateStr === dragCurrentDateStr);
              const idxSelf = plannerDays.findIndex(d => d.dateStr === dayObj.dateStr);
              if (idxStart === -1 || idxCurr === -1 || idxSelf === -1) return false;
              return idxSelf >= Math.min(idxStart, idxCurr) && idxSelf <= Math.max(idxStart, idxCurr);
            })();

            return (
              <div 
                key={dayObj.dateStr} 
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  padding: "12px 10px",
                  borderRadius: "14px",
                  backgroundColor: isToday ? "rgba(133, 58, 81, 0.04)" : "white",
                  border: isToday ? "1.5px solid var(--color-purple)" : "1px solid rgba(133, 58, 81, 0.08)",
                  gap: "10px",
                  transition: "all 0.15s"
                }}
              >
                {/* Select Checkbox */}
                <input 
                  type="checkbox" 
                  checked={selectedPlannerDates.includes(dayObj.dateStr)}
                  onChange={() => toggleSelectDate(dayObj.dateStr)}
                  style={{ marginTop: "4px", width: "16px", height: "16px", cursor: "pointer" }}
                />

                {/* Day Info */}
                <div style={{ display: "flex", flexDirection: "column", width: "65px", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.76rem", fontWeight: 800, color: isToday ? "var(--color-purple)" : "#6B7280" }}>
                    {dayObj.date.toLocaleDateString("en-US", { weekday: 'short' })}
                  </span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 900, color: isToday ? "var(--color-orange)" : "var(--color-purple)" }}>
                    {dayObj.date.toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                  </span>
                  {isToday && (
                    <span style={{
                      fontSize: "0.55rem",
                      fontWeight: 800,
                      color: "white",
                      backgroundColor: "var(--color-purple)",
                      padding: "1px 4px",
                      borderRadius: "4px",
                      marginTop: "3px",
                      textAlign: "center",
                      letterSpacing: "0.2px"
                    }}>
                      TODAY
                    </span>
                  )}
                </div>

                {/* Editable Fields Stack */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
                  {/* Destination Row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.85rem", opacity: 0.8 }} title="Destination">📍</span>
                    {editingItineraryCell?.date === dayObj.dateStr && editingItineraryCell?.field === "location" ? (
                      <ItineraryCellInput
                        initialValue={itineraryInput}
                        onSave={(val) => {
                          updateItineraryLocation(dayObj.dateStr, val);
                          setEditingItineraryCell(null);
                        }}
                        onCancel={() => setEditingItineraryCell(null)}
                        style={{
                          flex: 1,
                          padding: "2px 6px",
                          fontSize: "0.8rem",
                          borderRadius: "6px",
                          border: "1.5px solid var(--color-orange)",
                          outline: "none",
                          backgroundColor: "#FFFDF9"
                        }}
                      />
                    ) : (
                      <div 
                        data-date-str={dayObj.dateStr}
                        data-drag-cell-field="location"
                        onMouseEnter={() => {
                          setHoveredCell({ dateStr: dayObj.dateStr, field: "location" });
                          if (dragStartCell && dragStartCell.field === "location") {
                            setDragCurrentDateStr(dayObj.dateStr);
                          }
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{
                          flex: 1,
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          minWidth: 0,
                          outline: isLocationDraggedOver ? "2px dashed var(--color-orange)" : "none",
                          outlineOffset: "2px",
                          borderRadius: "4px",
                          transition: "outline 0.1s"
                        }}
                      >
                        <span 
                          onClick={() => {
                            setEditingItineraryCell({ date: dayObj.dateStr, field: "location" });
                            setItineraryInput(plannedDest);
                          }}
                          style={{
                            flex: 1,
                            fontSize: "0.82rem",
                            fontWeight: 750,
                            color: plannedDest ? "#111827" : "#9CA3AF",
                            borderBottom: "1px dashed rgba(0,0,0,0.15)",
                            cursor: "pointer",
                            padding: "2px 0",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {plannedDest || "Set destination..."}
                        </span>

                        {/* Excel-style drag handle */}
                        {!editingItineraryCell && ( (isTouchDevice && plannedDest) || (hoveredCell?.dateStr === dayObj.dateStr && hoveredCell?.field === "location") ) && (
                          <div
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDragStartCell({
                                dateStr: dayObj.dateStr,
                                field: "location",
                                value: plannedDest
                              });
                              setDragCurrentDateStr(dayObj.dateStr);
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              setDragStartCell({
                                dateStr: dayObj.dateStr,
                                field: "location",
                                value: plannedDest
                              });
                              setDragCurrentDateStr(dayObj.dateStr);
                            }}
                            onTouchMove={(e) => {
                              e.stopPropagation();
                              const touch = e.touches[0];
                              const elem = document.elementFromPoint(touch.clientX, touch.clientY);
                              const cell = elem?.closest('[data-drag-cell-field]');
                              if (cell) {
                                const dateStr = cell.getAttribute('data-date-str');
                                const field = cell.getAttribute('data-drag-cell-field');
                                if (dateStr && field === "location") {
                                  setDragCurrentDateStr(dateStr);
                                }
                              }
                            }}
                            style={{
                              position: "absolute",
                              right: isTouchDevice ? "-5px" : "-3px",
                              bottom: isTouchDevice ? "-5px" : "-3px",
                              width: isTouchDevice ? "14px" : "8px",
                              height: isTouchDevice ? "14px" : "8px",
                              backgroundColor: "var(--color-orange)",
                              border: "1px solid white",
                              cursor: "crosshair",
                              zIndex: 10,
                              touchAction: "none",
                              borderRadius: isTouchDevice ? "4px" : "0px"
                            }}
                            title="Drag to fill other days"
                          />
                        )}
                      </div>
                    )}

                    {/* Day Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                      <button
                        type="button"
                        onClick={() => handleFillDown(dayObj.dateStr)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "0.78rem",
                          padding: "4px",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center"
                        }}
                        title="Fill down to next day"
                      >
                        ↓
                      </button>
                    </div>
                  </div>

                  {/* Notes Row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.85rem", opacity: 0.8 }} title="Notes/Todo">📝</span>
                    {editingItineraryCell?.date === dayObj.dateStr && editingItineraryCell?.field === "notes" ? (
                      <ItineraryCellInput
                        initialValue={itineraryInput}
                        onSave={(val) => {
                          updateItineraryNotes(dayObj.dateStr, val);
                          setEditingItineraryCell(null);
                        }}
                        onCancel={() => setEditingItineraryCell(null)}
                        isTextArea={true}
                        style={{
                          flex: 1,
                          padding: "6px 8px",
                          fontSize: "16px",
                          borderRadius: "6px",
                          border: "1.5px solid var(--color-orange)",
                          outline: "none",
                          backgroundColor: "#FFFDF9",
                          minHeight: "80px"
                        }}
                      />
                    ) : (
                      <div 
                        data-date-str={dayObj.dateStr}
                        data-drag-cell-field="notes"
                        onMouseEnter={() => {
                          setHoveredCell({ dateStr: dayObj.dateStr, field: "notes" });
                          if (dragStartCell && dragStartCell.field === "notes") {
                            setDragCurrentDateStr(dayObj.dateStr);
                          }
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{
                          flex: 1,
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          minWidth: 0,
                          outline: isNotesDraggedOver ? "2px dashed var(--color-orange)" : "none",
                          outlineOffset: "2px",
                          borderRadius: "4px",
                          transition: "outline 0.1s"
                        }}
                      >
                        <span 
                          onClick={() => {
                            setEditingItineraryCell({ date: dayObj.dateStr, field: "notes" });
                            setItineraryInput(plannedNotes);
                          }}
                          style={{
                            flex: 1,
                            fontSize: "0.8rem",
                            fontWeight: 500,
                            color: plannedNotes ? "#4B5563" : "#9CA3AF",
                            borderBottom: "1px dashed rgba(0,0,0,0.1)",
                            cursor: "pointer",
                            padding: "2px 0",
                            overflow: "visible",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word"
                          }}
                        >
                          {plannedNotes || "Add plans/todo notes..."}
                        </span>

                        {/* Excel-style drag handle */}
                        {!editingItineraryCell && ( (isTouchDevice && plannedNotes) || (hoveredCell?.dateStr === dayObj.dateStr && hoveredCell?.field === "notes") ) && (
                          <div
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDragStartCell({
                                dateStr: dayObj.dateStr,
                                field: "notes",
                                value: plannedNotes
                              });
                              setDragCurrentDateStr(dayObj.dateStr);
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              setDragStartCell({
                                dateStr: dayObj.dateStr,
                                field: "notes",
                                value: plannedNotes
                              });
                              setDragCurrentDateStr(dayObj.dateStr);
                            }}
                            onTouchMove={(e) => {
                              e.stopPropagation();
                              const touch = e.touches[0];
                              const elem = document.elementFromPoint(touch.clientX, touch.clientY);
                              const cell = elem?.closest('[data-drag-cell-field]');
                              if (cell) {
                                const dateStr = cell.getAttribute('data-date-str');
                                const field = cell.getAttribute('data-drag-cell-field');
                                if (dateStr && field === "notes") {
                                  setDragCurrentDateStr(dateStr);
                                }
                              }
                            }}
                            style={{
                              position: "absolute",
                              right: isTouchDevice ? "-5px" : "-3px",
                              bottom: isTouchDevice ? "-5px" : "-3px",
                              width: isTouchDevice ? "14px" : "8px",
                              height: isTouchDevice ? "14px" : "8px",
                              backgroundColor: "var(--color-orange)",
                              border: "1px solid white",
                              cursor: "crosshair",
                              zIndex: 10,
                              touchAction: "none",
                              borderRadius: isTouchDevice ? "4px" : "0px"
                            }}
                            title="Drag to fill other days"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bookings / Spent Row */}
                  {(bookings.length > 0 || daySpent > 0) && (
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", marginTop: "2px" }}>
                      {bookings.map((b, bIdx) => (
                        <span 
                          key={bIdx}
                          style={{
                            fontSize: "0.7rem",
                            backgroundColor: "rgba(2, 132, 199, 0.08)",
                            color: "#0284C7",
                            border: "1px solid rgba(2, 132, 199, 0.2)",
                            padding: "1px 6px",
                            borderRadius: "8px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "2px"
                          }}
                          title={b.note}
                        >
                          {b.category === "Transport" ? "✈️" : "🎟️"} {b.note.substring(0, 15)}{b.note.length > 15 && "..."}
                        </span>
                      ))}
                      {daySpent > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedSpentDate(prev => prev === dayObj.dateStr ? null : dayObj.dateStr);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            margin: 0,
                            cursor: "pointer",
                            textAlign: "left",
                            outline: "none",
                            display: "inline-flex"
                          }}
                        >
                          <span style={{
                            fontSize: "0.7rem",
                            fontWeight: 800,
                            backgroundColor: "rgba(16, 185, 129, 0.08)",
                            color: "#10B981",
                            padding: "1px 6px",
                            borderRadius: "8px",
                            transition: "all 0.15s"
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.16)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.08)";
                          }}
                          >
                            Spent: {formatMoney(daySpent, trip.homeCurrency)}
                          </span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Expanded Spent Details Card */}
                  {expandedSpentDate === dayObj.dateStr && dayExpenses.length > 0 && (
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      marginTop: "6px",
                      padding: "8px 10px",
                      backgroundColor: "rgba(16, 185, 129, 0.03)",
                      border: "1.5px solid rgba(16, 185, 129, 0.15)",
                      borderRadius: "12px",
                      animation: "fadeInUp 0.15s ease-out"
                    }}>
                      <div style={{
                        fontSize: "0.62rem",
                        fontWeight: 850,
                        color: "#047857",
                        textTransform: "uppercase",
                        letterSpacing: "0.3px",
                        marginBottom: "2px"
                      }}>
                        Day's Expenses
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {dayExpenses.map((exp) => {
                          const categoryEmoji = (() => {
                            switch (exp.category) {
                              case "Accommodation": return "🏠";
                              case "Transportation": return "🚇";
                              case "Food & Drink": return "🍔";
                              default: return "📦";
                            }
                          })();
                          
                          return (
                            <div
                              key={exp.id}
                              onClick={() => {
                                setEditingExpense(exp);
                                setActiveModal("manual");
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "4px 8px",
                                backgroundColor: "white",
                                borderRadius: "8px",
                                border: "1px solid rgba(16, 185, 129, 0.1)",
                                cursor: "pointer",
                                transition: "all 0.15s"
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.06)";
                                e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.3)";
                                e.currentTarget.style.transform = "translateY(-0.5px)";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = "white";
                                e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.1)";
                                e.currentTarget.style.transform = "none";
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                                <span style={{ fontSize: "0.78rem", flexShrink: 0 }}>{categoryEmoji}</span>
                                <span style={{
                                  fontSize: "0.74rem",
                                  fontWeight: 700,
                                  color: "#1F2937",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap"
                                }}>
                                  {exp.title || (exp.establishment || exp.location)?.split(" | ")[0] || "Untitled Expense"}
                                </span>
                              </div>
                              <span style={{
                                fontSize: "0.74rem",
                                fontWeight: 800,
                                color: "#047857",
                                flexShrink: 0,
                                marginLeft: "8px"
                              }}>
                                {formatMoney(convertCurrency(exp.amount, exp.currency, trip.homeCurrency, rates), trip.homeCurrency)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Load Later button */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "4px" }}>
          <button
            type="button"
            onClick={() => setFutureOffset(prev => prev + 7)}
            style={{
              fontSize: "0.75rem",
              fontWeight: 750,
              color: "var(--color-purple)",
              backgroundColor: "rgba(133, 58, 81, 0.05)",
              border: "1px solid rgba(133, 58, 81, 0.15)",
              borderRadius: "10px",
              padding: "5px 16px",
              cursor: "pointer",
              outline: "none",
              width: "100%"
            }}
          >
            🗓️ Load More Future Days
          </button>
        </div>

        {/* Floating Batch Edit Action Bar */}
        {selectedPlannerDates.length > 0 && (
          <div style={{
            position: isDemo ? "absolute" : "fixed",
            bottom: isDemo ? "60px" : "80px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 32px)",
            maxWidth: "380px",
            backgroundColor: "#FFFDF9",
            borderRadius: "20px",
            border: "1.5px solid rgba(232, 107, 50, 0.3)",
            boxShadow: "0 10px 25px -5px rgba(232, 107, 50, 0.2)",
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            zIndex: 999,
            animation: "fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(232, 107, 50, 0.1)",
              paddingBottom: "6px"
            }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--color-orange)" }}>
                Selected: {selectedPlannerDates.length} Days
              </span>
              <button
                type="button"
                onClick={() => setSelectedPlannerDates([])}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "0.85rem",
                  color: "#9CA3AF",
                  cursor: "pointer",
                  fontWeight: 700
                }}
              >
                Clear
              </button>
            </div>

            {/* Batch Inputs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "0.85rem" }}>📍</span>
                <input
                  type="text"
                  placeholder="Set destination for selected..."
                  value={batchLocationInput}
                  onChange={(e) => setBatchLocationInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "6px 10px",
                    fontSize: "16px",
                    borderRadius: "8px",
                    border: "1px solid rgba(133, 58, 81, 0.15)",
                    outline: "none",
                    backgroundColor: "#F9F6ED"
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                <span style={{ fontSize: "0.85rem", marginTop: "8px" }}>📝</span>
                <textarea
                  placeholder="Set notes/todos for selected..."
                  value={batchNotesInput}
                  onChange={(e) => setBatchNotesInput(e.target.value)}
                  rows={2}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    fontSize: "16px",
                    borderRadius: "8px",
                    border: "1px solid rgba(133, 58, 81, 0.15)",
                    outline: "none",
                    backgroundColor: "#F9F6ED",
                    resize: "vertical",
                    fontFamily: "inherit"
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={handleApplyBatchChanges}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "var(--color-orange)",
                  color: "white",
                  fontSize: "0.74rem",
                  fontWeight: 750,
                  cursor: "pointer"
                }}
              >
                Apply Changes
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const nameLength = trip.name ? Math.min(trip.name.length, 30) : 0;
  const dynamicFontSize = nameLength > 24 
    ? "1.55rem" 
    : nameLength > 18 
      ? "1.7rem" 
      : nameLength > 12 
        ? "1.9rem" 
        : "2.1rem";

  return isMounted ? (
    <div 
      className="tracker-container"
      style={{
        maxWidth: isDemo ? "100%" : "480px",
        margin: "0 auto",
        height: isDemo ? "100%" : "100vh",
        height: isDemo ? "100%" : "100dvh",
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
      {isReadOnly && (
        <div style={{
          backgroundColor: "rgba(133, 58, 81, 0.05)",
          color: "var(--color-purple)",
          padding: "8px 24px",
          fontSize: "0.8rem",
          fontWeight: 700,
          borderBottom: "1.5px solid rgba(133, 58, 81, 0.12)",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px"
        }}>
          👁️ Read-Only Discover View
        </div>
      )}

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
        <header style={{
          padding: "20px 20px 16px",
          background: "linear-gradient(135deg, #FAF6EE 0%, #FFFDF9 50%, #FAF6EE 100%)",
          borderBottom: "1.5px solid rgba(133, 58, 81, 0.12)",
          marginBottom: "20px"
        }}>
          {/* Row 1: Back button and action buttons */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px"
          }}>
            {/* Back Button */}
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

            {/* Actions and Settings on the right */}
            {isReadOnly ? (
              <span style={{
                fontSize: "0.68rem",
                fontWeight: 750,
                color: "#6B7280",
                backgroundColor: "rgba(107, 114, 128, 0.08)",
                padding: "4px 10px",
                borderRadius: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                👁️ Discover Mode
              </span>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {/* Trash Bin Button */}
              <button
                type="button"
                onClick={() => setActiveModal("bin")}
                style={{
                  fontSize: "0.82rem",
                  color: "var(--color-purple)",
                  backgroundColor: "rgba(133, 58, 81, 0.08)",
                  border: "none",
                  borderRadius: "50%",
                  width: "22px",
                  height: "22px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  outline: "none"
                }}
                title="Trash / Recently Deleted"
              >
                🗑️
              </button>

              {/* Settings Button */}
              <button
                type="button"
                onClick={() => setActiveModal("settings")}
                style={{
                  fontSize: "0.82rem",
                  color: "var(--color-purple)",
                  backgroundColor: "rgba(133, 58, 81, 0.08)",
                  border: "none",
                  borderRadius: "50%",
                  width: "22px",
                  height: "22px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  outline: "none"
                }}
                title="Settings"
              >
                ⚙️
              </button>

              {/* Cloud Save & Sync (for Demo Mode) or Share & Sync for non-demo */}
              {supabase && (
                <>
                  {isDemo ? (
                    <button
                      onClick={handleSaveSyncClick}
                      style={{
                        fontSize: "0.78rem",
                        color: "white",
                        backgroundColor: "var(--color-orange)",
                        border: "none",
                        borderRadius: "50%",
                        width: "22px",
                        height: "22px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        outline: "none",
                        boxShadow: "0 2px 4px rgba(232, 107, 50, 0.15)"
                      }}
                      title="Save & Sync"
                    >
                      ☁️
                    </button>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {/* Share & Collaborate */}
                      <button
                        onClick={() => setActiveModal("collaborators")}
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--color-purple)",
                          backgroundColor: "rgba(133, 58, 81, 0.08)",
                          border: "none",
                          borderRadius: "50%",
                          width: "22px",
                          height: "22px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          outline: "none"
                        }}
                        title="Share & Collaborate"
                      >
                        👥
                      </button>

                      {/* Sync Status Light */}
                      {(() => {
                        let statusText = "Synced";
                        let lightColor = "#10B981"; // Emerald green
                        let glow = "0 0 8px rgba(16, 185, 129, 0.6)";
                        
                        if (!isOnline) {
                          statusText = "Offline / Queuing Updates";
                          lightColor = "#EF4444"; // Red
                          glow = "0 0 8px rgba(239, 68, 68, 0.6)";
                        } else if (syncError) {
                          statusText = syncError;
                          lightColor = "#EF4444"; // Red
                          glow = "0 0 8px rgba(239, 68, 68, 0.6)";
                        } else if (isSyncing || syncQueue.length > 0) {
                          statusText = "Syncing / Processing Queue...";
                          lightColor = "#F59E0B"; // Amber/Yellow
                          glow = "0 0 8px rgba(245, 158, 11, 0.6)";
                        }
                        
                        return (
                          <div 
                            title={statusText}
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              backgroundColor: lightColor,
                              boxShadow: glow,
                              transition: "all 0.3s ease",
                              display: "inline-block",
                              alignSelf: "center",
                              marginLeft: "4px"
                            }}
                          />
                        );
                      })()}
                    </div>
                  )}
                </>
              )}
          </div>
        )}
      </div>

          {/* Row 2: Editable Trip Title */}
          <div style={{
            display: "flex",
            alignItems: "center",
            marginTop: "6px"
          }}>
            {isEditingName ? (
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={saveTripName}
                onKeyDown={(e) => e.key === "Enter" && saveTripName()}
                autoFocus
                maxLength={30}
                style={{
                  fontSize: dynamicFontSize,
                  fontWeight: 800,
                  color: "var(--color-purple)",
                  border: "none",
                  borderBottom: "1.5px solid var(--color-purple)",
                  outline: "none",
                  background: "transparent",
                  width: "100%",
                  padding: 0
                }}
              />
            ) : (
              <div 
                onClick={() => !isReadOnly && setIsEditingName(true)}
                style={{
                  fontSize: dynamicFontSize,
                  fontWeight: 800,
                  color: "var(--color-purple)",
                  margin: 0,
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  lineHeight: "1.2",
                  width: "100%",
                  cursor: isReadOnly ? "default" : "pointer"
                }} 
                title={trip.name}
              >
                <span>{(trip.name || "").slice(0, 30)}</span>
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
              padding: isDemo && demoTourStep === 1 ? "8px 12px" : "0 12px",
              borderRadius: "16px",
              border: isDemo && demoTourStep === 1 ? "2.5px solid var(--color-orange)" : "2.5px solid transparent",
              boxShadow: isDemo && demoTourStep === 1 ? "0 0 12px rgba(235, 94, 40, 0.25)" : "none",
              transition: "all 0.3s ease"
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
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
                  <button
                    type="button"
                    onClick={() => {
                      if (logView === "insights") {
                        setLogView(prevViewBeforeInsights || "recent");
                      } else {
                        setPrevViewBeforeInsights(logView);
                        setLogView("insights");
                      }
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "1.2rem",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      backgroundColor: logView === "insights" ? "rgba(232, 107, 50, 0.12)" : "transparent",
                      transition: "background-color 0.2s"
                    }}
                    title="Toggle Insights"
                  >
                    💡
                  </button>
                </div>
              </div>
            </div>

            {/* Compact details line: Location & Currencies side-by-side */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 20px",
              borderTop: "1px solid rgba(133, 58, 81, 0.05)",
              marginTop: "4px",
              fontSize: "0.82rem",
              color: "#6B7280",
              gap: "8px",
              flexWrap: "wrap"
            }}>
              {/* Location & Today's Notes */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-start" }}>
                {!isEditingLocale ? (
                  <div 
                    onClick={() => {
                      const todayStr = new Date().toLocaleDateString('en-CA');
                      const inheritedLoc = getResolvedDayLocation(todayStr);
                      setLocaleSearchQuery(parseCurrentLocation(trip.currentLocation).location || inheritedLoc || "");
                      setIsEditingLocale(true);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                    title="Tap to change locale"
                  >
                    {(() => {
                      const currentLoc = getResolvedDayLocation(new Date().toLocaleDateString('en-CA'));
                      if (currentLoc) {
                        return <span>📍 {currentLoc}</span>;
                      }
                      return (
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          background: "rgba(59, 130, 246, 0.08)",
                          color: "#2563EB",
                          padding: "3px 10px",
                          borderRadius: "20px",
                          border: "1px solid rgba(59, 130, 246, 0.2)",
                          boxShadow: "0 0 12px rgba(59, 130, 246, 0.25)",
                          fontSize: "0.78rem",
                          fontWeight: 800,
                          animation: "blueGlowPulse 2.5s infinite ease-in-out"
                        }}>
                          📍 Where are you today?
                        </span>
                      );
                    })()}
                  </div>
                ) : (
                  <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                    <input
                      type="text"
                      value={localeSearchQuery}
                      onChange={(e) => setLocaleSearchQuery(e.target.value)}
                      placeholder="Where are you today?"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          saveLocaleAndSyncItinerary(localeSearchQuery);
                        } else if (e.key === "Escape") {
                          setIsEditingLocale(false);
                        }
                      }}
                      onBlur={() => saveLocaleAndSyncItinerary(localeSearchQuery)}
                      style={{
                        padding: "4px 24px 4px 8px",
                        fontSize: "0.82rem",
                        borderRadius: "6px",
                        border: "1.5px solid var(--color-purple)",
                        outline: "none",
                        backgroundColor: "#FFFDF9",
                        width: "120px",
                        boxSizing: "border-box"
                      }}
                    />
                    {localeSearchQuery && (
                      <span
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setLocaleSearchQuery("");
                        }}
                        style={{
                          position: "absolute",
                          right: "6px",
                          color: "#9CA3AF",
                          cursor: "pointer",
                          fontSize: "0.78rem",
                          fontWeight: "bold",
                          padding: "2px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                        title="Clear location"
                      >
                        ✕
                      </span>
                    )}
                  </div>
                )}

                {/* Today's Planning Notes nested in dashboard header */}
                {!isEditingLocale && (() => {
                  const todayStr = new Date().toLocaleDateString('en-CA');
                  const plannedNotes = trip.itinerary?.[todayStr]?.notes || "";
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                      <span style={{ fontSize: "0.72rem", opacity: 0.6 }}>📝</span>
                      {editingItineraryCell?.date === todayStr && editingItineraryCell?.field === "notes" ? (
                        <ItineraryCellInput
                          initialValue={plannedNotes}
                          isTextArea={true}
                          onSave={(val) => {
                            updateItineraryNotes(todayStr, val);
                            setEditingItineraryCell(null);
                          }}
                          onCancel={() => setEditingItineraryCell(null)}
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            color: "#4B5563",
                            border: "1px solid var(--color-orange)",
                            borderRadius: "6px",
                            padding: "3px 6px",
                            outline: "none",
                            backgroundColor: "#FFFDF9",
                            minHeight: "50px",
                            width: "180px"
                          }}
                        />
                      ) : (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItineraryCell({ date: todayStr, field: "notes" });
                            setItineraryInput(plannedNotes);
                          }}
                          style={{
                            fontSize: "0.75rem",
                            color: plannedNotes ? "#4B5563" : "#9CA3AF",
                            cursor: "pointer",
                            borderBottom: "1px dashed rgba(0,0,0,0.1)",
                            fontStyle: plannedNotes ? "normal" : "italic"
                          }}
                        >
                          {plannedNotes || "what's going on today?"}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Home Currency settings badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                <span style={{ fontSize: "1.05rem", marginRight: "2px" }}>🏠</span>
                {isHomeCurrencyLocked ? (
                  <span
                    onClick={() => setIsHomeCurrencyLocked(false)}
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      borderBottom: "1px dashed var(--color-purple)",
                      padding: "1px 2px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "2px"
                    }}
                    title="Click to unlock Home currency editing"
                  >
                    🔒 {trip.homeCurrency}
                  </span>
                ) : (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                    <span 
                      onClick={() => setIsHomeCurrencyLocked(true)}
                      style={{ cursor: "pointer", fontSize: "0.82rem" }}
                      title="Click to lock Home currency editing"
                    >
                      🔓
                    </span>
                    <SearchableCurrencySelect
                      value={trip.homeCurrency}
                      onChange={(val) => {
                        updateHomeCurrency(val);
                        setIsHomeCurrencyLocked(true);
                      }}
                      rates={rates}
                      customCurrencies={customCurrencies}
                      onAddCustomCurrency={addCustomCurrency}
                      style={{ fontSize: "0.82rem", fontWeight: 700 }}
                      align="right"
                    />
                  </div>
                )}
              </div>
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
                                  <span style={{ fontWeight: 600, color: "#374151" }}>{exp.title || exp.note || "Unspecified"}</span>
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
            const hasFutureExpenses = activeExpenses.some((e) => new Date(e.timestamp) > now);
            const baseExpenses = (showFuture || searchQuery) ? activeExpenses : visibleExpenses;
            const filteredExpenses = searchQuery
              ? baseExpenses.filter((e) => parseSearchQuery(searchQuery, e, trip.homeCurrency, convertCurrency, rates))
              : baseExpenses;
            const displayedExpenses = filteredExpenses;
            return (
              <>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  gap: "10px",
                  marginBottom: "16px",
                  position: "relative"
                }}>
                  {/* Left Side: Search */}
                  <div style={{ width: "36px", display: "flex", justifyContent: "flex-start", flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSearch(!showSearch);
                        if (showSearch) {
                          setSearchQuery("");
                        }
                      }}
                      style={{
                        fontSize: "0.85rem",
                        color: showSearch ? "white" : "var(--color-purple)",
                        backgroundColor: showSearch ? "var(--color-purple)" : "rgba(133, 58, 81, 0.05)",
                        border: "none",
                        borderRadius: "50%",
                        width: "32px",
                        height: "32px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: showSearch ? "0 2px 6px rgba(133,58,81,0.2)" : "none",
                        transition: "all 0.15s",
                        outline: "none"
                      }}
                      title="Search expenses"
                    >
                      🔍
                    </button>
                  </div>

                  {/* Center: Reorganized Segmented Navigation Control */}
                  <div style={{
                    display: "flex",
                    backgroundColor: "rgba(133, 58, 81, 0.05)",
                    padding: "3px",
                    borderRadius: "10px",
                    border: "1px solid rgba(133, 58, 81, 0.08)",
                    alignItems: "center",
                    gap: "2px",
                    flex: 1,
                    maxWidth: "280px"
                  }}>
                    {/* History (Left) */}
                    <button
                      type="button"
                      onClick={() => setLogView("history")}
                      style={{
                        flex: 1,
                        fontSize: "0.8rem",
                        fontWeight: logView === "history" ? 750 : 500,
                        color: logView === "history" ? "var(--color-purple)" : "#6B7280",
                        backgroundColor: logView === "history" ? "white" : "transparent",
                        border: "none",
                        borderRadius: "8px",
                        padding: "5px 8px",
                        cursor: "pointer",
                        boxShadow: logView === "history" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                        transition: "all 0.15s"
                      }}
                    >
                      History
                    </button>

                    {/* Log (Middle - distinct and slightly larger) */}
                    <button
                      type="button"
                      onClick={() => setLogView("recent")}
                      style={{
                        flex: 1.2,
                        fontSize: "0.85rem",
                        fontWeight: logView === "recent" ? 850 : 600,
                        color: logView === "recent" ? "var(--color-purple)" : "#6B7280",
                        backgroundColor: logView === "recent" ? "white" : "transparent",
                        border: logView === "recent" ? "1.5px solid rgba(133, 58, 81, 0.15)" : "none",
                        borderRadius: "8px",
                        padding: "6px 10px",
                        cursor: "pointer",
                        boxShadow: logView === "recent" ? "0 3px 8px rgba(133,58,81,0.1)" : "none",
                        transition: "all 0.15s"
                      }}
                    >
                      Log
                    </button>

                    {/* Plan (Right) */}
                    <button
                      type="button"
                      onClick={() => setLogView("plan")}
                      style={{
                        flex: 1,
                        fontSize: "0.8rem",
                        fontWeight: logView === "plan" ? 750 : 500,
                        color: logView === "plan" ? "var(--color-purple)" : "#6B7280",
                        backgroundColor: logView === "plan" ? "white" : "transparent",
                        border: "none",
                        borderRadius: "8px",
                        padding: "5px 8px",
                        cursor: "pointer",
                        boxShadow: logView === "plan" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                        transition: "all 0.15s"
                      }}
                    >
                      Plan
                    </button>
                  </div>

                  {/* Right Side: Spacer to keep Center perfectly centered */}
                  <div style={{ width: "36px", display: "flex", justifyContent: "flex-end", flexShrink: 0 }} />
                </div>

                {/* Sub-header Controls for Log/History */}
                {(logView === "recent" || logView === "history") && (
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "2px 4px",
                    marginBottom: "12px",
                    fontSize: "0.78rem",
                    color: "#6B7280"
                  }}>
                    {/* Left Side: Future toggle button */}
                    <div>
                      {hasFutureExpenses ? (
                        <button
                          type="button"
                          onClick={() => setShowFuture(!showFuture)}
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            color: showFuture ? "white" : "#0284C7",
                            backgroundColor: showFuture ? "#0284C7" : "rgba(2, 132, 199, 0.05)",
                            border: "1px solid rgba(2, 132, 199, 0.25)",
                            borderRadius: "10px",
                            padding: "2px 7px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: showFuture ? "0 2px 6px rgba(2, 132, 199, 0.2)" : "none",
                            display: "inline-flex",
                            alignItems: "center",
                            outline: "none",
                            height: "22px"
                          }}
                        >
                          Future
                        </button>
                      ) : searchQuery ? (
                        <span style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>Found {filteredExpenses.length} results</span>
                      ) : null}
                    </div>

                    {/* Right Side: View Mode Toggles & Search status */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {hasFutureExpenses && searchQuery && (
                        <span style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>Found {filteredExpenses.length} results</span>
                      )}
                      {logView === "history" && (
                        <button
                          type="button"
                          onClick={() => setHistoryViewMode(historyViewMode === "cards" ? "spreadsheet" : "cards")}
                          style={{
                            background: "none",
                            border: "none",
                            padding: "2px 4px",
                            color: "var(--color-purple)",
                            fontWeight: 700,
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "3px"
                          }}
                        >
                          {historyViewMode === "cards" ? "📊 Spreadsheet View" : "🗂️ Cards View"}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Slide-down Search Box */}
                {showSearch && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "12px",
                    width: "100%"
                  }}>
                    <div style={{
                      position: "relative",
                      flex: 1
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
                        placeholder="Search notes, tags, or operators..."
                        autoFocus
                        style={{
                          width: "100%",
                          padding: "8px 12px 8px 36px",
                          borderRadius: "10px",
                          border: "1.5px solid #E5E7EB",
                          backgroundColor: "white",
                          fontSize: "16px",
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
                  </div>
                )}

                {logView !== "insights" && logView !== "plan" && displayedExpenses.length === 0 ? (
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
                        return (
                          <div style={{
                            border: "1.5px solid rgba(14, 165, 233, 0.22)",
                            boxShadow: "0 8px 32px rgba(14, 165, 233, 0.08), 0 0 20px rgba(14, 165, 233, 0.12)",
                            borderRadius: "24px",
                            padding: "12px 14px",
                            backgroundColor: "rgba(255, 255, 255, 0.65)",
                            marginTop: "8px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px"
                          }}>
                            {/* Sleek, premium centered Insights Title with color shift animation */}
                            <div style={{
                              display: "flex",
                              justifyContent: "center",
                              marginTop: "2px",
                              marginBottom: "2px"
                            }}>
                              <span style={{
                                fontSize: "0.85rem",
                                fontWeight: 900,
                                letterSpacing: "2px",
                                textTransform: "uppercase",
                                fontFamily: "var(--font-heading)",
                                animation: "categoryTextGlowShift 8s infinite ease-in-out",
                                pointerEvents: "none",
                                whiteSpace: "nowrap"
                              }}>
                                Trip Insights
                              </span>
                            </div>
                            {renderInsights()}
                          </div>
                        );
                      }
                      if (logView === "plan") {
                        return renderPlanner();
                      }

                      const sortedExpenses = [...displayedExpenses].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                      if (logView === "recent") {
                        const recentExpenses = searchQuery ? sortedExpenses : sortedExpenses.slice(0, logLimit);
                        let lastLabel = null;
                        return (
                          <div>
                            {!recentExpenses.some(e => getDayLabel(e.timestamp) === "Today") && hasFutureExpenses && (() => {
                              const todayStr = new Date().toLocaleDateString('en-CA');
                              const dayLocation = getResolvedDayLocation(todayStr);
                              
                              {/* Today placeholder banner in History (no notes sub-row, resides in header) */}
                              return (
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "16px", marginBottom: "8px", alignSelf: "flex-start" }}>
                                  {/* Today Location Pill */}
                                  <div style={{
                                    fontSize: "0.8rem",
                                    fontWeight: 800,
                                    color: "var(--color-purple)",
                                    backgroundColor: "rgba(133, 58, 81, 0.06)",
                                    padding: "6px 12px",
                                    borderRadius: "8px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px"
                                  }}>
                                    <span>Today</span>
                                    <span 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingItineraryDate(todayStr);
                                        setItineraryInput(dayLocation || "");
                                      }}
                                      style={{ 
                                        color: dayLocation ? "var(--color-orange)" : "#9CA3AF", 
                                        display: "inline-flex", 
                                        alignItems: "center", 
                                        gap: "2px",
                                        cursor: "pointer",
                                        textTransform: "none"
                                      }}
                                    >
                                      {editingItineraryDate === todayStr ? (
                                        <ItineraryCellInput
                                          initialValue={itineraryInput}
                                          onSave={(val) => {
                                            updateItineraryLocation(todayStr, val);
                                            setEditingItineraryDate(null);
                                          }}
                                          onCancel={() => setEditingItineraryDate(null)}
                                          style={{
                                            fontSize: "0.8rem",
                                            fontWeight: 800,
                                            color: "var(--color-orange)",
                                            border: "none",
                                            borderBottom: "1px solid var(--color-orange)",
                                            outline: "none",
                                            width: "85px",
                                            background: "transparent",
                                            padding: 0
                                          }}
                                        />
                                      ) : (
                                        <span title="Click to edit destination">
                                          📍 {dayLocation || "Add destination"}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}

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
                                  const dateKey = (() => {
                                    const d = new Date(exp.timestamp);
                                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                                  })();
                                  const dayLocation = getResolvedDayLocation(dateKey, sameDayExpenses);
                                  const plannedNotes = trip.itinerary?.[dateKey]?.notes || "";

                                  return (
                                    <div key={exp.id}>
                                      {showHeader && (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "16px", marginBottom: "8px", width: "100%" }}>
                                          <div style={{
                                            fontSize: "0.8rem",
                                            fontWeight: 800,
                                            color: "var(--color-purple)",
                                            backgroundColor: "rgba(133, 58, 81, 0.06)",
                                            padding: "6px 12px",
                                            borderRadius: "8px",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                            alignSelf: "flex-start"
                                          }}>
                                            <span>{label}</span>
                                            <span 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingItineraryDate(dateKey);
                                                setItineraryInput(dayLocation || "");
                                              }}
                                              style={{ 
                                                color: dayLocation ? "var(--color-orange)" : "#9CA3AF", 
                                                display: "inline-flex", 
                                                alignItems: "center", 
                                                gap: "2px",
                                                cursor: "pointer",
                                                textTransform: "none"
                                              }}
                                            >
                                              {editingItineraryDate === dateKey ? (
                                                <ItineraryCellInput
                                                  initialValue={itineraryInput}
                                                  onSave={(val) => {
                                                    updateItineraryLocation(dateKey, val);
                                                    setEditingItineraryDate(null);
                                                  }}
                                                  onCancel={() => setEditingItineraryDate(null)}
                                                  style={{
                                                    fontSize: "0.8rem",
                                                    fontWeight: 800,
                                                    color: "var(--color-orange)",
                                                    border: "none",
                                                    borderBottom: "1px solid var(--color-orange)",
                                                    outline: "none",
                                                    width: "85px",
                                                    background: "transparent",
                                                    padding: 0
                                                  }}
                                                />
                                              ) : (
                                                 <span title="Click to edit destination">
                                                   📍 {dayLocation || "Add destination"}
                                                 </span>
                                              )}
                                            </span>
                                          </div>
                                          {/* Daily Notes sub-row (Only show for older days, not Today) */}
                                          {true && (
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingLeft: "6px" }}>
                                              <span style={{ fontSize: "0.72rem", opacity: 0.6 }}>📝</span>
                                              {editingItineraryCell?.date === dateKey && editingItineraryCell?.field === "notes" ? (
                                                <ItineraryCellInput
                                                  initialValue={plannedNotes}
                                                  isTextArea={true}
                                                  onSave={(val) => {
                                                    updateItineraryNotes(dateKey, val);
                                                    setEditingItineraryCell(null);
                                                  }}
                                                  onCancel={() => setEditingItineraryCell(null)}
                                                  style={{
                                                    fontSize: "0.75rem",
                                                    fontWeight: 500,
                                                    color: "#4B5563",
                                                    border: "1px solid var(--color-orange)",
                                                    borderRadius: "6px",
                                                    padding: "3px 6px",
                                                    outline: "none",
                                                    backgroundColor: "#FFFDF9",
                                                    minHeight: "50px",
                                                    width: "200px"
                                                  }}
                                                />
                                              ) : (
                                                <span
                                                  onClick={() => {
                                                    setEditingItineraryCell({ date: dateKey, field: "notes" });
                                                    setItineraryInput(plannedNotes);
                                                  }}
                                                  style={{
                                                    fontSize: "0.75rem",
                                                    color: plannedNotes ? "#4B5563" : "#9CA3AF",
                                                    cursor: "pointer",
                                                    borderBottom: "1px dashed rgba(0,0,0,0.1)",
                                                    fontStyle: plannedNotes ? "normal" : "italic",
                                                    display: "inline-block",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    maxWidth: "250px"
                                                  }}
                                                  title={plannedNotes}
                                                >
                                                  {plannedNotes || "Add plans/todo notes..."}
                                                </span>
                                              )}
                                            </div>
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
                                        trip={trip}
                                        setGlobalLightbox={setGlobalLightbox}
                                        isReadOnly={isReadOnly}
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

                          const isToday = dateKey === (() => {
                             const now = new Date();
                             return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                           })();
                           const rawLoc = exp.establishment || exp.location || "";
                           const highLevelLoc = isToday 
                             ? (parseCurrentLocation(trip.currentLocation).location || "") 
                             : (exp.locationLocale || (rawLoc ? (rawLoc.split(" | ")[0] || rawLoc) : ""));
                           if (highLevelLoc && !olderGroups[dateKey].locationsList.includes(highLevelLoc)) {
                             olderGroups[dateKey].locationsList.push(highLevelLoc);
                           }
                        });

                        // Set backward compatible single location for card rendering, giving preference to planned itinerary
                        Object.keys(olderGroups).forEach(k => {
                          const itLoc = trip.itinerary?.[k];
                          const plannedLoc = itLoc ? (typeof itLoc === 'string' ? itLoc : itLoc.location) : undefined;
                          olderGroups[k].location = plannedLoc !== undefined ? plannedLoc : (olderGroups[k].locationsList[0] || "");
                        });

                        const olderGroupsArray = Object.values(olderGroups).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
                        const visibleHistoryGroups = searchQuery ? olderGroupsArray : olderGroupsArray.slice(0, historyLimit);
                        const todayStr = new Date().toLocaleDateString('en-CA');
                        const dayLocation = getResolvedDayLocation(todayStr);

                        let historyContent;

                        if (historyViewMode === "spreadsheet") {
                          const renderCell = (group, cat, label) => {
                            const catData = group.categories[cat];
                            const amt = catData ? catData.total : 0;
                            
                            if (amt === 0) {
                              return (
                                <td style={{ padding: "10px 8px", textAlign: "right", color: "#D1D5DB" }}>
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
                                  padding: "10px 8px", 
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

                          historyContent = (
                            <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "10px" }}>
                              <div style={{
                                width: "100%",
                                overflowX: "auto",
                                WebkitOverflowScrolling: "touch",
                                borderRadius: "16px",
                                border: "1.5px solid #E5E7EB",
                                backgroundColor: "white",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.01)"
                              }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
                                  <thead>
                                    <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                                      <th style={{ padding: "10px 10px", fontWeight: 700, color: "#4B5563" }}>Date & Location</th>
                                      <th style={{ padding: "10px 8px", fontWeight: 700, color: "#4B5563", textAlign: "right" }}>Stay</th>
                                      <th style={{ padding: "10px 8px", fontWeight: 700, color: "#4B5563", textAlign: "right" }}>Transit</th>
                                      <th style={{ padding: "10px 8px", fontWeight: 700, color: "#4B5563", textAlign: "right" }}>Food</th>
                                      <th style={{ padding: "10px 8px", fontWeight: 700, color: "#4B5563", textAlign: "right" }}>Other</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {visibleHistoryGroups.map((group) => {
                                      return (
                                        <tr key={group.dateKey} style={{ borderBottom: "1px solid #F3F4F6", transition: "background-color 0.15s" }}>
                                          <td 
                                            onClick={() => setDrillDownExpenses({
                                              title: `Expenses on ${group.dateDisplay}`,
                                              dateKey: group.dateKey,
                                              category: "ALL"
                                            })}
                                            style={{ 
                                              padding: "10px 10px", 
                                              cursor: "pointer",
                                              textDecoration: "underline",
                                              textDecorationStyle: "dotted",
                                              textUnderlineOffset: "3px"
                                            }}
                                            title="Click to view all expenses"
                                          >
                                            <div style={{ fontWeight: 700, color: "#374151", whiteSpace: "nowrap" }}>
                                              {group.dateDisplay}
                                            </div>
                                            <div 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingItineraryDate(group.dateKey);
                                                setItineraryInput(group.location || "");
                                              }}
                                              style={{
                                                fontSize: "0.7rem",
                                                color: group.location ? "var(--color-orange)" : "#9CA3AF",
                                                fontWeight: 700,
                                                marginTop: "2px",
                                                whiteSpace: "nowrap",
                                                cursor: "pointer",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "2px",
                                                maxWidth: "110px",
                                                overflow: "hidden"
                                              }}
                                            >
                                              {editingItineraryDate === group.dateKey ? (
                                                <ItineraryCellInput
                                                  initialValue={itineraryInput}
                                                  onSave={(val) => {
                                                    updateItineraryLocation(group.dateKey, val);
                                                    setEditingItineraryDate(null);
                                                  }}
                                                  onCancel={() => setEditingItineraryDate(null)}
                                                  style={{
                                                    fontSize: "0.7rem",
                                                    fontWeight: 700,
                                                    color: "var(--color-orange)",
                                                    border: "none",
                                                    borderBottom: "1px solid var(--color-orange)",
                                                    outline: "none",
                                                    width: "75px",
                                                    background: "transparent",
                                                    padding: 0
                                                  }}
                                                />
                                              ) : (
                                                <span title="Click to edit destination" style={{ textOverflow: "ellipsis", overflow: "hidden" }}>
                                                  📍 {group.location || "Add Location"}
                                                </span>
                                              )}
                                            </div>
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
                        } else {
                          historyContent = (
                            <div style={{ marginTop: "8px" }}>
                              {visibleHistoryGroups.map((group) => {
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
                                        <div 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingItineraryDate(group.dateKey);
                                            setItineraryInput(group.location || "");
                                          }}
                                          style={{ 
                                            fontSize: "0.75rem", 
                                            color: group.location ? "var(--color-orange)" : "#9CA3AF", 
                                            display: "flex", 
                                            alignItems: "center", 
                                            gap: "2px", 
                                            cursor: "pointer",
                                            fontWeight: 600
                                          }}
                                        >
                                          {editingItineraryDate === group.dateKey ? (
                                            <ItineraryCellInput
                                              initialValue={itineraryInput}
                                              onSave={(val) => {
                                                updateItineraryLocation(group.dateKey, val);
                                                setEditingItineraryDate(null);
                                              }}
                                              onCancel={() => setEditingItineraryDate(null)}
                                              style={{
                                                fontSize: "0.75rem",
                                                fontWeight: 600,
                                                color: "var(--color-orange)",
                                                border: "none",
                                                borderBottom: "1px solid var(--color-orange)",
                                                outline: "none",
                                                width: "80px",
                                                background: "transparent",
                                                padding: 0
                                              }}
                                            />
                                          ) : (
                                            <span title="Click to edit destination">
                                              📍 {group.location || "Add destination"}
                                            </span>
                                          )}
                                        </div>

                                        {/* Daily Notes sub-row duplicated right below location in History card (Except for Today) */}
                                        {group.dateKey !== todayStr && (
                                          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                                            <span style={{ fontSize: "0.72rem", opacity: 0.6 }}>📝</span>
                                            {editingItineraryCell?.date === group.dateKey && editingItineraryCell?.field === "notes" ? (
                                              <ItineraryCellInput
                                                initialValue={trip.itinerary?.[group.dateKey]?.notes || ""}
                                                isTextArea={true}
                                                onSave={(val) => {
                                                  updateItineraryNotes(group.dateKey, val);
                                                  setEditingItineraryCell(null);
                                                }}
                                                onCancel={() => setEditingItineraryCell(null)}
                                                style={{
                                                  fontSize: "0.75rem",
                                                  fontWeight: 500,
                                                  color: "#4B5563",
                                                  border: "1px solid var(--color-orange)",
                                                  borderRadius: "6px",
                                                  padding: "3px 6px",
                                                  outline: "none",
                                                  backgroundColor: "#FFFDF9",
                                                  minHeight: "50px",
                                                  width: "180px"
                                                }}
                                              />
                                            ) : (
                                              <span
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setEditingItineraryCell({ date: group.dateKey, field: "notes" });
                                                  setItineraryInput(trip.itinerary?.[group.dateKey]?.notes || "");
                                                }}
                                                style={{
                                                  fontSize: "0.75rem",
                                                  color: trip.itinerary?.[group.dateKey]?.notes ? "#4B5563" : "#9CA3AF",
                                                  cursor: "pointer",
                                                  borderBottom: "1px dashed rgba(0,0,0,0.1)",
                                                  fontStyle: trip.itinerary?.[group.dateKey]?.notes ? "normal" : "italic",
                                                  display: "inline-block",
                                                  whiteSpace: "nowrap",
                                                  overflow: "hidden",
                                                  textOverflow: "ellipsis",
                                                  maxWidth: "200px"
                                                }}
                                                title={trip.itinerary?.[group.dateKey]?.notes || ""}
                                              >
                                                {trip.itinerary?.[group.dateKey]?.notes || "Add plans/todo notes..."}
                                              </span>
                                            )}
                                          </div>
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
                                                      trip={trip}
                                                      setGlobalLightbox={setGlobalLightbox}
                                         isReadOnly={isReadOnly}
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

                        return (
                          <div>
                            {historyContent}
                            {!searchQuery && olderGroupsArray.length > historyLimit && (
                              <div style={{ display: "flex", justifyContent: "center", marginTop: "16px", marginBottom: "10px" }}>
                                <button
                                  type="button"
                                  onClick={() => setHistoryLimit((prev) => prev + 14)}
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
                                  Load More Days
                                </button>
                              </div>
                            )}
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
      {!hideFloatingButtons && (
        <div style={{
          position: isDemo ? "absolute" : "fixed",
          bottom: isDemo ? "20px" : "30px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}>
          {undoStack.length > 0 && (
            <button
              onClick={handleUndo}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "white",
                color: "var(--color-purple)",
                border: "1.5px solid rgba(133, 58, 81, 0.15)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              title="Undo"
              onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.9)")}
              onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <UndoIcon size={18} />
            </button>
          )}

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
              border: isDemo && demoTourStep === 2 ? "3px solid var(--color-golden)" : "none",
              boxShadow: isDemo && demoTourStep === 2 
                ? "0 0 0 6px var(--color-orange), 0 10px 30px rgba(232, 107, 50, 0.4)" 
                : "0 10px 30px rgba(232, 107, 50, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
              animation: isDemo && demoTourStep === 2 ? "goldGlowPulse 1.5s infinite" : "none"
            }}
            onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
            onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <PlusIcon />
          </button>

          {redoStack.length > 0 && (
            <button
              onClick={handleRedo}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "white",
                color: "var(--color-purple)",
                border: "1.5px solid rgba(133, 58, 81, 0.15)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              title="Redo"
              onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.9)")}
              onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <RedoIcon size={18} />
            </button>
          )}
        </div>
      )}

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
          setGlobalLightbox={setGlobalLightbox}
          isTouchDevice={isTouchDevice}
          demoTourStep={demoTourStep}
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
                    trip={trip}
                    setGlobalLightbox={setGlobalLightbox}
                    isReadOnly={isReadOnly}
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
          isDemo={isDemo}
        />
      )}

      {activeModal === "collaborators" && (
        <CollaboratorsModal
          tripId={tripId}
          tripName={trip.name}
          onClose={() => setActiveModal(null)}
          isDemo={isDemo}
        />
      )}

      {activeModal === "settings" && (
        <SettingsModal
          trip={trip}
          rates={rates}
          customCurrencies={customCurrencies}
          onAddCustomCurrency={addCustomCurrency}
          isHomeCurrencyLocked={isHomeCurrencyLocked}
          setIsHomeCurrencyLocked={setIsHomeCurrencyLocked}
          updateHomeCurrency={updateHomeCurrency}
          updateTripVisibility={updateTripVisibility}
          updateDailyBudgetGoal={updateDailyBudgetGoal}
          showFuture={showFuture}
          setShowFuture={setShowFuture}
          expenses={expenses}
          convertCurrency={convertCurrency}
          onClose={() => setActiveModal(null)}
          isDemo={isDemo}
        />
      )}

      {activeModal === "bin" && (
        <TrashBinModal
          expenses={expenses}
          onClose={() => setActiveModal(null)}
          onRestore={handleRestoreExpense}
          onDeletePermanent={handleDeleteExpensePermanent}
          onEmptyBin={handleEmptyBin}
          homeCurrency={trip.homeCurrency}
          rates={rates}
          isDemo={isDemo}
        />
      )}


      <style>{`
        @keyframes blueGlowPulse {
          0% {
            box-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
            border-color: rgba(59, 130, 246, 0.2);
          }
          50% {
            box-shadow: 0 0 16px rgba(59, 130, 246, 0.45);
            border-color: rgba(59, 130, 246, 0.4);
          }
          100% {
            box-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
            border-color: rgba(59, 130, 246, 0.2);
          }
        }

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

        @keyframes categoryGlowShift {
          0% {
            box-shadow: 0 0 12px rgba(133, 58, 81, 0.2), 0 4px 16px rgba(133, 58, 81, 0.02);
            border-color: rgba(133, 58, 81, 0.18);
          }
          25% {
            box-shadow: 0 0 12px rgba(245, 158, 11, 0.2), 0 4px 16px rgba(245, 158, 11, 0.02);
            border-color: rgba(245, 158, 11, 0.18);
          }
          50% {
            box-shadow: 0 0 12px rgba(59, 130, 246, 0.2), 0 4px 16px rgba(59, 130, 246, 0.02);
            border-color: rgba(59, 130, 246, 0.18);
          }
          75% {
            box-shadow: 0 0 12px rgba(16, 185, 129, 0.2), 0 4px 16px rgba(16, 185, 129, 0.02);
            border-color: rgba(16, 185, 129, 0.18);
          }
          100% {
            box-shadow: 0 0 12px rgba(133, 58, 81, 0.2), 0 4px 16px rgba(133, 58, 81, 0.02);
            border-color: rgba(133, 58, 81, 0.18);
          }
        }

        @keyframes categoryTextGlowShift {
          0% {
            color: rgba(133, 58, 81, 1);
            text-shadow: 0 0 10px rgba(133, 58, 81, 0.25);
          }
          25% {
            color: rgba(232, 107, 50, 1);
            text-shadow: 0 0 10px rgba(232, 107, 50, 0.25);
          }
          50% {
            color: rgba(2, 132, 199, 1);
            text-shadow: 0 0 10px rgba(2, 132, 199, 0.25);
          }
          75% {
            color: rgba(16, 185, 129, 1);
            text-shadow: 0 0 10px rgba(16, 185, 129, 0.25);
          }
          100% {
            color: rgba(133, 58, 81, 1);
            text-shadow: 0 0 10px rgba(133, 58, 81, 0.25);
          }
        }

        @keyframes toastFadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, 15px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>

      {toastVisible && toastText && (
        <div style={{
          position: "fixed",
          bottom: "100px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(15, 23, 42, 0.85)",
          color: "white",
          padding: "10px 20px",
          borderRadius: "30px",
          fontSize: "0.85rem",
          fontWeight: 700,
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          zIndex: 3000,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          animation: "toastFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          whiteSpace: "nowrap"
        }}>
          <span>↩️</span>
          <span>{toastText}</span>
        </div>
      )}

      {globalLightbox.isOpen && globalLightbox.photos && globalLightbox.photos[globalLightbox.index] && (
        <div 
          onClick={() => setGlobalLightbox({ isOpen: false, photos: [], index: 0 })}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.9)",
            zIndex: 15000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(5px)",
            padding: "20px",
            userSelect: "none"
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setGlobalLightbox({ isOpen: false, photos: [], index: 0 })}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "rgba(0,0,0,0.5)",
              border: "none",
              color: "white",
              fontSize: "1.25rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 15200
            }}
          >
            ✕
          </button>

          {/* Image Container with Drag and Gesture zoom support */}
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleLightboxStartDrag}
            onMouseMove={handleLightboxDrag}
            onMouseUp={handleLightboxEndDrag}
            onMouseLeave={handleLightboxEndDrag}
            onTouchStart={(e) => {
              handleLightboxStartDrag(e);
              handleLightboxDoubleTap(e);
            }}
            onMouseMove={handleLightboxDrag} // mouse support
            onTouchMove={handleLightboxDrag}
            onTouchEnd={handleLightboxEndDrag}
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              cursor: lightboxScale > 1 ? (lightboxDragStart ? "grabbing" : "grab") : "default"
            }}
          >
            <img 
              ref={lightboxImageRef}
              src={globalLightbox.photos[globalLightbox.index]} 
              alt="Zoomable memory" 
              draggable={false}
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                objectFit: "contain",
                transform: `translate(${lightboxPan.x}px, ${lightboxPan.y}px) scale(${lightboxScale})`,
                transition: lightboxDragStart ? "none" : "transform 0.15s ease-out",
                borderRadius: "8px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
              }}
            />
          </div>

          {/* Left Arrow */}
          {globalLightbox.photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxScale(1);
                setLightboxPan({ x: 0, y: 0 });
                setGlobalLightbox(prev => ({
                  ...prev,
                  index: (prev.index - 1 + prev.photos.length) % prev.photos.length
                }));
              }}
              style={{
                position: "absolute",
                left: "20px",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: "rgba(0,0,0,0.5)",
                border: "none",
                color: "white",
                fontSize: "1.5rem",
                cursor: "pointer",
                zIndex: 15200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ‹
            </button>
          )}

          {/* Right Arrow */}
          {globalLightbox.photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxScale(1);
                setLightboxPan({ x: 0, y: 0 });
                setGlobalLightbox(prev => ({
                  ...prev,
                  index: (prev.index + 1) % prev.photos.length
                }));
              }}
              style={{
                position: "absolute",
                right: "20px",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: "rgba(0,0,0,0.5)",
                border: "none",
                color: "white",
                fontSize: "1.5rem",
                cursor: "pointer",
                zIndex: 15200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ›
            </button>
          )}

          {/* Counter indicator */}
          {globalLightbox.photos.length > 1 && (
            <div style={{
              position: "absolute",
              bottom: "20px",
              color: "white",
              fontSize: "0.85rem",
              fontWeight: "bold",
              backgroundColor: "rgba(0,0,0,0.6)",
              padding: "4px 12px",
              borderRadius: "12px",
              zIndex: 15200
            }}>
              {globalLightbox.index + 1} / {globalLightbox.photos.length}
            </div>
          )}
        </div>
      )}
    </div>
  ) : (
    <div style={{ minHeight: "100vh", background: "#F9F6ED" }} />
  );
}

function ItineraryCellInput({ initialValue, onSave, onCancel, style, isTextArea }) {
  const [val, setVal] = useState(initialValue || "");
  const baseStyle = {
    ...style,
    fontSize: "16px" // Force 16px to prevent iOS auto-zoom
  };

  if (isTextArea) {
    return (
      <div style={{ position: "relative", display: "inline-flex", width: "100%" }}>
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => onSave(val)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSave(val);
            } else if (e.key === "Escape") {
              onCancel();
            }
          }}
          autoFocus
          rows={3}
          style={{
            ...baseStyle,
            width: "100%",
            paddingRight: "28px",
            boxSizing: "border-box",
            resize: "vertical",
            minHeight: "80px",
            fontFamily: "inherit"
          }}
        />
        {val && (
          <span
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setVal("");
            }}
            style={{
              position: "absolute",
              right: "8px",
              top: "8px",
              color: "#9CA3AF",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "bold",
              padding: "4px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Clear text"
          >
            ✕
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", display: "inline-flex", width: "100%", alignItems: "center" }}>
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => onSave(val)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSave(val);
          } else if (e.key === "Escape") {
            onCancel();
          }
        }}
        autoFocus
        style={{
          ...baseStyle,
          width: "100%",
          paddingRight: "28px",
          boxSizing: "border-box"
        }}
      />
      {val && (
        <span
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setVal("");
          }}
          style={{
            position: "absolute",
            right: "8px",
            color: "#9CA3AF",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: "bold",
            padding: "4px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title="Clear text"
        >
          ✕
        </span>
      )}
    </div>
  );
}

function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  formatMoney,
  convertCurrency,
  homeCurrency,
  rates,
  trip,
  setGlobalLightbox,
  isReadOnly = false
}) {
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [isSwipedOpen, setIsSwipedOpen] = useState(false);
  const [fetchedPhotos, setFetchedPhotos] = useState(null);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  const handleOpenLightbox = async (e) => {
    e.stopPropagation();
    if (loadingPhotos) return;
    if (fetchedPhotos) {
      setGlobalLightbox({ isOpen: true, photos: fetchedPhotos, index: 0 });
      return;
    }
    setLoadingPhotos(true);
    try {
      const { data, error } = await supabase
        .from("trip_entries")
        .select("photo_url, photo_urls, photo_urls_full")
        .eq("id", expense.id)
        .single();
      if (!error && data) {
        const fullUrls = data.photo_urls_full || [];
        const urls = fullUrls.length > 0 ? fullUrls : (data.photo_urls || (data.photo_url ? [data.photo_url] : []));
        setFetchedPhotos(urls);
        setGlobalLightbox({ isOpen: true, photos: urls, index: 0 });
      } else {
        throw error || new Error("No data returned");
      }
    } catch (err) {
      console.error("Failed to load photos on demand:", err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const convertedAmount = convertCurrency(expense.amount, expense.currency, homeCurrency, rates);
  const worthIt = expense.worthIt;

  // Parse custom note suffix for spread/repeat details if present
  const displayTitle = expense.title || expense.note || "";
  const spreadMatch = displayTitle ? displayTitle.match(/(.*)\s\(Day\s(\d+)\/(\d+),\s(.*)\)/) : null;
  const rawDisplayNote = displayTitle ? (spreadMatch ? spreadMatch[1].trim() : displayTitle) : (expense.category || "");
  let displayNote = rawDisplayNote.replace(/#[a-zA-Z0-9_-]+/g, "").replace(/\s+/g, " ").trim();
  if (!displayNote) {
    displayNote = expense.category || "Expense";
  }
  const isRepeat = expense.tags?.includes("spread-mode-repeat");
  const spreadInfo = spreadMatch 
    ? `Day ${spreadMatch[2]}/${spreadMatch[3]}` 
    : null;

  const firstLineNote = displayNote.split("\n")[0].trim();
  const truncatedNote = firstLineNote.length > 30 ? `${firstLineNote.slice(0, 30)}...` : firstLineNote;

  return (
    <div 
      style={{
        borderRadius: "16px",
        marginBottom: "12px",
        boxShadow: worthIt ? undefined : "0 4px 10px rgba(0,0,0,0.02)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        flexShrink: 0
      }}
    >
      <div style={{ position: "relative" }}>
        {!isReadOnly && (
          <div
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this expense?")) {
                const deleteEntire = expense.tags?.some(t => t.startsWith("spread-group-"));
                const groupTag = expense.tags?.find(t => t.startsWith("spread-group-"));
                onDelete(expense.id, deleteEntire, groupTag);
              }
            }}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "70px",
              backgroundColor: "#EF4444",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: "0.85rem",
              borderRadius: "0 16px 16px 0",
              zIndex: 1
            }}
          >
            Delete
          </div>
        )}

        <div
          className={worthIt ? "worth-it-shimmer-card" : ""}
          onTouchStart={(e) => {
            if (isReadOnly) return;
            setStartX(e.touches[0].clientX);
            setIsDragging(true);
          }}
          onTouchMove={(e) => {
            if (isReadOnly || !isDragging) return;
            const diffX = e.touches[0].clientX - startX;
            if (diffX < 0 && diffX > -75) {
              setOffsetX(diffX);
            } else if (diffX >= 0) {
              setOffsetX(0);
              setIsSwipedOpen(false);
            }
          }}
          onTouchEnd={() => {
            if (isReadOnly) return;
            setIsDragging(false);
            if (offsetX < -40) {
              setOffsetX(-70);
              setIsSwipedOpen(true);
            } else {
              setOffsetX(0);
              setIsSwipedOpen(false);
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            backgroundColor: worthIt ? undefined : "white",
            border: worthIt ? undefined : "1.5px solid rgba(133, 58, 81, 0.08)",
            borderRadius: "16px",
            position: "relative",
            zIndex: 2,
            transform: `translateX(${offsetX}px)`,
            transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            cursor: isReadOnly ? "default" : "pointer",
            boxShadow: worthIt ? "0 4px 15px rgba(245, 158, 11, 0.12)" : undefined
          }}
          onClick={() => {
            if (isReadOnly) return;
            if (isSwipedOpen) {
              setOffsetX(0);
              setIsSwipedOpen(false);
            } else {
              onEdit(expense);
            }
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
              {worthIt && <StarIcon filled={true} />}
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap"
            }}>
              <span style={{ fontSize: "0.78rem", color: "#6B7280" }}>
                {CATEGORY_EMOJIS[expense.category] || "📦"} {expense.category}
              </span>
              {spreadInfo && (
                <span style={{
                  fontSize: "0.74rem",
                  color: "var(--color-orange)",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "2px",
                  backgroundColor: "rgba(232, 107, 50, 0.08)",
                  padding: "1px 6px",
                  borderRadius: "8px"
                }}>
                  {isRepeat ? "🔁" : "🗓️"} {spreadInfo}
                </span>
              )}
              {(() => {
                const dbEst = expense.establishment || expense.location || "";
                const expDateObj = new Date(expense.timestamp);
                const dateKey = `${expDateObj.getFullYear()}-${String(expDateObj.getMonth() + 1).padStart(2, '0')}-${String(expDateObj.getDate()).padStart(2, '0')}`;
                const itVal = trip?.itinerary?.[dateKey];
                const itLoc = itVal ? (typeof itVal === 'string' ? itVal : itVal.location) : undefined;
                const locale = (itLoc || parseCurrentLocation(trip?.currentLocation).location || "").trim();
                
                const cleanEst = dbEst.includes(" | ") ? dbEst.split(" | ")[0].trim() : dbEst.trim();
                const cleanLoc = locale;
                
                const shouldShow = cleanEst && cleanEst.toLowerCase() !== cleanLoc.toLowerCase();
                if (!shouldShow) return null;
                
                return (
                  <span style={{
                    fontSize: "0.78rem",
                    color: "#9CA3AF",
                    display: "flex",
                    alignItems: "center",
                    gap: "2px"
                  }}>
                    📍 {cleanEst}
                  </span>
                );
              })()}
            </div>

            {expense.notes && (
              <span style={{
                fontSize: "0.78rem",
                color: "#4B5563",
                marginTop: "2px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
                lineHeight: "1.3",
                opacity: 0.85
              }}
              title={expense.notes}
              >
                {expense.notes}
              </span>
            )}

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

          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{
              fontWeight: 800,
              fontSize: "1.05rem",
              color: "#111827"
            }}>{formatMoney(convertedAmount, homeCurrency)}</div>
            {expense.currency !== homeCurrency && (
              <div style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>
                {formatLocalCurrency(expense.amount, expense.currency)}
              </div>
            )}
            {(() => {
              if (!expense.hasPhoto) return null;
              return (
                <div 
                  onClick={handleOpenLightbox}
                  style={{
                    position: "relative",
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1.5px solid #E5E7EB",
                    marginTop: "6px",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                    backgroundColor: "#FFEBEB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  title={loadingPhotos ? "Loading receipt..." : "Click to view receipt"}
                >
                  {loadingPhotos ? (
                    <div style={{ fontSize: "0.75rem", color: "var(--color-orange)", fontWeight: 800 }}>...</div>
                  ) : (
                    (expense.photoUrls && expense.photoUrls.length > 0) ? (
                      <img 
                        src={expense.photoUrls[0]} 
                        alt="Receipt thumbnail" 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                      />
                    ) : (
                      <span style={{ fontSize: "1.1rem" }}>📷</span>
                    )
                  )}
                </div>
              );
            })()}
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
  onRefreshRates,
  setGlobalLightbox,
  isTouchDevice,
  demoTourStep,
  isDemo = false
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

  const [editEntireGroup, setEditEntireGroup] = useState(() => {
    return isGroup;
  });

  const fileInputRef = useRef(null);
  const totalInputRef = useRef(null);
  const dailyInputRef = useRef(null);
  const notesInputRef = useRef(null);
  const titleInputRef = useRef(null);
  const hashtagsDropdownRef = useRef(null);
  const establishmentInputRef = useRef(null);
  const calendarContainerRef = useRef(null);
  const [isDateExpanded, setIsDateExpanded] = useState(false);
  const [showHashtagsDropdown, setShowHashtagsDropdown] = useState(false);
  const [hashtagFilter, setHashtagFilter] = useState("");
  const [showLocSearchInput, setShowLocSearchInput] = useState(() => {
    return expenseToEdit && (expenseToEdit.establishment || expenseToEdit.location) ? true : false;
  });
  const [isMounting, setIsMounting] = useState(true);

  // Currency pills input states
  const [showOtherCurrencyInput, setShowOtherCurrencyInput] = useState(false);
  const [otherCurrencyQuery, setOtherCurrencyQuery] = useState("");

  // Modal Lightbox state
  const [showModalLightbox, setShowModalLightbox] = useState(false);
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounting(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Autofocus the title input on desktop mount to let user type right away (avoiding keyboard pop on mobile)
    if (titleInputRef.current && typeof window !== 'undefined' && window.innerWidth > 768) {
      titleInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        hashtagsDropdownRef.current &&
        !hashtagsDropdownRef.current.contains(event.target) &&
        titleInputRef.current &&
        !titleInputRef.current.contains(event.target)
      ) {
        setShowHashtagsDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        calendarContainerRef.current &&
        !calendarContainerRef.current.contains(event.target) &&
        !event.target.closest('[data-calendar-toggle="true"]') &&
        !event.target.closest('[data-date-input="true"]')
      ) {
        setIsDateExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isDateExpanded && calendarContainerRef && calendarContainerRef.current && typeof window !== 'undefined' && window.innerWidth > 768) {
      const timer = setTimeout(() => {
        try {
          if (calendarContainerRef.current) {
            calendarContainerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        } catch (err) {
          // ignore DOM scroll errors
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isDateExpanded]);

  const tripHashtags = (() => {
    const tagCounts = {};
    const tagLastUsed = {};
    
    expenses.forEach(e => {
      if (e.tags) {
        e.tags.forEach(t => {
          if (!t.startsWith("spread-") && !t.startsWith("spread-group-")) {
            tagCounts[t] = (tagCounts[t] || 0) + 1;
            const ts = e.timestamp || "";
            if (!tagLastUsed[t] || ts > tagLastUsed[t]) {
              tagLastUsed[t] = ts;
            }
          }
        });
      }
    });
    
    const uniqueTags = Object.keys(tagCounts);
    uniqueTags.sort((a, b) => {
      if (tagCounts[b] !== tagCounts[a]) {
        return tagCounts[b] - tagCounts[a];
      }
      const timeA = tagLastUsed[a] || "";
      const timeB = tagLastUsed[b] || "";
      return timeB.localeCompare(timeA);
    });
    
    const top5Frequent = uniqueTags.slice(0, 5);
    
    return {
      top5: top5Frequent,
      all: uniqueTags
    };
  })();

  const [modalTags, setModalTags] = useState(() => {
    if (expenseToEdit && expenseToEdit.tags) {
      return expenseToEdit.tags.filter(t => !t.startsWith("spread-"));
    }
    return [];
  });

  const [amount, setAmount] = useState(() => {
    if (expenseToEdit && expenseToEdit.amount !== undefined && expenseToEdit.amount !== null) {
      if (isGroup) {
        return formatInputWithCommas(origAmount.toString());
      }
      return formatInputWithCommas(expenseToEdit.amount.toString());
    }
    const draft = getDraft();
    return draft && draft.amount !== undefined && draft.amount !== null ? formatInputWithCommas(draft.amount.toString()) : "";
  });
  const [title, setTitle] = useState(() => {
    if (expenseToEdit) {
      if (expenseToEdit.title !== undefined) {
        return expenseToEdit.title;
      }
      const rawNote = expenseToEdit.note || "";
      const cleanNote = rawNote.replace(/\s*\(Day\s+\d+\/\d+.*\)$/, "");
      const parts = cleanNote.split("\n\n");
      return parts[0] || "";
    }
    const draft = getDraft();
    return draft ? draft.title || "" : "";
  });
  const [extraNotes, setExtraNotes] = useState(() => {
    if (expenseToEdit) {
      if (expenseToEdit.notes !== undefined) {
        return expenseToEdit.notes;
      }
      const rawNote = expenseToEdit.note || "";
      const cleanNote = rawNote.replace(/\s*\(Day\s+\d+\/\d+.*\)$/, "");
      const parts = cleanNote.split("\n\n");
      return parts.length > 1 ? parts.slice(1).join("\n\n") : "";
    }
    const draft = getDraft();
    return draft ? draft.extraNotes || "" : "";
  });
  const [photoUrls, setPhotoUrls] = useState(() => {
    if (expenseToEdit) return expenseToEdit.photoUrls || (expenseToEdit.photoUrl ? [expenseToEdit.photoUrl] : []);
    const draft = getDraft();
    if (draft) return draft.photoUrls || (draft.photoUrl ? [draft.photoUrl] : []);
    return [];
  });
  const [photoUrlsFull, setPhotoUrlsFull] = useState(() => {
    if (expenseToEdit) return expenseToEdit.photoUrlsFull || expenseToEdit.photoUrls || (expenseToEdit.photoUrl ? [expenseToEdit.photoUrl] : []);
    const draft = getDraft();
    if (draft) return draft.photoUrlsFull || draft.photoUrls || (draft.photoUrl ? [draft.photoUrl] : []);
    return [];
  });
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Photo rearrange drag states
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState(null);
  const [dragOverPhotoIndex, setDragOverPhotoIndex] = useState(null);
  const [isTouchDraggingPhoto, setIsTouchDraggingPhoto] = useState(false);
  const [photoTouchTimer, setPhotoTouchTimer] = useState(null);
  const touchDragActiveRef = useRef(false);

  // Photo Drag & Drop handlers
  const handlePhotoDragStart = (e, index) => {
    setDraggedPhotoIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handlePhotoDragOver = (e, index) => {
    e.preventDefault();
    if (draggedPhotoIndex === null || draggedPhotoIndex === index) return;
    setDragOverPhotoIndex(index);
  };

  const handlePhotoDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedPhotoIndex === null || draggedPhotoIndex === targetIndex) return;

    const newPhotoUrls = [...photoUrls];
    const newPhotoUrlsFull = [...photoUrlsFull];

    const [movedUrl] = newPhotoUrls.splice(draggedPhotoIndex, 1);
    newPhotoUrls.splice(targetIndex, 0, movedUrl);

    const [movedUrlFull] = newPhotoUrlsFull.splice(draggedPhotoIndex, 1);
    newPhotoUrlsFull.splice(targetIndex, 0, movedUrlFull);

    setPhotoUrls(newPhotoUrls);
    setPhotoUrlsFull(newPhotoUrlsFull);

    setDraggedPhotoIndex(null);
    setDragOverPhotoIndex(null);
  };

  const handlePhotoDragEnd = () => {
    setDraggedPhotoIndex(null);
    setDragOverPhotoIndex(null);
  };

  // Photo Touch Drag handlers for mobile (Touch & Hold)
  const handlePhotoTouchStart = (e, index) => {
    touchDragActiveRef.current = false;
    const timer = setTimeout(() => {
      setIsTouchDraggingPhoto(true);
      touchDragActiveRef.current = true;
      setDraggedPhotoIndex(index);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 400); // 400ms touch and hold
    setPhotoTouchTimer(timer);
  };

  const handlePhotoTouchMove = (e) => {
    if (!isTouchDraggingPhoto || draggedPhotoIndex === null) {
      if (photoTouchTimer) {
        clearTimeout(photoTouchTimer);
        setPhotoTouchTimer(null);
      }
      return;
    }

    if (e.cancelable) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    const draggedElement = document.querySelector(`[data-photo-index="${draggedPhotoIndex}"]`);
    
    let oldPointerEvents = "";
    if (draggedElement) {
      oldPointerEvents = draggedElement.style.pointerEvents;
      draggedElement.style.pointerEvents = "none";
    }

    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (draggedElement) {
      draggedElement.style.pointerEvents = oldPointerEvents;
    }

    const card = element?.closest('[data-photo-index]');
    if (card) {
      const overIndex = parseInt(card.getAttribute('data-photo-index'), 10);
      if (overIndex !== null && !isNaN(overIndex) && overIndex !== draggedPhotoIndex) {
        const newPhotoUrls = [...photoUrls];
        const newPhotoUrlsFull = [...photoUrlsFull];

        const [movedUrl] = newPhotoUrls.splice(draggedPhotoIndex, 1);
        newPhotoUrls.splice(overIndex, 0, movedUrl);

        const [movedUrlFull] = newPhotoUrlsFull.splice(draggedPhotoIndex, 1);
        newPhotoUrlsFull.splice(overIndex, 0, movedUrlFull);

        setPhotoUrls(newPhotoUrls);
        setPhotoUrlsFull(newPhotoUrlsFull);
        setDraggedPhotoIndex(overIndex);
      }
    }
  };

  const handlePhotoTouchEnd = () => {
    if (photoTouchTimer) {
      clearTimeout(photoTouchTimer);
      setPhotoTouchTimer(null);
    }
    setIsTouchDraggingPhoto(false);
    setDraggedPhotoIndex(null);
  };

  useEffect(() => {
    if (expenseToEdit && expenseToEdit.hasPhoto) {
      setLoadingPhotos(true);
      supabase
        .from("trip_entries")
        .select("photo_url, photo_urls, photo_urls_full")
        .eq("id", expenseToEdit.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            const urls = data.photo_urls || (data.photo_url ? [data.photo_url] : []);
            const fullUrls = data.photo_urls_full || [];
            setPhotoUrls(urls);
            setPhotoUrlsFull(fullUrls.length > 0 ? fullUrls : urls);
          }
        })
        .catch(err => console.error("Error fetching edit photos on demand:", err))
        .finally(() => setLoadingPhotos(false));
    }
  }, [expenseToEdit]);
  const [category, setCategory] = useState(() => {
    if (expenseToEdit) return expenseToEdit.category || "Everything Else";
    const draft = getDraft();
    return draft ? draft.category : "Everything Else";
  });
  const [worthIt, setWorthIt] = useState(() => {
    if (expenseToEdit) return !!expenseToEdit.worthIt;
    const draft = getDraft();
    return draft ? !!draft.worthIt : false;
  });
  const [currency, setCurrency] = useState(() => {
    if (expenseToEdit) return expenseToEdit.currency || trip.homeCurrency;
    const lastUsed = localStorage.getItem("tracker_last_used_currency");
    if (lastUsed) return lastUsed;
    const lastUsedNonHome = localStorage.getItem("tracker_last_used_non_home_currency");
    if (lastUsedNonHome && lastUsedNonHome !== trip.homeCurrency) {
      return lastUsedNonHome;
    }
    return "USD";
  });
  const [establishment, setEstablishment] = useState(() => {
    if (expenseToEdit) {
      if (expenseToEdit.establishment !== undefined) {
        return expenseToEdit.establishment;
      }
      const dbLoc = expenseToEdit.location || "";
      return (dbLoc.split(" | ")[0] || "");
    }
    const draft = getDraft();
    return draft ? draft.establishment || draft.location || "" : "";
  });
  const [spreadExpense, setSpreadExpense] = useState(() => {
    if (expenseToEdit && expenseToEdit.tags?.some(t => t.startsWith("spread-group-"))) {
      return true;
    }
    return false;
  });
  const [calendarTarget, setCalendarTarget] = useState("start"); // "start" | "end"
  const [calMonth, setCalMonth] = useState(() => {
    const initDate = expenseToEdit && expenseToEdit.timestamp ? new Date(expenseToEdit.timestamp) : new Date();
    return initDate.getMonth();
  });
  const [calYear, setCalYear] = useState(() => {
    const initDate = expenseToEdit && expenseToEdit.timestamp ? new Date(expenseToEdit.timestamp) : new Date();
    return initDate.getFullYear();
  });

  const renderCalendarGrid = () => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const totalDays = new Date(calYear, calMonth + 1, 0).getDate();
    const prevMonthTotalDays = new Date(calYear, calMonth, 0).getDate();
    const daysGrid = [];
    
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = new Date(calYear, calMonth - 1, prevMonthTotalDays - i);
      daysGrid.push({
        day: prevMonthTotalDays - i,
        isCurrentMonth: false,
        dateStr: d.toLocaleDateString('en-CA')
      });
    }
    
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(calYear, calMonth, i);
      daysGrid.push({
        day: i,
        isCurrentMonth: true,
        dateStr: d.toLocaleDateString('en-CA')
      });
    }
    
    const remaining = 42 - daysGrid.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(calYear, calMonth + 1, i);
      daysGrid.push({
        day: i,
        isCurrentMonth: false,
        dateStr: d.toLocaleDateString('en-CA')
      });
    }
    
    const handleDayClick = (dayStr) => {
      if (!spreadExpense) {
        setExpenseDate(dayStr);
        setSpreadStart(dayStr);
        setSpreadEnd(null);
        setIsDateExpanded(false);
      } else {
        if (spreadStart && spreadEnd) {
          // If range is already complete, clicking starts a new selection
          setSpreadStart(dayStr);
          setExpenseDate(dayStr);
          setSpreadEnd(null);
          setCalendarTarget("end");
        } else if (calendarTarget === "start") {
          setSpreadStart(dayStr);
          setExpenseDate(dayStr);
          setSpreadEnd(null);
          setCalendarTarget("end");
        } else {
          // calendarTarget === "end"
          if (dayStr >= spreadStart) {
            setSpreadEnd(dayStr);
          } else {
            // Clicked date is before start date -> make it new start date
            setSpreadStart(dayStr);
            setExpenseDate(dayStr);
            setSpreadEnd(null);
            setCalendarTarget("end");
          }
        }
      }
    };
    
    const changeMonth = (direction) => {
      if (direction === -1) {
        if (calMonth === 0) {
          setCalMonth(11);
          setCalYear(prev => prev - 1);
        } else {
          setCalMonth(prev => prev - 1);
        }
      } else {
        if (calMonth === 11) {
          setCalMonth(0);
          setCalYear(prev => prev + 1);
        } else {
          setCalMonth(prev => prev + 1);
        }
      }
    };
    
    return (
      <div style={{ padding: "2px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <button 
            type="button" 
            onClick={() => changeMonth(-1)}
            style={{ border: "none", background: "none", fontSize: "1rem", cursor: "pointer", color: "var(--color-purple)", fontWeight: 800, padding: "1px 6px" }}
          >
            ◀
          </button>
          <span style={{ fontWeight: 850, color: "var(--color-purple)", fontSize: "0.88rem" }}>
            {months[calMonth]} {calYear}
          </span>
          <button 
            type="button" 
            onClick={() => changeMonth(1)}
            style={{ border: "none", background: "none", fontSize: "1rem", cursor: "pointer", color: "var(--color-purple)", fontWeight: 800, padding: "1px 6px" }}
          >
            ▶
          </button>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontWeight: 800, color: "#9CA3AF", fontSize: "0.65rem", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: "2px", columnGap: "2px" }}>
          {daysGrid.map((item, idx) => {
            const isToday = new Date().toLocaleDateString('en-CA') === item.dateStr;
            const isStart = spreadStart === item.dateStr;
            const isEnd = spreadEnd === item.dateStr;
            const isRangeSelected = spreadExpense && spreadStart && spreadEnd;
            const isInRange = isRangeSelected && item.dateStr > spreadStart && item.dateStr < spreadEnd;
            const isSelected = !spreadExpense ? (expenseDate === item.dateStr) : (isStart || isEnd);
            
            let bg = "transparent";
            let color = item.isCurrentMonth ? "#374151" : "#D1D5DB";
            let fontWeight = 600;
            let borderRadius = "50%";
            
            if (isSelected) {
              bg = isStart || isEnd ? "var(--color-orange)" : "var(--color-purple)";
              color = "white";
              fontWeight = 800;
            } else if (isInRange) {
              bg = "rgba(232, 107, 50, 0.12)";
              color = "#C2410C";
              fontWeight = 700;
              borderRadius = "6px";
            } else if (isToday) {
              bg = "rgba(133, 58, 81, 0.08)";
              color = "var(--color-purple)";
              fontWeight = 800;
            }
            
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleDayClick(item.dateStr)}
                style={{
                  border: "none",
                  background: bg,
                  color: color,
                  fontWeight: fontWeight,
                  fontSize: "0.68rem",
                  height: "23px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: borderRadius,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  outline: "none"
                }}
              >
                {item.day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const [spreadMode, setSpreadMode] = useState(() => {
    if (expenseToEdit) {
      return expenseToEdit.tags?.find(t => t.startsWith("spread-mode-"))?.replace("spread-mode-", "") || "divide";
    }
    return "divide";
  });

  const handleSetSpreadMode = (newMode) => {
    setSpreadMode(newMode);
  };

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

  const [expenseDate, setExpenseDate] = useState(() => {
    if (expenseToEdit && expenseToEdit.timestamp) {
      try {
        return new Date(expenseToEdit.timestamp).toLocaleDateString('en-CA');
      } catch (e) {
        return new Date().toLocaleDateString('en-CA');
      }
    }
    return new Date().toLocaleDateString('en-CA');
  });

  const [lastLocalCurrency, setLastLocalCurrency] = useState(() => {
    if (expenseToEdit && expenseToEdit.currency !== trip.homeCurrency) {
      return expenseToEdit.currency;
    }
    const lastUsedNonHome = localStorage.getItem("tracker_last_used_non_home_currency");
    return (lastUsedNonHome && lastUsedNonHome !== trip.homeCurrency) ? lastUsedNonHome : "USD";
  });

  const formatDateForInput = (dateStr, otherDateStr = null) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    
    const currentYear = new Date().getFullYear().toString();
    
    // Check if years are different
    if (otherDateStr) {
      const otherParts = otherDateStr.split("-");
      if (otherParts.length === 3) {
        const otherYear = otherParts[0];
        if (year !== otherYear) {
          return `${month}/${day}/${year}`;
        }
      }
    }
    
    if (year !== currentYear) {
      return `${month}/${day}/${year}`;
    }
    
    return `${month}/${day}`;
  };

  const parseTextDate = (text) => {
    if (!text) return null;
    const clean = text.replace(/[^0-9/]/g, "");
    const parts = clean.split("/");
    if (parts.length < 2) return null;
    
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    if (isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) return null;
    
    let year = new Date().getFullYear();
    if (parts.length >= 3 && parts[2]) {
      const parsedYear = parseInt(parts[2], 10);
      if (!isNaN(parsedYear)) {
        if (parsedYear < 100) {
          year = 2000 + parsedYear;
        } else {
          year = parsedYear;
        }
      }
    }
    
    const mStr = String(month).padStart(2, "0");
    const dStr = String(day).padStart(2, "0");
    return `${year}-${mStr}-${dStr}`;
  };

  const [startInputText, setStartInputText] = useState(() => formatDateForInput(spreadStart, spreadEnd));
  const [endInputText, setEndInputText] = useState(() => formatDateForInput(spreadEnd, spreadStart));
  const [singleInputText, setSingleInputText] = useState(() => formatDateForInput(expenseDate));

  useEffect(() => {
    setStartInputText(formatDateForInput(spreadStart, spreadEnd));
  }, [spreadStart, spreadEnd]);

  useEffect(() => {
    setEndInputText(formatDateForInput(spreadEnd, spreadStart));
  }, [spreadEnd, spreadStart]);

  useEffect(() => {
    setSingleInputText(formatDateForInput(expenseDate));
  }, [expenseDate]);

  const handleStartTextBlur = () => {
    const parsed = parseTextDate(startInputText);
    if (parsed) {
      setSpreadStart(parsed);
      setExpenseDate(parsed);
      if (spreadEnd && parsed > spreadEnd) {
        setSpreadEnd(null);
        setSpreadExpense(false);
      }
    } else {
      setStartInputText(formatDateForInput(spreadStart, spreadEnd));
    }
  };

  const handleEndTextBlur = () => {
    const parsed = parseTextDate(endInputText);
    if (parsed) {
      if (parsed > spreadStart) {
        setSpreadEnd(parsed);
        setSpreadExpense(true);
        setSpreadMode(prev => prev || "divide");
      } else if (parsed === spreadStart) {
        setSpreadEnd(null);
        setSpreadExpense(false);
      } else {
        setEndInputText(formatDateForInput(spreadEnd, spreadStart));
      }
    } else {
      setEndInputText(formatDateForInput(spreadEnd, spreadStart));
    }
  };

  const handleSingleTextBlur = () => {
    const parsed = parseTextDate(singleInputText);
    if (parsed) {
      setExpenseDate(parsed);
      setSpreadStart(parsed);
      setSpreadEnd(null);
      setSpreadExpense(false);
    } else {
      setSingleInputText(formatDateForInput(expenseDate));
    }
  };

  // Sync editEntireGroup changes
  useEffect(() => {
    if (isGroup && editEntireGroup) {
      setSpreadExpense(true);
      setAmount(formatInputWithCommas(origAmount.toString()));
    } else if (isGroup && !editEntireGroup) {
      setSpreadExpense(false);
      setAmount(formatInputWithCommas(expenseToEdit.amount.toString()));
    }
  }, [editEntireGroup, isGroup, expenseToEdit, origAmount]);

  // Sync inputs with expenseToEdit changes (e.g. from async speech parser)
  useEffect(() => {
    if (expenseToEdit) {
      const baseTitle = expenseToEdit.title !== undefined ? expenseToEdit.title : (() => {
        const rawNote = expenseToEdit.note || "";
        const cleanNote = rawNote.replace(/\s*\(Day\s+\d+\/\d+.*\)$/, "");
        const parts = cleanNote.split("\n\n");
        return parts[0] || "";
      })();
      
      const baseExtraNotes = expenseToEdit.notes !== undefined ? expenseToEdit.notes : (() => {
        const rawNote = expenseToEdit.note || "";
        const cleanNote = rawNote.replace(/\s*\(Day\s+\d+\/\d+.*\)$/, "");
        const parts = cleanNote.split("\n\n");
        return parts.length > 1 ? parts.slice(1).join("\n\n") : "";
      })();

      const targetAmt = (isGroup && editEntireGroup) ? origAmount : expenseToEdit.amount;
      setAmount(targetAmt !== undefined && targetAmt !== null ? formatInputWithCommas(targetAmt.toString()) : "");
      setTitle(baseTitle);
      setExtraNotes(baseExtraNotes);
      setCategory(expenseToEdit.category || "Everything Else");
      setWorthIt(!!expenseToEdit.worthIt);
      setCurrency(expenseToEdit.currency || trip.homeCurrency);
      
      const baseEst = expenseToEdit.establishment !== undefined 
        ? expenseToEdit.establishment 
        : (expenseToEdit.location ? (expenseToEdit.location.split(" | ")[0] || "") : "");
      setEstablishment(baseEst);
      setPhotoUrls(expenseToEdit.photoUrls || (expenseToEdit.photoUrl ? [expenseToEdit.photoUrl] : []));
      setPhotoUrlsFull(expenseToEdit.photoUrlsFull || expenseToEdit.photoUrls || (expenseToEdit.photoUrl ? [expenseToEdit.photoUrl] : []));

      let initialDateStr = new Date().toLocaleDateString('en-CA');
      if (expenseToEdit.timestamp) {
        try {
          initialDateStr = new Date(expenseToEdit.timestamp).toLocaleDateString('en-CA');
        } catch (e) {
          console.error("Invalid expenseToEdit timestamp sync:", e);
        }
      }
      setExpenseDate(initialDateStr);

      const targetSpread = (isGroup && editEntireGroup) || (!isGroup && expenseToEdit.tags?.some(t => t.startsWith("spread-group-")));
      setSpreadExpense(targetSpread);

      const targetTags = expenseToEdit.tags ? expenseToEdit.tags.filter(t => !t.startsWith("spread-")) : [];
      setModalTags(targetTags);
    }
  }, [expenseToEdit, trip.homeCurrency, isGroup, editEntireGroup, origAmount]);

  // Auto-save draft as the user types (only for new expenses)
  useEffect(() => {
    if (!expenseToEdit) {
      const draftObj = { amount, title, extraNotes, category, worthIt, currency, location: establishment, photoUrls, photoUrlsFull };
      safeSetLocalStorage("tracker_expense_draft", JSON.stringify(draftObj));
    }
  }, [amount, title, extraNotes, category, worthIt, currency, establishment, photoUrls, photoUrlsFull, expenseToEdit]);

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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // --- 1. Create Tiny Thumbnail ---
          const canvasThumb = document.createElement("canvas");
          const THUMB_MAX_WIDTH = 400;
          let thumbWidth = img.width;
          let thumbHeight = img.height;
          if (thumbWidth > THUMB_MAX_WIDTH) {
            thumbHeight = Math.round((thumbHeight * THUMB_MAX_WIDTH) / thumbWidth);
            thumbWidth = THUMB_MAX_WIDTH;
          }
          canvasThumb.width = thumbWidth;
          canvasThumb.height = thumbHeight;
          const ctxThumb = canvasThumb.getContext("2d");
          ctxThumb.drawImage(img, 0, 0, thumbWidth, thumbHeight);
          const thumbBase64 = canvasThumb.toDataURL("image/jpeg", 0.75);

          // --- 2. Create Full Resolution ---
          const canvasFull = document.createElement("canvas");
          const FULL_MAX_WIDTH = 1000;
          let fullWidth = img.width;
          let fullHeight = img.height;
          if (fullWidth > FULL_MAX_WIDTH) {
            fullHeight = Math.round((fullHeight * FULL_MAX_WIDTH) / fullWidth);
            fullWidth = FULL_MAX_WIDTH;
          }
          canvasFull.width = fullWidth;
          canvasFull.height = fullHeight;
          const ctxFull = canvasFull.getContext("2d");
          ctxFull.drawImage(img, 0, 0, fullWidth, fullHeight);
          const fullBase64 = canvasFull.toDataURL("image/jpeg", 0.70);

          setPhotoUrls(prev => [...prev, thumbBase64]);
          setPhotoUrlsFull(prev => [...prev, fullBase64]);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });

    // Reset input value so same files can be chosen again
    e.target.value = "";
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
        position: isDemo ? "absolute" : "fixed",
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
        className={worthIt ? "worth-it-shimmer-modal" : ""}
        style={{
          backgroundColor: worthIt ? "#FFFDF2" : "white",
          width: "100%",
          maxWidth: "400px",
          borderRadius: "24px",
          padding: "20px 18px",
          animation: isMounting ? "fadeInUp 0.25s ease-out" : "none",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: worthIt ? "0 20px 50px rgba(245, 158, 11, 0.25)" : "0 20px 40px rgba(0,0,0,0.12)",
          border: worthIt ? "2.5px solid #FCD34D" : "1.5px solid transparent",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative"
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
            const evaluatedAmount = evaluateMathExpression(amount.replace(/,/g, ''));
            const val = parseFloat(evaluatedAmount);
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
            const todayCA = new Date().toLocaleDateString('en-CA');
            const [year, month, day] = expenseDate.split('-').map(Number);

            const getRetroactiveTimestamp = () => {
              const sameDayExps = expenses.filter(e => {
                try {
                  return new Date(e.timestamp).toLocaleDateString('en-CA') === expenseDate;
                } catch (err) {
                  return false;
                }
              });

              if (sameDayExps.length > 0) {
                const times = sameDayExps.map(e => new Date(e.timestamp).getTime());
                const maxTime = Math.max(...times);
                const candidateTime = maxTime + 1000;
                const dCandidate = new Date(candidateTime);
                if (dCandidate.toLocaleDateString('en-CA') === expenseDate) {
                  return dCandidate.toISOString();
                } else {
                  return new Date(maxTime + 1).toISOString();
                }
              } else {
                const now = new Date();
                const targetDate = new Date(
                  year,
                  month - 1,
                  day,
                  now.getHours(),
                  now.getMinutes(),
                  now.getSeconds(),
                  now.getMilliseconds()
                );
                return targetDate.toISOString();
              }
            };

            if (expenseToEdit) {
              const origDateStr = new Date(expenseToEdit.timestamp).toLocaleDateString('en-CA');
              if (expenseDate === origDateStr) {
                finalTimestamp = expenseToEdit.timestamp;
              } else {
                finalTimestamp = getRetroactiveTimestamp();
              }
            } else {
              if (expenseDate === todayCA) {
                finalTimestamp = new Date().toISOString();
              } else {
                finalTimestamp = getRetroactiveTimestamp();
              }
            }

            // Save last used currency and clear form draft on successful submit
            safeSetLocalStorage("tracker_last_used_currency", currency);
            localStorage.removeItem("tracker_expense_draft");

            // Combine title and extra notes for full text to parse tags
            const fullNoteText = extraNotes.trim() ? `${title.trim()}\n\n${extraNotes.trim()}` : title.trim();

            // Extract tags from the note text
            const hashtagRegex = /#([a-zA-Z0-9_-]+)/g;
            const parsedTags = [];
            let match;
            while ((match = hashtagRegex.exec(fullNoteText)) !== null) {
              parsedTags.push(match[1].toLowerCase());
            }

            const originalSpreadTags = expenseToEdit?.tags 
              ? expenseToEdit.tags.filter(t => t.startsWith("spread-") && !t.startsWith("spread-mode-") && !t.startsWith("spread-start-") && !t.startsWith("spread-end-") && !t.startsWith("spread-amount-")) 
              : [];
            
            const finalTags = Array.from(new Set([...modalTags, ...parsedTags])).concat(originalSpreadTags);

            const cleanTitle = title.replace(/#[a-zA-Z0-9_-]+/g, "").replace(/\s+/g, " ").trim();
            const cleanNotes = extraNotes.replace(/#[a-zA-Z0-9_-]+/g, "").replace(/\s+/g, " ").trim();

            onSave({
              amount: val,
              currency,
              category,
              title: cleanTitle || category,
              notes: cleanNotes,
              worthIt,
              establishment: establishment.trim(),
              photoUrl: photoUrls && photoUrls.length > 0 ? photoUrls[0] : "",
              photoUrls: photoUrls || [],
              photoUrlsFull: photoUrlsFull || [],
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
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", position: "relative" }}>
            <label style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#4B5563",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>Title</label>
            <div style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#F9F6ED",
              borderRadius: "16px",
              padding: "6px 12px",
              border: "1.5px solid rgba(133, 58, 81, 0.15)"
            }}>
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => {
                  const val = e.target.value;
                  setTitle(val);
                  
                  const selStart = e.target.selectionStart;
                  const textBeforeCursor = val.substring(0, selStart);
                  const hashtagMatch = textBeforeCursor.match(/#(\w*)$/);
                  if (hashtagMatch) {
                    setShowHashtagsDropdown(true);
                    setHashtagFilter(hashtagMatch[1]);
                  } else {
                    setShowHashtagsDropdown(false);
                    setHashtagFilter("");
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (totalInputRef.current) {
                      totalInputRef.current.focus();
                      totalInputRef.current.select();
                    }
                  }
                }}
                placeholder="Coffee before train"
                required
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  fontSize: "16px",
                  outline: "none",
                  width: "100%",
                  color: "#111827",
                  padding: "4px 0"
                }}
              />

              {/* Pin button */}
              <button
                type="button"
                onClick={() => {
                  setShowLocSearchInput(true);
                  requestAnimationFrame(() => {
                    if (establishmentInputRef.current) {
                      establishmentInputRef.current.focus();
                    }
                  });
                  setTimeout(() => {
                    if (establishmentInputRef.current) {
                      establishmentInputRef.current.focus();
                    }
                  }, 20);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-purple)",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.05rem",
                  marginRight: "4px",
                  outline: "none"
                }}
                title="Attach establishment"
              >
                📍
              </button>
              
              {/* Photo attachment camera button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: demoTourStep === 4 ? "rgba(235, 94, 40, 0.12)" : "none",
                  border: demoTourStep === 4 ? "1.5px solid var(--color-orange)" : "none",
                  color: "var(--color-purple)",
                  cursor: "pointer",
                  padding: demoTourStep === 4 ? "8px" : "4px",
                  boxShadow: demoTourStep === 4 ? "0 0 12px rgba(235, 94, 40, 0.35)" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  marginRight: "4px",
                  outline: "none",
                  transition: "all 0.2s ease"
                }}
              >
                <CameraIcon />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
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
                    borderRadius: "50%",
                    outline: "none"
                  }}
                >
                  <MicIcon />
                </button>
              )}
            </div>

            {/* Location / Establishment Input right below Title seamlessly */}
            {showLocSearchInput && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                marginTop: "4px"
              }}>
                <label style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#4B5563",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>Location / Establishment</label>
                <input
                  ref={establishmentInputRef}
                  type="text"
                  value={establishment}
                  onChange={(e) => setEstablishment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (totalInputRef.current) {
                        totalInputRef.current.focus();
                        totalInputRef.current.select();
                      }
                    }
                  }}
                  placeholder="e.g. Common Ground Cafe, Siargao"
                  autoFocus
                  style={{
                    padding: "10px 12px",
                    borderRadius: "12px",
                    border: "1.5px solid rgba(133, 58, 81, 0.15)",
                    backgroundColor: "#F9F6ED",
                    fontSize: "16px",
                    outline: "none"
                  }}
                />
              </div>
            )}


          </div>

          {/* Amount input block below Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <label style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#4B5563",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>Amount</label>
                {(() => {
                  if (currency === trip.homeCurrency) return null;
                  const rawAmtVal = parseFloat(evaluateMathExpression(amount.replace(/,/g, ''))) || 0;
                  if (rawAmtVal <= 0) return null;
                  
                  const days = (!spreadStart || !spreadEnd) ? 1 : (() => {
                    const start = new Date(spreadStart + "T00:00:00");
                    const end = new Date(spreadEnd + "T00:00:00");
                    return (isNaN(start) || isNaN(end) || end < start) ? 1 : Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                  })();
                  const isSeriesActive = spreadExpense && days > 1;
                  
                  const totalVal = isSeriesActive
                    ? (spreadMode === "repeat" ? (rawAmtVal * days) : rawAmtVal)
                    : rawAmtVal;
                  const dailyVal = isSeriesActive
                    ? (spreadMode === "repeat" ? rawAmtVal : (rawAmtVal / days))
                    : rawAmtVal;

                  const convertedHomeTotal = convertCurrency(totalVal, currency, trip.homeCurrency, rates);
                  const convertedHomeDaily = convertCurrency(dailyVal, currency, trip.homeCurrency, rates);
                  
                  if (convertedHomeTotal <= 0) return null;
                  
                  const homeSymbol = CURRENCY_SYMBOLS[trip.homeCurrency] || trip.homeCurrency;
                  
                  if (isSeriesActive) {
                    return (
                      <span style={{ fontSize: "0.74rem", fontWeight: 500, color: "#6B7280" }}>
                        ≈ {formatMoneyAbbrev(convertedHomeTotal, trip.homeCurrency)} total ({formatMoneyAbbrev(convertedHomeDaily, trip.homeCurrency)}/day)
                      </span>
                    );
                  }
                  
                  return (
                    <span style={{ fontSize: "0.74rem", fontWeight: 500, color: "#6B7280" }}>
                      ≈ {formatMoneyAbbrev(convertedHomeTotal, trip.homeCurrency)}
                    </span>
                  );
                })()}
              </div>
              {(() => {
                if (currency === trip.homeCurrency) return null;
                const lastRates = localStorage.getItem("tracker_rates_last_updated");
                if (!lastRates) return null;
                const diffMs = Date.now() - parseInt(lastRates, 10);
                const diffMin = Math.round(diffMs / 60000);
                const ratesTimeText = diffMin < 60 ? `${diffMin}m ago` : `${Math.round(diffMin / 60)}h ago`;

                return (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "0.7rem",
                    color: "#6B7280"
                  }}>
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
                          fontSize: "0.75rem",
                          color: "var(--color-purple)",
                          display: "flex",
                          alignItems: "center",
                          outline: "none"
                        }}
                        title="Refresh exchange rates"
                      >
                        🔄
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
            {(() => {
              const start = new Date(spreadStart + "T00:00:00");
              const end = new Date(spreadEnd + "T00:00:00");
              const days = (isNaN(start) || isNaN(end) || end < start) ? 1 : Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
              const isSeriesActive = spreadExpense && days > 1;
              const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {/* Standard Amount Field */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "#F9F6ED",
                    borderRadius: "16px",
                    padding: "8px 14px",
                    border: demoTourStep === 3 ? "2.5px solid var(--color-orange)" : "1.5px solid rgba(133, 58, 81, 0.15)",
                    boxShadow: demoTourStep === 3 ? "0 0 12px rgba(235, 94, 40, 0.25)" : "none",
                    transition: "all 0.3s ease",
                    marginBottom: "0px"
                  }}>
                    <style>{`
                      .amount-input-placeholder::placeholder {
                        font-size: 0.82rem !important;
                        font-weight: 500 !important;
                        color: #9CA3AF !important;
                        opacity: 0.8 !important;
                      }
                    `}</style>
                    {/* Left Side: Currency Selector & Reset Button */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (currency !== trip.homeCurrency) {
                            setCurrency(trip.homeCurrency);
                            safeSetLocalStorage("tracker_last_used_currency", trip.homeCurrency);
                            if (totalInputRef.current) {
                              totalInputRef.current.focus();
                            }
                          }
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-purple)",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          cursor: currency === trip.homeCurrency ? "default" : "pointer",
                          padding: "2px 4px",
                          outline: "none",
                          opacity: currency === trip.homeCurrency ? 0.35 : 1,
                          transition: "opacity 0.2s"
                        }}
                        title={currency === trip.homeCurrency ? `Home currency (${trip.homeCurrency})` : `Reset to home currency (${trip.homeCurrency})`}
                      >
                        🏠
                      </button>
                      <SearchableCurrencySelect
                        value={currency}
                        onChange={(val) => {
                          setCurrency(val);
                          safeSetLocalStorage("tracker_last_used_currency", val);
                          if (val !== trip.homeCurrency) {
                            safeSetLocalStorage("tracker_last_used_non_home_currency", val);
                          }
                          if (totalInputRef.current) {
                            totalInputRef.current.focus();
                          }
                        }}
                        rates={rates}
                        customCurrencies={customCurrencies}
                        onAddCustomCurrency={onAddCustomCurrency}
                        style={{ fontSize: "0.8rem", fontWeight: 700 }}
                        recentCurrencies={(() => {
                          const unique = Array.from(new Set(expenses.map(e => e.currency)));
                          return unique.slice(0, 5);
                        })()}
                        align="left"
                        customTrigger={({ onClick, value }) => (
                          <button
                            type="button"
                            onClick={onClick}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--color-purple)",
                              fontSize: "0.95rem",
                              fontWeight: 800,
                              cursor: "pointer",
                              padding: "4px 2px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "1px",
                              outline: "none"
                            }}
                          >
                            {CURRENCY_SYMBOLS[value] || value} <span style={{ fontSize: "0.6rem", opacity: 0.7 }}>▼</span>
                          </button>
                        )}
                      />
                    </div>

                    {/* Right Side: Input Box */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1, justifyContent: "flex-end", minWidth: 0 }}>
                      <input
                        ref={totalInputRef}
                        type="text"
                        className="amount-input-placeholder"
                        value={amount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^[0-9+\-*/().\s,]*$/.test(val)) {
                            const cleanVal = val.replace(/,/g, '');
                            setAmount(formatInputWithCommas(cleanVal));
                          }
                        }}
                        onBlur={() => {
                          const cleanAmt = amount.replace(/,/g, '');
                          const evaluated = evaluateMathExpression(cleanAmt);
                          setAmount(formatInputWithCommas(evaluated));
                        }}
                        placeholder={(() => {
                          if (currency === trip.homeCurrency) return "0.00";
                          const rateVal = convertCurrency(1, trip.homeCurrency, currency, rates);
                          if (rateVal > 0) {
                            const formattedRate = rateVal < 1
                              ? rateVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                              : rateVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            return `1 ${trip.homeCurrency} ≈ ${formattedRate} ${currency}`;
                          }
                          return "0.00";
                        })()}
                        style={{
                          border: "none",
                          background: "transparent",
                          fontSize: "1.4rem",
                          fontWeight: 800,
                          outline: "none",
                          width: "100%",
                          color: "#111827",
                          textAlign: "right",
                          padding: "4px 0",
                          paddingRight: "8px"
                        }}
                      />
                    </div>
                  </div>


                </div>
              );
            })()}
            {/* Horizontal series mode breakdown is displayed inline inside the amount box */}

            {/* Compressed photo preview */}
            {loadingPhotos && (
              <div style={{ fontSize: "0.85rem", color: "#6B7280", fontWeight: 700, padding: "8px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                ⏳ Loading receipt images...
              </div>
            )}
            {photoUrls && photoUrls.length > 0 && !loadingPhotos && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                {photoUrls.map((url, index) => {
                  const isDragged = draggedPhotoIndex === index;
                  const isOver = dragOverPhotoIndex === index;

                  return (
                    <div
                      key={index}
                      data-photo-index={index}
                      draggable={!isTouchDevice}
                      onDragStart={(e) => handlePhotoDragStart(e, index)}
                      onDragOver={(e) => handlePhotoDragOver(e, index)}
                      onDrop={(e) => handlePhotoDrop(e, index)}
                      onDragEnd={handlePhotoDragEnd}
                      onTouchStart={(e) => handlePhotoTouchStart(e, index)}
                      onTouchMove={handlePhotoTouchMove}
                      onTouchEnd={handlePhotoTouchEnd}
                      onTouchCancel={handlePhotoTouchEnd}
                      onContextMenu={(e) => e.preventDefault()} // Disable native long-press menu
                      onClick={() => {
                        if (touchDragActiveRef.current) return;
                        setGlobalLightbox({
                          isOpen: true,
                          photos: photoUrlsFull && photoUrlsFull.length > 0 ? photoUrlsFull : photoUrls,
                          index: index
                        });
                      }}
                      style={{
                        position: "relative",
                        width: "80px",
                        height: "80px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: isOver 
                          ? "2.5px solid var(--color-purple)" 
                          : (isDragged ? "2px solid var(--color-purple)" : "1px solid #E5E7EB"),
                        boxShadow: isDragged 
                          ? "0 12px 30px rgba(0,0,0,0.22)" 
                          : "0 2px 8px rgba(0,0,0,0.08)",
                        opacity: isDragged ? 0.95 : 1,
                        transform: isDragged ? "scale(1.12)" : "none",
                        zIndex: isDragged ? 10 : 1,
                        transition: "transform 0.15s, border 0.15s, opacity 0.15s, box-shadow 0.15s",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        WebkitTouchCallout: "none",
                        touchAction: "none" // Disable browser scroll during long-press drag
                      }}
                    >
                      {/* Cover Badge for first photo (index 0) */}
                      {index === 0 && (
                        <div style={{
                          position: "absolute",
                          top: "4px",
                          left: "4px",
                          backgroundColor: "var(--color-purple)",
                          color: "white",
                          padding: "1px 5px",
                          borderRadius: "6px",
                          fontSize: "8px",
                          fontWeight: "800",
                          zIndex: 3,
                          boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                          pointerEvents: "none",
                          textTransform: "uppercase",
                          letterSpacing: "0.3px"
                        }}>
                          ★ Cover
                        </div>
                      )}

                      <img 
                        src={url} 
                        alt={`Receipt ${index + 1}`} 
                        style={{ 
                          width: "100%", 
                          height: "100%", 
                          objectFit: "cover", 
                          cursor: "pointer",
                          pointerEvents: "none", // Prevent native iOS image long-press menus
                          WebkitTouchCallout: "none",
                          userSelect: "none",
                          WebkitUserSelect: "none"
                        }} 
                      />

                      {/* Rearrange Drag Handle for desktop */}
                      <div style={{
                        position: "absolute",
                        bottom: "4px",
                        left: "4px",
                        backgroundColor: "rgba(0,0,0,0.6)",
                        color: "white",
                        borderRadius: "4px",
                        width: "18px",
                        height: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        cursor: "grab",
                        zIndex: 3,
                        pointerEvents: "none",
                        userSelect: "none"
                      }} title="Click and drag to rearrange">
                        ⠿
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhotoUrls(prev => prev.filter((_, idx) => idx !== index));
                          setPhotoUrlsFull(prev => prev.filter((_, idx) => idx !== index));
                        }}
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
                          justifyContent: "center",
                          zIndex: 3
                        }}
                      >✕</button>
                    </div>
                  );
                })}
                {/* Plus button to add more photos */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "12px",
                    border: "1.5px dashed var(--color-purple)",
                    backgroundColor: "rgba(133, 58, 81, 0.03)",
                    color: "var(--color-purple)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "1.4rem",
                    fontWeight: 300,
                    transition: "all 0.2s",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(133, 58, 81, 0.08)";
                    e.currentTarget.style.transform = "scale(1.02)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(133, 58, 81, 0.03)";
                    e.currentTarget.style.transform = "none";
                  }}
                  title="Add more photos"
                >
                  ＋
                </button>
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
                      padding: "5px 3px",
                      borderRadius: "10px",
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
                    <span style={{ fontSize: "0.95rem", marginBottom: "1px" }}>{CATEGORY_EMOJIS[cat]}</span>
                    <span style={{ 
                      fontSize: "0.62rem", 
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

          {/* 2. Side-by-Side/Stacked Row: When? and Worth it */}
          <div style={{
            display: "grid",
            gridTemplateColumns: spreadExpense ? "1fr" : "1fr 1fr",
            gap: "10px",
            position: "relative"
          }}>
            {/* When? Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3px", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", height: "18px" }}>
                <label style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#4B5563",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  lineHeight: "1"
                }}>When?</label>
                <button
                  type="button"
                  data-calendar-toggle="true"
                  onClick={() => setIsDateExpanded(!isDateExpanded)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    padding: 0,
                    margin: 0,
                    outline: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    lineHeight: "1"
                  }}
                  title="Toggle calendar picker"
                >
                  📅
                </button>
              </div>
              {spreadExpense ? (
                <div style={{ display: "flex", gap: "4px", width: "100%", height: "40px", alignItems: "center" }}>
                  {/* Start Date Text Input */}
                  <input
                    type="text"
                    readOnly={true}
                    data-date-input="true"
                    value={startInputText}
                    onClick={() => {
                      setCalendarTarget("start");
                      setIsDateExpanded(true);
                    }}
                    placeholder="Start"
                    style={{
                      flex: 1,
                      backgroundColor: "white",
                      borderRadius: "12px",
                      border: calendarTarget === "start" ? "1.5px solid var(--color-purple)" : "1.5px solid rgba(133, 58, 81, 0.12)",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#374151",
                      outline: "none",
                      padding: "6px 4px",
                      textAlign: "center",
                      height: "40px",
                      minWidth: 0,
                      boxSizing: "border-box",
                      cursor: "pointer"
                    }}
                  />

                  <span style={{ fontSize: "0.8rem", color: "#9CA3AF", flexShrink: 0 }}>→</span>

                  {/* End Date Text Input */}
                  <div style={{
                    flex: 1,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    height: "40px",
                    minWidth: 0
                  }}>
                    <input
                      type="text"
                      readOnly={true}
                      data-date-input="true"
                      value={endInputText}
                      onClick={() => {
                        setCalendarTarget("end");
                        setIsDateExpanded(true);
                      }}
                      placeholder="End"
                      style={{
                        width: "100%",
                        backgroundColor: "white",
                        borderRadius: "12px",
                        border: calendarTarget === "end" ? "1.5px solid var(--color-purple)" : "1.5px solid rgba(133, 58, 81, 0.12)",
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#374151",
                        outline: "none",
                        padding: "6px 20px 6px 4px",
                        textAlign: "center",
                        height: "40px",
                        boxSizing: "border-box",
                        cursor: "pointer"
                      }}
                    />
                    {/* Clear Range Button (X) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSpreadEnd(null);
                        setSpreadExpense(false);
                        setCalendarTarget("start");
                      }}
                      style={{
                        position: "absolute",
                        right: "4px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#9CA3AF",
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        padding: "2px",
                        outline: "none"
                      }}
                      title="Exit Multi-Day Mode"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  readOnly={true}
                  data-date-input="true"
                  value={singleInputText}
                  onClick={() => {
                    setCalendarTarget("start");
                    setIsDateExpanded(true);
                  }}
                  placeholder="Date"
                  style={{
                    width: "100%",
                    backgroundColor: "white",
                    borderRadius: "12px",
                    border: "1.5px solid rgba(133, 58, 81, 0.12)",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--color-purple)",
                    outline: "none",
                    padding: "6px 12px",
                    textAlign: "center",
                    height: "40px",
                    boxSizing: "border-box",
                    cursor: "pointer"
                  }}
                />
              )}

              {/* Multi-Day Switch below the date field */}
              <div 
                style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", cursor: "pointer", alignSelf: "flex-start" }} 
                onClick={() => {
                  const newVal = !spreadExpense;
                  setSpreadExpense(newVal);
                  if (newVal) {
                    setCalendarTarget("start");
                    setIsDateExpanded(true); // Open calendar when toggling on
                    if (!spreadStart) {
                      setSpreadStart(expenseDate);
                    }
                    if (!spreadEnd) {
                      setSpreadEnd(getFutureDateString(3)); // default to 3 days out
                    }
                  } else {
                    setSpreadEnd(null);
                    setExpenseDate(spreadStart || new Date().toLocaleDateString('en-CA'));
                  }
                }}
              >
                <div style={{
                  width: "28px",
                  height: "16px",
                  borderRadius: "9px",
                  backgroundColor: spreadExpense ? "var(--color-purple)" : "#D1D5DB",
                  position: "relative",
                  transition: "background-color 0.2s"
                }}>
                  <div style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: "white",
                    position: "absolute",
                    top: "2px",
                    left: spreadExpense ? "14px" : "2px",
                    transition: "left 0.2s"
                  }} />
                </div>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#4B5563" }}>Multi-Day</span>
              </div>
            </div>

            {/* Worth It Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <div style={{ display: "flex", alignItems: "center", height: "18px" }}>
                <label style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#4B5563",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  lineHeight: "1"
                }}>Worth it?</label>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newValue = !worthIt;
                  setWorthIt(newValue);
                  if (typeof window !== "undefined" && navigator.vibrate) {
                    navigator.vibrate(15);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: worthIt ? "#FFFBEB" : "white",
                  borderRadius: "14px",
                  height: "40px",
                  boxSizing: "border-box",
                  border: demoTourStep === 5 ? "2.5px solid var(--color-orange)" : (worthIt ? "1.5px solid #FCD34D" : "1.5px solid rgba(133, 58, 81, 0.12)"),
                  boxShadow: demoTourStep === 5 ? "0 0 12px rgba(235, 94, 40, 0.25)" : "none",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: worthIt ? "#B45309" : "#6B7280",
                  outline: "none",
                  width: "100%",
                  textAlign: "center",
                  transition: "all 0.2s ease"
                }}
              >
                {worthIt ? "🌟 Worth it." : "💸 Worth it?"}
              </button>
            </div>

            {/* Collapsible Date Picker (Full-width grid row spanning across both columns) */}
            {isDateExpanded && (
              <div
                ref={calendarContainerRef}
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  backgroundColor: "#FFFDF9",
                  borderRadius: "20px",
                  border: "1.5px solid rgba(133, 58, 81, 0.22)",
                  padding: "8px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  boxShadow: "0 -12px 30px rgba(15, 23, 42, 0.18)",
                  zIndex: 1000,
                  maxHeight: "310px",
                  overflowY: "auto",
                  animation: "fadeInUp 0.2s ease-out"
                }}
              >
                {/* Dynamic Range Card (rendered ABOVE the calendar) */}
                {(() => {
                  const start = new Date(spreadStart + "T00:00:00");
                  const end = new Date(spreadEnd + "T00:00:00");

                  if (spreadExpense && !isNaN(start) && !isNaN(end) && end >= start) {
                    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                    const formattedStart = start.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
                    const formattedEnd = end.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' });

                    return (
                      <div style={{
                        display: "flex",
                        justify: "space-between",
                        alignItems: "center",
                        padding: "6px 8px",
                        backgroundColor: "rgba(232, 107, 50, 0.05)",
                        borderRadius: "12px",
                        border: "1.5px solid rgba(232, 107, 50, 0.15)",
                        marginBottom: "2px"
                      }}>
                        <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "#9A3412" }}>
                          📅 {formattedStart} – {formattedEnd}
                        </span>
                        <span style={{
                          fontSize: "0.68rem",
                          fontWeight: 750,
                          backgroundColor: "rgba(232, 107, 50, 0.12)",
                          color: "#C2410C",
                          padding: "1px 6px",
                          borderRadius: "20px"
                        }}>
                          {days} Days
                        </span>
                      </div>
                    );
                  } else {
                    // Single date selection card
                    const d = new Date(expenseDate + "T00:00:00");
                    const formattedDate = d.toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' });
                    return (
                      <div style={{
                        padding: "6px 8px",
                        backgroundColor: "rgba(133, 58, 81, 0.04)",
                        borderRadius: "10px",
                        border: "1px solid rgba(133, 58, 81, 0.08)",
                        fontSize: "0.74rem",
                        fontWeight: 750,
                        color: "var(--color-purple)",
                        display: "flex",
                        justify: "space-between",
                        alignItems: "center",
                        marginBottom: "2px"
                      }}>
                        <span>Logging on {formattedDate}</span>
                        <span style={{ fontSize: "0.68rem", color: "#6B7280" }}>Tap day to change</span>
                      </div>
                    );
                  }
                })()}

                {/* Render Custom Calendar Grid */}
                {renderCalendarGrid()}

                {/* OK button to verify date range */}
                <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid rgba(133, 58, 81, 0.1)", paddingTop: "6px", marginTop: "2px" }}>
                  <button
                    type="button"
                    onClick={() => setIsDateExpanded(false)}
                    style={{
                      backgroundColor: "var(--color-purple)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "5px 14px",
                      fontSize: "0.76rem",
                      fontWeight: 750,
                      cursor: "pointer",
                      outline: "none"
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notes Input at the bottom */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", position: "relative" }}>
            {/* iPhone-style Autocomplete horizontal suggestions bar */}
            {(() => {
              const filteredHashtags = hashtagFilter
                ? (tripHashtags.all || []).filter(tag => tag.toLowerCase().startsWith(hashtagFilter.toLowerCase()))
                : (tripHashtags.top5 || []);
              
              if (!showHashtagsDropdown || filteredHashtags.length === 0) return null;

              return (
                <div
                  ref={hashtagsDropdownRef}
                  style={{
                    position: "absolute",
                    bottom: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    border: "1.5px solid rgba(232, 107, 50, 0.2)",
                    borderRadius: "14px",
                    boxShadow: "0 -4px 15px rgba(0, 0, 0, 0.08)",
                    zIndex: 200,
                    padding: "6px 10px",
                    marginBottom: "6px",
                    display: "flex",
                    overflowX: "auto",
                    gap: "8px",
                    WebkitOverflowScrolling: "touch",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none"
                  }}
                >
                  <style>{`
                    div::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  {filteredHashtags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (notesInputRef.current) {
                          const el = notesInputRef.current;
                          const val = el.value;
                          const selStart = el.selectionStart;
                          
                          const textBeforeCursor = val.substring(0, selStart);
                          const hashtagMatch = textBeforeCursor.match(/#(\w*)$/);
                          
                          if (hashtagMatch) {
                            const matchIndex = hashtagMatch.index;
                            const beforeMatch = textBeforeCursor.substring(0, matchIndex);
                            const afterCursor = val.substring(selStart);
                            const newVal = beforeMatch + `#${tag} ` + afterCursor;
                            setExtraNotes(newVal);
                            
                            setTimeout(() => {
                              el.focus();
                              const newCursorPos = beforeMatch.length + tag.length + 2;
                              el.setSelectionRange(newCursorPos, newCursorPos);
                            }, 50);
                          } else {
                            if (!val.includes(`#${tag}`)) {
                              const trimmed = val.trim();
                              let newVal = trimmed;
                              if (trimmed.length === 0) newVal = `#${tag} `;
                              else if (trimmed.endsWith(" ") || trimmed.endsWith("\n")) newVal = trimmed + `#${tag} `;
                              else newVal = trimmed + ` #${tag} `;
                              setExtraNotes(newVal);
                            }
                            
                            setTimeout(() => {
                              el.focus();
                              const len = el.value.length;
                              el.setSelectionRange(len, len);
                            }, 50);
                          }
                        }
                        setShowHashtagsDropdown(false);
                        setHashtagFilter("");
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        backgroundColor: "rgba(232, 107, 50, 0.08)",
                        border: "1.5px solid rgba(232, 107, 50, 0.15)",
                        fontSize: "0.78rem",
                        fontWeight: 750,
                        color: "var(--color-orange)",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.15s",
                        outline: "none"
                      }}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              );
            })()}

            <label style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#4B5563",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>Notes</label>
            
            <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
              <textarea
                ref={notesInputRef}
                value={extraNotes}
                onChange={(e) => {
                  const val = e.target.value;
                  setExtraNotes(val);
                  
                  const selStart = e.target.selectionStart;
                  const textBeforeCursor = val.substring(0, selStart);
                  const hashtagMatch = textBeforeCursor.match(/#(\w*)$/);
                  if (hashtagMatch) {
                    setShowHashtagsDropdown(true);
                    setHashtagFilter(hashtagMatch[1]);
                  } else {
                    setShowHashtagsDropdown(false);
                    setHashtagFilter("");
                  }
                }}
                onBlur={() => {
                  setTimeout(() => {
                    if (document.activeElement !== notesInputRef.current) {
                      setShowHashtagsDropdown(false);
                    }
                  }, 200);
                }}
                placeholder="Add details, or use # to further categorize your spending"
                rows={2}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: "12px",
                  border: "1.5px solid rgba(133, 58, 81, 0.15)",
                  backgroundColor: "#F9F6ED",
                  fontSize: "16px",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit"
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setShowHashtagsDropdown(true);
                  setExtraNotes(prev => {
                    const trimmed = prev || "";
                    if (trimmed.endsWith("#")) return prev;
                    if (trimmed.length === 0) return "#";
                    if (trimmed.endsWith(" ") || trimmed.endsWith("\n")) return prev + "#";
                    return prev + " #";
                  });
                  setHashtagFilter("");
                  setTimeout(() => {
                    if (notesInputRef.current) {
                      notesInputRef.current.focus();
                      const len = notesInputRef.current.value.length;
                      notesInputRef.current.setSelectionRange(len, len);
                    }
                  }, 50);
                }}
                style={{
                  backgroundColor: "rgba(133, 58, 81, 0.05)",
                  border: "1.5px solid rgba(133, 58, 81, 0.12)",
                  borderRadius: "12px",
                  color: "var(--color-purple)",
                  cursor: "pointer",
                  width: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  outline: "none"
                }}
                title="Attach tag"
              >
                #
              </button>
            </div>

            {/* Tag Pills */}
            {modalTags && modalTags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px", marginBottom: "2px" }}>
                {modalTags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 8px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(232, 107, 50, 0.08)",
                      border: "1.5px solid rgba(232, 107, 50, 0.2)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--color-orange)"
                    }}
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => setModalTags(prev => prev.filter(t => t !== tag))}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        color: "var(--color-orange)",
                        fontSize: "0.85rem",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: "2px",
                        lineHeight: 1,
                        outline: "none"
                      }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick-tap frequently used tags */}
            {tripHashtags.top5 && tripHashtags.top5.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                <span style={{ fontSize: "0.7rem", color: "#6B7280", alignSelf: "center", marginRight: "2px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3px" }}>Frequent:</span>
                {tripHashtags.top5.map(tag => {
                  const isAlreadyInNotes = extraNotes.includes(`#${tag}`);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setExtraNotes(prev => {
                          const trimmed = prev || "";
                          if (trimmed.includes(`#${tag}`)) return prev;
                          let newVal = trimmed;
                          if (trimmed.length === 0) newVal = `#${tag} `;
                          else if (trimmed.endsWith(" ") || trimmed.endsWith("\n")) newVal = trimmed + `#${tag} `;
                          else newVal = trimmed + ` #${tag} `;
                          return newVal;
                        });
                        setTimeout(() => {
                          if (notesInputRef.current) {
                            notesInputRef.current.focus();
                            const len = notesInputRef.current.value.length;
                            notesInputRef.current.setSelectionRange(len, len);
                          }
                        }, 50);
                      }}
                      disabled={isAlreadyInNotes}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "8px",
                        backgroundColor: isAlreadyInNotes ? "rgba(133, 58, 81, 0.03)" : "rgba(133, 58, 81, 0.08)",
                        border: "none",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: isAlreadyInNotes ? "#9CA3AF" : "var(--color-purple)",
                        cursor: isAlreadyInNotes ? "default" : "pointer",
                        transition: "all 0.2s",
                        outline: "none"
                      }}
                    >
                      #{tag}
                    </button>
                  );
                })}
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

function AuthModal({ onClose, onSuccess, isDemo = false }) {
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
    <div 
      onClick={onClose}
      style={{
        position: isDemo ? "absolute" : "fixed",
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
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
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

function CollaboratorsModal({ tripId, tripName, onClose, isDemo = false }) {
  const [email, setEmail] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState(null);
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
    setEmailError(null);
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
        const origin = typeof window !== "undefined" ? window.location.origin : "https://lostandsoundtravel.com";

        const res = await fetch("/api/invite", {
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
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setEmailError(errData.error || "Failed to send email");
        }
      } catch (emailErr) {
        console.error("Invite email send error:", emailErr);
        setEmailError(emailErr.message || "Network error");
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
    <div 
      onClick={onClose}
      style={{
        position: isDemo ? "absolute" : "fixed",
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
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
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
            <p style={{ color: emailError ? "#D97706" : "#10B981", fontSize: "0.8rem", marginTop: "8px", fontWeight: 600, lineHeight: "1.3" }}>
              {emailError ? (
                <>
                  ⚠️ Whitelisted successfully, but the invite email could not be sent: <span style={{ fontWeight: 700 }}>{emailError}</span>.
                  <br />Please copy and send the private invite link above manually.
                </>
              ) : (
                "✅ Whitelisted and invite email sent! They can click the link in their email to join."
              )}
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

function SettingsModal({ 
  trip, 
  rates, 
  customCurrencies, 
  onAddCustomCurrency, 
  isHomeCurrencyLocked, 
  setIsHomeCurrencyLocked, 
  updateHomeCurrency,
  updateTripVisibility,
  updateDailyBudgetGoal,
  showFuture,
  setShowFuture,
  expenses,
  convertCurrency,
  onClose,
  isDemo = false
}) {
  const exportToCSV = () => {
    if (!expenses || expenses.length === 0) {
      alert("No expenses to export.");
      return;
    }
    const headers = ["Date", "Description", "Amount", "Currency", "Category", "Location", "Home Currency Amount", "Home Currency", "Worth It"];
    const rows = expenses.map(e => {
      const dateStr = new Date(e.timestamp).toLocaleDateString();
      const noteClean = (e.note || "").replace(/"/g, '""');
      const homeAmt = convertCurrency(e.amount, e.currency, trip.homeCurrency, rates);
      return [
        `"${dateStr}"`,
        `"${noteClean}"`,
        e.amount,
        `"${e.currency}"`,
        `"${e.category}"`,
        `"${(e.location || "").replace(/"/g, '""')}"`,
        homeAmt.toFixed(2),
        `"${trip.homeCurrency}"`,
        e.worthIt ? "Yes" : "No"
      ];
    });
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${trip.name.replace(/\s+/g, "_")}_expenses.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    if (!expenses || expenses.length === 0) {
      alert("No expenses to export.");
      return;
    }
    const dataStr = JSON.stringify(expenses, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${trip.name.replace(/\s+/g, "_")}_expenses.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: isDemo ? "absolute" : "fixed",
        top: 0, right: 0, bottom: 0, left: 0,
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px"
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
        backgroundColor: "#F9F6ED",
        borderRadius: "24px",
        border: "1.5px solid rgba(133, 58, 81, 0.15)",
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
        width: "100%",
        maxWidth: "400px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        position: "relative",
        animation: "fadeInScale 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--color-purple)", margin: 0 }}>
            ⚙️ Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", fontSize: "1.1rem", cursor: "pointer",
              color: "#9CA3AF", padding: "4px"
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.5px" }}>Home Currency</label>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "white",
            padding: "10px 14px",
            borderRadius: "14px",
            border: "1.5px solid rgba(133, 58, 81, 0.12)"
          }}>
            <span style={{ fontSize: "0.82rem", color: "#4B5563", fontWeight: 600 }}>Base Currency:</span>
            {isHomeCurrencyLocked ? (
              <span
                onClick={() => setIsHomeCurrencyLocked(false)}
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  color: "var(--color-purple)",
                  borderBottom: "1px dashed var(--color-purple)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px"
                }}
              >
                🔒 {trip.homeCurrency}
              </span>
            ) : (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <span onClick={() => setIsHomeCurrencyLocked(true)} style={{ cursor: "pointer" }}>🔓</span>
                <SearchableCurrencySelect
                  value={trip.homeCurrency}
                  onChange={(val) => {
                    updateHomeCurrency(val);
                    setIsHomeCurrencyLocked(true);
                  }}
                  rates={rates}
                  customCurrencies={customCurrencies}
                  onAddCustomCurrency={onAddCustomCurrency}
                  style={{ fontSize: "0.82rem", fontWeight: 800 }}
                />
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.5px" }}>Preferences</label>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "white",
            padding: "10px 14px",
            borderRadius: "14px",
            border: "1.5px solid rgba(133, 58, 81, 0.12)"
          }}>
            <span style={{ fontSize: "0.82rem", color: "#4B5563", fontWeight: 600 }}>Daily Budget Goal ({trip.homeCurrency}):</span>
            <input
              type="number"
              value={trip.dailyBudgetGoal || ""}
              onChange={(e) => updateDailyBudgetGoal(e.target.value)}
              placeholder="None"
              style={{
                width: "70px",
                border: "1.5px solid #E5E7EB",
                borderRadius: "8px",
                padding: "4px 8px",
                fontSize: "0.82rem",
                fontWeight: 700,
                textAlign: "right",
                color: "var(--color-purple)",
                outline: "none"
              }}
            />
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "white",
            padding: "10px 14px",
            borderRadius: "14px",
            border: "1.5px solid rgba(133, 58, 81, 0.12)"
          }}>
            <span style={{ fontSize: "0.82rem", color: "#4B5563", fontWeight: 600 }}>Show Future Expenses:</span>
            <button
              onClick={() => setShowFuture(!showFuture)}
              style={{
                border: "none",
                borderRadius: "20px",
                width: "42px",
                height: "24px",
                backgroundColor: showFuture ? "var(--color-orange)" : "#D1D5DB",
                position: "relative",
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
            >
              <div style={{
                position: "absolute",
                top: "2px",
                left: showFuture ? "20px" : "2px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                transition: "left 0.2s"
              }} />
            </button>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "white",
            padding: "10px 14px",
            borderRadius: "14px",
            border: "1.5px solid rgba(133, 58, 81, 0.12)",
            marginTop: "6px"
          }}>
            <span style={{ fontSize: "0.82rem", color: "#4B5563", fontWeight: 600 }}>Public Feed Search (Discoverable):</span>
            <button
              onClick={() => updateTripVisibility(!trip.isPublic)}
              style={{
                border: "none",
                borderRadius: "20px",
                width: "42px",
                height: "24px",
                backgroundColor: trip.isPublic ? "var(--color-orange)" : "#D1D5DB",
                position: "relative",
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
            >
              <div style={{
                position: "absolute",
                top: "2px",
                left: trip.isPublic ? "20px" : "2px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                transition: "left 0.2s"
              }} />
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.5px" }}>Export Data</label>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={exportToCSV}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: "var(--color-purple)",
                color: "white",
                fontWeight: 700,
                fontSize: "0.8rem",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(133, 58, 81, 0.1)"
              }}
            >
              📊 Export CSV
            </button>
            <button
              onClick={exportToJSON}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: "rgba(133, 58, 81, 0.08)",
                color: "var(--color-purple)",
                fontWeight: 700,
                fontSize: "0.8rem",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
              }}
            >
              ⚙️ Export JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrashBinModal({ 
  expenses, 
  onClose, 
  onRestore, 
  onDeletePermanent, 
  onEmptyBin, 
  homeCurrency, 
  rates,
  isDemo = false
}) {
  const deletedExpenses = React.useMemo(() => {
    return expenses
      .filter(e => e.deletedAt)
      .sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
  }, [expenses]);

  const handleEmptyClick = () => {
    if (window.confirm("Are you sure you want to permanently delete all items in the bin? This cannot be undone!")) {
      onEmptyBin();
    }
  };

  const handleDeleteClick = (id, title) => {
    if (window.confirm(`Permanently delete "${title}"? This cannot be undone.`)) {
      onDeletePermanent(id);
    }
  };

  const formatDeletedTime = (deletedAtStr) => {
    try {
      const dt = new Date(deletedAtStr);
      const diffMs = Date.now() - dt.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMins / 60);
      
      if (diffMins < 1) return "just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return dt.toLocaleDateString("en-US", { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return "recently";
    }
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: isDemo ? "absolute" : "fixed",
        top: 0, right: 0, bottom: 0, left: 0,
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px"
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
        backgroundColor: "#F9F6ED",
        borderRadius: "24px",
        border: "1.5px solid rgba(133, 58, 81, 0.15)",
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
        width: "100%",
        maxWidth: "400px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        maxHeight: "85vh",
        position: "relative",
        animation: "fadeInScale 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--color-purple)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
            🗑️ Trash Bin
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", fontSize: "1.1rem", cursor: "pointer",
              color: "#9CA3AF", padding: "4px"
            }}
          >
            ✕
          </button>
        </div>

        {deletedExpenses.length > 0 && (
          <div style={{ textAlign: "right" }}>
            <button
              onClick={handleEmptyClick}
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#EF4444",
                backgroundColor: "transparent",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                padding: "4px 8px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Empty Trash Bin
            </button>
          </div>
        )}

        <div style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          paddingRight: "4px",
          minHeight: "150px"
        }}>
          {deletedExpenses.length === 0 ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "200px",
              color: "#9CA3AF",
              textAlign: "center",
              gap: "8px"
            }}>
              <span style={{ fontSize: "2.5rem" }}>🗑️</span>
              <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>Your bin is empty</p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#6B7280", maxWidth: "260px" }}>
                Items you delete will show up here so you can recover them if needed.
              </p>
            </div>
          ) : (
            deletedExpenses.map((exp) => {
              // Helper to format money inline
              const formatMoney = (amount, currency) => {
                try {
                  return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency
                  }).format(amount);
                } catch {
                  return `${currency} ${amount.toFixed(2)}`;
                }
              };


              return (
                <div key={exp.id} style={{
                  backgroundColor: "white",
                  borderRadius: "14px",
                  border: "1px solid rgba(133, 58, 81, 0.08)",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ minWidth: 0, flex: 1, marginRight: "8px" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#374151", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {exp.title}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#9CA3AF", marginTop: "2px" }}>
                        {new Date(exp.timestamp).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })} • {exp.category}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--color-purple)" }}>
                        {exp.amount} {exp.currency}
                      </div>
                      {exp.currency !== homeCurrency && rates && (
                        <div style={{ fontSize: "0.72rem", color: "#6B7280", marginTop: "1px" }}>
                          ≈ {formatMoney(convertCurrency(exp.amount, exp.currency, homeCurrency, rates), homeCurrency)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    borderTop: "1px solid #F3F4F6",
                    paddingTop: "8px",
                    marginTop: "2px"
                  }}>
                    <span style={{ fontSize: "0.7rem", color: "#9CA3AF", fontStyle: "italic" }}>
                      Deleted {formatDeletedTime(exp.deletedAt)}
                    </span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => onRestore(exp.id)}
                        style={{
                          backgroundColor: "#E1F8EB",
                          color: "#10B981",
                          border: "none",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "opacity 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = 0.8}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => handleDeleteClick(exp.id, exp.title)}
                        style={{
                          backgroundColor: "transparent",
                          color: "#9CA3AF",
                          border: "none",
                          borderRadius: "6px",
                          padding: "4px 6px",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "color 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#EF4444"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "#9CA3AF"}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
            fontWeight: 600,
            marginTop: "4px"
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

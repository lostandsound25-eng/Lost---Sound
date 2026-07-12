'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import SearchableCurrencySelect from '../../../components/SearchableCurrencySelect';

export default function DiscoverFeedPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewerCurrency, setViewerCurrency] = useState("USD");
  const [currencyMode, setCurrencyMode] = useState("viewer"); // 'viewer' or 'original'
  const [rates, setRates] = useState({
    USD: 1.0,
    EUR: 1.08,
    GBP: 1.27,
    THB: 0.027,
    PHP: 0.017,
    VND: 0.000039,
    SGD: 0.74,
    AUD: 0.66,
    CAD: 0.73,
    JPY: 0.0064,
    KRW: 0.00073,
    MYR: 0.21,
    IDR: 0.000062,
    NZD: 0.61,
    CHF: 1.11,
    CNY: 0.14,
    HKD: 0.13,
  });

  useEffect(() => {
    // Load cached rates if available
    if (typeof window !== 'undefined') {
      const savedRates = localStorage.getItem("tracker_rates");
      if (savedRates) {
        try {
          setRates(JSON.parse(savedRates));
        } catch(e) {}
      }
      const savedViewerCurrency = localStorage.getItem("tracker_viewer_currency");
      if (savedViewerCurrency) {
        setViewerCurrency(savedViewerCurrency);
      }
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        if (currentSession?.user) {
          // Fetch viewer's home currency from profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('home_currency')
            .eq('id', currentSession.user.id)
            .maybeSingle();
          if (profile?.home_currency) {
            setViewerCurrency(profile.home_currency);
            localStorage.setItem("tracker_viewer_currency", profile.home_currency);
          }
        }

        // Fetch public trips
        const { data: publicTrips, error: tripsErr } = await supabase
          .from('trips')
          .select('*')
          .eq('is_public', true);

        if (tripsErr) throw tripsErr;

        if (publicTrips && publicTrips.length > 0) {
          const tripIds = publicTrips.map(t => t.id);
          const creatorIds = [...new Set(publicTrips.map(t => t.created_by))];

          // Fetch profiles of creators
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, display_name')
            .in('id', creatorIds);

          const profilesMap = (profilesData || []).reduce((acc, p) => {
            acc[p.id] = p.display_name;
            return acc;
          }, {});

          // Fetch all entries for public trips to compute stats
          const { data: entriesData } = await supabase
            .from('trip_entries')
            .select('id, trip_id, amount, currency, category, is_deleted')
            .in('trip_id', tripIds)
            .eq('is_deleted', false);

          const entriesMap = (entriesData || []).reduce((acc, entry) => {
            if (!acc[entry.trip_id]) acc[entry.trip_id] = [];
            acc[entry.trip_id].push(entry);
            return acc;
          }, {});

          const processedTrips = publicTrips.map(trip => {
            const tripEntries = entriesMap[trip.id] || [];
            
            // Calculate total cost in trip's home currency
            let totalHomeCost = 0;
            const categoryTotals = {};

            tripEntries.forEach(entry => {
              // Convert to trip home currency
              const amountInHome = convertCost(entry.amount, entry.currency, trip.home_currency);
              totalHomeCost += amountInHome;

              // Track categories
              const cat = entry.category || "Other";
              categoryTotals[cat] = (categoryTotals[cat] || 0) + amountInHome;
            });

            // Sort categories to find top 3
            const topCategories = Object.entries(categoryTotals)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(entry => entry[0]);

            const currencies = [...new Set(tripEntries.map(e => e.currency.toUpperCase()))];
            if (trip.home_currency) {
              currencies.push(trip.home_currency.toUpperCase());
            }
            const uniqueCurrencies = [...new Set(currencies)];

            return {
              ...trip,
              creatorName: profilesMap[trip.created_by] || "Guest Explorer",
              totalHomeCost,
              entriesCount: tripEntries.length,
              topCategories,
              uniqueCurrencies
            };
          });

          setTrips(processedTrips);
        }
      } catch (err) {
        console.error("Error loading discover feed:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const convertCost = (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return amount;
    const rateFrom = rates[fromCurrency] || 1.0;
    const rateTo = rates[toCurrency] || 1.0;
    // convert to USD, then to target
    const amountInUSD = amount / rateFrom;
    return amountInUSD * rateTo;
  };

  const handleViewerCurrencyChange = (newVal) => {
    setViewerCurrency(newVal);
    localStorage.setItem("tracker_viewer_currency", newVal);
    // sync to supabase profile if logged in
    if (session?.user && supabase) {
      supabase.from('profiles').update({ home_currency: newVal }).eq('id', session.user.id).then();
    }
  };

  // Filter trips
  const KEYWORD_TO_CURRENCY = {
    thailand: 'THB', thai: 'THB', bangkok: 'THB', phuket: 'THB',
    philippines: 'PHP', filipino: 'PHP', manila: 'PHP', peso: 'PHP',
    vietnam: 'VND', hanoi: 'VND', saigon: 'VND', dong: 'VND',
    indonesia: 'IDR', bali: 'IDR', jakarta: 'IDR', rupiah: 'IDR',
    malaysia: 'MYR', kuala: 'MYR', ringgit: 'MYR',
    singapore: 'SGD',
    japan: 'JPY', tokyo: 'JPY', kyoto: 'JPY', yen: 'JPY',
    korea: 'KRW', seoul: 'KRW', won: 'KRW',
    australia: 'AUD', sydney: 'AUD', melbourne: 'AUD',
    newzealand: 'NZD', kiwi: 'NZD',
    uk: 'GBP', london: 'GBP', britain: 'GBP', england: 'GBP', pound: 'GBP',
    europe: 'EUR', euro: 'EUR', italy: 'EUR', france: 'EUR', germany: 'EUR', spain: 'EUR', greece: 'EUR', netherland: 'EUR', portugal: 'EUR', austria: 'EUR', ireland: 'EUR',
    usa: 'USD', america: 'USD', states: 'USD', dollar: 'USD',
    canada: 'CAD', toronto: 'CAD',
    swiss: 'CHF', switzerland: 'CHF',
    china: 'CNY', yuan: 'CNY',
    hongkong: 'HKD'
  };

  const filteredTrips = trips.filter(trip => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    // 1. Matches trip name
    if (trip.name.toLowerCase().includes(q)) return true;

    // 2. Matches trip home currency code directly
    if (trip.home_currency?.toLowerCase() === q) return true;

    // 3. Matches creator name
    if (trip.creatorName?.toLowerCase().includes(q)) return true;

    // 4. Matches currency codes loaded in the trip based on country/region keywords
    const matchedCurrency = KEYWORD_TO_CURRENCY[q] || Object.keys(KEYWORD_TO_CURRENCY).find(k => k.includes(q)) && KEYWORD_TO_CURRENCY[Object.keys(KEYWORD_TO_CURRENCY).find(k => k.includes(q))];
    if (matchedCurrency && trip.uniqueCurrencies?.includes(matchedCurrency)) {
      return true;
    }

    // 5. Check if search query matches any of the trip's unique currencies directly
    if (trip.uniqueCurrencies?.some(c => c.toLowerCase() === q)) {
      return true;
    }

    return false;
  });

  return (
    <div style={{
      maxWidth: "480px",
      margin: "0 auto",
      minHeight: "100vh",
      backgroundColor: "#F9F6ED",
      fontFamily: "system-ui, sans-serif",
      color: "#1F2937",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 0 40px rgba(0,0,0,0.05)"
    }}>
      {/* Header */}
      <header style={{
        padding: "20px 20px 16px",
        backgroundColor: "white",
        borderBottom: "1.5px solid rgba(133, 58, 81, 0.12)",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyBox: "space-between", justifyContent: "space-between" }}>
          <button
            onClick={() => window.location.href = '/tracker/trips'}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.15rem",
              cursor: "pointer",
              color: "#853A51",
              padding: "4px 8px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgba(133, 58, 81, 0.05)"
            }}
          >
            ←
          </button>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#853A51", margin: 0 }}>
            🧭 Discover Trips
          </h2>
          <div style={{ width: "32px" }} />
        </div>

        {/* Currency Controls */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          backgroundColor: "#F9F6ED",
          padding: "10px 14px",
          borderRadius: "14px",
          border: "1px solid rgba(133, 58, 81, 0.08)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#4B5563" }}>Viewer Currency:</span>
            <div style={{ width: "90px", backgroundColor: "white", borderRadius: "8px", border: "1px solid #E5E7EB", padding: "4px 8px" }}>
              <SearchableCurrencySelect
                value={viewerCurrency}
                onChange={handleViewerCurrencyChange}
                rates={rates}
                customCurrencies={[]}
                style={{ fontSize: "0.85rem", fontWeight: 700 }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
            <button
              onClick={() => setCurrencyMode("viewer")}
              style={{
                flex: 1,
                padding: "6px",
                borderRadius: "8px",
                fontSize: "0.75rem",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                backgroundColor: currencyMode === "viewer" ? "#853A51" : "white",
                color: currencyMode === "viewer" ? "white" : "#4B5563",
                boxShadow: currencyMode === "viewer" ? "0 2px 6px rgba(133, 58, 81, 0.15)" : "none"
              }}
            >
              Show in {viewerCurrency}
            </button>
            <button
              onClick={() => setCurrencyMode("original")}
              style={{
                flex: 1,
                padding: "6px",
                borderRadius: "8px",
                fontSize: "0.75rem",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                backgroundColor: currencyMode === "original" ? "#853A51" : "white",
                color: currencyMode === "original" ? "white" : "#4B5563",
                boxShadow: currencyMode === "original" ? "0 2px 6px rgba(133, 58, 81, 0.15)" : "none"
              }}
            >
              Show Trip Home Currency
            </button>
          </div>
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search destinations or trips..."
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            fontSize: "0.88rem",
            outline: "none",
            boxSizing: "border-box"
          }}
        />
      </header>

      {/* Main Feed List */}
      <main style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#853A51", fontWeight: 700, marginTop: "40px" }}>
            Loading public tracks...
          </div>
        ) : filteredTrips.length === 0 ? (
          <div style={{ textAlign: "center", color: "#6B7280", padding: "40px 20px" }}>
            <span style={{ fontSize: "2rem", display: "block", marginBottom: "10px" }}>🌍</span>
            <p style={{ fontWeight: 600 }}>No public trips found matching "{searchQuery}"</p>
          </div>
        ) : (
          filteredTrips.map(trip => {
            // Determine displayed currency and value
            const showViewerCurrency = currencyMode === "viewer";
            const targetCurrency = showViewerCurrency ? viewerCurrency : trip.home_currency;
            const convertedValue = showViewerCurrency 
              ? convertCost(trip.totalHomeCost, trip.home_currency, viewerCurrency)
              : trip.totalHomeCost;

            const formattedCost = new Intl.NumberFormat(undefined, {
              style: 'currency',
              currency: targetCurrency
            }).format(convertedValue);

            return (
              <div
                key={trip.id}
                onClick={() => window.location.href = `/tracker/trip/${trip.id}`}
                style={{
                  backgroundColor: "white",
                  borderRadius: "20px",
                  padding: "18px",
                  border: "1px solid rgba(133, 58, 81, 0.08)",
                  cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(133, 58, 81, 0.03)",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(133, 58, 81, 0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(133, 58, 81, 0.03)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1F2937", margin: 0 }}>
                      {trip.name}
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 550 }}>
                      by @{trip.creatorName}
                    </span>
                  </div>
                  <span style={{ fontSize: "1.1rem", fontWeight: 850, color: "#853A51" }}>
                    {formattedCost}
                  </span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
                  {trip.topCategories.map(cat => (
                    <span
                      key={cat}
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        backgroundColor: "rgba(133, 58, 81, 0.05)",
                        color: "#853A51",
                        padding: "3px 8px",
                        borderRadius: "8px"
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                  {trip.topCategories.length === 0 && (
                    <span style={{ fontSize: "0.7rem", color: "#9CA3AF" }}>No logged expenses</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}

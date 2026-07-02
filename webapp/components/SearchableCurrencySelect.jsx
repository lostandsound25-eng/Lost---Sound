'use client';

import { useState, useEffect, useRef } from 'react';

// Country-to-Currency mapping for country-based search
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

// Helper function to turn 2-letter country code to flag emoji
function getFlagEmoji(cc) {
  if (!cc || cc.length !== 2) return "🌐";
  const codePoints = cc.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return "🌐";
  }
}

// Currency-to-Country mapping to generate flags for all currencies
const CURRENCY_TO_COUNTRY = {
  USD: "US", EUR: "EU", JPY: "JP", GBP: "GB", AUD: "AU", CAD: "CA", CHF: "CH", CNY: "CN", SEK: "SE", NZD: "NZ",
  MXN: "MX", SGD: "SG", HKD: "HK", NOK: "NO", KRW: "KR", TRY: "TR", RUB: "RU", INR: "IN", BRL: "BR", ZAR: "ZA",
  DKK: "DK", PLN: "PL", TWD: "TW", THB: "TH", IDR: "ID", HUF: "HU", AED: "AE", COP: "CO", SAR: "SA",
  ILS: "IL", MYR: "MY", PHP: "PH", VND: "VN", ARS: "AR", CLP: "CL", EGP: "EG", RON: "RO", PEN: "PE", KZT: "KZ",
  UAH: "UA", QAR: "QA", KWD: "KW", DZD: "DZ", MAD: "MA", ALL: "AL", AMD: "AM", ANG: "CW", AOA: "AO",
  AWG: "AW", AZN: "AZ", BAM: "BA", BBD: "BB", BDT: "BD", BGN: "BG", BHD: "BH", BIF: "BI", BMD: "BM", BND: "BN",
  BOB: "BO", BSD: "BS", BTN: "BT", BWP: "BW", BYN: "BY", BZD: "BZ", CDF: "CD", CLF: "CL", CNH: "CN",
  CRC: "CR", CUC: "CU", CUP: "CU", CVE: "CV", CZK: "CZ", DJF: "DJ", DOP: "DO", ERN: "ER", ETB: "ET", FJD: "FJ",
  FKP: "FK", GEL: "GE", GGP: "GG", GHS: "GH", GIP: "GI", GMD: "GM", GNF: "GN", GTQ: "GT", GYD: "GY", HNL: "HN",
  HRK: "HR", HTG: "HT", IQD: "IQ", IRR: "IR", ISK: "IS", JEP: "JE", JMD: "JM", JOD: "JO", KES: "KE", KGS: "KG",
  KHR: "KH", KMF: "KM", KPW: "KP", LBP: "LB", LKR: "LK", LRD: "LR", LSL: "LS", LYD: "LY", MDL: "MD", MGA: "MG",
  MKD: "MK", MMK: "MM", MNT: "MN", MOP: "MO", MRU: "MR", MUR: "MU", MVR: "MV", MWK: "MW", MZN: "MZ", NAD: "NA",
  NGN: "NG", NIO: "NI", NPR: "NP", OMR: "OM", PAB: "PA", PGK: "PG", PKR: "PK", PYG: "PY", RWF: "RW", SBD: "SB",
  SCR: "SC", SDG: "SD", SHP: "SH", SLL: "SL", SOS: "SO", SRD: "SR", SSP: "SS", STN: "ST", SVC: "SV", SYP: "SY",
  SZL: "SZ", TJS: "TJ", TMT: "TM", TND: "TN", TOP: "TO", TTD: "TT", TZS: "TZ", UGX: "UG", UYU: "UY", UZS: "UZ",
  VES: "VE", VUV: "VU", WST: "WS", XAF: "CM", XAG: "AG", XAU: "AU", XCD: "DM", XDR: "US", XOF: "SN", XPD: "PD",
  XPF: "PF", XPT: "PT", YER: "YE", ZMW: "ZM", ZWL: "ZW"
};

export function getCurrencyFlag(currencyCode) {
  if (!currencyCode) return "🌐";
  const code = currencyCode.toUpperCase();
  const cc = CURRENCY_TO_COUNTRY[code];
  if (!cc) {
    const guess = code.substring(0, 2);
    return getFlagEmoji(guess);
  }
  return getFlagEmoji(cc);
}

export default function SearchableCurrencySelect({ 
  value, 
  onChange, 
  rates = {}, 
  customCurrencies = [], 
  onAddCustomCurrency,
  style = {},
  align = "left",
  customTrigger,
  recentCurrencies = []
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const defaultCurrencies = ["USD", "THB", "VND", "EUR", "PHP", "IDR", "CAD", "MXN", "AUD"];
  const allAvailable = Object.keys(rates).length > 0 ? Object.keys(rates) : defaultCurrencies;

  // Build list of unique currencies
  const uniqueAll = Array.from(new Set([
    ...recentCurrencies,
    ...defaultCurrencies,
    ...customCurrencies,
    ...allAvailable
  ]));

  // Separate recents from others for sorting
  const recentsFiltered = uniqueAll.filter(c => recentCurrencies.includes(c));
  const othersFiltered = uniqueAll.filter(c => !recentCurrencies.includes(c)).sort();

  // Filter currency options based on search query
  let options = [];
  if (!search.trim()) {
    options = [...recentsFiltered, ...othersFiltered];
  } else {
    const query = search.trim().toLowerCase();
    const matched = uniqueAll.filter(c => {
      const codeLower = c.toLowerCase();
      // Match by currency code directly
      if (codeLower.includes(query)) return true;
      // Match by country names mapping to this currency code
      const matchesCountry = Object.entries(COUNTRY_CURRENCY_MAP).some(([country, code]) => {
        return code.toLowerCase() === codeLower && country.includes(query);
      });
      return matchesCountry;
    });

    const matchedRecents = matched.filter(c => recentCurrencies.includes(c));
    const matchedOthers = matched.filter(c => !recentCurrencies.includes(c)).sort();
    options = [...matchedRecents, ...matchedOthers];
  }

  const handleSelect = (code) => {
    onChange(code);
    
    // If it's a new custom currency not in the default list, add it to custom list
    if (!defaultCurrencies.includes(code) && !customCurrencies.includes(code) && onAddCustomCurrency) {
      onAddCustomCurrency(code);
    }
    
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block", ...style }}>
      {customTrigger ? (
        customTrigger({ onClick: () => setIsOpen(!isOpen), value })
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            border: "none",
            background: "transparent",
            fontWeight: 700,
            color: "var(--color-purple)",
            outline: "none",
            cursor: "pointer",
            fontSize: "inherit",
            padding: "2px 6px",
            borderRadius: "6px",
            backgroundColor: isOpen ? "rgba(133, 58, 81, 0.08)" : "transparent",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          {getCurrencyFlag(value)} {value} <span style={{ fontSize: "0.6rem", opacity: 0.7 }}>▼</span>
        </button>
      )}

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: align === "left" ? 0 : "auto",
          right: align === "right" ? 0 : "auto",
          marginTop: "6px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(15, 23, 42, 0.15)",
          border: "1px solid #E5E7EB",
          zIndex: 300,
          padding: "8px",
          width: "200px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          textAlign: "left"
        }}>
          <input
            type="text"
            placeholder="Search country or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus={true}
            style={{
              padding: "8px 10px",
              borderRadius: "8px",
              border: "1px solid #D1D5DB",
              fontSize: "16px",
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
              color: "#374151"
            }}
          />
          <div style={{
            maxHeight: "180px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "2px"
          }}>
            {options.length === 0 ? (
              <span style={{ fontSize: "0.8rem", color: "#9CA3AF", padding: "6px 8px" }}>
                No results
              </span>
            ) : (
              options.map(opt => {
                const isRecent = recentCurrencies.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "none",
                      background: opt === value ? "rgba(133, 58, 81, 0.08)" : "transparent",
                      color: opt === value ? "var(--color-purple)" : "#374151",
                      fontWeight: opt === value ? 700 : 500,
                      textAlign: "left",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxSizing: "border-box",
                      transition: "background-color 0.15s"
                    }}
                    onMouseEnter={(e) => {
                      if (opt !== value) e.currentTarget.style.backgroundColor = "#F3F4F6";
                    }}
                    onMouseLeave={(e) => {
                      if (opt !== value) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span>{getCurrencyFlag(opt)}</span>
                    <span style={{ flex: 1 }}>{opt}</span>
                    {isRecent && (
                      <span style={{ fontSize: "0.65rem", color: "var(--color-purple)", opacity: 0.8, backgroundColor: "rgba(133, 58, 81, 0.08)", padding: "1px 4px", borderRadius: "4px" }}>
                        Recent
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

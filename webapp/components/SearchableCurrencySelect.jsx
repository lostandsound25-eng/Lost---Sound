'use client';

import { useState, useEffect, useRef } from 'react';

export default function SearchableCurrencySelect({ 
  value, 
  onChange, 
  rates = {}, 
  customCurrencies = [], 
  onAddCustomCurrency,
  style = {}
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

  // Filter currency options
  let options = [];
  if (!search.trim()) {
    // Show defaults + any custom currencies added + the current value
    options = [...new Set([...defaultCurrencies, ...customCurrencies, value])];
  } else {
    // Search within all available currencies in rates
    const query = search.trim().toUpperCase();
    options = allAvailable.filter(c => c.includes(query));
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
        {value} <span style={{ fontSize: "0.6rem", opacity: 0.7 }}>▼</span>
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          marginTop: "6px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(15, 23, 42, 0.15)",
          border: "1px solid #E5E7EB",
          zIndex: 300,
          padding: "8px",
          width: "180px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          textAlign: "left"
        }}>
          <input
            type="text"
            placeholder="Search currency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus={true}
            style={{
              padding: "8px 10px",
              borderRadius: "8px",
              border: "1px solid #D1D5DB",
              fontSize: "0.85rem",
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
              color: "#374151"
            }}
          />
          <div style={{
            maxHeight: "150px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "2px"
          }}>
            {options.length === 0 ? (
              <span style={{ fontSize: "0.8rem", color: "#9CA3AF", padding: "6px 8px" }}>No results</span>
            ) : (
              options.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  style={{
                    padding: "6px 8px",
                    borderRadius: "6px",
                    border: "none",
                    background: opt === value ? "rgba(133, 58, 81, 0.08)" : "transparent",
                    color: opt === value ? "var(--color-purple)" : "#374151",
                    fontWeight: opt === value ? 700 : 500,
                    textAlign: "left",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    width: "100%",
                    display: "block",
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
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

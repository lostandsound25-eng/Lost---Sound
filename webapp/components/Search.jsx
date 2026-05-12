'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  // Simple local search logic for now
  // In a real app, this would query Supabase or WordPress API
  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    
    if (val.length > 2) {
      // Mock results or eventually fetch from API
      setResults([
        { title: 'Exploring Ireland', type: 'Itinerary', url: '/itineraries' },
        { title: 'Vegas to Denver', type: 'Itinerary', url: '/itineraries' },
        { title: 'The Pakse Loop', type: 'Blog', url: '/blog' }
      ].filter(item => item.title.toLowerCase().includes(val.toLowerCase())));
    } else {
      setResults([]);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center',
          color: 'var(--color-purple)',
          padding: '8px',
          opacity: 0.8
        }}
        aria-label="Search site"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </button>

      {isOpen && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(255,255,255,0.98)', 
          zIndex: 9999,
          padding: '60px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ position: 'absolute', top: '30px', right: '30px', background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: 'var(--color-purple)' }}
          >
            ✕
          </button>

          <div style={{ width: '100%', maxWidth: '600px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '30px', textAlign: 'center' }}>What are you looking for?</h2>
            <input 
              type="text"
              autoFocus
              value={query}
              onChange={handleSearch}
              placeholder="Search trips, stories, and tricks..."
              style={{ 
                width: '100%', 
                padding: '24px 30px', 
                borderRadius: '40px', 
                border: '2px solid var(--color-purple)', 
                fontSize: '1.5rem',
                outline: 'none',
                fontFamily: 'var(--font-heading)'
              }}
            />

            <div style={{ marginTop: '40px' }}>
              {results.length > 0 ? (
                results.map((res, i) => (
                  <Link 
                    key={i} 
                    href={res.url} 
                    onClick={() => setIsOpen(false)}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '20px', 
                      backgroundColor: 'var(--color-bg)', 
                      borderRadius: '20px', 
                      marginBottom: '10px',
                      textDecoration: 'none',
                      color: 'var(--color-purple)'
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>{res.title}</span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase' }}>{res.type}</span>
                  </Link>
                ))
              ) : query.length > 2 ? (
                <p style={{ textAlign: 'center', opacity: 0.6 }}>No results found for "{query}"</p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

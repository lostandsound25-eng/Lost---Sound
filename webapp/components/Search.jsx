'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allPosts, setAllPosts] = useState([]);

  // Pre-fetch posts when component mounts for lightning-fast search
  useEffect(() => {
    async function fetchAllPosts() {
      try {
        const res = await fetch(
          'https://public-api.wordpress.com/rest/v1.1/sites/lostandsoundtravel.wordpress.com/posts?number=100'
        );
        if (res.ok) {
          const data = await res.json();
          setAllPosts(data.posts || []);
        }
      } catch (err) {
        console.error('Search fetch error:', err);
      }
    }
    fetchAllPosts();
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    
    if (val.length > 1) {
      const filtered = allPosts.filter(post => {
        const searchContent = `${post.title} ${post.content} ${post.excerpt}`.toLowerCase();
        return searchContent.includes(val.toLowerCase());
      }).map(post => {
        const categories = Object.keys(post.categories || {}).map(c => c.toLowerCase());
        const isItinerary = categories.includes('itineraries');
        return {
          title: post.title.replace(/<\/?[^>]+(>|$)/g, ""),
          type: isItinerary ? 'Itinerary' : 'Story',
          url: `/blog/${post.slug}`
        };
      }).slice(0, 8); 
      
      setResults(filtered);
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
          alignItems: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ position: 'absolute', top: '30px', right: '30px', background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: 'var(--color-purple)' }}
          >
            ✕
          </button>

          <div style={{ width: '100%', maxWidth: '600px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '30px', textAlign: 'center', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)' }}>
              What are you looking for?
            </h2>
            <div style={{ position: 'relative' }}>
              <input 
                type="text"
                autoFocus
                value={query}
                onChange={handleSearch}
                placeholder="Search stories, trips, and tricks..."
                style={{ 
                  width: '100%', 
                  padding: '24px 30px', 
                  borderRadius: '40px', 
                  border: '2px solid var(--color-purple)', 
                  fontSize: '1.5rem',
                  outline: 'none',
                  fontFamily: 'var(--font-heading)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                }}
              />
              <div style={{ position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
            </div>

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
                      padding: '20px 30px', 
                      backgroundColor: 'white', 
                      borderRadius: '20px', 
                      marginBottom: '12px',
                      textDecoration: 'none',
                      color: 'var(--color-purple)',
                      border: '1px solid #eee',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{res.title}</span>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      opacity: 0.8, 
                      textTransform: 'uppercase', 
                      backgroundColor: 'var(--color-bg)', 
                      padding: '4px 10px', 
                      borderRadius: '10px',
                      fontWeight: 800,
                      letterSpacing: '1px',
                      color: 'var(--color-orange)'
                    }}>{res.type}</span>
                  </Link>
                ))
              ) : query.length > 1 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                   <p style={{ opacity: 0.6, fontSize: '1.1rem' }}>No results found for "{query}"</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

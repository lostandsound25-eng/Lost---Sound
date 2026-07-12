'use client';
import React from 'react';
import Link from 'next/link';

export default function TravelTricks() {
  return (
    <main style={{ backgroundColor: '#F9F6ED', minHeight: '100vh', padding: '80px 24px 120px 24px' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: '0.85rem',
            fontWeight: 800,
            color: 'var(--color-orange)',
            display: 'block',
            marginBottom: '10px'
          }}>
            Travel Smarter
          </span>
          <h1 style={{ fontSize: '3.2rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: '0 0 16px 0', lineHeight: 1.1 }}>
            Travel Tricks & Companion Hacks
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#6B7280', margin: 0, fontWeight: 500 }}>
            Proven full-time systems to journal memories, balance travel budgets, and share itineraries effortlessly.
          </p>
        </header>

        {/* Tricks Grid/List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginBottom: '60px' }}>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '30px',
            border: '1.5px solid rgba(133, 58, 81, 0.08)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '2rem' }}>🎙️</span>
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-purple)' }}>
                Trick 1: Log Expenses Instantly Hands-Free
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '1rem', color: '#4B5563', lineHeight: 1.6 }}>
              It's easy to lose track of what you spend on the road. With the **Tracks** companion app, just hold the microphone and say: <code style={{ backgroundColor: '#F3F4F6', padding: '3px 8px', borderRadius: '6px', color: 'var(--color-orange)', fontWeight: 600 }}>"lunch in bangkok 350 baht worth it"</code>. The AI parses the amount, matches the category, detects currency exchange, and journals it instantly.
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '30px',
            border: '1.5px solid rgba(133, 58, 81, 0.08)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '2rem' }}>🔁</span>
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-purple)' }}>
                Trick 2: Split Travel Expenses in Real-Time
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '1rem', color: '#4B5563', lineHeight: 1.6 }}>
              Traveling with a partner or friends? Instead of manual calculations at the end of the trip, add them as co-editors to your track. Collaborative budgets automatically keep track of balances and splits, updating instantly across screens even in different parts of the world.
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '30px',
            border: '1.5px solid rgba(133, 58, 81, 0.08)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '2rem' }}>🌍</span>
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-purple)' }}>
                Trick 3: Share Price-Converted Public Tracks
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '1rem', color: '#4B5563', lineHeight: 1.6 }}>
              When friends or family ask how much your trip to Europe or Thailand cost, don't guess. Make your track public in dashboard settings. Viewers can visit your public link, search your feed, and see all pricing automatically converted from THB or EUR directly to their preferred home currency (USD, GBP, etc.).
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '30px',
            border: '1.5px solid rgba(133, 58, 81, 0.08)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '2rem' }}>📶</span>
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-purple)' }}>
                Trick 4: Work Completely Offline
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '1rem', color: '#4B5563', lineHeight: 1.6 }}>
              No service on a remote beach? No problem. Tracks uses an offline-first sync cache. You can upload photos, add expenses, and edit logs in airplane mode. The app queues the changes and seamlessly syncs to the database the second you reconnect to Wi-Fi.
            </p>
          </div>

        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/tracker" className="btn btn-primary" style={{
            backgroundColor: 'var(--color-purple)',
            color: 'white',
            padding: '16px 36px',
            fontSize: '1.1rem',
            fontWeight: 800,
            borderRadius: '30px',
            textDecoration: 'none',
            boxShadow: '0 10px 25px rgba(133, 58, 81, 0.2)'
          }}>
            🚀 Open Lost & Sound Tracks App
          </Link>
        </div>

      </div>
    </main>
  );
}

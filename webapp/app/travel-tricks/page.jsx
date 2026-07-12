'use client';
import React from 'react';
import Link from 'next/link';

export default function TravelTricks() {
  return (
    <main style={{ backgroundColor: '#F9F6ED', minHeight: '100vh', padding: '80px 24px 120px' }}>
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
            Tested Travel Wisdom
          </span>
          <h1 style={{ fontSize: '3.2rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: '0 0 16px', lineHeight: 1.1 }}>
            Travel Tricks & Smarter Habits
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#6B7280', margin: 0, fontWeight: 550, lineHeight: 1.5 }}>
            Our absolute favorite pacing secrets, packing matrices, and booking rules compiled from years of full-time travel.
          </p>
        </header>

        {/* Content Section 1: Packing */}
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', marginBottom: '16px' }}>
            🎒 1. Ultra-Lightweight Packing Hacks
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1.5px solid rgba(133, 58, 81, 0.08)' }}>
            <p style={{ margin: 0, lineHeight: 1.6, color: '#4B5563' }}>
              <strong>Compression Cubes:</strong> Do not use regular packing cubes. Mesh compression cubes save up to 40% more volume by using a secondary zipper system to compress air out of folded fabrics.
            </p>
            <p style={{ margin: 0, lineHeight: 1.6, color: '#4B5563' }}>
              <strong>The 1-Bag Rule:</strong> Choose a 40L travel pack over a rolling suitcase. It qualifies as a carry-on globally, eliminates luggage carousel wait times, and makes walking down European cobblestones or dirt paths in Southeast Asia breeze-simple.
            </p>
            <p style={{ margin: 0, lineHeight: 1.6, color: '#4B5563' }}>
              <strong>Roll, Don't Fold:</strong> Tightly rolling your clothes prevents heavy creasing, makes packing cubes easier to organize, and maximizes every corner of your bag.
            </p>
          </div>
        </section>

        {/* Content Section 2: Flights */}
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', marginBottom: '16px' }}>
            ✈️ 2. Booking Hacks & Flight Secrets
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1.5px solid rgba(133, 58, 81, 0.08)' }}>
            <p style={{ margin: 0, lineHeight: 1.6, color: '#4B5563' }}>
              <strong>Incognito Searching:</strong> Always search flights in private/incognito tabs. Airlines track cookies and search frequency, automatically inflating prices if they detect repeating interest in specific routes.
            </p>
            <p style={{ margin: 0, lineHeight: 1.6, color: '#4B5563' }}>
              <strong>The Sweet Spot:</strong> Book international flights 50 to 90 days out. For domestic hops, 21 to 35 days prior yields the lowest average pricing. Booking too early or on the last week almost always costs more.
            </p>
            <p style={{ margin: 0, lineHeight: 1.6, color: '#4B5563' }}>
              <strong>Multi-City Booking:</strong> Try routing "A to B" and "C to A" rather than separate one-ways. Long-term travelers often save hundreds by using open-jaw tickets and routing intermediate steps via budget local transit channels.
            </p>
          </div>
        </section>

        {/* Content Section 3: Pacing */}
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', marginBottom: '16px' }}>
            ⏳ 3. Avoid Burnout: Pacing Rules
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1.5px solid rgba(133, 58, 81, 0.08)' }}>
            <p style={{ margin: 0, lineHeight: 1.6, color: '#4B5563' }}>
              <strong>The 3-Night Minimum:</strong> Moving every 1-2 days kills travel energy. Spend at least 3 nights in every hub. It gives you time to unpack, find a local breakfast spot, and appreciate the rhythm of the city.
            </p>
            <p style={{ margin: 0, lineHeight: 1.6, color: '#4B5563' }}>
              <strong>"No-Plan" Days:</strong> Leave one day per week completely empty. No bookings, no tours, no schedules. Wake up and decide how to spend the day entirely based on your current energy.
            </p>
          </div>
        </section>

        {/* Content Section 4: Tracks Callout (Piece of the page) */}
        <section style={{
          backgroundColor: 'var(--color-purple)',
          color: 'white',
          padding: '40px 30px',
          borderRadius: '24px',
          boxShadow: '0 12px 30px rgba(133, 58, 81, 0.1)',
          marginTop: '60px'
        }}>
          <span style={{
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            fontSize: '0.8rem',
            fontWeight: 800,
            color: 'var(--color-golden)',
            display: 'block',
            marginBottom: '8px'
          }}>
            Free Travel Companion App
          </span>
          <h2 style={{ margin: '0 0 12px', fontSize: '2rem', color: 'white', fontFamily: 'var(--font-heading)' }}>
            Budget & Log Your Travel Easily
          </h2>
          <p style={{ margin: '0 0 24px', fontSize: '1rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.6' }}>
            We created a simple, free tool called <strong>Lost & Sound Tracks</strong> to help people track multi-currency expenses, split budgets, log locations, and save travel memories. It works completely offline and synchronizes when you get service.
          </p>

          {/* Screenshot Row */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            overflowX: 'auto', 
            padding: '10px 4px', 
            margin: '0 0 24px',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch'
          }}>
            <img src="/assets/screenshot_log_expense.png" alt="Log Expense Screenshot" style={{ height: '240px', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)', flexShrink: 0 }} />
            <img src="/assets/screenshot_dashboard.png" alt="Dashboard Screenshot" style={{ height: '240px', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)', flexShrink: 0 }} />
            <img src="/assets/screenshot_plan.png" alt="Plan Screenshot" style={{ height: '240px', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)', flexShrink: 0 }} />
            <img src="/assets/screenshot_history.png" alt="History Search Screenshot" style={{ height: '240px', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)', flexShrink: 0 }} />
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link href="/tracker" className="btn" style={{
              backgroundColor: 'var(--color-golden)',
              color: 'var(--color-purple)',
              padding: '14px 28px',
              fontSize: '0.95rem',
              fontWeight: 800,
              borderRadius: '20px',
              textDecoration: 'none',
              display: 'inline-block'
            }}>
              🚀 Open Free Tracks App
            </Link>
            <Link href="/tracker/discover" style={{
              color: 'white',
              padding: '14px 20px',
              fontSize: '0.95rem',
              fontWeight: 700,
              textDecoration: 'underline',
              display: 'inline-block'
            }}>
              🧭 Explore Public Feed
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}

'use client';
import React from 'react';
import Link from 'next/link';
import InteractiveDemo from '../../components/InteractiveDemo';

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

        {/* Content Section 4: Live Interactive Companion App Callout */}
        <section style={{
          backgroundColor: 'var(--color-purple)',
          background: 'linear-gradient(135deg, var(--color-purple) 0%, #4c1f2e 100%)',
          color: 'white',
          padding: '48px 32px',
          borderRadius: '30px',
          boxShadow: '0 15px 35px rgba(133, 58, 81, 0.15)',
          marginTop: '60px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center'
          }}>
            <div>
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
              <h2 style={{ margin: '0 0 14px', fontSize: '2.2rem', color: 'white', fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}>
                Lost & Sound Tracks
              </h2>
              <p style={{ margin: '0 0 24px', fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.7' }}>
                We created a simple, free companion tool to help you track multi-currency expenses, plan future spending lists, and save visual travel memories. It works completely offline and synchronizes in the background. Play around in the live simulator!
              </p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link href="/tracker" style={{
                  backgroundColor: 'var(--color-golden)',
                  color: 'var(--color-purple)',
                  padding: '14px 28px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  borderRadius: '20px',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}>
                  🚀 Start Travelin'
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
            </div>

            {/* Live Mobile Simulator integration */}
            <div style={{ 
              backgroundColor: '#1E1518', 
              borderRadius: '24px', 
              padding: '20px 12px',
              border: '1.5px solid rgba(255, 255, 255, 0.1)',
              boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)'
            }}>
              <InteractiveDemo />
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}

'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import InteractiveDemo from '../../components/InteractiveDemo';
import { getAffiliateLink } from '../../lib/affiliateLinks';

export default function TravelTricksClient() {
  const [activeStep, setActiveStep] = useState('prepare'); // 'prepare' | 'pack' | 'go' | 'keepGoing' | 'demo'
  const [gearLockerOpen, setGearLockerOpen] = useState(false);
  const [fanosOpen, setFanosOpen] = useState(false);
  const [expandedAffirmation, setExpandedAffirmation] = useState(null);

  // Top 3 Must-Packs Teaser for Stage 02
  const top3MustPacks = [
    { name: 'Osprey 70L & 55L Packs', tag: 'Primary Luggage', desc: 'Our primary carry-on travel pack setup', image: '/assets/pack-closed-removebg-preview.png', link: getAffiliateLink('osprey_70l') },
    { name: 'Compression Packing Cubes', tag: 'Space Saver', desc: 'Saves 40% luggage volume instantly', icon: '📦', link: getAffiliateLink('packing_cubes') },
    { name: 'Universal Travel Adapter', tag: 'Tech Essential', desc: 'All-in-one global surge-protected plug', icon: '🔌', link: getAffiliateLink('universal_adapter') },
  ];

  // Full 21-Item Gear Locker
  const gearItems = [
    { name: 'Osprey 70L & 55L Packs', desc: 'Primary carry-on travel packs', link: getAffiliateLink('osprey_70l'), icon: '🎒', highlight: true },
    { name: 'Compression Packing Cubes', desc: 'Saves 40% luggage volume', link: getAffiliateLink('packing_cubes'), icon: '📦', highlight: true },
    { name: 'Universal Travel Adapter', desc: 'Global surge-protected plug', link: getAffiliateLink('universal_adapter'), icon: '🔌', highlight: true },
    { name: 'Salomon Trail Runners', desc: 'Hiking & city walk shoes', link: getAffiliateLink('salomon_runners'), icon: '👟', highlight: true },
    { name: 'Altra Wide-Toe Runners', desc: 'Ergonomic long-distance shoes', link: getAffiliateLink('ultra_runners'), icon: '🏃', highlight: true },
    { name: 'Osmo Pocket 3', desc: 'Stabilized vlogging camera', link: getAffiliateLink('osmo_pocket_3'), icon: '📹', highlight: true },

    { name: 'DJI Neo / Mini Drone', desc: 'Ultralight travel drone', link: getAffiliateLink('dji_drone'), icon: '🚁' },
    { name: 'JBL GO4 Speaker', desc: 'Compact waterproof speaker', link: getAffiliateLink('jbl_speaker'), icon: '🔊' },
    { name: 'Olympus Street Camera', desc: 'Discrete street photo camera', link: getAffiliateLink('olympus_camera'), icon: '📷' },
    { name: 'Kindle Paperwhite', desc: 'Glare-free digital library', link: getAffiliateLink('kindle'), icon: '📚' },
    { name: 'Kindle Protective Cover', desc: 'Durable protective case', link: getAffiliateLink('kindle_case'), icon: '📖' },
    { name: 'Side-by-Side Cable Pouch', desc: 'Untangled cord & tech organizer', link: getAffiliateLink('tech_organizer'), icon: '💼' },
    { name: 'Wired Headphones (3.5mm)', desc: 'Zero battery drain inflight set', link: getAffiliateLink('wired_headphones'), icon: '🎧' },
    { name: 'Apple AirTags (4-Pack)', desc: 'Global GPS luggage trackers', link: getAffiliateLink('airtags'), icon: '🏷️' },

    { name: 'Heavy-Duty Carabiners', desc: 'Clips shoes & wet gear outside', link: getAffiliateLink('carabiners'), icon: '🧗' },
    { name: 'Cozy Transit Sweater', desc: 'Blanket & pillow for cold AC', link: getAffiliateLink('sweater'), icon: '🧥' },
    { name: 'Lightweight Temple Sarong', desc: 'Modest cover for temple visits', link: getAffiliateLink('temple_sarong'), icon: '🧣' },

    { name: 'Travel Resistance Bands', desc: 'Zero-weight full body workout', link: getAffiliateLink('resistance_bands'), icon: '💪' },
    { name: 'Foldable Travel Yoga Mat', desc: 'Thin mat for stretch sessions', link: getAffiliateLink('yoga_mat'), icon: '🧘' },
    { name: 'Pharmacy & Liquid Bandages', desc: 'Meds & instant cut sealant', link: getAffiliateLink('liquid_bandage'), icon: '🩹' },
    { name: '3D Sleeping Contour Mask', desc: '100% light blackout mask', link: getAffiliateLink('sleeping_mask'), icon: '😴' },
  ];

  const journeySteps = [
    { id: 'prepare', step: '01', title: 'Prepare', subtitle: 'Work backwards and save' },
    { id: 'pack', step: '02', title: 'Pack', subtitle: 'Carry-on only matrix' },
    { id: 'go', step: '03', title: 'Travel', subtitle: 'Transit & daily rituals' },
    { id: 'keepGoing', step: '04', title: '"Keep Going"', subtitle: 'Prevent travel burnout' },
  ];

  return (
    <main style={{ backgroundColor: 'var(--color-golden)', minHeight: '100vh', padding: '90px 16px 100px' }}>
      <div className="container" style={{ maxWidth: '1140px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{ fontSize: '3.4rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: '0 0 14px', lineHeight: 1.05 }}>
            Travel Tricks
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-purple)', maxWidth: '740px', margin: '0 auto', lineHeight: 1.6, fontWeight: 500 }}>
            These are valuable lessons that we have learned the long way. From start to finish, long-term travel should be something that makes you feel energized, not drained. The little things go a long way.
          </p>
        </header>

        {/* SLIM STICKY TOP NAVIGATION BAR FOR MOBILE (TRANSPARENT, NO WHITE BOX CONTAINER) */}
        <div className="tricks-bar-mobile">
          {/* Horizontal Connector Line */}
          <div style={{
            position: 'absolute',
            top: '26px',
            left: '30px',
            right: '30px',
            height: '2px',
            backgroundColor: 'rgba(133, 58, 81, 0.25)',
            zIndex: 1
          }} />

          {journeySteps.map((s, index) => {
            const isActive = activeStep === s.id;
            return (
              <div
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                {/* Circle Badge with Blue Glow when Active */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#0088FF' : 'white',
                  color: isActive ? 'white' : 'var(--color-purple)',
                  border: isActive ? '2px solid #0088FF' : '2px solid #D1D5DB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 0 14px rgba(0, 136, 255, 0.8)' : '0 2px 5px rgba(0,0,0,0.06)',
                  transform: isActive ? 'scale(1.08)' : 'scale(1)',
                  marginBottom: '4px'
                }}>
                  {index + 1}
                </div>

                {/* Stage Title Label */}
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: isActive ? 'var(--color-purple)' : '#555',
                  whiteSpace: 'nowrap'
                }}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* 2-COLUMN LAYOUT WITH STICKY VERTICAL SIDEBAR FOR DESKTOP */}
        <div style={{
          display: 'flex',
          gap: '32px',
          alignItems: 'flex-start',
          position: 'relative',
          flexWrap: 'wrap'
        }}>
          {/* STICKY VERTICAL LEFT SIDEBAR NAVIGATION (DESKTOP - TRANSPARENT & FIXED SIZE) */}
          <div className="tricks-sidebar-desktop">
            {/* Slim Vertical Connector Line */}
            <div style={{
              position: 'absolute',
              top: '30px',
              bottom: '30px',
              left: '18px',
              width: '2px',
              backgroundColor: 'rgba(133, 58, 81, 0.2)',
              zIndex: 1
            }} />

            {journeySteps.map((s, index) => {
              const isActive = activeStep === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveStep(s.id)}
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    cursor: 'pointer',
                    height: '46px' /* FIXED HEIGHT TO PREVENT ANY RESIZING */
                  }}
                >
                  {/* Circle Badge with Blue Glow when Active */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? '#0088FF' : 'white',
                    color: isActive ? 'white' : 'var(--color-purple)',
                    border: isActive ? '2px solid #0088FF' : '2px solid #D1D5DB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1rem',
                    flexShrink: 0,
                    transition: 'all 0.25s ease',
                    boxShadow: isActive 
                      ? '0 0 16px rgba(0, 136, 255, 0.75), 0 0 4px #0088FF' 
                      : '0 2px 6px rgba(0,0,0,0.04)',
                    transform: isActive ? 'scale(1.08)' : 'scale(1)'
                  }}>
                    {index + 1}
                  </div>

                  {/* Stage Number & Title Stack (FIXED SIZE) */}
                  <div>
                    <div style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: isActive ? '#0088FF' : '#777',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}>
                      Stage {index + 1}
                    </div>
                    <div style={{
                      fontSize: '0.94rem',
                      fontWeight: 800,
                      color: isActive ? 'var(--color-purple)' : '#4B5563',
                      lineHeight: 1.15
                    }}>
                      {s.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ACTIVE STAGE CONTENT TOOLKIT CANVAS */}
          <div style={{
            flex: 1,
            minWidth: '280px',
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '28px 24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: '2px solid rgba(133, 58, 81, 0.12)'
          }}>

            {/* STAGE 1: PREPARE */}
            {activeStep === 'prepare' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <span style={{ fontSize: '1.8rem' }}>📝</span>
                  <div>
                    <span style={{ color: 'var(--color-orange)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.72rem' }}>Stage 01</span>
                    <h2 style={{ fontSize: '1.8rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: 0, lineHeight: 1.1 }}>
                      Pre-Trip Preparation Systems
                    </h2>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-orange)', fontWeight: 700, marginTop: '2px' }}>
                      Work backwards and save
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                  <div style={{ backgroundColor: '#FDFBF7', padding: '16px', borderRadius: '16px', border: '1px solid #F0EAD6' }}>
                    <strong style={{ color: 'var(--color-purple)', fontSize: '1rem', display: 'block', marginBottom: '4px' }}>🚀 Commit & Timeline:</strong>
                    <span style={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      Define departure dates and work backwards (saving goals, housing sublets, work notices, storing gear).
                    </span>
                  </div>

                  <div style={{ backgroundColor: '#FDFBF7', padding: '16px', borderRadius: '16px', border: '1px solid #F0EAD6' }}>
                    <strong style={{ color: 'var(--color-purple)', fontSize: '1rem', display: 'block', marginBottom: '4px' }}>📊 Use Our Budget Tool:</strong>
                    <span style={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      Log target daily budgets to compute exact runway needed. <Link href="/tracker" style={{ color: 'var(--color-orange)', fontWeight: 800 }}>Try free app →</Link>
                    </span>
                  </div>

                  <div style={{ backgroundColor: '#FDFBF7', padding: '16px', borderRadius: '16px', border: '1px solid #F0EAD6' }}>
                    <strong style={{ color: 'var(--color-purple)', fontSize: '1rem', display: 'block', marginBottom: '4px' }}>💳 Credit Cards & Points:</strong>
                    <span style={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      Route daily expenses through travel cards early to bank flight points. <a href={getAffiliateLink('chase_travel')} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-purple)', fontWeight: 800 }}>We use Chase Travel →</a>
                    </span>
                  </div>

                  <div style={{ backgroundColor: '#FDFBF7', padding: '16px', borderRadius: '16px', border: '1px solid #F0EAD6' }}>
                    <strong style={{ color: 'var(--color-purple)', fontSize: '1rem', display: 'block', marginBottom: '4px' }}>🗓️ Tuesday Planning Nights:</strong>
                    <span style={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      Reserve every Tuesday evening dedicated solely to visa rules, accommodation research, and safety checks.
                    </span>
                  </div>

                  <div style={{ backgroundColor: '#FDFBF7', padding: '16px', borderRadius: '16px', border: '1px solid #F0EAD6' }}>
                    <strong style={{ color: 'var(--color-purple)', fontSize: '1rem', display: 'block', marginBottom: '4px' }}>🩺 Insurance & Vaccines:</strong>
                    <span style={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      Secure global travel health insurance and complete yellow fever / regional vaccines ahead of time.
                    </span>
                  </div>
                </div>
              </div>
            )}

          {/* STAGE 2: PACK (Cleaned Up Main Flow with Top 3 Teaser) */}
          {activeStep === 'pack' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <span style={{ fontSize: '1.8rem' }}>🧳</span>
                <div>
                  <span style={{ color: 'var(--color-golden)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.72rem' }}>Stage 02</span>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: 0, lineHeight: 1.1 }}>
                    Lightweight Packing Rules
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-orange)', fontWeight: 700, marginTop: '2px' }}>
                    Carry-on only matrix
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ padding: '14px', backgroundColor: '#FAFAFA', borderRadius: '14px', borderLeft: '3px solid var(--color-orange)' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.92rem' }}>🎒 1 Pack + 1 Daypack:</strong> One main Osprey carry-on pack & front daypack each.
                </div>
                <div style={{ padding: '14px', backgroundColor: '#FAFAFA', borderRadius: '14px', borderLeft: '3px solid var(--color-golden)' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.92rem' }}>📦 Compression Cubes:</strong> Tightly roll clothes & compress to save 40% bag space.
                </div>
                <div style={{ padding: '14px', backgroundColor: '#FAFAFA', borderRadius: '14px', borderLeft: '3px solid var(--color-purple)' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.92rem' }}>👟 3-Pair Shoe Rule:</strong> 1 trekking/runner, 1 sandal/flip-flop, 1 everyday pair.
                </div>
                <div style={{ padding: '14px', backgroundColor: '#FAFAFA', borderRadius: '14px', borderLeft: '3px solid var(--color-orange)' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.92rem' }}>🧺 7-Day Laundry Cycle:</strong> Pack 7 days of clothes; do local laundry weekly.
                </div>
              </div>

              {/* TOP 3 MUST-PACKS TEASER BANNER SECTION */}
              <div style={{
                backgroundColor: '#FFFDF7',
                borderRadius: '20px',
                padding: '20px',
                border: '1.5px solid var(--color-golden)',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-orange)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      ⭐ Essential Gear Teaser
                    </span>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: 0 }}>
                      Top 3 Must-Pack Non-Negotiables
                    </h3>
                  </div>
                  <button
                    onClick={() => setGearLockerOpen(true)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: 'var(--color-orange)',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(235, 94, 40, 0.25)'
                    }}
                  >
                    Unzip Our Packs →
                  </button>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '12px'
                }}>
                  {top3MustPacks.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '14px',
                        border: '1px solid #F0EAD6',
                        textDecoration: 'none',
                        color: 'inherit'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          {item.image ? (
                            <Image src={item.image} alt={item.name} width={38} height={38} style={{ objectFit: 'contain' }} />
                          ) : (
                            <span style={{ fontSize: '1.6rem' }}>{item.icon}</span>
                          )}
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: 'rgba(235, 94, 40, 0.1)', color: 'var(--color-orange)', padding: '2px 6px', borderRadius: '8px' }}>
                            {item.tag}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--color-purple)', marginBottom: '4px' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#666', lineHeight: 1.3 }}>
                          {item.desc}
                        </div>
                      </div>
                      <div style={{ marginTop: '10px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-orange)' }}>
                        Buy Link ↗
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Harry's Soccer Ball Story Box */}
              <div style={{ backgroundColor: 'var(--color-cream)', padding: '16px 20px', borderRadius: '16px', border: '1.5px dashed var(--color-golden)', marginBottom: '14px' }}>
                <strong style={{ color: 'var(--color-purple)', fontSize: '0.98rem', display: 'block', marginBottom: '4px' }}>⚽ Carabiners & Harry's Soccer Ball:</strong>
                <span style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.5 }}>
                  Hook bulky items & wet towels outside your bag with carabiners. <em>Harry carried a soccer ball thousands of miles outside his pack — it’s the ultimate icebreaker with local kids!</em>
                </span>
              </div>
            </div>
          )}

          {/* STAGE 3: GO */}
          {activeStep === 'go' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <span style={{ fontSize: '1.8rem' }}>✈️</span>
                <div>
                  <span style={{ color: 'var(--color-purple)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.72rem' }}>Stage 03</span>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: 0, lineHeight: 1.1 }}>
                    On The Road Secrets
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-orange)', fontWeight: 700, marginTop: '2px' }}>
                    Transit & daily rituals
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '14px', backgroundColor: '#FAFAFA', borderRadius: '14px' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>✈️ Flights & Timing:</strong>
                  <span style={{ fontSize: '0.88rem', color: '#555' }}>Book flights Tuesdays or midnight–2am. Set Google Flight trackers & check wet seasons.</span>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#FAFAFA', borderRadius: '14px' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>🏨 Accommodation 2-Night Rule:</strong>
                  <span style={{ fontSize: '0.88rem', color: '#555' }}>Compare <a href={getAffiliateLink('booking')} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Booking.com</a>, <a href={getAffiliateLink('agoda')} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Agoda</a>, <a href={getAffiliateLink('hostelworld')} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Hostelworld</a>, & <a href={getAffiliateLink('airbnb')} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Airbnb</a>. Book 1–2 nights upfront, then extend in person!</span>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#FAFAFA', borderRadius: '14px' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>🚌 12Go Asia Transit:</strong>
                  <span style={{ fontSize: '0.88rem', color: '#555' }}>Use <a href={getAffiliateLink('twelve_go')} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-purple)', fontWeight: 800 }}>12Go Asia</a> for land & ferry bookings across SE Asia. Keep a sweater handy for AC transit.</span>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#FAFAFA', borderRadius: '14px' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>💳 Multi-Card ATM Strategy:</strong>
                  <span style={{ fontSize: '0.88rem', color: '#555' }}>Carry backup cards from <a href={getAffiliateLink('wise')} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Wise</a> and <a href={getAffiliateLink('revolut')} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Revolut</a> to avoid foreign ATM fee surcharges.</span>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#FAFAFA', borderRadius: '14px' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>📱 Passport & AirTag Backups:</strong>
                  <span style={{ fontSize: '0.88rem', color: '#555' }}>Drop AirTags in bags, take passport/visa photos, and scan <code>r/[country]</code> subreddits.</span>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#FAFAFA', borderRadius: '14px' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>🛵 Scooter Readiness:</strong>
                  <span style={{ fontSize: '0.88rem', color: '#555' }}>Take riding lessons before departing, get an International Driving Permit, & wear a helmet.</span>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 4: KEEP GOING (Burnout & Mindset) */}
          {activeStep === 'keepGoing' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <span style={{ fontSize: '1.8rem' }}>🧘</span>
                <div>
                  <span style={{ color: 'var(--color-orange)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.72rem' }}>Stage 04</span>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: 0, lineHeight: 1.1 }}>
                    Avoiding Burnout & Relationship Rituals
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-orange)', fontWeight: 700, marginTop: '2px' }}>
                    Prevent travel burnout
                  </div>
                </div>
              </div>

              {/* Expandable FANOS Card */}
              <div style={{
                backgroundColor: '#FAF5FF',
                borderRadius: '16px',
                padding: '16px',
                border: '1.5px solid #E9D5FF',
                marginBottom: '16px'
              }}>
                <div 
                  onClick={() => setFanosOpen(!fanosOpen)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                >
                  <strong style={{ fontSize: '1.05rem', color: 'var(--color-purple)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>💜</span> The Couples FANOS Ritual (Bi-Weekly Check-in)
                  </strong>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-purple)', fontWeight: 700 }}>
                    {fanosOpen ? 'Hide ▲' : 'Expand Details ▼'}
                  </span>
                </div>

                {fanosOpen && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(133, 58, 81, 0.1)' }}>
                    <p style={{ fontSize: '0.88rem', color: '#555', lineHeight: 1.5, margin: '0 0 10px' }}>
                      Traveling full-time as a couple means you are each other's entire support system 24/7. Every two weeks, we hold a <strong>FANOS session</strong>:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px', marginBottom: '8px' }}>
                      <div style={{ backgroundColor: 'white', padding: '8px 10px', borderRadius: '8px', fontSize: '0.82rem' }}><strong>F</strong> — Feeling</div>
                      <div style={{ backgroundColor: 'white', padding: '8px 10px', borderRadius: '8px', fontSize: '0.82rem' }}><strong>A</strong> — Affirmation</div>
                      <div style={{ backgroundColor: 'white', padding: '8px 10px', borderRadius: '8px', fontSize: '0.82rem' }}><strong>N</strong> — Need</div>
                      <div style={{ backgroundColor: 'white', padding: '8px 10px', borderRadius: '8px', fontSize: '0.82rem' }}><strong>O</strong> — Ownership</div>
                      <div style={{ backgroundColor: 'white', padding: '8px 10px', borderRadius: '8px', fontSize: '0.82rem' }}><strong>S</strong> — Struggle</div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-purple)', fontStyle: 'italic' }}>
                      ✨ End by stating one positive thing directly to each other!
                    </p>
                  </div>
                )}
              </div>

              {/* 3 Morning Affirmations */}
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ fontSize: '1rem', color: 'var(--color-purple)', display: 'block', marginBottom: '10px' }}>☀️ 3 Daily Morning Affirmations (Tap to Expand):</strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                  
                  <div 
                    onClick={() => setExpandedAffirmation(expandedAffirmation === 1 ? null : 1)}
                    style={{ backgroundColor: '#FFFDF5', padding: '12px 14px', borderRadius: '12px', border: '1px solid #FCD34D', cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-orange)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Affirmation 1 {expandedAffirmation === 1 ? '▲' : '▼'}
                    </div>
                    <p style={{ fontFamily: 'var(--font-hand)', fontSize: '1.2rem', color: 'var(--color-purple)', margin: 0, lineHeight: 1.3 }}>
                      “Today is going to be the best day of my life…”
                    </p>
                    {expandedAffirmation === 1 && (
                      <p style={{ fontSize: '0.85rem', color: '#555', marginTop: '8px', lineHeight: 1.4 }}>
                        Not because it’s going to be perfect, but because I am going to show up, be fully present, and willing to learn from whatever the day brings.
                      </p>
                    )}
                  </div>

                  <div 
                    onClick={() => setExpandedAffirmation(expandedAffirmation === 2 ? null : 2)}
                    style={{ backgroundColor: '#FFFDF5', padding: '12px 14px', borderRadius: '12px', border: '1px solid #FCD34D', cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-orange)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Affirmation 2 {expandedAffirmation === 2 ? '▲' : '▼'}
                    </div>
                    <p style={{ fontFamily: 'var(--font-hand)', fontSize: '1.2rem', color: 'var(--color-purple)', margin: 0, lineHeight: 1.3 }}>
                      “I control my mind, my mind does not control me…”
                    </p>
                    {expandedAffirmation === 2 && (
                      <p style={{ fontSize: '0.85rem', color: '#555', marginTop: '8px', lineHeight: 1.4 }}>
                        I cannot control what happens, but I can control how I respond, and I choose to respond with love and joy.
                      </p>
                    )}
                  </div>

                  <div 
                    onClick={() => setExpandedAffirmation(expandedAffirmation === 3 ? null : 3)}
                    style={{ backgroundColor: '#FFFDF5', padding: '12px 14px', borderRadius: '12px', border: '1px solid #FCD34D', cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-orange)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Affirmation 3 {expandedAffirmation === 3 ? '▲' : '▼'}
                    </div>
                    <p style={{ fontFamily: 'var(--font-hand)', fontSize: '1.2rem', color: 'var(--color-purple)', margin: 0, lineHeight: 1.3 }}>
                      “I am grateful for what I have right now…”
                    </p>
                    {expandedAffirmation === 3 && (
                      <p style={{ fontSize: '0.85rem', color: '#555', marginTop: '8px', lineHeight: 1.4 }}>
                        …and all of the opportunities and challenges that today may bring.
                      </p>
                    )}
                  </div>

                </div>
              </div>

              {/* Mindset Bullets */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.85rem', color: '#555' }}>
                <div style={{ padding: '10px 12px', backgroundColor: '#FAFAFA', borderRadius: '10px' }}><strong>😴 Rest:</strong> Don't feel guilty for sleeping in.</div>
                <div style={{ padding: '10px 12px', backgroundColor: '#FAFAFA', borderRadius: '10px' }}><strong>🏃 Active Body:</strong> Walk, run, do yoga daily.</div>
                <div style={{ padding: '10px 12px', backgroundColor: '#FAFAFA', borderRadius: '10px' }}><strong>🗣️ Local Talk:</strong> Learn "Hello", "Thank you", "Goodbye".</div>
                <div style={{ padding: '10px 12px', backgroundColor: '#FAFAFA', borderRadius: '10px' }}><strong>🌅 Sunrises:</strong> Watch sunrises & sunsets often.</div>
                <div style={{ padding: '10px 12px', backgroundColor: '#FAFAFA', borderRadius: '10px' }}><strong>😂 Expect Chaos:</strong> Laugh when you want to cry.</div>
                <div style={{ padding: '10px 12px', backgroundColor: '#FAFAFA', borderRadius: '10px' }}><strong>🙏 Gratitude:</strong> Travel is a privilege.</div>
              </div>
            </div>
          )}

          {/* STAGE DEMO: LIVE SIMULATOR */}
          {activeStep === 'demo' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <span style={{ textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-orange)', display: 'block', marginBottom: '4px' }}>
                  Interactive Simulator
                </span>
                <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)' }}>
                  Lost & Sound Tracks App Simulator
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#666' }}>
                  Select the steps on the left to see the phone update live!
                </p>
              </div>

              <div style={{ 
                backgroundColor: '#1E1518', 
                borderRadius: '24px', 
                padding: '20px 14px',
                border: '1.5px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)'
              }}>
                <InteractiveDemo />
              </div>
            </div>
          )}

        </div>

      </div>

      {/* SPEC 1: THE TRIGGER - FLOATING ACTION PILL BUTTON */}
      <button
        className="unzip-packs-float-btn"
        onClick={() => setGearLockerOpen(!gearLockerOpen)}
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'var(--color-orange)',
          color: 'white',
          border: 'none',
          padding: '10px 22px 10px 14px',
          borderRadius: '50px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05) translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 15px 35px rgba(235, 94, 40, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
        }}
      >
        <Image 
          src={gearLockerOpen ? "/assets/pack-open-removebg-preview.png" : "/assets/pack-closed-removebg-preview.png"} 
          alt={gearLockerOpen ? "Open Osprey Pack" : "Closed Osprey Pack"} 
          width={40} 
          height={40} 
          style={{ objectFit: 'contain' }}
        />
        <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
          {gearLockerOpen ? 'Close Gear Locker' : 'Unzip Our Packs'}
        </span>
      </button>

      {/* SPEC 2 & 3: THE MODAL - OFF-CANVAS RIGHT DRAWER */}
      {gearLockerOpen && (
        <div 
          onClick={() => setGearLockerOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(20, 10, 15, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9998,
            display: 'flex',
            justify: 'flex-end'
          }}
        >
          {/* Off-Canvas Drawer Container (40% desktop / 100% mobile) */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFDF7',
              width: '460px',
              maxWidth: '100vw',
              height: '100vh',
              boxShadow: '-10px 0 35px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              zIndex: 9999
            }}
          >
            {/* Drawer Header (NO Search Bar / Category Filter Chips) */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #EAE5D9',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAF7EE'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-orange)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Interactive Gear Blueprint
                </span>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-purple)', margin: '2px 0 0', fontFamily: 'var(--font-heading)' }}>
                  The Carry-On Only Blueprint
                </h3>
              </div>
              <button
                onClick={() => setGearLockerOpen(false)}
                aria-label="Close Drawer"
                style={{
                  backgroundColor: 'white',
                  color: 'var(--color-purple)',
                  border: '1px solid #E0D8C8',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                ✕
              </button>
            </div>

            {/* SPEC 3: INSIDE DRAWER LAYOUT (35% Left Sticky Open Pack / 65% Right 2-Column Grid) */}
            <div style={{
              display: 'flex',
              flex: 1,
              overflowY: 'auto',
              backgroundColor: '#FFFDF7'
            }}>
              
              {/* Left Column (35% width): Sticky Open Osprey Pack PNG */}
              <div style={{
                width: '35%',
                backgroundColor: '#FAF5EE',
                padding: '20px 12px',
                borderRight: '1px solid #EAE5D9',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'sticky',
                top: 0,
                height: 'fit-content'
              }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-orange)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Pack View
                </span>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-purple)', margin: '2px 0 14px', lineHeight: 1.2 }}>
                  Osprey Farpoint
                </div>

                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '240px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Image 
                    src="/assets/pack-open-removebg-preview.png" 
                    alt="Opened Osprey Pack Inside Drawer" 
                    width={140} 
                    height={220} 
                    style={{ objectFit: 'contain', maxHeight: '100%' }}
                  />
                </div>

                <a
                  href={getAffiliateLink('osprey_70l')}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-purple)',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    textDecoration: 'none',
                    marginTop: '16px'
                  }}
                >
                  Shop Osprey ↗
                </a>
              </div>

              {/* Right Column (65% width): Clean Minimalist 2-Column Grid (All 21 Items) */}
              <div style={{ width: '65%', padding: '16px 14px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '10px'
                }}>
                  {gearItems.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justify: 'space-between',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '10px 10px',
                        border: item.highlight ? '1px solid var(--color-golden)' : '1px solid #EAEAE5',
                        textDecoration: 'none',
                        color: 'inherit',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-orange)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = item.highlight ? 'var(--color-golden)' : '#EAEAE5';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                          <span style={{ color: 'var(--color-orange)', fontSize: '0.7rem', fontWeight: 800 }}>↗</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-purple)', lineHeight: 1.25, marginBottom: '2px' }}>
                          {item.name}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#777', marginTop: '4px', lineHeight: 1.25 }}>
                        {item.desc}
                      </div>
                    </a>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  </main>
  );
}

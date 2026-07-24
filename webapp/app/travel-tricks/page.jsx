'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import InteractiveDemo from '../../components/InteractiveDemo';
import { AFFILIATE_LINKS } from '../../lib/affiliateLinks';

export default function TravelTricks() {
  const [activeStep, setActiveStep] = useState('prepare'); // 'prepare' | 'pack' | 'go' | 'keepGoing' | 'demo'
  const [gearLockerOpen, setGearLockerOpen] = useState(false);
  const [gearCategory, setGearCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fanosOpen, setFanosOpen] = useState(false);
  const [expandedAffirmation, setExpandedAffirmation] = useState(null);

  // Top 5 Must-Pack Items Showcase
  const mustPackItems = [
    { name: 'Osprey 70L & 55L Packs', tag: 'Must-Have Luggage', desc: 'Our primary carry-on backpack setup', icon: '🎒', link: AFFILIATE_LINKS.osprey_70l },
    { name: 'Compression Packing Cubes', tag: 'Space Saver', desc: 'Saves 40% luggage volume instantly', icon: '📦', link: AFFILIATE_LINKS.packing_cubes },
    { name: 'Universal Travel Adapter', tag: 'Tech Essential', desc: 'All-in-one global surge protector', icon: '🔌', link: AFFILIATE_LINKS.universal_adapter },
    { name: 'Salomon & Altra Runners', tag: 'Footwear', desc: 'For mountain hikes & long city walks', icon: '👟', link: AFFILIATE_LINKS.salomon_runners },
    { name: 'Osmo Pocket 3 / DJI Drone', tag: 'Camera & Vlogging', desc: 'For stabilized travel footage & aerials', icon: '📹', link: AFFILIATE_LINKS.osmo_pocket_3 },
  ];

  // Full Gear Locker
  const gearItems = [
    { name: 'DJI Neo / Mini Drone', desc: 'Ultralight travel drone', category: 'Tech', link: AFFILIATE_LINKS.dji_drone, icon: '🚁' },
    { name: 'JBL GO4 Speaker', desc: 'Compact waterproof speaker', category: 'Tech', link: AFFILIATE_LINKS.jbl_speaker, icon: '🔊' },
    { name: 'Osmo Pocket 3', desc: 'Stabilized vlogging camera', category: 'Tech', link: AFFILIATE_LINKS.osmo_pocket_3, icon: '📹' },
    { name: 'Olympus Street Camera', desc: 'Discrete street photo camera', category: 'Tech', link: AFFILIATE_LINKS.olympus_camera, icon: '📷' },
    { name: 'Kindle Paperwhite', desc: 'Glare-free digital library', category: 'Tech', link: AFFILIATE_LINKS.kindle, icon: '📚' },
    { name: 'Kindle Protective Cover', desc: 'Durable protective case', category: 'Tech', link: AFFILIATE_LINKS.kindle_case, icon: '📖' },
    { name: 'Universal Travel Adapter', desc: 'Global surge-protected plug', category: 'Tech', link: AFFILIATE_LINKS.universal_adapter, icon: '🔌' },
    { name: 'Side-by-Side Cable Pouch', desc: 'Untangled cord & tech organizer', category: 'Tech', link: AFFILIATE_LINKS.tech_organizer, icon: '💼' },
    { name: 'Wired Headphones (3.5mm)', desc: 'Zero battery drain inflight set', category: 'Tech', link: AFFILIATE_LINKS.wired_headphones, icon: '🎧' },
    { name: 'Apple AirTags (4-Pack)', desc: 'Global GPS luggage trackers', category: 'Tech', link: AFFILIATE_LINKS.airtags, icon: '🏷️' },

    { name: 'Osprey 70L & 55L Packs', desc: 'Primary carry-on travel packs', category: 'Luggage', link: AFFILIATE_LINKS.osprey_70l, icon: '🎒' },
    { name: 'Compression Packing Cubes', desc: 'Saves 40% luggage volume', category: 'Luggage', link: AFFILIATE_LINKS.packing_cubes, icon: '📦' },
    { name: 'Heavy-Duty Carabiners', desc: 'Clips shoes & wet gear outside', category: 'Luggage', link: AFFILIATE_LINKS.carabiners, icon: '🧗' },

    { name: 'Salomon Trail Runners', desc: 'Hiking & city walk shoes', category: 'Footwear', link: AFFILIATE_LINKS.salomon_runners, icon: '👟' },
    { name: 'Altra Wide-Toe Runners', desc: 'Ergonomic long-distance shoes', category: 'Footwear', link: AFFILIATE_LINKS.ultra_runners, icon: '🏃' },
    { name: 'Cozy Transit Sweater', desc: 'Blanket & pillow for cold AC', category: 'Clothing', link: AFFILIATE_LINKS.sweater, icon: '🧥' },
    { name: 'Lightweight Temple Sarong', desc: 'Modest cover for temple visits', category: 'Clothing', link: AFFILIATE_LINKS.temple_sarong, icon: '🧣' },

    { name: 'Travel Resistance Bands', desc: 'Zero-weight full body workout', category: 'Fitness', link: AFFILIATE_LINKS.resistance_bands, icon: '💪' },
    { name: 'Foldable Travel Yoga Mat', desc: 'Thin mat for stretch sessions', category: 'Fitness', link: AFFILIATE_LINKS.yoga_mat, icon: '🧘' },
    { name: 'Pharmacy & Liquid Bandages', desc: 'Meds & instant cut sealant', category: 'Health', link: AFFILIATE_LINKS.liquid_bandage, icon: '🩹' },

    { name: 'Beach Blanket (Ticket to Moon)', desc: 'Parachute silk quick-dry blanket', category: 'Comfort', link: AFFILIATE_LINKS.beach_blanket, icon: '🏖️' },
    { name: 'Quick-Dry Microfiber Towels', desc: 'Compact palm-sized towels', category: 'Comfort', link: AFFILIATE_LINKS.microfiber_towel, icon: '🧼' },
    { name: '3D Sleeping Contour Mask', desc: '100% light blackout mask', category: 'Comfort', link: AFFILIATE_LINKS.sleeping_mask, icon: '😴' },
    { name: 'Rechargeable Headlamp', desc: 'Hands-free night & cave light', category: 'Comfort', link: AFFILIATE_LINKS.headlamp, icon: '🔦' },
  ];

  const gearCategories = ['all', 'Tech', 'Luggage', 'Footwear', 'Clothing', 'Fitness', 'Health', 'Comfort'];

  const filteredGear = gearItems.filter(item => {
    const matchesCat = gearCategory === 'all' || item.category === gearCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const journeySteps = [
    { id: 'prepare', step: '01', title: 'PREPARE', subtitle: 'Work Backwards & Save', icon: '📝' },
    { id: 'pack', step: '02', title: 'PACK', subtitle: 'Carry-On Only Matrix', icon: '🧳' },
    { id: 'go', step: '03', title: 'GO', subtitle: 'On The Road Hacks', icon: '✈️' },
    { id: 'keepGoing', step: '04', title: 'KEEP GOING', subtitle: 'Burnout & Mindset', icon: '🧘' },
  ];

  return (
    <main style={{ backgroundColor: '#F4F1EA', minHeight: '100vh', padding: '90px 16px 100px' }}>
      <div className="container" style={{ maxWidth: '1020px', margin: '0 auto' }}>
        
        {/* Organic Header */}
        <header style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{
            textTransform: 'uppercase',
            letterSpacing: '2.5px',
            fontSize: '0.8rem',
            fontWeight: 800,
            color: 'var(--color-orange)',
            display: 'block',
            marginBottom: '6px'
          }}>
            Interactive Travel Toolkit
          </span>
          <h1 style={{ fontSize: '3.3rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: '0 0 10px', lineHeight: 1.05 }}>
            Travel Tricks & Journey Blueprint
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#555', maxWidth: '650px', margin: '0 auto', lineHeight: 1.5 }}>
            Travel is a continuous journey. Use our interactive roadmap below to explore each phase — from pre-trip preparation to packing, flight hacks, and relationship rituals.
          </p>
        </header>

        {/* VISUAL JOURNEY ROADMAP PIPELINE */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '20px 16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
          marginBottom: '20px',
          border: '1.5px solid rgba(133, 58, 81, 0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-purple)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              🗺️ Continuous Travel Pipeline: Click any stage to explore
            </span>
            <button
              onClick={() => setActiveStep('demo')}
              style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: 'var(--color-orange)',
                backgroundColor: 'rgba(235, 94, 40, 0.1)',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              📱 Test Companion App Simulator →
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
            position: 'relative'
          }}>
            {journeySteps.map((s) => {
              const isActive = activeStep === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveStep(s.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'var(--color-purple)' : '#FAF9F6',
                    color: isActive ? 'white' : 'var(--color-purple)',
                    border: isActive ? '1.5px solid var(--color-purple)' : '1.5px solid #EBEBEB',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 6px 18px rgba(133, 58, 81, 0.2)' : 'none',
                    transform: isActive ? 'translateY(-2px)' : 'none'
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    backgroundColor: isActive ? 'var(--color-golden)' : 'white',
                    color: isActive ? 'var(--color-purple)' : 'var(--color-orange)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1rem',
                    flexShrink: 0
                  }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, opacity: isActive ? 0.8 : 0.6, letterSpacing: '0.5px' }}>
                      STAGE {s.step}
                    </div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 800, lineHeight: 1.1 }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: '0.74rem', opacity: isActive ? 0.9 : 0.7, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.subtitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FEATURED TOP 5 "MUST-PACK" SHOWCASE BANNER */}
        <div style={{
          backgroundColor: '#FFFDF7',
          borderRadius: '24px',
          padding: '20px 20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
          marginBottom: '24px',
          border: '1.5px solid var(--color-golden)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-orange)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                ⭐ Top 5 Must-Pack Essentials
              </span>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: 0 }}>
                Our Non-Negotiable Travel Gear
              </h3>
            </div>
            <button
              onClick={() => setGearLockerOpen(!gearLockerOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1.5px solid var(--color-purple)',
                backgroundColor: gearLockerOpen ? 'var(--color-purple)' : 'white',
                color: gearLockerOpen ? 'white' : 'var(--color-purple)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🎒 {gearLockerOpen ? 'Close Gear Locker' : 'Open Full 21-Item Gear Locker'}</span>
              <span style={{ fontSize: '0.75rem' }}>{gearLockerOpen ? '▲' : '▼'}</span>
            </button>
          </div>

          {/* Top 5 Horizontal Showcase Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '10px'
          }}>
            {mustPackItems.map((item, idx) => (
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
                  borderRadius: '16px',
                  padding: '12px 14px',
                  border: '1px solid #F0EAD6',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-orange)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#F0EAD6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: 'rgba(235, 94, 40, 0.1)', color: 'var(--color-orange)', padding: '2px 6px', borderRadius: '8px' }}>
                      {item.tag}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-purple)', lineHeight: 1.2, marginBottom: '4px' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#666', lineHeight: 1.3 }}>
                    {item.desc}
                  </div>
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-orange)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Buy Link</span> ↗
                </div>
              </a>
            ))}
          </div>

          {/* EXPANDABLE FULL GEAR LOCKER DRAWER */}
          {gearLockerOpen && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1.5px dashed var(--color-golden)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--color-purple)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  📦 Complete 21-Item Gear Locker
                </h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Search gear..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      border: '1.5px solid #E0E0E0',
                      fontSize: '0.82rem',
                      outline: 'none',
                      maxWidth: '150px'
                    }}
                  />
                </div>
              </div>

              {/* Category Filter Chips */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {gearCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setGearCategory(cat)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: gearCategory === cat ? 'var(--color-purple)' : '#F0F0F0',
                      color: gearCategory === cat ? 'white' : '#555',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    {cat === 'all' ? 'All Items' : cat}
                  </button>
                ))}
              </div>

              {/* High-density Gear Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '8px'
              }}>
                {filteredGear.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '8px 10px',
                      border: '1px solid #EAEAEA',
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                  >
                    <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{item.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-purple)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#777', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.desc}
                      </div>
                    </div>
                    <span style={{ color: 'var(--color-orange)', fontSize: '0.75rem', fontWeight: 800 }}>↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ACTIVE STAGE CONTENT TOOLKIT CANVAS */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '24px 20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
          border: '1.5px solid rgba(133, 58, 81, 0.08)'
        }}>

          {/* STAGE 1: PREPARE */}
          {activeStep === 'prepare' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.8rem' }}>📝</span>
                <div>
                  <span style={{ color: 'var(--color-orange)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.72rem' }}>Stage 01</span>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: 0 }}>
                    Pre-Trip Preparation Systems
                  </h2>
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
                    Route daily expenses through travel cards early to bank flight points. <a href={AFFILIATE_LINKS.chase_travel} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-purple)', fontWeight: 800 }}>We use Chase Travel →</a>
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

          {/* STAGE 2: PACK */}
          {activeStep === 'pack' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.8rem' }}>🧳</span>
                <div>
                  <span style={{ color: 'var(--color-golden)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.72rem' }}>Stage 02</span>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: 0 }}>
                    Lightweight Packing Rules
                  </h2>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '14px' }}>
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

              {/* Harry's Soccer Ball Story Box */}
              <div style={{ backgroundColor: 'var(--color-cream)', padding: '16px 20px', borderRadius: '16px', border: '1.5px dashed var(--color-golden)', marginBottom: '14px' }}>
                <strong style={{ color: 'var(--color-purple)', fontSize: '0.98rem', display: 'block', marginBottom: '4px' }}>⚽ Carabiners & Harry's Soccer Ball:</strong>
                <span style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.5 }}>
                  Hook bulky items & wet towels outside your bag with carabiners. <em>Harry carried a soccer ball thousands of miles outside his pack — it’s the ultimate icebreaker with local kids!</em>
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '14px', backgroundColor: '#FAF5FF', borderRadius: '14px' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.92rem' }}>🩹 Travel Pharmacy:</strong> Sudafed, Advil, Saline, and liquid skin sealant.
                </div>
                <div style={{ padding: '14px', backgroundColor: '#EFF6FF', borderRadius: '14px' }}>
                  <strong style={{ color: '#1E40AF', fontSize: '0.92rem' }}>💧 Asia Water Bottles:</strong> Reuse disposable bottles until inconvenient, then replace.
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: GO */}
          {activeStep === 'go' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.8rem' }}>✈️</span>
                <div>
                  <span style={{ color: 'var(--color-purple)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.72rem' }}>Stage 03</span>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: 0 }}>
                    On The Road Secrets
                  </h2>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '14px', backgroundColor: '#FAFAFA', borderRadius: '14px' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>✈️ Flights & Timing:</strong>
                  <span style={{ fontSize: '0.88rem', color: '#555' }}>Book flights Tuesdays or midnight–2am. Set Google Flight trackers & check wet seasons.</span>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#FAFAFA', borderRadius: '14px' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>🏨 Accommodation 2-Night Rule:</strong>
                  <span style={{ fontSize: '0.88rem', color: '#555' }}>Compare <a href={AFFILIATE_LINKS.booking} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Booking.com</a>, <a href={AFFILIATE_LINKS.agoda} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Agoda</a>, <a href={AFFILIATE_LINKS.hostelworld} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Hostelworld</a>, & <a href={AFFILIATE_LINKS.airbnb} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Airbnb</a>. Book 1–2 nights upfront, then extend in person!</span>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#FAFAFA', borderRadius: '14px' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>🚌 12Go Asia Transit:</strong>
                  <span style={{ fontSize: '0.88rem', color: '#555' }}>Use <a href={AFFILIATE_LINKS.twelve_go} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-purple)', fontWeight: 800 }}>12Go Asia</a> for land & ferry bookings across SE Asia. Keep a sweater handy for AC transit.</span>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#FAFAFA', borderRadius: '14px' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>💳 Multi-Card ATM Strategy:</strong>
                  <span style={{ fontSize: '0.88rem', color: '#555' }}>Carry backup cards from <a href={AFFILIATE_LINKS.wise} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Wise</a> and <a href={AFFILIATE_LINKS.revolut} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Revolut</a> to avoid foreign ATM fee surcharges.</span>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.8rem' }}>🧘</span>
                <div>
                  <span style={{ color: 'var(--color-orange)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.72rem' }}>Stage 04</span>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: 0 }}>
                    Avoiding Burnout & Relationship Rituals
                  </h2>
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

              {/* 3 Morning Affirmations with Snippet Highlight & Expansion */}
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
    </main>
  );
}

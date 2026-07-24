'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import InteractiveDemo from '../../components/InteractiveDemo';
import { AFFILIATE_LINKS } from '../../lib/affiliateLinks';

export default function TravelTricks() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Section collapse states (default open for Gear & Prep, collapsible for others)
  const [openSections, setOpenSections] = useState({
    gear: true,
    prep: false,
    packing: false,
    onTheRoad: false,
    burnout: false,
    fanos: false
  });

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = (expand) => {
    setOpenSections({
      gear: expand,
      prep: expand,
      packing: expand,
      onTheRoad: expand,
      burnout: expand,
      fanos: expand
    });
  };

  const gearItems = [
    { name: 'DJI Neo / Mini Drone', desc: 'Ultralight aerial travel drone', category: 'Tech & Electronics', link: AFFILIATE_LINKS.dji_drone, icon: '🚁' },
    { name: 'JBL GO4 Speaker', desc: 'Compact waterproof speaker', category: 'Tech & Electronics', link: AFFILIATE_LINKS.jbl_speaker, icon: '🔊' },
    { name: 'Osmo Pocket 3', desc: 'Stabilized vlogging camera', category: 'Tech & Electronics', link: AFFILIATE_LINKS.osmo_pocket_3, icon: '📹' },
    { name: 'Olympus Street Camera', desc: 'Discrete street photography camera', category: 'Tech & Electronics', link: AFFILIATE_LINKS.olympus_camera, icon: '📷' },
    { name: 'Kindle Paperwhite', desc: 'Entire glare-free digital library', category: 'Tech & Electronics', link: AFFILIATE_LINKS.kindle, icon: '📚' },
    { name: 'Kindle Case', desc: 'Durable protective cover', category: 'Tech & Electronics', link: AFFILIATE_LINKS.kindle_case, icon: '📖' },
    { name: 'Universal Travel Adapter', desc: 'Global surge-protected plug', category: 'Tech & Electronics', link: AFFILIATE_LINKS.universal_adapter, icon: '🔌' },
    { name: 'Side-by-Side Cable Pouch', desc: 'Untangled cord & charger organizer', category: 'Tech & Electronics', link: AFFILIATE_LINKS.tech_organizer, icon: '💼' },
    { name: 'Wired Headphones (3.5mm)', desc: 'Zero battery drain for inflight screens', category: 'Tech & Electronics', link: AFFILIATE_LINKS.wired_headphones, icon: '🎧' },
    { name: 'Apple AirTags (4-Pack)', desc: 'Global GPS bag trackers', category: 'Tech & Electronics', link: AFFILIATE_LINKS.airtags, icon: '🏷️' },

    { name: 'Osprey 70L & 55L Packs', desc: 'Primary carry-on travel packs', category: 'Luggage & Packing', link: AFFILIATE_LINKS.osprey_70l, icon: '🎒' },
    { name: 'Compression Packing Cubes', desc: 'Saves 40% luggage volume', category: 'Luggage & Packing', link: AFFILIATE_LINKS.packing_cubes, icon: '📦' },
    { name: 'Heavy-Duty Carabiners', desc: 'Clips shoes & wet gear outside', category: 'Luggage & Packing', link: AFFILIATE_LINKS.carabiners, icon: '🧗' },

    { name: 'Salomon Trail Runners', desc: 'Hiking & city walk shoes', category: 'Footwear & Apparel', link: AFFILIATE_LINKS.salomon_runners, icon: '👟' },
    { name: 'Altra / Ultra Runners', desc: 'Wide toe-box ergonomic runners', category: 'Footwear & Apparel', link: AFFILIATE_LINKS.ultra_runners, icon: '🏃' },
    { name: 'Cozy Transit Sweater', desc: 'Blanket & pillow for cold AC transit', category: 'Footwear & Apparel', link: AFFILIATE_LINKS.sweater, icon: '🧥' },
    { name: 'Temple Sarong', desc: 'Modest cover-up for temple visits', category: 'Footwear & Apparel', link: AFFILIATE_LINKS.temple_sarong, icon: '🧣' },

    { name: 'Resistance Bands', desc: 'Zero-weight full body workout set', category: 'Fitness & Health', link: AFFILIATE_LINKS.resistance_bands, icon: '💪' },
    { name: 'Foldable Travel Yoga Mat', desc: 'Thin mat for stretch sessions', category: 'Fitness & Health', link: AFFILIATE_LINKS.yoga_mat, icon: '🧘' },
    { name: 'Travel Pharmacy & Liquid Bandages', desc: 'Medication & instant skin seal', category: 'Fitness & Health', link: AFFILIATE_LINKS.liquid_bandage, icon: '🩹' },

    { name: 'Beach Blanket (Ticket to Moon)', desc: 'Parachute silk quick-dry blanket', category: 'Daily Comfort', link: AFFILIATE_LINKS.beach_blanket, icon: '🏖️' },
    { name: 'Quick-Dry Microfiber Towels', desc: 'Compact palm-sized towels', category: 'Daily Comfort', link: AFFILIATE_LINKS.microfiber_towel, icon: '🧼' },
    { name: '3D Sleeping Contour Mask', desc: '100% light blackout mask', category: 'Daily Comfort', link: AFFILIATE_LINKS.sleeping_mask, icon: '😴' },
    { name: 'Rechargeable Headlamp', desc: 'Hands-free night & cave light', category: 'Daily Comfort', link: AFFILIATE_LINKS.headlamp, icon: '🔦' },
  ];

  const categories = ['all', 'Tech & Electronics', 'Luggage & Packing', 'Footwear & Apparel', 'Fitness & Health', 'Daily Comfort'];

  const filteredGear = gearItems.filter(item => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <main style={{ backgroundColor: '#F9F6ED', minHeight: '100vh', padding: '100px 20px 120px' }}>
      <div className="container" style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        {/* Header Hero */}
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{
            textTransform: 'uppercase',
            letterSpacing: '2.5px',
            fontSize: '0.85rem',
            fontWeight: 800,
            color: 'var(--color-orange)',
            display: 'block',
            marginBottom: '10px'
          }}>
            Field-Tested Travel Blueprint
          </span>
          <h1 style={{ fontSize: '3.4rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: '0 0 14px', lineHeight: 1.1 }}>
            Travel Tricks & Tested Wisdom
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#555', maxWidth: '700px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Everything we’ve learned from years of full-time travel — from our packing stack to route planning & burnout prevention.
          </p>

          {/* Clean Filter Tabs (No Numbers, No Emojis) */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
            <a href="#gear" className="btn" style={{ padding: '8px 18px', backgroundColor: 'white', border: '1.5px solid var(--color-purple)', color: 'var(--color-purple)', borderRadius: '25px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
              Gear
            </a>
            <a href="#prep" className="btn" style={{ padding: '8px 18px', backgroundColor: 'white', border: '1.5px solid var(--color-purple)', color: 'var(--color-purple)', borderRadius: '25px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
              Preparation
            </a>
            <a href="#packing" className="btn" style={{ padding: '8px 18px', backgroundColor: 'white', border: '1.5px solid var(--color-purple)', color: 'var(--color-purple)', borderRadius: '25px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
              Packing
            </a>
            <a href="#on-the-road" className="btn" style={{ padding: '8px 18px', backgroundColor: 'white', border: '1.5px solid var(--color-purple)', color: 'var(--color-purple)', borderRadius: '25px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
              On The Road
            </a>
            <a href="#burnout" className="btn" style={{ padding: '8px 18px', backgroundColor: 'white', border: '1.5px solid var(--color-purple)', color: 'var(--color-purple)', borderRadius: '25px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
              Avoiding Burnout
            </a>
          </div>

          {/* Expand All / Collapse All controls */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '0.82rem' }}>
            <button onClick={() => toggleAll(true)} style={{ background: 'none', border: 'none', color: 'var(--color-orange)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
              Expand All Sections
            </button>
            <span style={{ opacity: 0.4 }}>•</span>
            <button onClick={() => toggleAll(false)} style={{ background: 'none', border: 'none', color: '#666', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
              Collapse All Sections
            </button>
          </div>
        </header>

        {/* SECTION: OUR GEAR (Compact Grid) */}
        <section id="gear" style={{ marginBottom: '28px', scrollMarginTop: '100px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '28px 24px', boxShadow: '0 8px 24px rgba(0,0,0,0.04)', border: '1.5px solid rgba(133, 58, 81, 0.08)' }}>
            <div 
              onClick={() => toggleSection('gear')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
            >
              <div>
                <span style={{ color: 'var(--color-golden)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>Tested Stack</span>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎒</span> Our Travel Gear List
                  <span style={{ fontSize: '0.85rem', backgroundColor: '#F3F4F6', color: '#555', padding: '2px 10px', borderRadius: '12px', fontWeight: 700 }}>21 items</span>
                </h2>
              </div>
              <span style={{ fontSize: '1.4rem', color: 'var(--color-purple)', fontWeight: 800, transition: 'transform 0.2s ease', transform: openSections.gear ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </div>

            {openSections.gear && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #F0F0F0' }}>
                
                {/* Search & Filter Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          border: 'none',
                          backgroundColor: activeCategory === cat ? 'var(--color-purple)' : '#F3F4F6',
                          color: activeCategory === cat ? 'white' : '#4B5563',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        {cat === 'all' ? 'All' : cat}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Search gear..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: '1.5px solid #E5E7EB',
                      fontSize: '0.85rem',
                      outline: 'none',
                      maxWidth: '180px'
                    }}
                  />
                </div>

                {/* Compact Space-Efficient Gear Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                  gap: '12px'
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
                        gap: '10px',
                        backgroundColor: '#FAFAF9',
                        borderRadius: '14px',
                        padding: '10px 14px',
                        border: '1px solid #EBEBEB',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFDF5';
                        e.currentTarget.style.borderColor = 'var(--color-golden)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FAFAF9';
                        e.currentTarget.style.borderColor = '#EBEBEB';
                      }}
                    >
                      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{item.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-purple)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#777', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.desc}
                        </div>
                      </div>
                      <span style={{ color: 'var(--color-orange)', fontSize: '0.8rem', fontWeight: 800 }}>↗</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 1: PREPARATION (Collapsible) */}
        <section id="prep" style={{ marginBottom: '28px', scrollMarginTop: '100px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '28px 24px', border: '1.5px solid rgba(133, 58, 81, 0.08)' }}>
            <div 
              onClick={() => toggleSection('prep')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
            >
              <div>
                <span style={{ color: 'var(--color-orange)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>Step 1</span>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📝</span> Preparation & Pre-Trip Systems
                </h2>
              </div>
              <span style={{ fontSize: '1.4rem', color: 'var(--color-purple)', fontWeight: 800, transition: 'transform 0.2s ease', transform: openSections.prep ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </div>

            {openSections.prep && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #F0F0F0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ backgroundColor: '#FDFBF7', padding: '16px 20px', borderRadius: '16px', border: '1px solid #F0EAD6' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '1.02rem', display: 'block', marginBottom: '4px' }}>🚀 Commit & Set Your Timeline:</strong>
                  <span style={{ color: 'var(--color-text)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                    Define your exact departure date and work backwards. Answering questions around savings goals, work notices, housing sublets, and storing belongings gives you clarity and structure to save steadily.
                  </span>
                </div>

                <div style={{ backgroundColor: '#FDFBF7', padding: '16px 20px', borderRadius: '16px', border: '1px solid #F0EAD6' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '1.02rem', display: 'block', marginBottom: '4px' }}>📊 Use Our Budget Tool:</strong>
                  <span style={{ color: 'var(--color-text)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                    Start logging your savings and daily living costs early to know your exact required runway. <Link href="/tracker" style={{ color: 'var(--color-orange)', fontWeight: 800 }}>Try our free companion app →</Link>
                  </span>
                </div>

                <div style={{ backgroundColor: '#FDFBF7', padding: '16px 20px', borderRadius: '16px', border: '1px solid #F0EAD6' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '1.02rem', display: 'block', marginBottom: '4px' }}>💳 Travel Points & Credit Cards:</strong>
                  <span style={{ color: 'var(--color-text)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                    Research travel credit cards early and route daily expenses through them to bank points. <a href={AFFILIATE_LINKS.chase_travel} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-purple)', fontWeight: 800 }}>We use Chase Travel Points →</a>
                  </span>
                </div>

                <div style={{ backgroundColor: '#FDFBF7', padding: '16px 20px', borderRadius: '16px', border: '1px solid #F0EAD6' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '1.02rem', display: 'block', marginBottom: '4px' }}>🗓️ Tuesday Planning Nights:</strong>
                  <span style={{ color: 'var(--color-text)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                    Set aside one evening every week (we held ours every Tuesday!) dedicated solely to researching visas, routes, accommodation, and safety requirements.
                  </span>
                </div>

                <div style={{ backgroundColor: '#FDFBF7', padding: '16px 20px', borderRadius: '16px', border: '1px solid #F0EAD6' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '1.02rem', display: 'block', marginBottom: '4px' }}>🩺 Health Insurance & Vaccines:</strong>
                  <span style={{ color: 'var(--color-text)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                    Secure comprehensive international health insurance before departure and check vaccine requirements for target destinations.
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2: PACKING (Collapsible) */}
        <section id="packing" style={{ marginBottom: '28px', scrollMarginTop: '100px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '28px 24px', border: '1.5px solid rgba(133, 58, 81, 0.08)' }}>
            <div 
              onClick={() => toggleSection('packing')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
            >
              <div>
                <span style={{ color: 'var(--color-golden)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>Step 2</span>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🧳</span> Packing Rules & Bag Setup
                </h2>
              </div>
              <span style={{ fontSize: '1.4rem', color: 'var(--color-purple)', fontWeight: 800, transition: 'transform 0.2s ease', transform: openSections.packing ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </div>

            {openSections.packing && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #F0F0F0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  <div style={{ padding: '14px 16px', backgroundColor: '#FAFAFA', borderRadius: '14px', borderLeft: '3px solid var(--color-orange)' }}>
                    <strong style={{ color: 'var(--color-purple)', fontSize: '0.95rem' }}>🎒 1 Pack + 1 Daypack:</strong> Each person carries one main Osprey carry-on pack & front daypack.
                  </div>
                  <div style={{ padding: '14px 16px', backgroundColor: '#FAFAFA', borderRadius: '14px', borderLeft: '3px solid var(--color-golden)' }}>
                    <strong style={{ color: 'var(--color-purple)', fontSize: '0.95rem' }}>📦 Roll & Compress:</strong> Use compression cubes & tightly roll clothes to save up to 40% bag volume.
                  </div>
                  <div style={{ padding: '14px 16px', backgroundColor: '#FAFAFA', borderRadius: '14px', borderLeft: '3px solid var(--color-purple)' }}>
                    <strong style={{ color: 'var(--color-purple)', fontSize: '0.95rem' }}>👟 3-Pair Shoe Rule:</strong> 1 trekking/runner pair, 1 flip-flop/water sandal, and 1 comfortable walking pair.
                  </div>
                  <div style={{ padding: '14px 16px', backgroundColor: '#FAFAFA', borderRadius: '14px', borderLeft: '3px solid var(--color-orange)' }}>
                    <strong style={{ color: 'var(--color-purple)', fontSize: '0.95rem' }}>🧺 7-Day Clothes Limit:</strong> Pack enough clothes for 7 days, then drop off laundry weekly on the road.
                  </div>
                </div>

                {/* Harry's Soccer Ball Callout */}
                <div style={{ backgroundColor: 'var(--color-cream)', padding: '18px 20px', borderRadius: '16px', border: '1.5px dashed var(--color-golden)' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '1rem', display: 'block', marginBottom: '4px' }}>⚽ Carabiner Hack & Harry's Soccer Ball:</strong>
                  <span style={{ fontSize: '0.92rem', color: '#555', lineHeight: 1.5 }}>
                    Hook bulky or wet items outside your pack with carabiners. <em>Harry has carried a soccer ball for thousands of miles on the outside of his bag — it's the single best icebreaker with local kids!</em>
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  <div style={{ padding: '14px 16px', backgroundColor: '#FAF5FF', borderRadius: '14px' }}>
                    <strong style={{ color: 'var(--color-purple)', fontSize: '0.95rem' }}>🩹 Travel Pharmacy:</strong> Keep Sudafed, Advil, Saline, and liquid bandages ready.
                  </div>
                  <div style={{ padding: '14px 16px', backgroundColor: '#EFF6FF', borderRadius: '14px' }}>
                    <strong style={{ color: '#1E40AF', fontSize: '0.95rem' }}>💧 Asia Water Bottles:</strong> Reuse disposable water bottles until inconvenient, then replace.
                  </div>
                </div>

              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: ON THE ROAD TIPS (Collapsible) */}
        <section id="on-the-road" style={{ marginBottom: '28px', scrollMarginTop: '100px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '28px 24px', border: '1.5px solid rgba(133, 58, 81, 0.08)' }}>
            <div 
              onClick={() => toggleSection('onTheRoad')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
            >
              <div>
                <span style={{ color: 'var(--color-purple)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>Step 3</span>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🌏</span> On The Road Secrets & Booking Rules
                </h2>
              </div>
              <span style={{ fontSize: '1.4rem', color: 'var(--color-purple)', fontWeight: 800, transition: 'transform 0.2s ease', transform: openSections.onTheRoad ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </div>

            {openSections.onTheRoad && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #F0F0F0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                
                <div style={{ padding: '16px', backgroundColor: '#FAFAFA', borderRadius: '14px' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.98rem', display: 'block', marginBottom: '4px' }}>✈️ Flights & Timing:</strong>
                  <span style={{ fontSize: '0.9rem', color: '#555' }}>Book flights Tuesdays or late night (midnight–2am). Set Google Flight trackers & research monsoon seasons.</span>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#FAFAFA', borderRadius: '14px' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.98rem', display: 'block', marginBottom: '4px' }}>🏨 Accommodation 2-Night Rule:</strong>
                  <span style={{ fontSize: '0.9rem', color: '#555' }}>Check <a href={AFFILIATE_LINKS.booking} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Booking.com</a>, <a href={AFFILIATE_LINKS.agoda} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Agoda</a>, <a href={AFFILIATE_LINKS.hostelworld} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Hostelworld</a>, & <a href={AFFILIATE_LINKS.airbnb} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Airbnb</a>. Book 1–2 nights, then extend in person!</span>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#FAFAFA', borderRadius: '14px' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.98rem', display: 'block', marginBottom: '4px' }}>🚌 12Go Asia Transit:</strong>
                  <span style={{ fontSize: '0.9rem', color: '#555' }}>Use <a href={AFFILIATE_LINKS.twelve_go} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-purple)', fontWeight: 800 }}>12Go Asia</a> for land & ferry bookings across SE Asia. Keep a sweater handy for AC transit.</span>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#FAFAFA', borderRadius: '14px' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.98rem', display: 'block', marginBottom: '4px' }}>💳 Multi-Card ATM Strategy:</strong>
                  <span style={{ fontSize: '0.9rem', color: '#555' }}>Carry backup cards from <a href={AFFILIATE_LINKS.wise} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Wise</a> and <a href={AFFILIATE_LINKS.revolut} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Revolut</a> to minimize foreign ATM fee surcharges.</span>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#FAFAFA', borderRadius: '14px' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.98rem', display: 'block', marginBottom: '4px' }}>📱 Passport & AirTag Backups:</strong>
                  <span style={{ fontSize: '0.9rem', color: '#555' }}>Drop AirTags in your bags, take passport/visa photos, and scan <code>r/[country]</code> subreddits for insider info.</span>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#FAFAFA', borderRadius: '14px' }}>
                  <strong style={{ color: 'var(--color-purple)', fontSize: '0.98rem', display: 'block', marginBottom: '4px' }}>🛵 Scooter Readiness:</strong>
                  <span style={{ fontSize: '0.9rem', color: '#555' }}>Take riding lessons before departing, get an International Driving Permit, and always wear a helmet.</span>
                </div>

              </div>
            )}
          </div>
        </section>

        {/* SECTION 4: AVOIDING BURNOUT (Collapsible with Expandable FANOS) */}
        <section id="burnout" style={{ marginBottom: '28px', scrollMarginTop: '100px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '28px 24px', border: '1.5px solid rgba(133, 58, 81, 0.08)' }}>
            <div 
              onClick={() => toggleSection('burnout')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
            >
              <div>
                <span style={{ color: 'var(--color-orange)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>Step 4</span>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🧘</span> Avoiding Burnout & Relationship Harmony
                </h2>
              </div>
              <span style={{ fontSize: '1.4rem', color: 'var(--color-purple)', fontWeight: 800, transition: 'transform 0.2s ease', transform: openSections.burnout ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </div>

            {openSections.burnout && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #F0F0F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Expandable FANOS Relationship Card */}
                <div style={{
                  backgroundColor: '#FAF5FF',
                  borderRadius: '18px',
                  padding: '20px',
                  border: '1.5px solid #E9D5FF'
                }}>
                  <div 
                    onClick={() => toggleSection('fanos')}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                  >
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--color-purple)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>💜</span> The Couples FANOS Ritual (Optional Relationship Tool)
                    </h3>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-purple)', fontWeight: 700 }}>
                      {openSections.fanos ? 'Hide Details ▲' : 'Show Details ▼'}
                    </span>
                  </div>

                  {openSections.fanos && (
                    <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(133, 58, 81, 0.1)' }}>
                      <p style={{ fontSize: '0.92rem', color: '#555', lineHeight: 1.6, margin: '0 0 12px' }}>
                        Traveling full-time as a couple means you are each other's entire support system 24/7. Every two weeks, we hold a <strong>FANOS check-in</strong>:
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                        <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '10px', fontSize: '0.85rem' }}><strong>F</strong> — Feeling</div>
                        <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '10px', fontSize: '0.85rem' }}><strong>A</strong> — Affirmation</div>
                        <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '10px', fontSize: '0.85rem' }}><strong>N</strong> — Need</div>
                        <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '10px', fontSize: '0.85rem' }}><strong>O</strong> — Ownership</div>
                        <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '10px', fontSize: '0.85rem' }}><strong>S</strong> — Struggle</div>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-purple)', fontStyle: 'italic' }}>
                        ✨ Always end your FANOS session by stating one positive thing directly to each other!
                      </p>
                    </div>
                  )}
                </div>

                {/* 3 Morning Affirmations */}
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--color-purple)', margin: '0 0 12px' }}>☀️ Our 3 Daily Morning Affirmations:</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
                    <div style={{ backgroundColor: '#FFFDF5', padding: '14px', borderRadius: '14px', border: '1px solid #FCD34D', fontFamily: 'var(--font-hand)', fontSize: '1.15rem', color: 'var(--color-purple)' }}>
                      "Today is going to be the best day of my life. Not because it’s perfect, but because I am going to show up fully present..."
                    </div>
                    <div style={{ backgroundColor: '#FFFDF5', padding: '14px', borderRadius: '14px', border: '1px solid #FCD34D', fontFamily: 'var(--font-hand)', fontSize: '1.15rem', color: 'var(--color-purple)' }}>
                      "I control my mind, my mind does not control me. I choose to respond with love and joy..."
                    </div>
                    <div style={{ backgroundColor: '#FFFDF5', padding: '14px', borderRadius: '14px', border: '1px solid #FCD34D', fontFamily: 'var(--font-hand)', fontSize: '1.15rem', color: 'var(--color-purple)' }}>
                      "I am grateful for what I have right now, and all of the opportunities & challenges today brings..."
                    </div>
                  </div>
                </div>

                {/* Burnout Prevention Bullets */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '0.88rem', color: '#555' }}>
                  <div style={{ padding: '12px', backgroundColor: '#FAFAFA', borderRadius: '12px' }}>
                    <strong>😴 Rest & Sleep In:</strong> Don't feel guilty for resting. Long-term travel is a marathon, not a sprint.
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#FAFAFA', borderRadius: '12px' }}>
                    <strong>🏃 Stay Active:</strong> Run, walk, use resistance bands. Keep your body & mind healthy on the road.
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#FAFAFA', borderRadius: '12px' }}>
                    <strong>🗣️ Local Greetings:</strong> *"Hello"*, *"Thank you"*, and *"Goodbye"* in the local language go a long way.
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#FAFAFA', borderRadius: '12px' }}>
                    <strong>🌅 Sunrises & Sunsets:</strong> Watch sunrises & sunsets as often as possible to stay grounded.
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#FAFAFA', borderRadius: '12px' }}>
                    <strong>😂 Expect Chaos:</strong> Expect things to go wrong. Laugh when you want to cry!
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#FAFAFA', borderRadius: '12px' }}>
                    <strong>🙏 Gratitude:</strong> Remember travel is a privilege. Stay humble, smile, and remain grateful.
                  </div>
                </div>

              </div>
            )}
          </div>
        </section>

        {/* SECTION: LIVE APP COMPANION SIMULATOR SIDE-BY-SIDE */}
        <section style={{
          backgroundColor: 'var(--color-purple)',
          background: 'linear-gradient(135deg, var(--color-purple) 0%, #4c1f2e 100%)',
          color: 'white',
          padding: '40px 24px',
          borderRadius: '28px',
          boxShadow: '0 15px 35px rgba(133, 58, 81, 0.15)',
          marginTop: '40px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: 'var(--color-golden)',
              display: 'block',
              marginBottom: '6px'
            }}>
              Free Companion Tool
            </span>
            <h2 style={{ margin: '0 0 10px', fontSize: '2.2rem', color: 'white', fontFamily: 'var(--font-heading)' }}>
              Lost & Sound Tracks Simulator
            </h2>
            <p style={{ margin: '0 auto', fontSize: '1rem', color: 'rgba(255, 255, 255, 0.85)', maxWidth: '600px', lineHeight: '1.5' }}>
              Select the guide steps on the left to see the phone update in real time!
            </p>
          </div>

          {/* Full-width container so InteractiveDemo's internal 2-column layout renders side-by-side cleanly */}
          <div style={{ 
            backgroundColor: '#1E1518', 
            borderRadius: '24px', 
            padding: '24px 16px',
            border: '1.5px solid rgba(255, 255, 255, 0.1)',
            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)'
          }}>
            <InteractiveDemo />
          </div>
        </section>

      </div>
    </main>
  );
}

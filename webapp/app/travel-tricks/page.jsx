'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import InteractiveDemo from '../../components/InteractiveDemo';
import { AFFILIATE_LINKS } from '../../lib/affiliateLinks';

export default function TravelTricks() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const gearItems = [
    { name: 'DJI Neo / Mini Drone', desc: 'Ultralight drone for epic aerial travel footage', category: 'Tech & Electronics', link: AFFILIATE_LINKS.dji_drone, icon: '🚁' },
    { name: 'JBL GO4 Speaker', desc: 'Compact, waterproof speaker for beach & room vibes', category: 'Tech & Electronics', link: AFFILIATE_LINKS.jbl_speaker, icon: '🔊' },
    { name: 'Osmo Pocket 3', desc: 'Ultimate stabilized vlogging & travel video camera', category: 'Tech & Electronics', link: AFFILIATE_LINKS.osmo_pocket_3, icon: '📹' },
    { name: 'Olympus Street Camera', desc: 'Compact vintage-style camera for discrete street photos', category: 'Tech & Electronics', link: AFFILIATE_LINKS.olympus_camera, icon: '📷' },
    { name: 'Kindle Paperwhite', desc: 'Entire library in one glare-free, battery-saving device', category: 'Tech & Electronics', link: AFFILIATE_LINKS.kindle, icon: '📚' },
    { name: 'Kindle Protective Case', desc: 'Durable cover to shield your Kindle on bumpy journeys', category: 'Tech & Electronics', link: AFFILIATE_LINKS.kindle_case, icon: '📖' },
    { name: 'Universal Travel Adapter', desc: 'All-in-one surge-protected global plug adapter', category: 'Tech & Electronics', link: AFFILIATE_LINKS.universal_adapter, icon: '🔌' },
    { name: 'Side-by-Side Tech Organizer', desc: 'Keeps all cords, chargers, and SD cards untangled', category: 'Tech & Electronics', link: AFFILIATE_LINKS.tech_organizer, icon: '💼' },
    { name: 'Wired Headphones (3.5mm)', desc: 'No battery drain & connects to airplane media screens', category: 'Tech & Electronics', link: AFFILIATE_LINKS.wired_headphones, icon: '🎧' },
    { name: 'Apple AirTags (4-Pack)', desc: 'Track your Osprey packs and daybags globally', category: 'Tech & Electronics', link: AFFILIATE_LINKS.airtags, icon: '🏷️' },

    { name: 'Osprey 70L & 55L Packs', desc: 'Our primary long-term travel carry-on backpacks', category: 'Luggage & Packing', link: AFFILIATE_LINKS.osprey_70l, icon: '🎒' },
    { name: 'Volume Compression Cubes', desc: 'Zippered compression cubes saving 40% bag volume', category: 'Luggage & Packing', link: AFFILIATE_LINKS.packing_cubes, icon: '📦' },
    { name: 'Heavy-Duty Carabiners', desc: 'Clip shoes, wet gear, or Harry’s soccer ball outside', category: 'Luggage & Packing', link: AFFILIATE_LINKS.carabiners, icon: '🧗' },

    { name: 'Salomon Trail Runners', desc: 'Durable footwear for mountain hikes and long city walks', category: 'Footwear & Apparel', link: AFFILIATE_LINKS.salomon_runners, icon: '👟' },
    { name: 'Altra / Ultra Runners', desc: 'Ergonomic wide-toe box running shoes for ultimate comfort', category: 'Footwear & Apparel', link: AFFILIATE_LINKS.ultra_runners, icon: '🏃' },
    { name: 'Cozy Transit Sweater', desc: 'Doubles as a blanket or pillow on freezing AC buses & planes', category: 'Footwear & Apparel', link: AFFILIATE_LINKS.sweater, icon: '🧥' },
    { name: 'Lightweight Temple Sarong', desc: 'Essential modest cover-up for visiting Asian temples', category: 'Footwear & Apparel', link: AFFILIATE_LINKS.temple_sarong, icon: '🧣' },

    { name: 'Resistance Bands', desc: 'Full body workout setup taking up zero luggage weight', category: 'Fitness & Health', link: AFFILIATE_LINKS.resistance_bands, icon: '💪' },
    { name: 'Foldable Travel Yoga Mat', desc: 'Thin mat for stretch sessions in hotel rooms & parks', category: 'Fitness & Health', link: AFFILIATE_LINKS.yoga_mat, icon: '🧘' },
    { name: 'Travel Pharmacy & Liquid Bandages', desc: 'Sudafed, Advil, Saline, and instant liquid skin sealing', category: 'Fitness & Health', link: AFFILIATE_LINKS.liquid_bandage, icon: '🩹' },

    { name: 'Ticket to the Moon Beach Blanket', desc: 'Ultra-light, quick-dry parachute silk blanket', category: 'Daily Comfort', link: AFFILIATE_LINKS.beach_blanket, icon: '🏖️' },
    { name: 'Quick-Dry Microfiber Towels', desc: 'Super absorbent and packs down into palm size', category: 'Daily Comfort', link: AFFILIATE_LINKS.microfiber_towel, icon: '🧼' },
    { name: '3D Sleeping Contour Mask', desc: 'Blocks 100% light for sleeping on hostal buses & flights', category: 'Daily Comfort', link: AFFILIATE_LINKS.sleeping_mask, icon: '😴' },
    { name: 'Hands-Free Rechargeable Headlamp', desc: 'Essential for night walks, power cuts, and sunrise hikes', category: 'Daily Comfort', link: AFFILIATE_LINKS.headlamp, icon: '🔦' },
  ];

  const categories = ['all', 'Tech & Electronics', 'Luggage & Packing', 'Footwear & Apparel', 'Fitness & Health', 'Daily Comfort'];

  const filteredGear = gearItems.filter(item => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <main style={{ backgroundColor: '#F9F6ED', minHeight: '100vh', padding: '100px 20px 120px' }}>
      <div className="container" style={{ maxWidth: '1080px', margin: '0 auto' }}>
        
        {/* Header Hero */}
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span style={{
            textTransform: 'uppercase',
            letterSpacing: '2.5px',
            fontSize: '0.85rem',
            fontWeight: 800,
            color: 'var(--color-orange)',
            display: 'block',
            marginBottom: '12px'
          }}>
            Field-Tested Travel Blueprint
          </span>
          <h1 style={{ fontSize: '3.6rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: '0 0 18px', lineHeight: 1.1 }}>
            Travel Tricks & Tested Wisdom
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#555', maxWidth: '750px', margin: '0 auto 30px', lineHeight: 1.7 }}>
            Everything we’ve learned from years of full-time travel — from our exact gear packing stack to relationship rituals and burnout prevention.
          </p>

          {/* Quick Jump Anchors */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
            <a href="#gear" className="btn" style={{ padding: '10px 18px', backgroundColor: 'white', border: '1.5px solid var(--color-purple)', color: 'var(--color-purple)', borderRadius: '30px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
              🎒 Our Gear
            </a>
            <a href="#prep" className="btn" style={{ padding: '10px 18px', backgroundColor: 'white', border: '1.5px solid var(--color-purple)', color: 'var(--color-purple)', borderRadius: '30px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
              📝 1. Preparation
            </a>
            <a href="#packing" className="btn" style={{ padding: '10px 18px', backgroundColor: 'white', border: '1.5px solid var(--color-purple)', color: 'var(--color-purple)', borderRadius: '30px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
              🧳 2. Packing
            </a>
            <a href="#on-the-road" className="btn" style={{ padding: '10px 18px', backgroundColor: 'white', border: '1.5px solid var(--color-purple)', color: 'var(--color-purple)', borderRadius: '30px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
              🌏 3. On The Road
            </a>
            <a href="#burnout" className="btn" style={{ padding: '10px 18px', backgroundColor: 'white', border: '1.5px solid var(--color-purple)', color: 'var(--color-purple)', borderRadius: '30px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
              🧘 4. Avoiding Burnout
            </a>
          </div>
        </header>

        {/* SECTION: OUR GEAR */}
        <section id="gear" style={{ marginBottom: '80px', scrollMarginTop: '100px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '32px', padding: '40px 30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1.5px solid rgba(133, 58, 81, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <div>
                <span style={{ color: 'var(--color-golden)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Tested & Approved</span>
                <h2 style={{ fontSize: '2.4rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', margin: 0 }}>
                  🎒 Our Complete Travel Gear Stack
                </h2>
              </div>

              {/* Search Box */}
              <input
                type="text"
                placeholder="🔍 Search gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '25px',
                  border: '1.5px solid #E5E7EB',
                  fontSize: '0.95rem',
                  outline: 'none',
                  minWidth: '220px'
                }}
              />
            </div>

            <p style={{ color: '#666', lineHeight: 1.6, marginBottom: '24px' }}>
              We carry every single item below in our Osprey packs. Clicking any item will take you directly to our verified affiliate link to grab yours!
            </p>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '30px' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    backgroundColor: activeCategory === cat ? 'var(--color-purple)' : '#F3F4F6',
                    color: activeCategory === cat ? 'white' : '#4B5563',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat === 'all' ? 'All Gear' : cat}
                </button>
              ))}
            </div>

            {/* Gear Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {filteredGear.map((item, idx) => (
                <a
                  key={idx}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    backgroundColor: '#FAFAF9',
                    borderRadius: '20px',
                    padding: '20px',
                    border: '1px solid #EAEAEA',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <span style={{ fontSize: '2rem' }}>{item.icon}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(232, 180, 100, 0.2)', color: 'var(--color-purple)', padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
                        {item.category.split(' ')[0]}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--color-purple)', margin: '0 0 6px', fontWeight: 700 }}>
                      {item.name}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.5, margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-orange)', fontWeight: 800, fontSize: '0.85rem' }}>
                    <span>Check Product Link</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 1: PREPARATION */}
        <section id="prep" style={{ marginBottom: '60px', scrollMarginTop: '100px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '32px', padding: '40px 30px', border: '1.5px solid rgba(133, 58, 81, 0.08)' }}>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>📝</span> 1. Preparation & Pre-Trip Systems
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              <div style={{ backgroundColor: '#FDFBF7', padding: '24px', borderRadius: '20px', border: '1px solid #F0EAD6' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-purple)', margin: '0 0 10px' }}>🚀 Commit & Set Your Timeline</h3>
                <p style={{ margin: 0, lineHeight: 1.6, color: '#555', fontSize: '0.98rem' }}>
                  Define your exact departure date and work backwards. Answering questions around savings goals, work notices, housing sublets, and storing belongings gives you clarity and structure to save steadily.
                </p>
              </div>

              <div style={{ backgroundColor: '#FDFBF7', padding: '24px', borderRadius: '20px', border: '1px solid #F0EAD6' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-purple)', margin: '0 0 10px' }}>📊 Use Our Budget Tool</h3>
                <p style={{ margin: '0 0 12px', lineHeight: 1.6, color: '#555', fontSize: '0.98rem' }}>
                  Start logging your savings and daily living costs early. Log target budgets for destinations to know your exact required runway.
                </p>
                <Link href="/tracker" style={{ color: 'var(--color-orange)', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none' }}>
                  Try Free Companion Tracker →
                </Link>
              </div>

              <div style={{ backgroundColor: '#FDFBF7', padding: '24px', borderRadius: '20px', border: '1px solid #F0EAD6' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-purple)', margin: '0 0 10px' }}>💳 Travel Credit Cards & Points</h3>
                <p style={{ margin: '0 0 12px', lineHeight: 1.6, color: '#555', fontSize: '0.98rem' }}>
                  Research travel credit cards early and start routing daily expenses through them to bank points for long-haul flights.
                </p>
                <a href={AFFILIATE_LINKS.chase_travel} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-purple)', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'underline' }}>
                  We use Chase Travel Points →
                </a>
              </div>

              <div style={{ backgroundColor: '#FDFBF7', padding: '24px', borderRadius: '20px', border: '1px solid #F0EAD6' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-purple)', margin: '0 0 10px' }}>🗓️ Tuesday Planning Nights</h3>
                <p style={{ margin: 0, lineHeight: 1.6, color: '#555', fontSize: '0.98rem' }}>
                  Set aside one evening every single week (we held our planning night every Tuesday!) dedicated solely to researching visas, routes, accommodation options, and safety requirements.
                </p>
              </div>

              <div style={{ backgroundColor: '#FDFBF7', padding: '24px', borderRadius: '20px', border: '1px solid #F0EAD6' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-purple)', margin: '0 0 10px' }}>🩺 Health Insurance & Vaccines</h3>
                <p style={{ margin: 0, lineHeight: 1.6, color: '#555', fontSize: '0.98rem' }}>
                  Secure comprehensive international travel health insurance before departure and check yellow fever or local vaccine requirements for your target destinations.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 2: PACKING */}
        <section id="packing" style={{ marginBottom: '60px', scrollMarginTop: '100px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '32px', padding: '40px 30px', border: '1.5px solid rgba(133, 58, 81, 0.08)' }}>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>🧳</span> 2. Packing Rules & Bag Setup
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                
                <div style={{ borderLeft: '4px solid var(--color-orange)', paddingLeft: '16px' }}>
                  <h4 style={{ margin: '0 0 6px', color: 'var(--color-purple)', fontSize: '1.1rem' }}>🎒 The 1 Backpack + 1 Daypack Rule</h4>
                  <p style={{ margin: 0, color: '#555', lineHeight: 1.5, fontSize: '0.95rem' }}>
                    Each person carries one main backpack (we use Osprey carry-on size packs) and one front daypack. It eliminates checked luggage waits and keeps you agile.
                  </p>
                </div>

                <div style={{ borderLeft: '4px solid var(--color-golden)', paddingLeft: '16px' }}>
                  <h4 style={{ margin: '0 0 6px', color: 'var(--color-purple)', fontSize: '1.1rem' }}>📦 Compression Packing Cubes</h4>
                  <p style={{ margin: 0, color: '#555', lineHeight: 1.5, fontSize: '0.95rem' }}>
                    Use volume-adjusting compression zipper cubes. Tightly roll your clothes to eliminate air pockets, prevent heavy creasing, and maximize every inch.
                  </p>
                </div>

                <div style={{ borderLeft: '4px solid var(--color-purple)', paddingLeft: '16px' }}>
                  <h4 style={{ margin: '0 0 6px', color: 'var(--color-purple)', fontSize: '1.1rem' }}>👟 The 3-Pair Shoe Matrix</h4>
                  <p style={{ margin: 0, color: '#555', lineHeight: 1.5, fontSize: '0.95rem' }}>
                    On average, we carry only 3 pairs of shoes: 1 pair for trekking/jogging (Salomon/Altra), 1 pair of flip-flops/water sandals, and 1 comfortable everyday walking pair.
                  </p>
                </div>

                <div style={{ borderLeft: '4px solid var(--color-orange)', paddingLeft: '16px' }}>
                  <h4 style={{ margin: '0 0 6px', color: 'var(--color-purple)', fontSize: '1.1rem' }}>🧺 The 7-Day Laundry Cycle</h4>
                  <p style={{ margin: 0, color: '#555', lineHeight: 1.5, fontSize: '0.95rem' }}>
                    We carry enough clothes for exactly 7 days. Once a week, drop off laundry at a local laundromat — carrying more clothes is completely unnecessary weight.
                  </p>
                </div>

              </div>

              {/* Fun Highlight Story Box */}
              <div style={{
                backgroundColor: 'var(--color-cream)',
                borderRadius: '24px',
                padding: '24px 28px',
                border: '2px dashed var(--color-golden)',
                margin: '10px 0'
              }}>
                <h4 style={{ margin: '0 0 8px', color: 'var(--color-purple)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ⚽ The Carabiner Hack & Harry's Soccer Ball
                </h4>
                <p style={{ margin: 0, lineHeight: 1.6, color: '#4B5563', fontSize: '1rem' }}>
                  Utilize heavy-duty carabiners to hook bulky items, wet towels, or dirty shoes directly onto the outside of your pack. <strong>Fun fact:</strong> Harry has carried a soccer ball for thousands of miles on the outside of his bag! It’s the single best icebreaker with local kids in almost every country on earth.
                </p>
              </div>

              {/* Travel Pharmacy & Water Bottles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ backgroundColor: '#FAF5FF', padding: '20px', borderRadius: '16px', border: '1px solid #E9D5FF' }}>
                  <h4 style={{ margin: '0 0 6px', color: 'var(--color-purple)', fontSize: '1.05rem' }}>🩹 Compact Travel Pharmacy</h4>
                  <p style={{ margin: 0, color: '#555', lineHeight: 1.5, fontSize: '0.92rem' }}>
                    Always keep Sudafed, Advil, Saline spray, and <strong>Liquid Bandages</strong> in your daypack. Liquid bandages seal cuts instantly in tropical environments.
                  </p>
                </div>

                <div style={{ backgroundColor: '#EFF6FF', padding: '20px', borderRadius: '16px', border: '1px solid #BFDBFE' }}>
                  <h4 style={{ margin: '0 0 6px', color: '#1E40AF', fontSize: '1.05rem' }}>💧 The Water Bottle Reality</h4>
                  <p style={{ margin: 0, color: '#1E3A8A', lineHeight: 1.5, fontSize: '0.92rem' }}>
                    We skipped bulky refillable bottles. In Asia, most clean water comes in bottled form anyway. We reuse disposable bottles a few times until inconvenient, then recycle and replace them on the road.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 3: ON THE ROAD TIPS */}
        <section id="on-the-road" style={{ marginBottom: '60px', scrollMarginTop: '100px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '32px', padding: '40px 30px', border: '1.5px solid rgba(133, 58, 81, 0.08)' }}>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>🌏</span> 3. On The Road Secrets & Booking Rules
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              <div style={{ backgroundColor: '#FAFAFA', padding: '22px', borderRadius: '20px', border: '1px solid #EEEEEE' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--color-purple)', margin: '0 0 8px' }}>✈️ Booking Flights & Timing</h3>
                <p style={{ margin: 0, color: '#555', lineHeight: 1.5, fontSize: '0.95rem' }}>
                  Set price alerts on Google Flights months in advance. Book flights on Tuesdays or late at night (midnight–2 AM). Research local monsoon & wet seasons before booking!
                </p>
              </div>

              <div style={{ backgroundColor: '#FAFAFA', padding: '22px', borderRadius: '20px', border: '1px solid #EEEEEE' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--color-purple)', margin: '0 0 8px' }}>🏨 Accommodation Stack & The 2-Night Rule</h3>
                <p style={{ margin: '0 0 10px', color: '#555', lineHeight: 1.5, fontSize: '0.95rem' }}>
                  Cross-check <a href={AFFILIATE_LINKS.booking} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Booking.com</a>, <a href={AFFILIATE_LINKS.agoda} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Agoda</a>, <a href={AFFILIATE_LINKS.hostelworld} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Hostelworld</a>, & <a href={AFFILIATE_LINKS.airbnb} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Airbnb</a>. In Asia, book only 1–2 nights upfront, then extend in-person for better prices!
                </p>
              </div>

              <div style={{ backgroundColor: '#FAFAFA', padding: '22px', borderRadius: '20px', border: '1px solid #EEEEEE' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--color-purple)', margin: '0 0 8px' }}>🚌 Regional Transit (12Go Asia)</h3>
                <p style={{ margin: 0, color: '#555', lineHeight: 1.5, fontSize: '0.95rem' }}>
                  For land and sea connections across Southeast Asia, use <a href={AFFILIATE_LINKS.twelve_go} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-purple)', fontWeight: 800, textDecoration: 'underline' }}>12Go Asia</a> to compare buses, ferries, and trains. Always keep a sweater handy for blasting AC transit!
                </p>
              </div>

              <div style={{ backgroundColor: '#FAFAFA', padding: '22px', borderRadius: '20px', border: '1px solid #EEEEEE' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--color-purple)', margin: '0 0 8px' }}>💳 Multi-Card ATM Strategy</h3>
                <p style={{ margin: 0, color: '#555', lineHeight: 1.5, fontSize: '0.95rem' }}>
                  Never travel with just one card. Carry multiple options including <a href={AFFILIATE_LINKS.wise} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Wise</a> and <a href={AFFILIATE_LINKS.revolut} target="_blank" rel="noopener noreferrer sponsored" style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Revolut</a> debit cards to avoid hefty foreign ATM fee surcharges.
                </p>
              </div>

              <div style={{ backgroundColor: '#FAFAFA', padding: '22px', borderRadius: '20px', border: '1px solid #EEEEEE' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--color-purple)', margin: '0 0 8px' }}>📱 Safety & Passport Backups</h3>
                <p style={{ margin: 0, color: '#555', lineHeight: 1.5, fontSize: '0.95rem' }}>
                  Drop Apple AirTags in your bags. Take photos of your passports & visas, and share real-time locations with trusted emergency contacts. Scan <code>r/[country]</code> subreddits for real-time local updates.
                </p>
              </div>

              <div style={{ backgroundColor: '#FAFAFA', padding: '22px', borderRadius: '20px', border: '1px solid #EEEEEE' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--color-purple)', margin: '0 0 8px' }}>🛵 Scooter & Moped Readiness</h3>
                <p style={{ margin: 0, color: '#555', lineHeight: 1.5, fontSize: '0.95rem' }}>
                  If visiting Southeast Asia, prepare early for riding mopeds! Take a lesson before leaving home, obtain an International Driving Permit, and always wear a helmet.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 4: AVOIDING BURNOUT */}
        <section id="burnout" style={{ marginBottom: '60px', scrollMarginTop: '100px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '32px', padding: '40px 30px', border: '1.5px solid rgba(133, 58, 81, 0.08)' }}>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>🧘</span> 4. Avoiding Burnout & Relationship Harmony
            </h2>

            {/* Special FANOS Box */}
            <div style={{
              background: 'linear-gradient(135deg, var(--color-purple) 0%, #4c1f2e 100%)',
              color: 'white',
              borderRadius: '28px',
              padding: '36px 30px',
              marginBottom: '32px',
              boxShadow: '0 10px 30px rgba(133, 58, 81, 0.2)'
            }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-golden)', display: 'block', marginBottom: '8px' }}>
                Our #1 Relationship Ritual
              </span>
              <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', margin: '0 0 14px', color: 'white' }}>
                The Bi-Weekly FANOS Check-In
              </h3>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, opacity: 0.9, marginBottom: '20px' }}>
                Traveling full-time as a couple means you are each other's entire support system 24/7. To ease that pressure, we hold a <strong>FANOS session every two weeks</strong>:
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '14px', borderRadius: '16px' }}>
                  <strong style={{ color: 'var(--color-golden)', display: 'block' }}>F — Feeling</strong>
                  <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Share your current emotional state.</span>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '14px', borderRadius: '16px' }}>
                  <strong style={{ color: 'var(--color-golden)', display: 'block' }}>A — Affirmation</strong>
                  <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Express genuine praise for your partner.</span>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '14px', borderRadius: '16px' }}>
                  <strong style={{ color: 'var(--color-golden)', display: 'block' }}>N — Need</strong>
                  <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>State what you need right now.</span>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '14px', borderRadius: '16px' }}>
                  <strong style={{ color: 'var(--color-golden)', display: 'block' }}>O — Ownership</strong>
                  <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Own up to any recent mistakes or friction.</span>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '14px', borderRadius: '16px' }}>
                  <strong style={{ color: 'var(--color-golden)', display: 'block' }}>S — Struggle</strong>
                  <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Share any internal struggle you're facing.</span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.98rem', opacity: 0.9, fontStyle: 'italic' }}>
                ✨ Always end your FANOS session by stating one positive, heart-felt thing directly to each other.
              </p>
            </div>

            {/* Daily Affirmations Cards */}
            <h3 style={{ fontSize: '1.6rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>
              ☀️ Our 3 Daily Morning Affirmations
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              
              <div style={{ backgroundColor: '#FFFDF5', padding: '24px', borderRadius: '20px', border: '1.5px solid #FCD34D' }}>
                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '8px' }}>1️⃣</span>
                <p style={{ fontFamily: 'var(--font-hand)', fontSize: '1.4rem', color: 'var(--color-purple)', lineHeight: 1.4, margin: 0 }}>
                  “Today is going to be the best day of my life. Not because it’s going to be perfect, but because I am going to show up, be fully present, and willing to learn from whatever the day brings.”
                </p>
              </div>

              <div style={{ backgroundColor: '#FFFDF5', padding: '24px', borderRadius: '20px', border: '1.5px solid #FCD34D' }}>
                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '8px' }}>2️⃣</span>
                <p style={{ fontFamily: 'var(--font-hand)', fontSize: '1.4rem', color: 'var(--color-purple)', lineHeight: 1.4, margin: 0 }}>
                  “I control my mind, my mind does not control me. I cannot control what happens, but I can control how I respond, and I choose to respond with love and joy.”
                </p>
              </div>

              <div style={{ backgroundColor: '#FFFDF5', padding: '24px', borderRadius: '20px', border: '1.5px solid #FCD34D' }}>
                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '8px' }}>3️⃣</span>
                <p style={{ fontFamily: 'var(--font-hand)', fontSize: '1.4rem', color: 'var(--color-purple)', lineHeight: 1.4, margin: 0 }}>
                  “I am grateful for what I have right now, and all of the opportunities and challenges that today may bring.”
                </p>
              </div>

            </div>

            {/* General Burnout Prevention Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: '#FAFAFA', borderRadius: '16px' }}>
                <strong>😴 Sleep In & Rest:</strong> Don't feel guilty for resting in your room. Burnout happens when you treat long-term travel like a sprint.
              </div>
              <div style={{ padding: '16px', backgroundColor: '#FAFAFA', borderRadius: '16px' }}>
                <strong>🏃 Keep Up Body & Mind:</strong> Walk, run, do yoga with resistance bands. Don't use travel as an excuse to neglect your health.
              </div>
              <div style={{ padding: '16px', backgroundColor: '#FAFAFA', borderRadius: '16px' }}>
                <strong>🗣️ Learn Local Greetings:</strong> *"Hello"*, *"Thank you"*, and *"Goodbye"* in the local language open doors and hearts everywhere.
              </div>
              <div style={{ padding: '16px', backgroundColor: '#FAFAFA', borderRadius: '16px' }}>
                <strong>🌅 Sunrise & Sunsets:</strong> Catch sunrises & sunsets as often as possible. It grounds you in the present moment.
              </div>
              <div style={{ padding: '16px', backgroundColor: '#FAFAFA', borderRadius: '16px' }}>
                <strong>😂 Laugh When You Want to Cry:</strong> Things will go wrong. Expect it, embrace the chaos, and laugh through it together.
              </div>
              <div style={{ padding: '16px', backgroundColor: '#FAFAFA', borderRadius: '16px' }}>
                <strong>🙏 Gratitude & Privilege:</strong> Remember long-term travel is a privilege. Stay humble, smile at people, and stay grateful.
              </div>
            </div>

          </div>
        </section>

        {/* SECTION: LIVE APP COMPANION SIMULATOR SIDE-BY-SIDE */}
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

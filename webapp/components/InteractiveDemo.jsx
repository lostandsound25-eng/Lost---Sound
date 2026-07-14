'use client';

import React, { useState, useEffect } from 'react';

const STEPS = [
  {
    id: 'dashboard',
    number: '01',
    title: 'Live Budget Dashboard',
    tagline: 'Stay on top of what you spent.',
    description: 'Keep track of all travel elements in one place. Log locations, pacing, and category budgets without background process drain.',
    image: '/assets/screenshot_dashboard.png',
    annotations: [
      {
        id: 'db-1',
        title: '💵 Daily Pacing Target',
        text: 'Averages recalculate live to show exactly what you have left to spend each day.',
        cardStyle: { top: '50px', right: '-150px' },
        hotspotStyle: { top: '12%', left: '52%', width: '130px', height: '60px' },
        // SVG path from card connection (X=480, Y=90) to hotspot center (X=330, Y=95)
        svgPath: 'M 470 90 Q 400 70 340 90',
        arrowDirection: 'left'
      },
      {
        id: 'db-2',
        title: '🏠 Auto Breakdown',
        text: 'Accommodation, Transportation, and Food separated out instantly.',
        cardStyle: { top: '220px', left: '-150px' },
        hotspotStyle: { top: '25%', left: '3%', width: '300px', height: '160px' },
        // SVG path from card connection (X=160, Y=260) to hotspot center (X=170, Y=210)
        svgPath: 'M 160 260 Q 190 280 180 220',
        arrowDirection: 'right'
      }
    ]
  },
  {
    id: 'quick_entry',
    number: '02',
    title: 'Log in 10s or Less',
    tagline: 'Lightning-fast offline expensing.',
    description: 'Enter local pricing completely offline. Tag your purchases dynamically with custom hashtags and worth-it indicators.',
    image: '/assets/screenshot_log_expense.png',
    annotations: [
      {
        id: 'qe-1',
        title: '🔄 Auto FX Math',
        text: 'Type local currency (e.g. Rp 50,000) and watch it convert to USD ($2.76) in real-time.',
        cardStyle: { top: '200px', left: '-150px' },
        hotspotStyle: { top: '37%', left: '6%', width: '280px', height: '70px' },
        // SVG path from card connection (X=160, Y=240) to hotspot center (X=190, Y=255)
        svgPath: 'M 160 240 Q 185 245 190 255',
        arrowDirection: 'right'
      },
      {
        id: 'qe-2',
        title: '🌟 "Worth It" Toggle',
        text: 'Check whether an experience or purchase was actually worth the cost.',
        cardStyle: { top: '320px', right: '-150px' },
        hotspotStyle: { top: '55%', left: '50%', width: '140px', height: '50px' },
        // SVG path from card connection (X=480, Y=360) to hotspot center (X=320, Y=370)
        svgPath: 'M 470 360 Q 380 375 330 370',
        arrowDirection: 'left'
      }
    ]
  },
  {
    id: 'planning',
    number: '03',
    title: 'Forward Planning',
    tagline: 'Stay flexible with your itinerary.',
    description: 'Map out your destinations and daily targets days or weeks in advance without rigid itinerary lock-ins.',
    image: '/assets/screenshot_plan.png',
    annotations: [
      {
        id: 'pl-1',
        title: '📅 Flexible Timeline',
        text: 'Chronological list of locations, target pacing, and daily todo checklists.',
        cardStyle: { top: '150px', left: '-150px' },
        hotspotStyle: { top: '25%', left: '5%', width: '280px', height: '240px' },
        // SVG path from card connection (X=160, Y=190) to hotspot center (X=180, Y=220)
        svgPath: 'M 160 190 Q 200 170 190 215',
        arrowDirection: 'right'
      },
      {
        id: 'pl-2',
        title: '📝 Notes & Reminders',
        text: 'Attach custom checkins, sights, or todo checklists per day.',
        cardStyle: { top: '330px', right: '-150px' },
        hotspotStyle: { top: '32%', left: '38%', width: '180px', height: '120px' },
        // SVG path from card connection (X=480, Y=370) to hotspot center (X=330, Y=340)
        svgPath: 'M 470 370 Q 390 380 320 330',
        arrowDirection: 'left'
      }
    ]
  },
  {
    id: 'search',
    number: '04',
    title: 'Sub-second Search',
    tagline: 'Recall past details in milliseconds.',
    description: 'Search through past transactions to recall flight codes, hostel check-in times, addresses, or refer prices to friends.',
    image: '/assets/screenshot_history.png',
    annotations: [
      {
        id: 'sh-1',
        title: '🔍 Instant Query Filters',
        text: 'Type flight codes or hotel names to filter matches in milliseconds.',
        cardStyle: { top: '260px', left: '-150px' },
        hotspotStyle: { top: '51%', left: '5%', width: '290px', height: '60px' },
        // SVG path from card connection (X=160, Y=300) to hotspot center (X=180, Y=345)
        svgPath: 'M 160 300 Q 190 320 180 340',
        arrowDirection: 'right'
      },
      {
        id: 'sh-2',
        title: '✈️ Detail Retrieval',
        text: 'Quickly recall flight numbers, checkin times, or stay addresses.',
        cardStyle: { top: '360px', right: '-150px' },
        hotspotStyle: { top: '65%', left: '5%', width: '290px', height: '140px' },
        // SVG path from card connection (X=480, Y=400) to hotspot center (X=310, Y=450)
        svgPath: 'M 470 400 Q 380 430 320 440',
        arrowDirection: 'left'
      }
    ]
  },
  {
    id: 'discover',
    number: '05',
    title: 'Budget Discover Feed',
    tagline: 'Compare spends with other travelers.',
    description: 'Browse authentic public budget tracks shared by other globetrotters to gauge costs for your next destination.',
    image: '/assets/app_mockup.png',
    annotations: [
      {
        id: 'dc-1',
        title: '🧭 Real Cost Feeds',
        text: 'Gain transparent insights into real costs in countries like Thailand, Bali, and Vietnam.',
        cardStyle: { top: '180px', left: '-150px' },
        hotspotStyle: { top: '30%', left: '10%', width: '260px', height: '180px' },
        svgPath: 'M 160 220 Q 200 240 210 230',
        arrowDirection: 'right'
      }
    ]
  }
];

export default function InteractiveDemo() {
  const [activeStepId, setActiveStepId] = useState('dashboard');
  const activeStep = STEPS.find(s => s.id === activeStepId) || STEPS[0];
  const [windowWidth, setWindowWidth] = useState(1024);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const isMobileLayout = windowWidth < 960;

  // Auto-rotation of steps
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepId(currentId => {
        const index = STEPS.findIndex(s => s.id === currentId);
        const nextIndex = (index + 1) % STEPS.length;
        return STEPS[nextIndex].id;
      });
    }, 9000); // switch every 9s

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      gap: '40px',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginTop: '20px',
      width: '100%'
    }}>
      
      {/* Selector Toggles Column */}
      <div style={{
        flex: '1 1 360px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '440px'
      }}>
        {STEPS.map((step) => {
          const isActive = step.id === activeStepId;
          return (
            <div
              key={step.id}
              onClick={() => setActiveStepId(step.id)}
              style={{
                display: 'flex',
                gap: '16px',
                padding: '18px',
                borderRadius: '20px',
                cursor: 'pointer',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: isActive ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isActive ? 'translateX(8px)' : 'none',
                boxShadow: isActive ? '0 10px 30px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              {/* Number Badge */}
              <div style={{
                fontSize: '1.2rem',
                fontWeight: 900,
                color: isActive ? 'var(--color-golden)' : 'rgba(255, 255, 255, 0.4)',
                fontFamily: 'var(--font-heading)',
                marginTop: '1px'
              }}>
                {step.number}
              </div>

              {/* Title & Description */}
              <div style={{ flex: 1 }}>
                <h4 style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  margin: '0 0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {step.title}
                  {isActive && (
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-golden)',
                      display: 'inline-block'
                    }} />
                  )}
                </h4>
                <p style={{
                  fontSize: '0.85rem',
                  color: isActive ? 'var(--color-golden)' : 'rgba(255, 255, 255, 0.5)',
                  fontWeight: 600,
                  margin: '0 0 6px'
                }}>
                  {step.tagline}
                </p>
                {isActive && (
                  <p style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255, 255, 255, 0.85)',
                    lineHeight: '1.55',
                    margin: 0,
                    animation: 'fadeIn 0.4s ease-out'
                  }}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Phone chassis display frame */}
      <div style={{
        flex: '1 1 630px',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        width: isMobileLayout ? '100%' : '630px',
        height: isMobileLayout ? 'auto' : '630px',
        alignItems: 'center',
        padding: isMobileLayout ? '10px 0' : '0'
      }}>
        
        {/* Main interactive demo wrapper (limits coordinates dynamically to avoid clip bugs) */}
        <div style={{
          position: 'relative',
          width: '630px',
          height: '610px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          
          {/* Curved SVG Arrows: Only display on Desktop layout */}
          {!isMobileLayout && (
            <svg 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '630px',
                height: '610px',
                pointerEvents: 'none',
                zIndex: 15
              }}
            >
              <defs>
                <marker 
                  id="handwritten-arrow-head" 
                  viewBox="0 0 10 10" 
                  refX="5" 
                  refY="5" 
                  markerWidth="6" 
                  markerHeight="6" 
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 L 2 5 z" fill="var(--color-orange)" />
                </marker>
              </defs>

              {/* Dynamic curved paths */}
              {activeStep.annotations.map((ann) => (
                <path
                  key={ann.id}
                  d={ann.svgPath}
                  fill="none"
                  stroke="var(--color-orange)"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  markerEnd="url(#handwritten-arrow-head)"
                  style={{
                    animation: 'dashDraw 1.2s ease-out forwards',
                    opacity: 0.95
                  }}
                />
              ))}
            </svg>
          )}

          {/* Phone chassis structure (always centered in 630px space at left=160px) */}
          <div style={{
            width: '290px',
            height: '590px',
            borderRadius: '40px',
            backgroundColor: '#1E1518',
            border: '9px solid #2B1E21',
            boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.8)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10
          }}>
            {/* Notch */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100px',
              height: '20px',
              backgroundColor: '#2B1E21',
              borderRadius: '0 0 12px 12px',
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#111', marginRight: '16px' }} />
              <div style={{ width: '30px', height: '3px', borderRadius: '1.5px', backgroundColor: '#333' }} />
            </div>

            {/* Viewport */}
            <div style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              backgroundColor: '#FFFDF9',
              overflow: 'hidden'
            }}>
              <img
                key={activeStep.id}
                src={activeStep.image}
                alt={activeStep.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  animation: 'fadeInSlide 0.5s ease-out forwards'
                }}
              />

              {/* Hotspots rings */}
              {activeStep.annotations.map((ann, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    top: ann.hotspotStyle.top,
                    left: ann.hotspotStyle.left,
                    width: ann.hotspotStyle.width,
                    height: ann.hotspotStyle.height,
                    border: '3px dashed var(--color-orange)',
                    borderRadius: '18px',
                    pointerEvents: 'none',
                    transform: `rotate(${idx % 2 === 0 ? '-3deg' : '3deg'})`,
                    animation: 'pulseBorder 2.5s infinite ease-in-out',
                    boxShadow: '0 0 0 4px rgba(235, 94, 40, 0.1)'
                  }}
                />
              ))}
            </div>

            {/* Bottom Home Indicator Bar */}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90px',
              height: '4px',
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: '2px',
              zIndex: 20
            }} />
          </div>

          {/* Floating Cards (Desktop only, positioned absolutely in margins) */}
          {!isMobileLayout && activeStep.annotations.map((ann) => (
            <div
              key={ann.id}
              style={{
                position: 'absolute',
                ...ann.cardStyle,
                width: '170px',
                backgroundColor: '#FFFDF9',
                color: 'var(--color-purple)',
                padding: '14px 16px',
                borderRadius: '18px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.22)',
                border: '1.5px solid var(--color-orange)',
                zIndex: 25,
                fontSize: '0.82rem',
                lineHeight: '1.45',
                animation: 'floatCard 0.4s ease-out forwards'
              }}
            >
              <strong style={{ display: 'block', color: 'var(--color-orange)', marginBottom: '4px', fontWeight: 800, fontSize: '0.88rem' }}>
                {ann.title}
              </strong>
              {ann.text}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile-only descriptive list cards */}
      {isMobileLayout && (
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginTop: '10px',
          padding: '0 10px'
        }}>
          {activeStep.annotations.map((ann) => (
            <div
              key={ann.id}
              style={{
                backgroundColor: '#FFFDF9',
                color: 'var(--color-purple)',
                padding: '16px',
                borderRadius: '16px',
                border: '1.5px solid var(--color-orange)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.06)'
              }}
            >
              <strong style={{ display: 'block', color: 'var(--color-orange)', marginBottom: '4px', fontSize: '0.92rem', fontWeight: 800 }}>
                {ann.title}
              </strong>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#4B5563', lineHeight: '1.45' }}>
                {ann.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInSlide {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseBorder {
          0% { border-color: var(--color-orange); }
          50% { border-color: var(--color-golden); }
          100% { border-color: var(--color-orange); }
        }
        @keyframes floatCard {
          from { opacity: 0; transform: translateY(10px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dashDraw {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}

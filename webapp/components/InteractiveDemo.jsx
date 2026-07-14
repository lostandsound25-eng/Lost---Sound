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
        top: '12%',
        left: '52%',
        width: '125px',
        height: '55px',
        label: '💵 Daily Pacing Target',
        tooltip: 'See how today\'s spending compares to your target average.',
        arrowDirection: 'right'
      },
      {
        top: '25%',
        left: '4%',
        width: '290px',
        height: '150px',
        label: '🏠 Automatic Breakdown',
        tooltip: 'Accommodation, Transportation, and Food separated out instantly.',
        arrowDirection: 'left'
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
        top: '37%',
        left: '8%',
        width: '275px',
        height: '65px',
        label: '🔄 Auto FX Math',
        tooltip: 'Type local currency (e.g. Rp 50,000) and watch it convert to USD ($2.76) in real-time.',
        arrowDirection: 'left'
      },
      {
        top: '55%',
        left: '48%',
        width: '140px',
        height: '45px',
        label: '🌟 "Worth It" Toggle',
        tooltip: 'Check whether an experience or purchase was actually worth the cost.',
        arrowDirection: 'right'
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
        top: '25%',
        left: '5%',
        width: '280px',
        height: '240px',
        label: '📅 Flexible Timeline',
        tooltip: 'Chronological list of locations, target pacing, and daily todo checklists.',
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
        top: '50%',
        left: '5%',
        width: '280px',
        height: '65px',
        label: '🔍 Instant Query Filters',
        tooltip: 'Search query lists update instantly as you type to retrieve records.',
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
        top: '30%',
        left: '10%',
        width: '260px',
        height: '180px',
        label: '🧭 Real-World Cost Feeds',
        tooltip: 'View real traveler tracks to prepare for your own trip budgets.',
        arrowDirection: 'right'
      }
    ]
  }
];

export default function InteractiveDemo() {
  const [activeStepId, setActiveStepId] = useState('dashboard');
  const activeStep = STEPS.find(s => s.id === activeStepId) || STEPS[0];

  // Auto-rotation of steps
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepId(currentId => {
        const index = STEPS.findIndex(s => s.id === currentId);
        const nextIndex = (index + 1) % STEPS.length;
        return STEPS[nextIndex].id;
      });
    }, 8000); // switch every 8s

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      gap: '50px',
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
        gap: '16px',
        maxWidth: '460px'
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
                padding: '20px',
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
                fontSize: '1.25rem',
                fontWeight: 900,
                color: isActive ? 'var(--color-golden)' : 'rgba(255, 255, 255, 0.4)',
                fontFamily: 'var(--font-heading)',
                marginTop: '2px'
              }}>
                {step.number}
              </div>

              {/* Title & Description */}
              <div style={{ flex: 1 }}>
                <h4 style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  margin: '0 0 6px',
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
                  fontSize: '0.88rem',
                  color: isActive ? 'var(--color-golden)' : 'rgba(255, 255, 255, 0.5)',
                  fontWeight: 600,
                  margin: '0 0 8px'
                }}>
                  {step.tagline}
                </p>
                {isActive && (
                  <p style={{
                    fontSize: '0.92rem',
                    color: 'rgba(255, 255, 255, 0.85)',
                    lineHeight: '1.5',
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
        flex: '1 1 320px',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        padding: '30px'
      }}>
        {/* Phone outer bezel */}
        <div style={{
          width: '310px',
          height: '630px',
          borderRadius: '40px',
          backgroundColor: '#1E1518',
          border: '10px solid #2B1E21',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.8)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.5s ease'
        }}>
          {/* Notch / Speaker Ear Piece */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '110px',
            height: '22px',
            backgroundColor: '#2B1E21',
            borderRadius: '0 0 14px 14px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Small camera/lens spot */}
            <div style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: '#111',
              marginRight: '20px'
            }} />
            <div style={{
              width: '35px',
              height: '3px',
              borderRadius: '2px',
              backgroundColor: '#333'
            }} />
          </div>

          {/* Screenshot viewport container */}
          <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            backgroundColor: '#FFFDF9',
            overflow: 'hidden'
          }}>
            {/* Screenshot Image with smooth CSS transitions */}
            <img
              key={activeStep.id}
              src={activeStep.image}
              alt={activeStep.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                animation: 'fadeInSlide 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
            />

            {/* Hand-drawn Hotspots overlay */}
            {activeStep.annotations.map((ann, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  top: ann.top,
                  left: ann.left,
                  width: ann.width,
                  height: ann.height,
                  border: '3px dashed var(--color-orange)',
                  borderRadius: '16px',
                  pointerEvents: 'none',
                  transform: `rotate(${index % 2 === 0 ? '-3deg' : '3deg'})`,
                  animation: 'pulseBorder 2s infinite ease-in-out'
                }}
              />
            ))}
          </div>

          {/* Bottom simulated home bar indicator */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100px',
            height: '4px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: '2px',
            zIndex: 10
          }} />
        </div>

        {/* Floating Callout Labels adjacent to the phone */}
        {activeStep.annotations.map((ann, index) => {
          const isRight = ann.arrowDirection === 'right';
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: `calc(${ann.top} + 20px)`,
                [isRight ? 'right' : 'left']: '-50px',
                backgroundColor: 'white',
                color: 'var(--color-purple)',
                padding: '12px 16px',
                borderRadius: '18px',
                boxShadow: '0 12px 28px rgba(0,0,0,0.3)',
                width: '190px',
                fontSize: '0.85rem',
                lineHeight: '1.4',
                zIndex: 20,
                border: '1.5px solid var(--color-orange)',
                animation: 'floatAnnotation 0.5s ease-out forwards'
              }}
            >
              <strong style={{ display: 'block', color: 'var(--color-orange)', marginBottom: '3px', fontWeight: 800 }}>
                {ann.label}
              </strong>
              {ann.tooltip}
            </div>
          );
        })}
      </div>

      {/* Embedded Animations and Keyframes */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInSlide {
          from { opacity: 0; transform: scale(1.02); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseBorder {
          0% { border-color: var(--color-orange); opacity: 0.8; }
          50% { border-color: var(--color-golden); opacity: 1; }
          100% { border-color: var(--color-orange); opacity: 0.8; }
        }
        @keyframes floatAnnotation {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

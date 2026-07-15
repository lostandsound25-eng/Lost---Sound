'use client';

import React, { useState, useEffect } from 'react';
import TrackerApp from './TrackerApp';

const TOUR_STEPS = [
  {
    step: 1,
    number: '01',
    title: 'Live Budget Dashboard',
    tagline: 'Stay on top of what you spent.',
    description: 'Tracks and computes your daily pacing dynamically.'
  },
  {
    step: 2,
    number: '02',
    title: 'Log in 10s or Less',
    tagline: 'Lightning-fast offline logging.',
    description: 'Tapping the "+" button opens the entry panel to log a purchase in 10s or less. Go ahead, or tap Next to see it open!'
  },
  {
    step: 3,
    number: '03',
    title: 'Auto FX Conversion',
    tagline: 'Automatic offline foreign currency math.',
    description: 'Type foreign currencies (like Indonesian Rupiah) directly. Tracks calculates conversion math instantly completely offline.'
  },
  {
    step: 4,
    number: '04',
    title: 'Remember Where You Went',
    tagline: 'Visual travel memory photostream.',
    description: 'Add photos of food, tickets, or stays to your log. Your expense history becomes a beautiful visual travel diary!'
  },
  {
    step: 5,
    number: '05',
    title: 'The "Worth It" Star',
    tagline: 'Track satisfaction, not just cost digits.',
    description: 'Check the star if a meal or ride was genuinely worth the cost. Helps analyze travel value beyond pure spreadsheet rows.'
  },
  {
    step: 6,
    number: '06',
    title: 'Forward Looking Timeline',
    tagline: 'Stay flexible with your itinerary.',
    description: 'Check out the Plan tab. Estimate future spends and outline your travel targets chronological days in advance.'
  },
  {
    step: 7,
    number: '07',
    title: 'Sub-second Search History',
    tagline: 'Recall past details in milliseconds.',
    description: 'Check out the History search. Instantly search flight numbers, checkin times, addresses, or refer costs to friends.'
  }
];

export default function InteractiveDemo() {
  const [activeStep, setActiveStep] = useState(1);
  const activeStepData = TOUR_STEPS.find(s => s.step === activeStep) || TOUR_STEPS[0];

  // Auto-rotation removed to prevent page distraction - tour advances only on interaction

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
      
      {/* Left Column: Interactive Selector Buttons */}
      <div style={{
        flex: '1 1 360px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '440px'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>
            Live Interactive Simulator
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            Tapping the guides below controls the real application inside the phone in real-time. Feel free to click buttons directly on the phone to test it yourself!
          </p>
        </div>

        {TOUR_STEPS.map((step) => {
          const isActive = step.step === activeStep;
          return (
            <div
              key={step.step}
              onClick={() => setActiveStep(step.step)}
              style={{
                display: 'flex',
                gap: '14px',
                padding: '16px',
                borderRadius: '18px',
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
                fontSize: '1.15rem',
                fontWeight: 900,
                color: isActive ? 'var(--color-golden)' : 'rgba(255, 255, 255, 0.4)',
                fontFamily: 'var(--font-heading)',
                marginTop: '1px'
              }}>
                {step.number}
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <h4 style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
                  margin: '0 0 2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {step.title}
                  {isActive && (
                    <span style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-golden)',
                      display: 'inline-block'
                    }} />
                  )}
                </h4>
                <p style={{
                  fontSize: '0.82rem',
                  color: isActive ? 'var(--color-golden)' : 'rgba(255, 255, 255, 0.5)',
                  fontWeight: 600,
                  margin: '0 0 6px'
                }}>
                  {step.tagline}
                </p>
                {isActive && (
                  <div style={{
                    animation: 'fadeIn 0.4s ease-out'
                  }}>
                    <p style={{
                      fontSize: '0.88rem',
                      color: 'rgba(255, 255, 255, 0.85)',
                      lineHeight: '1.5',
                      margin: '0 0 12px'
                    }}>
                      {step.description}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeStep > 1) {
                            setActiveStep(activeStep - 1);
                          }
                        }}
                        disabled={activeStep === 1}
                        style={{
                          fontSize: '0.72rem',
                          color: activeStep === 1 ? 'rgba(255,255,255,0.3)' : 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          cursor: activeStep === 1 ? 'not-allowed' : 'pointer',
                          fontWeight: 700,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        ← Back
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeStep < TOUR_STEPS.length) {
                            setActiveStep(activeStep + 1);
                          } else {
                            setActiveStep(1);
                          }
                        }}
                        style={{
                          fontSize: '0.72rem',
                          color: 'white',
                          backgroundColor: 'var(--color-orange)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontWeight: 800,
                          boxShadow: '0 4px 10px rgba(235,94,40,0.2)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {activeStep === TOUR_STEPS.length ? 'Start Over ↺' : 'Next Step →'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Column: Phone Chassis Mockup rendering the actual TrackerApp */}
      <div style={{
        flex: '0 0 320px',
        minWidth: '320px',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {/* Phone outer bezel */}
        <div style={{
          width: '300px',
          height: '610px',
          borderRadius: '40px',
          backgroundColor: '#1E1518',
          border: '10px solid #2B1E21',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.8)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          boxSizing: 'content-box'
        }}>
          {/* Notch / Speaker Ear Piece */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100px',
            height: '20px',
            backgroundColor: '#2B1E21',
            borderRadius: '0 0 12px 12px',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}>
            {/* Small camera/lens spot */}
            <div style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: '#111',
              marginRight: '16px'
            }} />
            <div style={{
              width: '30px',
              height: '3px',
              borderRadius: '1.5px',
              backgroundColor: '#333'
            }} />
          </div>

          {/* Screenshot viewport container containing the actual TrackerApp component */}
          <div style={{
            width: '375px',
            height: '762px',
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'scale(0.8)',
            transformOrigin: 'top left',
            backgroundColor: '#F9F6ED',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            contain: 'content',
            boxSizing: 'border-box'
          }}>
            <TrackerApp 
              isDemo={true} 
              externalTourStep={activeStep}
              hideFloatingButtons={false}
            />
          </div>

          {/* Bottom simulated home bar indicator */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90px',
            height: '4px',
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: '2px',
            zIndex: 100,
            pointerEvents: 'none'
          }} />
        </div>
      </div>

      {/* Embedded Animations and Keyframes */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

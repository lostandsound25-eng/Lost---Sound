'use client';

import React, { useState, useEffect } from 'react';
import TrackerApp from './TrackerApp';

const TOUR_STEPS = [
  {
    step: 1,
    number: '01',
    title: 'Live Budget Dashboard',
    tagline: 'Stay on top of what you spent.',
    description: 'Keep track of all travel elements in one place. Log locations, pacing, and category budgets without background process drain.'
  },
  {
    step: 2,
    number: '02',
    title: 'Log in 10s or Less',
    tagline: 'Lightning-fast offline logging.',
    description: 'Tap the "+" button at the bottom of the screen to open the log panel. Enter costs quickly while walking around.'
  },
  {
    step: 3,
    number: '03',
    title: 'Auto FX Conversion',
    tagline: 'Automatic offline foreign currency math.',
    description: 'Type local prices (like Indonesian Rupiah) directly. Tracks calculates conversion math instantly completely offline.'
  },
  {
    step: 4,
    number: '04',
    title: 'The "Worth It" Star',
    tagline: 'Track satisfaction, not just cost digits.',
    description: 'Check the star if a meal or ride was genuinely worth the cost. Helps analyze travel value beyond pure spreadsheet rows.'
  },
  {
    step: 5,
    number: '05',
    title: 'Forward Looking Timeline',
    tagline: 'Stay flexible with your itinerary.',
    description: 'Check out the Plan tab. Outline locations, targets, and checkin notes chronologically to stay highly flexible.'
  },
  {
    step: 6,
    number: '06',
    title: 'Sub-second Search History',
    tagline: 'Recall past details in milliseconds.',
    description: 'Check out the History tab. Search flight codes, checkin times, stay addresses, or refer costs to friends instantly.'
  }
];

export default function InteractiveDemo() {
  const [activeStep, setActiveStep] = useState(1);
  const activeStepData = TOUR_STEPS.find(s => s.step === activeStep) || TOUR_STEPS[0];

  // Auto-rotation of tour steps
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(currentStep => {
        return (currentStep % TOUR_STEPS.length) + 1;
      });
    }, 10000); // Rotate step every 10s

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
                  <p style={{
                    fontSize: '0.88rem',
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

      {/* Right Column: Phone Chassis Mockup rendering the actual TrackerApp */}
      <div style={{
        flex: '1 1 320px',
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
          zIndex: 10
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
            width: '100%',
            height: '100%',
            position: 'relative',
            backgroundColor: '#F9F6ED',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <TrackerApp 
              isDemo={true} 
              externalTourStep={activeStep}
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

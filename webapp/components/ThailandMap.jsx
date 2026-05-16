'use client';
import React, { useState } from 'react';

const locations = [
  { 
    id: 'bangkok', 
    name: 'Bangkok', 
    x: 180, 
    y: 350, 
    highlight: 'Street food, neon lights, and golden temples.',
    icon: '🏮'
  },
  { 
    id: 'chiangmai', 
    name: 'Chiang Mai', 
    x: 140, 
    y: 120, 
    highlight: 'Night markets, elephant sanctuaries, and cool mountain air.',
    icon: '🐘'
  },
  { 
    id: 'pai', 
    name: 'Pai', 
    x: 100, 
    y: 90, 
    highlight: 'Waterfalls, canyons, and ultimate mountain vibes.',
    icon: '🛵'
  },
  { 
    id: 'krabi', 
    name: 'Krabi', 
    x: 160, 
    y: 580, 
    highlight: 'Emerald pools, longtail boats, and limestone cliffs.',
    icon: '🏝️'
  }
];

export default function ThailandMap() {
  const [activeLoc, setActiveLoc] = useState(null);

  return (
    <div className="map-container" style={{ 
      position: 'relative', 
      maxWidth: '800px', 
      margin: '60px auto',
      padding: '40px',
      backgroundColor: 'var(--color-bg)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'inset 0 0 100px rgba(232, 107, 50, 0.05)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '40px', color: 'var(--color-purple)' }}>
        The Lost & Sound Route
      </h2>

      <div style={{ position: 'relative', height: '700px' }}>
        <svg viewBox="0 0 400 700" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {/* Simplified Thailand Path (Organic Style) */}
          <path 
            d="M100,50 L180,40 L250,80 L280,200 L250,300 L200,350 L180,450 L200,550 L180,680 L140,680 L130,550 L150,450 L100,350 L50,200 L60,100 Z" 
            fill="white" 
            stroke="var(--color-purple)" 
            strokeWidth="3" 
            strokeLinejoin="round"
            style={{ opacity: 0.3 }}
          />

          {/* Clearer Route Path */}
          <path 
            d="M180,350 L140,120 L100,90 M180,350 L160,580" 
            fill="none" 
            stroke="var(--color-orange)" 
            strokeWidth="4" 
            strokeDasharray="8 8"
            className="route-path"
          />

          {/* Points */}
          {locations.map((loc) => (
            <g 
              key={loc.id} 
              onMouseEnter={() => setActiveLoc(loc)}
              onMouseLeave={() => setActiveLoc(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle 
                cx={loc.x} 
                cy={loc.y} 
                r="12" 
                fill={activeLoc?.id === loc.id ? 'var(--color-orange)' : 'var(--color-purple)'} 
                style={{ transition: 'all 0.3s ease' }}
              />
              <circle 
                cx={loc.x} 
                cy={loc.y} 
                r="20" 
                fill="var(--color-orange)" 
                style={{ opacity: activeLoc?.id === loc.id ? 0.2 : 0, transition: 'all 0.3s ease' }}
              />
              <text 
                x={loc.x + 20} 
                y={loc.y + 5} 
                style={{ 
                  fontFamily: 'var(--font-heading)', 
                  fontWeight: 800, 
                  fontSize: '14px',
                  fill: 'var(--color-purple)',
                  opacity: activeLoc?.id === loc.id ? 1 : 0.7
                }}
              >
                {loc.name}
              </text>
            </g>
          ))}
        </svg>

        {/* Highlight Overlay */}
        {activeLoc && (
          <div style={{
            position: 'absolute',
            top: activeLoc.y - 120,
            left: activeLoc.x + 40,
            width: '240px',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '20px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
            zIndex: 10,
            animation: 'fadeInUp 0.3s ease forwards',
            border: '2px solid var(--color-bg)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{activeLoc.icon}</div>
            <h4 style={{ color: 'var(--color-purple)', marginBottom: '5px' }}>{activeLoc.name}</h4>
            <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.4' }}>{activeLoc.highlight}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .route-path {
          stroke-dashoffset: 1000;
          animation: draw 3s ease forwards;
        }
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}

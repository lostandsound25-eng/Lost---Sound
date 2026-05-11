'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [activeDay, setActiveDay] = useState(0);

  // Load trip data
  useEffect(() => {
    const saved = localStorage.getItem('ls_trips');
    if (saved) {
      const allTrips = JSON.parse(saved);
      const found = allTrips.find(t => t.id.toString() === id);
      if (found) {
        // Initialize days if empty
        if (!found.days || found.days.length === 0) {
          found.days = [
            { 
              id: 0, 
              anchors: [], 
              flex: [], 
              logistics: [], 
              memories: [] 
            }
          ];
        }
        setTrip(found);
      }
    }
  }, [id]);

  const saveTrip = (updatedTrip) => {
    setTrip(updatedTrip);
    const saved = localStorage.getItem('ls_trips');
    const allTrips = JSON.parse(saved);
    const index = allTrips.findIndex(t => t.id.toString() === id);
    allTrips[index] = updatedTrip;
    localStorage.setItem('ls_trips', JSON.stringify(allTrips));
  };

  const addDay = () => {
    const newDay = { 
      id: trip.days.length, 
      anchors: [], 
      flex: [], 
      logistics: [], 
      memories: [] 
    };
    const updated = { ...trip, days: [...trip.days, newDay] };
    saveTrip(updated);
    setActiveDay(newDay.id);
  };

  const addItem = (section) => {
    const title = prompt(`Add to ${section}:`);
    if (!title) return;

    const updatedDays = [...trip.days];
    updatedDays[activeDay][section].push({ id: Date.now(), title, time: section === 'anchors' ? '12:00' : null });
    saveTrip({ ...trip, days: updatedDays });
  };

  if (!trip) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading your journey...</div>;

  const currentDay = trip.days[activeDay];

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#F9F6ED', padding: '80px 0' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Navigation */}
        <Link href="/planner" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-purple)', textDecoration: 'none', marginBottom: '40px', fontWeight: 600 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Dashboard
        </Link>

        {/* Trip Header */}
        <header style={{ marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '8px' }}>{trip.name}</h1>
          <p style={{ opacity: 0.6, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>{trip.destination}</p>
        </header>

        {/* Day Selector */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', overflowX: 'auto', paddingBottom: '10px' }}>
          {trip.days.map((day, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveDay(idx)}
              style={{ 
                padding: '12px 24px', 
                borderRadius: '50px', 
                border: 'none',
                backgroundColor: activeDay === idx ? 'var(--color-purple)' : 'white',
                color: activeDay === idx ? 'white' : 'inherit',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
              }}
            >
              Day {idx + 1}
            </button>
          ))}
          <button onClick={addDay} style={{ padding: '12px 24px', borderRadius: '50px', border: '2px dashed #ccc', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 600 }}>
            + Add Day
          </button>
        </div>

        {/* The Day Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          {/* LEFT COLUMN: The Schedule */}
          <div style={{ display: 'grid', gap: '30px' }}>
            
            {/* A. ANCHOR EVENTS */}
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '40px', border: '2px solid var(--color-purple)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--color-purple)' }}>●</span> Anchor Events
                </h2>
                <button onClick={() => addItem('anchors')} style={{ border: 'none', background: '#F9F6ED', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>+</button>
              </div>
              <div style={{ display: 'grid', gap: '16px' }}>
                {currentDay.anchors.length === 0 && <p style={{ opacity: 0.3, fontStyle: 'italic' }}>Flights, trains, reservations...</p>}
                {currentDay.anchors.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: 'var(--color-purple)', fontSize: '0.9rem', width: '50px' }}>{item.time}</span>
                    <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* B. FLEXIBLE IDEAS */}
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--color-golden)' }}>○</span> Flexible Ideas
                </h2>
                <button onClick={() => addItem('flex')} style={{ border: 'none', background: '#F9F6ED', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>+</button>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {currentDay.flex.length === 0 && <p style={{ opacity: 0.3, fontStyle: 'italic' }}>Cafes, viewpoints, markets...</p>}
                {currentDay.flex.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', border: '1.5px solid #ccc' }}></div>
                    <span style={{ opacity: 0.8 }}>{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: The Logistics */}
          <div style={{ display: 'grid', gap: '30px' }}>
            
            {/* C. LOGISTICS */}
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--color-orange)' }}>□</span> Logistics
                </h2>
                <button onClick={() => addItem('logistics')} style={{ border: 'none', background: '#F9F6ED', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>+</button>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {currentDay.logistics.length === 0 && <p style={{ opacity: 0.3, fontStyle: 'italic' }}>Hotels, transport, confirmation #s...</p>}
                {currentDay.logistics.map(item => (
                  <div key={item.id} style={{ padding: '12px', border: '1px solid #eee', borderRadius: '15px', fontSize: '0.9rem' }}>
                    {item.title}
                  </div>
                ))}
              </div>
            </div>

            {/* D. MEMORIES / CONTENT */}
            <div style={{ backgroundColor: '#F2AE3015', padding: '40px', borderRadius: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--color-golden)' }}>✧</span> Memories & Content
                </h2>
                <button onClick={() => addItem('memories')} style={{ border: 'none', background: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>+</button>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {currentDay.memories.length === 0 && <p style={{ opacity: 0.3, fontStyle: 'italic' }}>Journaling, reel ideas, photos to catch...</p>}
                {currentDay.memories.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                    <span style={{ color: 'var(--color-golden)' }}>✦</span>
                    <span style={{ fontSize: '1rem', fontStyle: 'italic' }}>{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}

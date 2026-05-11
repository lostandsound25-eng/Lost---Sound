'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TripPlanner() {
  const [trips, setTrips] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [newTripDestination, setNewTripDestination] = useState('');

  // Load from local storage for V1
  useEffect(() => {
    const saved = localStorage.getItem('ls_trips');
    if (saved) setTrips(JSON.parse(saved));
  }, []);

  const createTrip = (startDate, endDate) => {
    if (!newTripName || !newTripDestination) return;
    
    const newTrip = {
      id: Date.now(),
      name: newTripName,
      destination: newTripDestination,
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
      days: [] // We'll add logic to generate day cards later
    };

    const updated = [...trips, newTrip];
    setTrips(updated);
    localStorage.setItem('ls_trips', JSON.stringify(updated));
    setIsCreating(false);
    setNewTripName('');
    setNewTripDestination('');
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#F9F6ED', padding: '120px 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
          <div>
            <h1 style={{ fontSize: '3.5rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>My Trips</h1>
            <p style={{ opacity: 0.6, fontSize: '1.1rem' }}>Plan your anchors, leave room for magic.</p>
          </div>
          {!isCreating && (
            <button 
              onClick={() => setIsCreating(true)}
              className="btn btn-primary"
              style={{ borderRadius: '50px', padding: '12px 30px' }}
            >
              + Create Trip
            </button>
          )}
        </div>

        {/* Create Trip Form */}
        {isCreating && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '40px', 
            borderRadius: '40px', 
            marginBottom: '40px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.03)'
          }}>
            <h2 style={{ marginBottom: '20px' }}>Where to next?</h2>
            <div style={{ display: 'grid', gap: '20px' }}>
              <input 
                type="text" 
                placeholder="Trip Name (e.g., Summer in Sicily)"
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
                style={{ width: '100%', padding: '16px 24px', borderRadius: '20px', border: '1px solid #eee', fontSize: '1.1rem' }}
              />
              <input 
                type="text" 
                placeholder="Destination"
                value={newTripDestination}
                onChange={(e) => setNewTripDestination(e.target.value)}
                style={{ width: '100%', padding: '16px 24px', borderRadius: '20px', border: '1px solid #eee', fontSize: '1.1rem' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Start Date</label>
                  <input type="date" id="start-date" style={{ width: '100%', padding: '12px 20px', borderRadius: '15px', border: '1px solid #eee' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>End Date</label>
                  <input type="date" id="end-date" style={{ width: '100%', padding: '12px 20px', borderRadius: '15px', border: '1px solid #eee' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button onClick={() => {
                  const start = document.getElementById('start-date').value;
                  const end = document.getElementById('end-date').value;
                  createTrip(start, end);
                }} className="btn btn-primary">Start Planning</button>
                <button onClick={() => setIsCreating(false)} className="btn btn-outline" style={{ border: 'none' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Trip List */}
        <div style={{ display: 'grid', gap: '20px' }}>
          {trips.length === 0 && !isCreating && (
            <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.4 }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '20px' }}>
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              <p>No trips yet. Start by creating your first adventure.</p>
            </div>
          )}

          {trips.map(trip => (
            <Link 
              key={trip.id} 
              href={`/planner/${trip.id}`}
              style={{ 
                display: 'block', 
                backgroundColor: 'white', 
                padding: '30px 40px', 
                borderRadius: '30px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{trip.name}</h3>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <p style={{ opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {trip.destination}
                    </p>
                    {trip.startDate && (
                      <>
                        <span style={{ opacity: 0.2 }}>•</span>
                        <p style={{ opacity: 0.5, fontSize: '0.8rem', fontWeight: 600 }}>
                          {trip.startDate} — {trip.endDate}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if(confirm('Delete this trip?')) {
                        const updated = trips.filter(t => t.id !== trip.id);
                        setTrips(updated);
                        localStorage.setItem('ls_trips', JSON.stringify(updated));
                      }
                    }}
                    style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    Delete
                  </button>
                  <div style={{ color: 'var(--color-purple)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

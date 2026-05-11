'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format, eachDayOfInterval, parseISO, isSameDay } from 'date-fns';

export default function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [editingDay, setEditingDay] = useState(null); // The full day object being edited

  // Load trip data
  useEffect(() => {
    const saved = localStorage.getItem('ls_trips');
    if (saved) {
      const allTrips = JSON.parse(saved);
      const found = allTrips.find(t => t.id.toString() === id);
      if (found) {
        // If no days generated yet, generate them based on start/end dates
        if ((!found.days || found.days.length === 0) && found.startDate && found.endDate) {
          try {
            const days = eachDayOfInterval({
              start: parseISO(found.startDate),
              end: parseISO(found.endDate)
            }).map((date, idx) => ({
              id: idx,
              date: format(date, 'yyyy-MM-dd'),
              anchors: [],
              logistics: [],
              flex: []
            }));
            found.days = days;
          } catch (err) {
            console.error("Invalid dates in trip", err);
            window.location.href = '/planner';
          }
        } else if (!found.startDate || !found.endDate) {
          // If it's a legacy trip without dates, we can't show the calendar
          window.location.href = '/planner';
        }
        setTrip(found);
      } else {
        window.location.href = '/planner';
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

  const addItem = (section) => {
    const title = prompt(`Add to ${section}:`);
    if (!title) return;

    const updatedDays = [...trip.days];
    const dayIndex = updatedDays.findIndex(d => d.date === editingDay.date);
    updatedDays[dayIndex][section].push({ 
      id: Date.now(), 
      title, 
      time: section === 'anchors' ? '12:00' : null 
    });
    
    saveTrip({ ...trip, days: updatedDays });
    setEditingDay({ ...updatedDays[dayIndex] });
  };

  const printPDF = () => {
    window.print();
  };

  if (!trip) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading your journey...</div>;

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#F9F6ED', padding: '60px 0' }}>
      <style>{`
        @media print {
          nav, button, .no-print { display: none !important; }
          main { padding: 0 !important; background: white !important; }
          .container { max-width: 100% !important; }
          .calendar-grid { display: block !important; }
          .day-card { page-break-inside: avoid; border: 1px solid #eee; margin-bottom: 20px; }
        }
      `}</style>

      <div className="container" style={{ maxWidth: '1100px' }}>
        
        {/* Navigation */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <Link href="/planner" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-purple)', textDecoration: 'none', fontWeight: 600 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Dashboard
          </Link>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => {
                if(confirm('Are you sure you want to delete this entire trip?')) {
                  const saved = localStorage.getItem('ls_trips');
                  const allTrips = JSON.parse(saved);
                  const updated = allTrips.filter(t => t.id.toString() !== id);
                  localStorage.setItem('ls_trips', JSON.stringify(updated));
                  window.location.href = '/planner';
                }
              }}
              className="btn btn-outline" 
              style={{ borderRadius: '50px', color: '#ff4d4d', borderColor: '#ff4d4d' }}
            >
              Delete Trip
            </button>
            <button onClick={printPDF} className="btn btn-outline" style={{ borderRadius: '50px' }}>Save as PDF</button>
            <button className="btn btn-outline" style={{ borderRadius: '50px' }}>Export to Calendar</button>
          </div>
        </div>

        {/* Trip Header */}
        <header style={{ marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '8px' }}>{trip.name}</h1>
          <p style={{ opacity: 0.6, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
            {trip.destination} • {trip.startDate} to {trip.endDate}
          </p>
        </header>

        {/* CALENDAR GRID */}
        <div className="calendar-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '20px' 
        }}>
          {trip.days.map((day, idx) => (
            <div 
              key={idx}
              onClick={() => setEditingDay(day)}
              className="day-card"
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '24px', 
                padding: '24px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                border: '1px solid transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '0.8rem', opacity: 0.4, fontWeight: 700, marginBottom: '8px' }}>
                DAY {idx + 1}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>
                {format(parseISO(day.date), 'MMM d')}
              </div>
              
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.6 }}>Anchors</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-purple)' }}>{day.anchors.length}</span>
                </div>
                <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.6 }}>Logistics</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-orange)' }}>{day.logistics.length}</span>
                </div>
                <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.6 }}>Flex Ideas</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-golden)' }}>{day.flex.length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DAY EDITOR MODAL */}
        {editingDay && (
          <div style={{ 
            position: 'fixed', 
            top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.4)', 
            backdropFilter: 'blur(8px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{ 
              backgroundColor: '#F9F6ED', 
              width: '100%', 
              maxWidth: '800px', 
              maxHeight: '90vh', 
              borderRadius: '40px', 
              overflowY: 'auto',
              position: 'relative',
              padding: '60px'
            }}>
              <button 
                onClick={() => setEditingDay(null)}
                style={{ position: 'absolute', top: '30px', right: '30px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem' }}
              >✕</button>

              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2.5rem' }}>{format(parseISO(editingDay.date), 'EEEE, MMMM do')}</h2>
                <p style={{ opacity: 0.5 }}>Manage your anchors and logistics for this day.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* ANCHORS */}
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '30px', border: '2px solid var(--color-purple)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--color-purple)' }}>Anchors</h3>
                    <button onClick={() => addItem('anchors')} className="btn-add">+</button>
                  </div>
                  {editingDay.anchors.map(item => (
                    <div key={item.id} style={{ marginBottom: '10px', fontSize: '1rem', fontWeight: 600 }}>{item.title}</div>
                  ))}
                </div>

                {/* LOGISTICS */}
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--color-orange)' }}>Logistics</h3>
                    <button onClick={() => addItem('logistics')} className="btn-add">+</button>
                  </div>
                  {editingDay.logistics.map(item => (
                    <div key={item.id} style={{ marginBottom: '8px', padding: '10px', backgroundColor: '#fcfcfc', border: '1px solid #eee', borderRadius: '12px', fontSize: '0.9rem' }}>
                      {item.title}
                    </div>
                  ))}
                </div>
              </div>

              {/* FLEX IDEAS */}
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '30px', marginTop: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--color-golden)' }}>Flexible Ideas</h3>
                  <button onClick={() => addItem('flex')} className="btn-add">+</button>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {editingDay.flex.map(item => (
                    <span key={item.id} style={{ padding: '6px 16px', backgroundColor: '#F9F6ED', borderRadius: '20px', fontSize: '0.9rem' }}>{item.title}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      <style>{`
        .btn-add {
          border: none;
          background: #F9F6ED;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          font-weight: bold;
        }
      `}</style>
    </main>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format, eachDayOfInterval, parseISO, isSameDay, startOfWeek, endOfWeek } from 'date-fns';

export default function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [editingDay, setEditingDay] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(null); // 'anchors', 'logistics', 'flex'

  // Load trip data
  useEffect(() => {
    const saved = localStorage.getItem('ls_trips');
    if (saved) {
      const allTrips = JSON.parse(saved);
      const found = allTrips.find(t => t.id.toString() === id);
      if (found) {
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
            window.location.href = '/planner';
          }
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

  const handleAddItem = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const details = formData.get('details');
    const time = formData.get('time');

    if (!title) return;

    const updatedDays = [...trip.days];
    const dayIndex = updatedDays.findIndex(d => d.date === editingDay.date);
    
    updatedDays[dayIndex][isAddingItem].push({ 
      id: Date.now(), 
      title, 
      details: details || '', 
      time: time || null 
    });
    
    saveTrip({ ...trip, days: updatedDays });
    setEditingDay({ ...updatedDays[dayIndex] });
    setIsAddingItem(null);
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
          .day-card { page-break-inside: avoid; border: 1px solid #eee; margin-bottom: 20px; min-height: auto !important; }
        }
        .day-card:hover { border-color: var(--color-purple) !important; }
      `}</style>

      <div className="container" style={{ maxWidth: '1200px' }}>
        
        {/* Navigation */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <Link href="/planner" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-purple)', textDecoration: 'none', fontWeight: 600 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Dashboard
          </Link>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => {
              if(confirm('Delete this entire trip?')) {
                const saved = localStorage.getItem('ls_trips');
                const allTrips = JSON.parse(saved);
                const updated = allTrips.filter(t => t.id.toString() !== id);
                localStorage.setItem('ls_trips', JSON.stringify(updated));
                window.location.href = '/planner';
              }
            }} className="btn btn-outline" style={{ borderRadius: '50px', color: '#ff4d4d', borderColor: '#ff4d4d' }}>Delete Trip</button>
            <button onClick={() => window.print()} className="btn btn-outline" style={{ borderRadius: '50px' }}>Save as PDF</button>
          </div>
        </div>

        {/* Trip Header */}
        <header style={{ marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '8px' }}>{trip.name}</h1>
          <p style={{ opacity: 0.6, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
            {trip.destination} • {trip.startDate} to {trip.endDate}
          </p>
        </header>

        {/* CALENDAR DAYS HEADER */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '10px', 
          marginBottom: '10px',
          textAlign: 'center'
        }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.3, textTransform: 'uppercase' }}>{day}</div>
          ))}
        </div>

        {/* CALENDAR GRID */}
        <div className="calendar-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '10px' 
        }}>
          {trip.days.map((day, idx) => {
            const dateObj = parseISO(day.date);
            // On the first day, add grid column offset
            const style = idx === 0 ? { gridColumnStart: dateObj.getDay() + 1 } : {};
            
            return (
              <div 
                key={idx}
                onClick={() => setEditingDay(day)}
                className="day-card"
                style={{ 
                  ...style,
                  backgroundColor: 'white', 
                  borderRadius: '16px', 
                  padding: '16px',
                  cursor: 'pointer',
                  minHeight: '160px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  border: '1px solid #eee'
                }}
              >
                <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{format(dateObj, 'd')}</span>
                  <span style={{ fontSize: '0.6rem', opacity: 0.3 }}>D{idx + 1}</span>
                </div>
                
                {/* Visible Anchors */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gap: '4px' }}>
                  {day.anchors.slice(0, 3).map(anchor => (
                    <div key={anchor.id} style={{ 
                      fontSize: '0.7rem', 
                      backgroundColor: 'var(--color-purple)', 
                      color: 'white', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontWeight: 700
                    }}>
                      {anchor.title}
                    </div>
                  ))}
                  {day.anchors.length > 3 && (
                    <div style={{ fontSize: '0.6rem', opacity: 0.4 }}>+{day.anchors.length - 3} more</div>
                  )}
                </div>

                <div style={{ marginTop: '10px', display: 'flex', gap: '8px', fontSize: '0.7rem', fontWeight: 700 }}>
                  <span style={{ color: 'var(--color-orange)' }}>L:{day.logistics.length}</span>
                  <span style={{ color: 'var(--color-golden)' }}>F:{day.flex.length}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* DAY EDITOR MODAL */}
        {editingDay && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}>
            <div style={{ 
              backgroundColor: '#F9F6ED', width: '100%', maxWidth: '900px', maxHeight: '95vh', 
              borderRadius: '40px', overflowY: 'auto', position: 'relative', padding: '60px'
            }}>
              <button onClick={() => setEditingDay(null)} style={{ position: 'absolute', top: '30px', right: '30px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>

              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2.5rem' }}>{format(parseISO(editingDay.date), 'EEEE, MMMM do')}</h2>
                <p style={{ opacity: 0.5 }}>Anchors, Logistics, and Flex Ideas.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                
                {/* ANCHORS SECTION */}
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '30px', border: '2px solid var(--color-purple)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--color-purple)' }}>Anchors</h3>
                    <button onClick={() => setIsAddingItem('anchors')} style={{ border: 'none', background: '#F9F6ED', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer' }}>+</button>
                  </div>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {editingDay.anchors.map(item => (
                      <div key={item.id} style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 800 }}>{item.title}</span>
                          {item.time && <span style={{ fontSize: '0.8rem', color: 'var(--color-purple)' }}>{item.time}</span>}
                        </div>
                        {item.details && <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: 0 }}>{item.details}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '30px' }}>
                  {/* LOGISTICS */}
                  <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '1.2rem', color: 'var(--color-orange)' }}>Logistics</h3>
                      <button onClick={() => setIsAddingItem('logistics')} style={{ border: 'none', background: '#F9F6ED', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer' }}>+</button>
                    </div>
                    {editingDay.logistics.map(item => (
                      <div key={item.id} style={{ marginBottom: '8px', padding: '10px', backgroundColor: '#fcfcfc', border: '1px solid #eee', borderRadius: '12px', fontSize: '0.9rem' }}>
                        <strong>{item.title}</strong>
                        {item.details && <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '4px' }}>{item.details}</div>}
                      </div>
                    ))}
                  </div>

                  {/* FLEX IDEAS */}
                  <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '1.2rem', color: 'var(--color-golden)' }}>Flex Ideas</h3>
                      <button onClick={() => setIsAddingItem('flex')} style={{ border: 'none', background: '#F9F6ED', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer' }}>+</button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {editingDay.flex.map(item => (
                        <div key={item.id} style={{ padding: '6px 14px', backgroundColor: '#F9F6ED', borderRadius: '20px', fontSize: '0.85rem' }}>{item.title}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADD ITEM OVERLAY FORM */}
        {isAddingItem && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}>
            <form onSubmit={handleAddItem} style={{ 
              backgroundColor: 'white', padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '500px' 
            }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', textTransform: 'capitalize' }}>Add {isAddingItem}</h3>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 700 }}>Title</label>
                  <input name="title" autoFocus required placeholder="e.g. Boat Cruise or Flight PR123" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #eee' }} />
                </div>
                {isAddingItem === 'anchors' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 700 }}>Time (Optional)</label>
                    <input name="time" type="time" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #eee' }} />
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 700 }}>Details / Notes</label>
                  <textarea name="details" placeholder="Confirmation #s, Landing times, etc." style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #eee' }} rows="3"></textarea>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add to Trip</button>
                  <button type="button" onClick={() => setIsAddingItem(null)} className="btn btn-outline" style={{ border: 'none' }}>Cancel</button>
                </div>
              </div>
            </form>
          </div>
        )}

      </div>
    </main>
  );
}

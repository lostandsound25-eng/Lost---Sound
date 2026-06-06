'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function TripsDashboard() {
  const [session, setSession] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create trip form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTripName, setNewTripName] = useState("");
  const [homeCurrency, setHomeCurrency] = useState("USD");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const isAuthCallback = (typeof window !== 'undefined' && window.location.hash.includes('access_token')) || !!code;
    
    if (isAuthCallback) {
      setLoading(true);
    }

    const handleAuthSession = (session) => {
      if (session) {
        setSession(session);
        fetchTrips(session.user);
      } else {
        setSession(null);
        setTrips([]);
        setLoading(false);
      }
    };

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!error && data?.session) {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          handleAuthSession(data.session);
        } else {
          console.error("Code exchange failed:", error);
          setSession(null);
          setTrips([]);
          setLoading(false);
        }
      });
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleAuthSession(session);
      } else {
        setSession(null);
        setTrips([]);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        handleAuthSession(session);
      } else {
        setSession(null);
        setTrips([]);
        setLoading(false);
      }
    });

    let fallbackTimeout;
    if (isAuthCallback) {
      fallbackTimeout = setTimeout(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session) {
            window.location.href = '/tracker';
          } else {
            setLoading(false);
          }
        });
      }, 6000);
    }

    return () => {
      subscription.unsubscribe();
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
    };
  }, []);

  const fetchTrips = async (user) => {
    if (!supabase) return;
    try {
      // 1. Get trip IDs where email or user_id matches
      const { data: members, error: memErr } = await supabase
        .from('trip_members')
        .select('trip_id, role, user_id')
        .or(`user_id.eq.${user.id},email.eq.${user.email}`);
      if (memErr) throw memErr;

      if (!members || members.length === 0) {
        setTrips([]);
        return;
      }

      // If user has pending invitations where user_id is null, resolve them now!
      const unresolvedIds = members
        .filter(m => !m.user_id)
        .map(m => m.trip_id);

      if (unresolvedIds.length > 0) {
        await supabase
          .from('trip_members')
          .update({ user_id: user.id })
          .in('trip_id', unresolvedIds)
          .eq('email', user.email);
      }

      const tripIds = members.map(m => m.trip_id);

      // 2. Fetch the trip details
      const { data: tripsList, error: tripErr } = await supabase
        .from('trips')
        .select('*')
        .in('id', tripIds)
        .order('created_at', { ascending: false });
      if (tripErr) throw tripErr;

      // Merge role info
      const tripsWithRoles = tripsList.map(t => {
        const mem = members.find(m => m.trip_id === t.id);
        return {
          ...t,
          role: mem ? mem.role : 'editor'
        };
      });

      setTrips(tripsWithRoles);
    } catch (err) {
      console.error("Error fetching trips:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!newTripName.trim() || !supabase || !session) return;
    setCreating(true);
    try {
      // 1. Create trip
      const { data: tripData, error: tripErr } = await supabase
        .from('trips')
        .insert({
          name: newTripName.trim(),
          home_currency: homeCurrency,
          local_currency: homeCurrency,
          created_by: session.user.id
        })
        .select()
        .single();
      if (tripErr) throw tripErr;

      // 2. Create owner member
      const { error: memErr } = await supabase
        .from('trip_members')
        .insert({
          trip_id: tripData.id,
          user_id: session.user.id,
          email: session.user.email,
          role: "owner"
        });
      if (memErr) throw memErr;

      // Redirect to trip tracker
      window.location.href = `/tracker/trip/${tripData.id}`;
    } catch (err) {
      console.error("Create trip error:", err);
      alert(`Failed to create trip: ${err.message || JSON.stringify(err)}`);
    } finally {
      setCreating(false);
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      window.location.href = '/tracker';
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9F6ED'
      }}>
        <div style={{
          color: '#853A51',
          fontWeight: 700,
          fontSize: '1.1rem',
          fontFamily: 'system-ui, sans-serif'
        }}>Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div 
      className="tracker-container"
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100vh',
        backgroundColor: '#F9F6ED',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        color: '#1F2937',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 40px rgba(133, 58, 81, 0.03)',
        boxSizing: 'border-box'
      }}
    >
      {/* Redesigned Clean Header */}
      <header style={{
        padding: '32px 24px 20px 24px',
        backgroundColor: '#F9F6ED',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(133, 58, 81, 0.05)'
      }}>
        <div>
          <span style={{ 
            fontSize: '0.72rem', 
            fontWeight: 850, 
            color: '#E86B32', 
            textTransform: 'uppercase', 
            letterSpacing: '1.5px',
            display: 'block'
          }}>
            Lost & Sound
          </span>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 900,
            color: '#853A51',
            margin: '2px 0 0 0',
            letterSpacing: '-0.5px'
          }}>
            My Trips
          </h1>
        </div>

        {session ? (
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: '#853A51',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 16px',
              fontWeight: 750,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(133, 58, 81, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6e3043'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#853A51'}
          >
            ✈️ + New Trip
          </button>
        ) : (
          <button
            onClick={() => window.location.href = '/tracker'}
            style={{
              fontSize: '0.82rem',
              fontWeight: 750,
              color: 'white',
              backgroundColor: '#853A51',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(133, 58, 81, 0.15)'
            }}
          >
            Sign In
          </button>
        )}
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '12px 20px 40px 20px' }}>
        
        {/* LOGGED IN VIEW */}
        {session ? (
          <div>
            {trips.length === 0 ? (
              // Empty State
              <div style={{
                textAlign: 'center',
                padding: '60px 24px',
                backgroundColor: 'white',
                borderRadius: '24px',
                border: '1.5px solid rgba(133, 58, 81, 0.08)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.01)',
                marginTop: '12px'
              }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🎒</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#853A51', margin: '0 0 8px 0' }}>
                  No trips synced yet
                </h3>
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: '#6B7280', 
                  lineHeight: '1.5',
                  margin: '0 0 24px 0'
                }}>
                  Create your first collaborative trip in the cloud to track expenses and sync with partners in real-time.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    backgroundColor: '#E86B32',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontWeight: 750,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(232, 107, 50, 0.2)'
                  }}
                >
                  Create New Trip
                </button>
              </div>
            ) : (
              // Grid list of Trip Cards
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
                {trips.map(trip => (
                  <div
                    key={trip.id}
                    onClick={() => window.location.href = `/tracker/trip/${trip.id}`}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '20px',
                      padding: '20px',
                      boxShadow: '0 4px 12px rgba(133, 58, 81, 0.01)',
                      border: '1.5px solid rgba(133, 58, 81, 0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#853A51';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(133, 58, 81, 0.08)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1, paddingRight: '12px' }}>
                      <h4 style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: 800, 
                        color: '#1F2937', 
                        margin: 0,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                      }}>{trip.name}</h4>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 750,
                          color: trip.role === 'owner' ? '#E86B32' : '#853A51',
                          backgroundColor: trip.role === 'owner' ? 'rgba(232, 107, 50, 0.06)' : 'rgba(133, 58, 81, 0.06)',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {trip.role}
                        </span>
                        
                        <span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 550 }}>
                          Home: {trip.home_currency}
                        </span>
                      </div>
                    </div>
                    <span style={{ 
                      fontSize: '1.3rem', 
                      color: '#853A51',
                      opacity: 0.6,
                      fontWeight: 700 
                    }}>→</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // GUEST VIEW (Not Logged In)
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginTop: '12px'
          }}>
            {/* Elegant Auth CTA Card */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              padding: '36px 24px',
              border: '1.5px solid rgba(133, 58, 81, 0.08)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.01)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>☁️</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#853A51', margin: '0 0 8px 0' }}>
                Collaborate in the Cloud
              </h3>
              <p style={{ 
                fontSize: '0.85rem', 
                color: '#6B7280', 
                lineHeight: '1.5',
                margin: '0 0 24px 0'
              }}>
                Sign up with your email or Google account to invite travel partners, sync budgets, work offline, and back up your logs.
              </p>
              
              <button
                onClick={() => window.location.href = '/tracker'}
                style={{
                  backgroundColor: '#853A51',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontWeight: 750,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(133, 58, 81, 0.15)',
                  width: '100%',
                  boxSizing: 'border-box',
                  marginBottom: '10px'
                }}
              >
                Sign In / Create Account
              </button>

              <button
                onClick={() => window.location.href = '/tracker?demo=true'}
                style={{
                  backgroundColor: 'white',
                  color: '#853A51',
                  border: '1.5px solid rgba(133, 58, 81, 0.15)',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontWeight: 750,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                🎒 Play in Demo Trip (Offline)
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Redesigned Minimal Footer */}
      {session && (
        <footer style={{
          padding: '24px',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: '#9CA3AF',
          borderTop: '1px solid rgba(133, 58, 81, 0.05)'
        }}>
          Logged in as <strong style={{ color: '#6B7280' }}>{session.user.email}</strong>
          <span style={{ margin: '0 8px', opacity: 0.5 }}>•</span>
          <button
            onClick={handleSignOut}
            style={{
              background: 'none',
              border: 'none',
              color: '#853A51',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              fontSize: 'inherit'
            }}
          >
            Sign Out
          </button>
        </footer>
      )}

      {/* Create Trip Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '32px 24px',
            width: '100%',
            maxWidth: '360px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            border: '1px solid #E5E7EB',
            textAlign: 'center',
            animation: 'fadeInUp 0.3s ease-out'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              color: '#853A51',
              marginBottom: '16px',
              fontFamily: 'system-ui, sans-serif'
            }}>Create New Trip</h3>

            <form onSubmit={handleCreateTrip}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#4B5563', marginBottom: '6px' }}>
                    Trip Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newTripName}
                    onChange={(e) => setNewTripName(e.target.value)}
                    placeholder="e.g. Summer in Italy 🍕"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB',
                      fontSize: '0.9rem',
                      outline: 'none',
                      color: '#1F2937',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#4B5563', marginBottom: '6px' }}>
                    Home Currency (e.g. USD, EUR)
                  </label>
                  <input
                    type="text"
                    required
                    value={homeCurrency}
                    onChange={(e) => setHomeCurrency(e.target.value.toUpperCase())}
                    maxLength={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB',
                      fontSize: '0.9rem',
                      outline: 'none',
                      color: '#1F2937',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    width: '100%',
                    backgroundColor: '#853A51',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px',
                    fontWeight: 750,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(133, 58, 81, 0.15)'
                  }}
                >
                  {creating ? 'Creating...' : 'Launch Trip'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#9CA3AF',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    padding: '8px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

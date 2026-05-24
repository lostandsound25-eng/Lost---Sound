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
        window.location.href = '/tracker';
      }
    };

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!error && data?.session) {
          // Remove code from URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          handleAuthSession(data.session);
        } else {
          console.error("Code exchange failed:", error);
          window.location.href = '/tracker';
        }
      });
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleAuthSession(session);
      } else if (!isAuthCallback) {
        window.location.href = '/tracker';
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleAuthSession(session);
      } else if (!isAuthCallback) {
        window.location.href = '/tracker';
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
          color: 'var(--color-purple)',
          fontWeight: 700,
          fontSize: '1.1rem'
        }}>Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: '#F9F6ED',
      fontFamily: 'var(--font-body), system-ui, sans-serif',
      color: 'var(--color-text)',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 0 40px rgba(0,0,0,0.05)'
    }}>
      {/* Header */}
      <header style={{
        padding: '24px 20px',
        backgroundColor: 'white',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.4rem',
            fontWeight: 900,
            color: 'var(--color-purple)',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.1
          }}>My Trips</h1>
          <p style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
            Logged in as {session?.user?.email}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#9CA3AF',
            background: 'none',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '6px 12px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '24px 20px' }}>
        {/* Create Trip CTA Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
          border: '1.5px solid rgba(133, 58, 81, 0.08)',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-purple)', marginBottom: '6px' }}>
            Ready for a new adventure?
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '16px' }}>
            Create a collaborative cloud trip to track your budget with a travel partner in real-time.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: 'var(--color-orange)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontWeight: 750,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(232, 107, 50, 0.25)',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            ✈️ Create New Trip
          </button>
          <button
            onClick={() => window.location.href = '/tracker?demo=true'}
            style={{
              backgroundColor: 'white',
              color: 'var(--color-purple)',
              border: '1.5px solid rgba(133, 58, 81, 0.15)',
              borderRadius: '12px',
              padding: '12px 24px',
              fontWeight: 750,
              fontSize: '0.88rem',
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '10px'
            }}
          >
            🎒 Play in Demo Trip
          </button>
        </div>

        {/* Trips List */}
        <div>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-purple)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            All Trips ({trips.length})
          </h3>

          {trips.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#9CA3AF',
              backgroundColor: 'white',
              borderRadius: '20px',
              border: '1px solid #E5E7EB'
            }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>🎒</span>
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No cloud trips yet.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Click the button above to create one!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {trips.map(trip => (
                <div
                  key={trip.id}
                  onClick={() => window.location.href = `/tracker/trip/${trip.id}`}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    padding: '16px 20px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.01)',
                    border: '1px solid #E5E7EB',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-purple)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                >
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1F2937' }}>{trip.name}</h4>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: trip.role === 'owner' ? 'var(--color-orange)' : 'var(--color-purple)',
                      backgroundColor: trip.role === 'owner' ? 'rgba(232, 107, 50, 0.08)' : 'rgba(133, 58, 81, 0.08)',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      display: 'inline-block',
                      marginTop: '6px',
                      textTransform: 'uppercase'
                    }}>{trip.role}</span>
                  </div>
                  <span style={{ fontSize: '1.2rem', color: '#9CA3AF' }}>→</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

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
              fontSize: '1.3rem',
              fontWeight: 800,
              color: 'var(--color-purple)',
              marginBottom: '16px',
              fontFamily: 'var(--font-heading)'
            }}>Create New Trip</h3>

            <form onSubmit={handleCreateTrip}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4B5563', marginBottom: '6px' }}>
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
                      color: '#1F2937'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4B5563', marginBottom: '6px' }}>
                    Home Currency (e.g. USD, EUR, PHP)
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
                      color: '#1F2937'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    padding: '12px',
                    fontWeight: 700
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

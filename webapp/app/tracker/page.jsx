'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import TrackerApp from '../../components/TrackerApp';

export default function TrackerLandingPage() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Auth States
  const [email, setEmail] = useState('');
  const [sendingMagicLink, setSendingMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [invitedTripName, setInvitedTripName] = useState('');

  // Handle redirecting and resolving pending invites
  const handleRedirectAfterLogin = async (user) => {
    let targetUrl = '/tracker/trips';
    try {
      const pendingTripId = sessionStorage.getItem('pending_trip_id');
      if (pendingTripId) {
        if (supabase && user?.email) {
          // Resolve pending invitation matching the logged-in email
          await supabase
            .from('trip_members')
            .update({ user_id: user.id })
            .eq('email', user.email.toLowerCase().trim());
        }
        sessionStorage.removeItem('pending_trip_id');
        targetUrl = `/tracker/trip/${pendingTripId}`;
      }
    } catch (err) {
      console.error("Error resolving pending invite redirect:", err);
    }
    window.location.href = targetUrl;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forceDemo = params.get('demo') === 'true';
    if (forceDemo) {
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    // Capture pending invitations from URL
    const queryTripId = params.get('tripId');
    const queryEmail = params.get('email');

    if (queryTripId) {
      sessionStorage.setItem('pending_trip_id', queryTripId);
      if (supabase) {
        // Fetch trip name to display a personal welcome message
        supabase
          .from('trips')
          .select('name')
          .eq('id', queryTripId)
          .single()
          .then(({ data }) => {
            if (data?.name) {
              setInvitedTripName(data.name);
            }
          });
      }
    }
    if (queryEmail) {
      setEmail(queryEmail);
    }

    if (supabase) {
      const code = params.get('code');
      const isAuthCallback = (typeof window !== 'undefined' && window.location.hash.includes('access_token')) || !!code;
      if (isAuthCallback) {
        setLoading(true);
      }

      // Handle PKCE code exchange
      const handleCodeExchange = async () => {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (data?.session) {
            setIsLoggedIn(true);
            await handleRedirectAfterLogin(data.session.user);
          }
        } catch (err) {
          console.error("Code exchange failed:", err);
          setErrorMsg(err.message || "Authentication failed.");
          setLoading(false);
        }
      };

      if (code) {
        handleCodeExchange();
      }

      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session && !code) {
          setIsLoggedIn(true);
          await handleRedirectAfterLogin(session.user);
        } else if (!isAuthCallback) {
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session && !code) {
          setIsLoggedIn(true);
          setTimeout(async () => {
            await handleRedirectAfterLogin(session.user);
          }, 300);
        } else if (!isAuthCallback) {
          setLoading(false);
        }
      });

      let fallbackTimeout;
      if (isAuthCallback) {
        fallbackTimeout = setTimeout(() => {
          setLoading(false);
        }, 6000);
      }

      return () => {
        subscription.unsubscribe();
        if (fallbackTimeout) clearTimeout(fallbackTimeout);
      };
    } else {
      setLoading(false);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    if (!supabase) return;
    setErrorMsg('');
    try {
      const redirectToUrl = window.location.origin + window.location.pathname;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectToUrl
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error("Google sign in error:", err);
      setErrorMsg("Google sign in failed. Please try again.");
    }
  };

  const handleSendMagicLink = async (e) => {
    e.preventDefault();
    if (!email || !supabase) return;
    setSendingMagicLink(true);
    setErrorMsg('');
    try {
      const cleanEmail = email.trim().toLowerCase();
      const redirectToUrl = window.location.origin + window.location.pathname;
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectToUrl
        }
      });
      if (error) throw error;
      setMagicLinkSent(true);
    } catch (err) {
      console.error("Magic link send error:", err);
      setErrorMsg("Failed to send magic link. Please check your email and try again.");
    } finally {
      setSendingMagicLink(false);
    }
  };

  if (isDemoMode) {
    return <TrackerApp isDemo={true} />;
  }

  if (loading || isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9F6ED'
      }}>
        <div style={{
          color: '#853A51', // var(--color-purple)
          fontWeight: 700,
          fontSize: '1.1rem',
          fontFamily: 'system-ui, sans-serif'
        }}>Loading Tracker...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F9F6ED',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'white',
        borderRadius: '28px',
        padding: '40px 28px',
        boxShadow: '0 10px 30px rgba(133, 58, 81, 0.04)',
        border: '1px solid rgba(133, 58, 81, 0.08)',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}>
        {/* Header Logo & Branding */}
        <div style={{ marginBottom: '32px' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>✈️</span>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 900,
            color: '#853A51',
            margin: 0,
            letterSpacing: '-0.5px'
          }}>LOST & SOUND</h1>
          <p style={{
            fontSize: '0.88rem',
            color: '#6B7280',
            marginTop: '4px',
            fontWeight: 500
          }}>Travel Expense Tracker</p>
        </div>

        {/* Invited Collaboration Welcome Banner */}
        {invitedTripName && (
          <div style={{
            backgroundColor: 'rgba(133, 58, 81, 0.04)',
            border: '1px solid rgba(133, 58, 81, 0.1)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.88rem',
              color: '#853A51',
              fontWeight: 700,
              lineHeight: 1.4
            }}>
              🎒 You've been invited!
            </p>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '0.82rem',
              color: '#4B5563',
              lineHeight: 1.4
            }}>
              Sign in below to join and co-edit the trip <strong>"{invitedTripName}"</strong>.
            </p>
          </div>
        )}

        {/* Google Sign-in Option */}
        <button
          onClick={handleGoogleSignIn}
          style={{
            width: '100%',
            height: '48px',
            backgroundColor: '#ffffff',
            border: '1.5px solid #E5E7EB',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontSize: '0.92rem',
            fontWeight: 700,
            color: '#374151',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F9FAFB';
            e.currentTarget.style.borderColor = '#D1D5DB';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#E5E7EB';
          }}
        >
          {/* Inline Google G SVG Icon */}
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.69-1.55 2.69-3.85 2.69-6.57z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.23l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.34-1.59-5.05-3.73H.95v2.3C2.43 15.89 5.5 18 9 18z"/>
            <path fill="#FBBC05" d="M3.95 10.67a5.4 5.4 0 0 1 0-3.34V5.03H.95a9 9 0 0 0 0 7.94l3-2.3z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4A9 9 0 0 0 .95 5.03l3 2.3C4.66 5.17 6.65 3.58 9 3.58z"/>
          </svg>
          Sign in with Google
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '24px 0',
          color: '#D1D5DB'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
          <span style={{
            padding: '0 12px',
            fontSize: '0.78rem',
            color: '#9CA3AF',
            fontWeight: 600,
            textTransform: 'uppercase'
          }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
        </div>

        {/* Magic Link Form */}
        {magicLinkSent ? (
          <div style={{
            backgroundColor: 'rgba(52, 168, 83, 0.05)',
            border: '1px solid rgba(52, 168, 83, 0.15)',
            borderRadius: '16px',
            padding: '20px 16px',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '8px' }}>✉️</span>
            <h4 style={{ margin: '0 0 6px 0', color: '#15803d', fontSize: '0.95rem', fontWeight: 800 }}>
              Check your email!
            </h4>
            <p style={{
              margin: 0,
              fontSize: '0.8rem',
              color: '#166534',
              lineHeight: '1.5'
            }}>
              We sent a magic sign-in link to <strong>{email}</strong>.<br />
              Open the email on your device and click the link to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendMagicLink}>
            <div style={{ textAlign: 'left', marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#4B5563',
                marginBottom: '6px'
              }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '0 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #E5E7EB',
                  fontSize: '0.9rem',
                  outline: 'none',
                  color: '#1F2937',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={sendingMagicLink}
              style={{
                width: '100%',
                height: '46px',
                backgroundColor: '#853A51', // var(--color-purple)
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 750,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                boxShadow: '0 4px 10px rgba(133, 58, 81, 0.15)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6e3043'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#853A51'}
            >
              {sendingMagicLink ? 'Sending Link...' : 'Email me a Magic Link'}
            </button>
          </form>
        )}

        {/* Error Message */}
        {errorMsg && (
          <p style={{
            color: '#EF4444',
            fontSize: '0.82rem',
            fontWeight: 500,
            marginTop: '16px',
            lineHeight: 1.4
          }}>{errorMsg}</p>
        )}

        {/* Demo Mode Action */}
        <div style={{ marginTop: '32px', borderTop: '1px solid #F3F4F6', paddingTop: '24px' }}>
          <p style={{
            fontSize: '0.82rem',
            color: '#6B7280',
            margin: '0 0 12px 0'
          }}>
            Just looking around?
          </p>
          <button
            onClick={() => setIsDemoMode(true)}
            style={{
              background: 'none',
              border: '1px solid rgba(133, 58, 81, 0.25)',
              borderRadius: '12px',
              padding: '10px 20px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#853A51',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(133, 58, 81, 0.03)';
              e.currentTarget.style.borderColor = '#853A51';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(133, 58, 81, 0.25)';
            }}
          >
            🎒 Try Demo Mode (Offline)
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import TrackerApp from '../../../../components/TrackerApp';

export default function TrackerTripPage({ params }) {
  const tripId = params.id;
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!supabase || !tripId) {
      setLoading(false);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const isAuthCallback = (typeof window !== 'undefined' && window.location.hash.includes('access_token')) || !!code;

    const checkTripAccess = () => {
      supabase
        .from('trips')
        .select('id')
        .eq('id', tripId)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            alert('This trip does not exist or you do not have permission to view it.');
            window.location.href = '/tracker';
          } else {
            setAuthorized(true);
            setLoading(false);
          }
        });
    };

    if (code) {
      // Exchange PKCE code
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!error && data?.session) {
          // Remove code from URL without reloading
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          checkTripAccess();
        } else {
          console.error("Code exchange failed:", error);
          checkTripAccess(); // Try anyway, though RLS will block if not auth'd
        }
      });
    } else if (isAuthCallback) {
      // It's implicit flow hash callback, wait for onAuthStateChange to fire
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          subscription.unsubscribe();
          checkTripAccess();
        }
      });
      // Fallback timeout
      const t = setTimeout(() => {
        subscription.unsubscribe();
        checkTripAccess();
      }, 5000);
      return () => {
        subscription.unsubscribe();
        clearTimeout(t);
      };
    } else {
      checkTripAccess();
    }
  }, [tripId]);

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
        }}>Syncing with Cloud...</div>
      </div>
    );
  }

  return <TrackerApp tripId={tripId} isDemo={false} />;
}

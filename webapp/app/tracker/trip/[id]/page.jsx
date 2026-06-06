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

    const checkTripAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Store the target trip ID so we can redirect back here after login
          sessionStorage.setItem('pending_trip_id', tripId);
          window.location.href = '/tracker';
          return;
        }

        const { data, error } = await supabase
          .from('trips')
          .select('id')
          .eq('id', tripId)
          .single();

        if (error || !data) {
          alert('This trip does not exist or you do not have permission to view it.');
          window.location.href = '/tracker';
        } else {
          // Resolve any pending member invitation for this user
          if (session.user?.email) {
            await supabase
              .from('trip_members')
              .update({ user_id: session.user.id })
              .eq('email', session.user.email.toLowerCase().trim());
          }
          setAuthorized(true);
          setLoading(false);
        }
      } catch (err) {
        console.error("Access check error:", err);
        window.location.href = '/tracker';
      }
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
          checkTripAccess();
        }
      });
    } else if (isAuthCallback) {
      // Wait for session
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          subscription.unsubscribe();
          checkTripAccess();
        }
      });
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

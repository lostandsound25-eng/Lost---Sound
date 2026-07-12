'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import TrackerApp from '../../../../components/TrackerApp';

export default function TrackerTripPage({ params }) {
  const tripId = params.id;
  // Start with authorized=true if we have locally-cached trip data —
  // this renders the full app instantly on refresh instead of showing a spinner.
  // The auth check still runs in the background and will redirect if needed.
  const [isMounted, setIsMounted] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      if (typeof window !== 'undefined' && localStorage.getItem(`tracker_trip_${tripId}`)) {
        setAuthorized(true);
      }
    } catch {}

    if (!supabase || !tripId) {
      setAuthorized(true); // No supabase config — allow through (demo/dev mode)
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const isAuthCallback = (typeof window !== 'undefined' && window.location.hash.includes('access_token')) || !!code;

    const checkTripAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Not logged in — redirect to login
          sessionStorage.setItem('pending_trip_id', tripId);
          window.location.href = '/tracker';
          return;
        }

        const { data: memberData } = await supabase
          .from('trip_members')
          .select('role')
          .eq('trip_id', tripId)
          .or(`user_id.eq.${session.user.id},email.eq.${session.user.email}`)
          .maybeSingle();

        setIsReadOnly(!memberData);

        const { data, error } = await supabase
          .from('trips')
          .select('id')
          .eq('id', tripId)
          .single();

        if (error || !data) {
          const hasCache = typeof window !== 'undefined' && !!localStorage.getItem(`tracker_trip_${tripId}`);
          if (hasCache) {
            console.log("Working offline with cached data");
            setAuthorized(true);
          } else {
            alert('This trip does not exist or you do not have permission to view it.');
            window.location.href = '/tracker';
          }
        } else {
          // Resolve any pending member invitation for this user
          if (session.user?.email) {
            await supabase
              .from('trip_members')
              .update({ user_id: session.user.id })
              .eq('email', session.user.email.toLowerCase().trim());
          }
          setAuthorized(true);
        }
      } catch (err) {
        console.error("Access check error:", err);
        if (typeof window !== 'undefined' && localStorage.getItem(`tracker_trip_${tripId}`)) {
          setAuthorized(true);
        } else {
          window.location.href = '/tracker';
        }
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
      // Wait for session after OAuth redirect
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
      // Normal page load — check auth in background
      checkTripAccess();
    }
  }, [tripId]);

  if (!isMounted || !authorized) {
    // Only show this on first-ever visit with no local cache
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
        }}>Loading...</div>
      </div>
    );
  }

  return <TrackerApp tripId={tripId} isDemo={false} isReadOnly={isReadOnly} />;
}

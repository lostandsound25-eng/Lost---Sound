'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import TrackerApp from '../../components/TrackerApp';

export default function TrackerLandingPage() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forceDemo = params.get('demo') === 'true';
    if (forceDemo) {
      setIsDemoMode(true);
      setLoading(false);
      return;
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
            window.location.href = '/tracker/trips';
          }
        } catch (err) {
          console.error("Code exchange failed:", err);
          setLoading(false);
        }
      };

      if (code) {
        handleCodeExchange();
      }

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && !code) {
          setIsLoggedIn(true);
          window.location.href = '/tracker/trips';
        } else if (!isAuthCallback) {
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session && !code) {
          setIsLoggedIn(true);
          setTimeout(() => {
            window.location.href = '/tracker/trips';
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
          color: 'var(--color-purple)',
          fontWeight: 700,
          fontSize: '1.1rem'
        }}>Loading Tracker...</div>
      </div>
    );
  }

  return <TrackerApp isDemo={true} />;
}

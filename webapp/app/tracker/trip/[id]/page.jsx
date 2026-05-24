'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import TrackerApp from '../../../../components/TrackerApp';

export default function TrackerTripPage({ params }) {
  const tripId = params.id;
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (supabase && tripId) {
      supabase
        .from('trips')
        .select('id')
        .eq('id', tripId)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            alert('This trip does not exist or has been deleted.');
            window.location.href = '/tracker';
          } else {
            setAuthorized(true);
            setLoading(false);
          }
        });
    } else {
      setLoading(false);
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

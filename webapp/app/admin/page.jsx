'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminPortal() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-cream)' }}>
        <p style={{ color: 'var(--color-purple)', fontWeight: 600, fontSize: '1.125rem' }}>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-cream)', padding: '1rem' }}>
        <div style={{ maxWidth: '400px', width: '100%', backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid rgba(242, 174, 48, 0.2)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-purple)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>Admin Portal</h1>
            <p style={{ color: '#6B7280' }}>Sign in to manage your itineraries.</p>
          </div>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E5E7EB', outline: 'none', transition: 'all 0.2s' }}
                placeholder="admin@lostandsound.com"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E5E7EB', outline: 'none', transition: 'all 0.2s' }}
                placeholder="••••••••"
                required
              />
            </div>
            
            {error && (
              <div style={{ padding: '0.75rem', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '12px', fontSize: '0.875rem', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-cream)' }}>
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', height: '4rem', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-purple)', fontFamily: 'var(--font-heading)' }}>Lost & Sound Admin</h1>
            <button 
              onClick={handleLogout}
              style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #F3F4F6', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', fontFamily: 'var(--font-heading)' }}>Itineraries Dashboard</h2>
              <p style={{ color: '#6B7280', marginTop: '0.25rem' }}>Manage and publish your travel guides here.</p>
            </div>
            <button className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', borderRadius: '12px', fontWeight: 600 }}>
              + New Itinerary
            </button>
          </div>
          
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
            <div style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'var(--color-cream)', color: 'var(--color-golden)' }}>
              <svg style={{ width: '2rem', height: '2rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 500, color: '#111827', marginBottom: '0.25rem' }}>No itineraries yet</h3>
            <p style={{ maxWidth: '24rem', margin: '0 auto' }}>Get started by creating your very first travel itinerary. It will instantly appear on the live website!</p>
          </div>
        </div>
      </main>
    </div>
  );
}

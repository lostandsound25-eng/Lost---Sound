'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function KeepInTouchForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      if (!supabase) {
        console.warn('Supabase is not configured. Please add environment variables to Vercel.');
        setStatus('error');
        return;
      }

      const { error } = await supabase
        .from('leads')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') { // Postgres unique violation code
          setStatus('success'); // Already subscribed
        } else {
          throw error;
        }
      } else {
        setStatus('success');
      }
      setEmail('');
    } catch (error) {
      console.error('Error submitting email:', error);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-[#853A51] p-4 rounded-xl text-center">
        <p className="text-[#F9F6ED] font-semibold">Thanks for keeping in touch! Check your email soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="email" 
          placeholder="Your email address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ flex: 1, padding: '12px 16px', borderRadius: '30px', border: 'none', outline: 'none' }} 
          required 
          disabled={status === 'loading'}
        />
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ padding: '10px 20px', opacity: status === 'loading' ? 0.7 : 1 }}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Sending...' : 'Subscribe'}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-[#F2AE30] text-sm mt-1 text-center">Oops! Something went wrong. Please try again.</p>
      )}
    </form>
  );
}

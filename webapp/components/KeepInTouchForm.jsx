'use client';
import { useState } from 'react';

export default function KeepInTouchForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');
    
    // For now, we'll just simulate a success message since we are disregarding Supabase
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1000);
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
    </form>
  );
}

'use client';
import { useState } from 'react';

export default function Questionnaire() {
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    
    // Simulate submission for now
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  };

  if (status === 'success') {
    return (
      <main style={{ padding: '120px 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <h1 style={{ fontSize: '3rem', color: 'var(--color-purple)', marginBottom: '1.5rem' }}>We've Got It!</h1>
          <p style={{ fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Thanks for sharing your trip dreams with us. We'll review your details and get back to you within 24-48 hours with next steps.
          </p>
          <div style={{ padding: '30px', backgroundColor: '#F9F6ED', borderRadius: '30px' }}>
            <p style={{ fontWeight: 600 }}>What happens next?</p>
            <p>We'll send you a link to finalize your Tier selection and payment, then we start planning!</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '120px 0 80px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="mb-5">
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Tell us about your trip</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
            Fill this out and we'll start crafting your personalized Lost & Sound experience.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Your Name</label>
              <input type="text" required style={{ width: '100%', padding: '12px 20px', borderRadius: '15px', border: '1px solid #ddd' }} />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email Address</label>
              <input type="email" required style={{ width: '100%', padding: '12px 20px', borderRadius: '15px', border: '1px solid #ddd' }} />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Where are you thinking of going?</label>
            <input type="text" placeholder="e.g. Northern Italy, Thailand, Colorado..." style={{ width: '100%', padding: '12px 20px', borderRadius: '15px', border: '1px solid #ddd' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Estimated Dates / Duration</label>
              <input type="text" placeholder="e.g. Two weeks in September" style={{ width: '100%', padding: '12px 20px', borderRadius: '15px', border: '1px solid #ddd' }} />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Budget Vibe</label>
              <select style={{ width: '100%', padding: '12px 20px', borderRadius: '15px', border: '1px solid #ddd', backgroundColor: 'white' }}>
                <option>Budget-friendly (Hostels & Hidden Gems)</option>
                <option>Balanced (Boutique & Local)</option>
                <option>Luxury (High-end & Seamless)</option>
                <option>Not sure yet</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>What's the vibe of this trip?</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['Adventure', 'Relaxation', 'Foodie', 'Culture', 'Off-the-beaten-path', 'Social'].map((vibe) => (
                <label key={vibe} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '8px 16px', 
                  border: '1px solid #ddd', 
                  borderRadius: '20px', 
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}>
                  <input type="checkbox" /> {vibe}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Anything else we should know?</label>
            <textarea rows="4" placeholder="Specific interests, dietary needs, must-see spots..." style={{ width: '100%', padding: '12px 20px', borderRadius: '15px', border: '1px solid #ddd' }}></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem', alignSelf: 'start' }} disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Sending...' : 'Send to Lost & Sound'}
          </button>
        </form>
      </div>
    </main>
  );
}

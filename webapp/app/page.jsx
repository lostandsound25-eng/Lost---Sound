'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StorySection from '../components/StorySection';
import KeepInTouchForm from '../components/KeepInTouchForm';

export default function Home() {
  const [showTrackerModal, setShowTrackerModal] = useState(false);
  const router = useRouter();

  const handleTrackerSuccess = () => {
    // Small delay for user to see success message, then redirect
    setTimeout(() => {
      router.push('/tracker');
    }, 1500);
  };

  return (
    <main>
      <section className="hero">
        <div className="container hero-split">
          <div className="hero-text">
            <h1 style={{ lineHeight: 1 }}>Lost <br/>& Sound</h1>
            <p>Travel the world without burning out or breaking the bank.</p>
            <div className="hero-btns">
              <Link href="/itineraries" className="btn btn-primary">Plan a Trip</Link>
              <Link href="/blog" className="btn btn-secondary">Read the Blog</Link>
            </div>
          </div>
          <div className="hero-visuals">
            <img src="/assets/hj-colorado-foliage.jpg" alt="Julie and Harry in Colorado" className="blob-shape-1" />
            <img src="/assets/ireland.png" alt="Exploring Ireland" className="blob-shape-2" />
          </div>
        </div>
      </section>

      <section className="social-proof">
        <div className="container">
          <p>20,000+ MILES TRAVELED • 4 CONTINENTS • 1 MISSION</p>
        </div>
      </section>

      <StorySection isExcerpt={true} />

      {/* NOMAD TRACKER SPOTLIGHT */}
      <section style={{ backgroundColor: 'var(--color-bg)', padding: '80px 0' }}>
        <div className="container">
          <div style={{ 
            backgroundColor: 'var(--color-purple)', 
            borderRadius: 'var(--radius-card)', 
            padding: '60px 40px',
            color: 'white',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
            boxShadow: '0 30px 60px rgba(133, 58, 81, 0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div>
              <h2 style={{ color: 'var(--color-golden)', fontSize: '3rem', marginBottom: '1.5rem' }}>The Nomad Tracker</h2>
              <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', opacity: 0.9 }}>
                The one piece of advice we have for anyone on the road is to keep going. Log your spend, track your budget, and keep your journey sound.
              </p>
              <button 
                onClick={() => setShowTrackerModal(true)}
                className="btn btn-primary" 
                style={{ backgroundColor: 'var(--color-golden)', color: 'var(--color-purple)', padding: '16px 40px', border: 'none' }}
              >
                Get Free Access →
              </button>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {/* SNEAK PEEK UI */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.5rem' }}>🥗</span>
                <span style={{ fontWeight: 800 }}>$15.50</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.5rem' }}>🚕</span>
                <span style={{ fontWeight: 800 }}>$5.00</span>
              </div>
              <div style={{ height: '2px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '20px 0' }}></div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Total Today</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-golden)', margin: 0 }}>$20.50</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEAD CAPTURE MODAL */}
      {showTrackerModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(133, 58, 81, 0.9)', 
          backdropFilter: 'blur(10px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '50px 40px', 
            borderRadius: '40px', 
            maxWidth: '500px', 
            width: '100%',
            position: 'relative',
            textAlign: 'center'
          }}>
            <button 
              onClick={() => setShowTrackerModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-purple)' }}
            >
              ✕
            </button>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🧭</div>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--color-purple)', marginBottom: '15px' }}>Unlock the Tracker</h2>
            <p style={{ marginBottom: '30px', opacity: 0.8, fontSize: '1.1rem' }}>
              Enter your email to unlock the Nomad Tracker. We'll also send you a quick guide on how to best use it on the road!
            </p>
            <KeepInTouchForm onSuccess={handleTrackerSuccess} />
          </div>
        </div>
      )}

      <section style={{ backgroundColor: 'var(--color-golden)', borderRadius: '80px 80px 0 0', padding: '120px 0' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 style={{ fontSize: '3.5rem' }}>Where to next?</h2>
            <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>Tried, tested, and perfectly paced itineraries.</p>
          </div>

          <div className="cards-grid">
            <div className="card">
              <div className="card-img-container">
                <img src="/assets/hj-cottonwood.jpg" alt="Vegas to Denver Road Trip" />
              </div>
              <div className="card-content">
                <h3>Vegas to Denver</h3>
                <p>7 Days of red rocks, national parks, and epic mountain passes.</p>
              </div>
            </div>

            <div className="card">
              <div className="card-img-container">
                <img src="/assets/ireland.png" alt="Ireland North Coast" />
              </div>
              <div className="card-content">
                <h3>Ireland's North</h3>
                <p>Coastal cliffs, ancient causeways, and legendary pubs.</p>
              </div>
            </div>

            <div className="card">
              <div className="card-img-container">
                <img src="/assets/pakse_loop.jpg" alt="Laos Pakse Loop" />
              </div>
              <div className="card-content">
                <h3>The Pakse Loop</h3>
                <p>3 Days, 2 wheels, and countless waterfalls in Southern Laos.</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-5">
            <Link href="/itineraries" className="btn btn-outline">Explore All Itineraries</Link>
          </div>
        </div>
      </section>

      <section className="conversion-section">
        <div className="container">
          <h2 style={{ color: 'var(--color-purple)' }}>Let's Venture Forth.</h2>
          <p>Ready to start planning your next journey? We're here to help you get lost (and stay sound).</p>
          <div className="hero-btns" style={{ justifyContent: 'center' }}>
            <Link href="/start-planning" className="btn btn-primary">Start Planning</Link>
            <Link href="/work-with-us" className="btn btn-outline">Work with Us</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

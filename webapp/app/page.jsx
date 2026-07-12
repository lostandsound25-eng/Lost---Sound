import Link from 'next/link'
import StorySection from '../components/StorySection'

export default function Home() {
  return (
    <>
      <header className="hero">
        <div className="container hero-split">
          <div className="hero-text">
            <h1 style={{ fontSize: '5rem', lineHeight: '1.05', marginBottom: '2rem' }}>
              Sharing our journey,<br />
              <span style={{ color: 'var(--color-purple)' }}>to simplify yours.</span>
            </h1>
            <h2 style={{ 
              fontSize: '2rem', 
              fontFamily: 'var(--font-heading)', 
              color: 'var(--color-golden)', 
              marginBottom: '1rem',
              fontWeight: 600
            }}>
              This site is everything we wish we knew, all in one place.
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '3rem', color: 'var(--color-text)', lineHeight: 1.8, maxWidth: '650px' }}>
              Explore our <Link href="/blog" style={{ display: 'inline-block', backgroundColor: 'var(--color-golden)', color: 'white', padding: '2px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem', margin: '0 4px', textTransform: 'uppercase' }}>blog</Link> for tips, recommendations, and honest insights. Browse our curated <Link href="/gallery" style={{ display: 'inline-block', backgroundColor: 'var(--color-purple)', color: 'white', padding: '2px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem', margin: '0 4px', textTransform: 'uppercase' }}>travel gallery</Link> for visual inspiration and highlights of our journeys. 
              <br /><br />
              Or, if you are feeling overwhelmed and want help structuring your journey sustainably, we offer 1-on-1 strategy calls to help you curate your own unforgettable route.
            </p>
            <div className="hero-btns" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <Link href="/start-planning" className="btn btn-primary">Start Planning</Link>
              <Link href="/gallery" className="btn btn-secondary">Gallery</Link>
            </div>
          </div>
          <div className="hero-visuals">
            <img src="/assets/hj-cottonwood.jpg" alt="Couple traveling" className="blob-shape-1" />
            <img src="/assets/rice-terraces.jpg" alt="Temple" className="blob-shape-2" />
          </div>
        </div>
      </header>

      <section className="social-proof">
        <p>Trusted by weary planners looking for a better way to travel</p>
      </section>

      <StorySection isExcerpt={true} />

      <section style={{ backgroundColor: 'var(--color-purple)', color: 'white', borderRadius: '80px 80px 0 0', padding: '120px 24px', overflow: 'hidden' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'row', gap: '60px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Left Column: Copy */}
          <div style={{ flex: '1 1 400px', minWidth: '320px' }}>
            <span style={{
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontSize: '0.9rem',
              fontWeight: 800,
              color: 'var(--color-golden)',
              display: 'block',
              marginBottom: '10px'
            }}>
              Now Live in Beta
            </span>
            <h2 style={{ fontSize: '3.5rem', color: 'white', margin: '0 0 20px 0', lineHeight: '1.1' }}>
              Lost & Sound Tracks
            </h2>
            <p style={{ fontSize: '1.25rem', fontWeight: 650, color: 'rgba(255,255,255,0.9)', marginBottom: '30px', lineHeight: '1.4' }}>
              Remember where you went, stay on track of what you spent. A companion app to journal your travel experiences.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem' }}>📸</span>
                <div>
                  <h4 style={{ color: 'var(--color-golden)', fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px 0' }}>Journal Your Travel Stories</h4>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
                    Log local destinations, snap photos, write logs, and organize your trip chronologically in a collaborative feed.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem' }}>💸</span>
                <div>
                  <h4 style={{ color: 'var(--color-golden)', fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px 0' }}>Real-Time Expense Tracking</h4>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
                    Track multi-currency transactions, split costs with partners in real-time, and analyze spending by category.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem' }}>🌍</span>
                <div>
                  <h4 style={{ color: 'var(--color-golden)', fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px 0' }}>Public Discover Feed</h4>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
                    Make your tracks public so others can inspect route prices instantly converted to their preferred viewer currency.
                  </p>
                </div>
              </div>
            </div>

            <Link href="/tracker" className="btn btn-primary" style={{
              backgroundColor: 'var(--color-golden)',
              color: 'var(--color-purple)',
              padding: '16px 36px',
              fontSize: '1.1rem',
              fontWeight: 800,
              borderRadius: '30px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              boxShadow: '0 10px 25px rgba(232, 180, 100, 0.25)',
              textDecoration: 'none'
            }}>
              🚀 Try Tracks Companion App
            </Link>
          </div>

          {/* Right Column: Screenshot/Mockup */}
          <div style={{
            flex: '1 1 350px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}>
            <div style={{
              position: 'relative',
              borderRadius: '32px',
              overflow: 'hidden',
              boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
              border: '6px solid rgba(255, 255, 255, 0.1)',
              maxWidth: '100%'
            }}>
              <img
                src="/assets/app_mockup.png"
                alt="Lost & Sound Tracks App Mockup"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  transform: 'scale(1.01)'
                }}
              />
            </div>
          </div>

        </div>
      </section>

      <section className="conversion-section" style={{ backgroundColor: 'var(--color-purple)', padding: '100px 24px', textAlign: 'center', color: 'white' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', color: 'white' }}>
            Want Help Building Your Own Route?
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '1.5rem', opacity: 0.9 }}>
            Planning long-term travel can get overwhelming fast. If you need help structuring your trip sustainably, avoiding burnout, and making confident route decisions...
          </p>
          <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', opacity: 0.9 }}>
            …we offer custom strategy calls based on the exact systems we use to travel full-time.
          </p>
          <Link href="/start-planning" className="btn btn-primary" style={{ backgroundColor: 'white', color: 'var(--color-purple)', padding: '16px 32px', fontSize: '1.2rem' }}>
            Learn More Here
          </Link>
        </div>
      </section>
    </>
  )
}

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

      <section style={{ backgroundColor: 'var(--color-purple)', color: 'white', borderRadius: '80px 80px 0 0', padding: '100px 24px', overflow: 'hidden' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '60px', maxWidth: '800px', margin: '0 auto 60px' }}>
            <span style={{
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: 'var(--color-golden)',
              display: 'block',
              marginBottom: '10px'
            }}>
              Free Travel Companion App
            </span>
            <h2 style={{ fontSize: '3rem', color: 'white', margin: '0 0 20px 0', fontFamily: 'var(--font-heading)' }}>
              Lost & Sound Tracks
            </h2>
            <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)', lineHeight: '1.6', margin: '0 0 16px' }}>
              Unlike cumbersome, battery-draining trackers like Polarsteps, Tracks is designed to be lightweight, responsive, and acts as a beautiful memory bank of your trips. 
            </p>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.75)', lineHeight: '1.6', margin: '0 0 30px' }}>
              It is a completely free companion tool designed to make budgeting and journaling travel experiences easy, offline-first, and fun to look back on and share with friends and family.
            </p>
            <Link href="/tracker" className="btn btn-primary" style={{
              backgroundColor: 'var(--color-golden)',
              color: 'var(--color-purple)',
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: 800,
              borderRadius: '30px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 10px 25px rgba(232, 180, 100, 0.2)'
            }}>
              🚀 Open Free Tracks App
            </Link>
          </div>

          {/* Feature Showcase Grid (2x2) */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '40px',
            marginTop: '40px'
          }}>
            
            {/* Feature 1 */}
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.03)', 
              borderRadius: '24px', 
              padding: '30px', 
              border: '1.5px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: '120px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', border: '2.5px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <img src="/assets/screenshot_dashboard.png" alt="Dashboard" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-golden)', textTransform: 'uppercase', letterSpacing: '1px' }}>Core Tagline</span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 850, color: 'white', margin: '6px 0 10px', lineHeight: '1.25' }}>
                    Remember where you went. Stay on top of what you spent.
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
                    Tracks serves as a beautiful memory bank. Log daily stats, currencies, and budgets manually without background processes draining your battery.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.03)', 
              borderRadius: '24px', 
              padding: '30px', 
              border: '1.5px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: '120px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', border: '2.5px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <img src="/assets/screenshot_log_expense.png" alt="Log Expense" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-golden)', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Logging</span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 850, color: 'white', margin: '6px 0 10px', lineHeight: '1.25' }}>
                    Lightning-fast expensing & "Worth it" flags.
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
                    Log multi-currency details completely offline. Use our signature "Worth It" star to tag whenever a local deal, meal, or splurge was genuinely worth the money.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.03)', 
              borderRadius: '24px', 
              padding: '30px', 
              border: '1.5px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: '120px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', border: '2.5px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <img src="/assets/screenshot_plan.png" alt="Plan" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-golden)', textTransform: 'uppercase', letterSpacing: '1px' }}>Itinerary planning</span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 850, color: 'white', margin: '6px 0 10px', lineHeight: '1.25' }}>
                    Stay flexible by planning your forward-looking itinerary.
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
                    Map out daily pacing, targets, and notes day-by-day without being locked into rigid planner schedules.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.03)', 
              borderRadius: '24px', 
              padding: '30px', 
              border: '1.5px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: '120px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', border: '2.5px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <img src="/assets/screenshot_history.png" alt="History" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-golden)', textTransform: 'uppercase', letterSpacing: '1px' }}>Memory search</span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 850, color: 'white', margin: '6px 0 10px', lineHeight: '1.25' }}>
                    Fast search & instant cost retrieval.
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
                    Search past expenses to recall flight departure details, check lodging addresses, look up flight times, or share cost details.
                  </p>
                </div>
              </div>
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

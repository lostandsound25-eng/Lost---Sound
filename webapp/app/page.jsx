import Link from 'next/link'
import StorySection from '@/components/StorySection'

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
              Explore our <Link href="/blog" style={{ display: 'inline-block', backgroundColor: 'var(--color-golden)', color: 'white', padding: '2px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem', margin: '0 4px', textTransform: 'uppercase' }}>blog</Link> for tips, recommendations, and honest insights. Use our tried-and-true free <Link href="/itineraries" style={{ display: 'inline-block', backgroundColor: 'var(--color-purple)', color: 'white', padding: '2px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem', margin: '0 4px', textTransform: 'uppercase' }}>itineraries</Link> to take the guesswork out of planning your trip. 
              <br /><br />
              Or, if you would rather not do the planning yourself, we can do it with you. Book your free 15-minute call with us to discuss your next trip.
            </p>
            <div className="hero-btns" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <Link href="/start-planning" className="btn btn-primary">Start Planning</Link>
              <Link href="/itineraries" className="btn btn-secondary">Itineraries</Link>
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

      <StorySection />

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
                <h3>Ireland's North Coast</h3>
                <p>7 Days along the Wild Atlantic Way and the Giant's Causeway.</p>
              </div>
            </div>

            <div className="card">
              <div className="card-img-container">
                <img src="/assets/rice-terraces.jpg" alt="Thailand Adventure" />
              </div>
              <div className="card-content">
                <h3>Thailand Immersive</h3>
                <p>3 Weeks from Bangkok's energy to the tranquil islands of the South.</p>
              </div>
            </div>
          </div>

          <div className="text-center" style={{ marginTop: '60px' }}>
            <Link href="/itineraries" className="btn btn-outline" style={{ background: 'white' }}>View All Trips</Link>
          </div>
        </div>
      </section>

      <section className="conversion-section">
        <h2>Want us to plan this for you?</h2>
        <p>We tailor these trips to your dates, budget, and travel style.</p>
        <Link href="/start-planning" className="btn btn-primary" style={{ background: 'var(--color-purple)', color: 'white' }}>Book a Free 15-Min Call</Link>
      </section>
    </>
  )
}

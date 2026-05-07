import Link from 'next/link'

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
            <p style={{ fontSize: '1.2rem', marginBottom: '3rem', color: 'var(--color-text)', lineHeight: 1.6, maxWidth: '650px' }}>
              Explore our blog for tips, recommendations, and honest insights. Use our tried-and-true free itineraries to take the guesswork out of planning your trip. Or, if you would rather not do the planning yourself, we can do it with you. Book your free 15-minute call with us to discuss your next trip.
            </p>
            <div className="hero-btns" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <Link href="/start-planning" className="btn btn-primary">Start Planning</Link>
              <Link href="/itineraries" className="btn btn-secondary">Explore Destinations</Link>
            </div>
          </div>
          <div className="hero-visuals">
            <img src="/assets/H&J_Cottonwood_pass.jpg" alt="Couple traveling" className="blob-shape-1" />
            <img src="/assets/rice terraces ha giang.jpg" alt="Temple" className="blob-shape-2" />
          </div>
        </div>
      </header>

      <section className="social-proof">
        <p>Trusted by weary planners looking for a better way to travel</p>
      </section>

      <section className="container" style={{ padding: '80px 24px' }}>
        <div className="split-section">
          <div className="split-content">
            <h2>Who are we?</h2>
            <p className="mb-4" style={{ fontSize: '1.2rem' }}>
              We're a couple of travelers who realized that seeing the world shouldn't feel like a chore. After years of navigating the chaotic middle-ground between budget backpacking and luxury tours, we created Lost & Sound to help others find that perfect balance of adventure and comfort.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link href="/about" style={{ fontWeight: 600, color: 'var(--color-orange)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Read our full story <span style={{ fontSize: '1.2rem' }}>→</span>
              </Link>
            </div>
          </div>
          <div>
            <img src="/assets/ireland.png" alt="Who we are" className="organic-image" style={{ height: '450px' }} />
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: 'var(--color-golden)', borderRadius: '80px 80px 0 0', padding: '120px 0' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 style={{ fontSize: '3.5rem' }}>Where to next?</h2>
            <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>Tried, tested, and perfectly paced itineraries.</p>
          </div>

          <div className="cards-grid">
            <div className="card">
              <div className="card-img-container">
                <img src="/assets/asia.png" alt="Southeast Asia Temple" />
              </div>
              <div className="card-content">
                <h3>Southeast Asia</h3>
                <p>Culture, nature, and incredible food, without the backpacker dorms.</p>
              </div>
            </div>

            <div className="card">
              <div className="card-img-container">
                <img src="/assets/ireland.png" alt="Ireland Coast" />
              </div>
              <div className="card-content">
                <h3>Ireland</h3>
                <p>Dramatic coasts, cozy pubs, and the ultimate scenic road trip.</p>
              </div>
            </div>

            <div className="card">
              <div className="card-img-container">
                <img src="/assets/hero.png" alt="Greece" />
              </div>
              <div className="card-content">
                <h3>Greece & Utah</h3>
                <p>Perfect pacing for European coastlines and American deserts.</p>
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

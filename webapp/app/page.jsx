import Link from 'next/link'

export default function Home() {
  return (
    <>
      <header className="hero" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="container hero-split">
          <div className="hero-text">
            <h1 style={{ fontSize: '4.5rem' }}>Lost in the world,<br/>Sound in the journey.</h1>
            <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', color: 'var(--color-text)', lineHeight: 1.6 }}>
              Travel the world without burning out or breaking the bank. We plan, you simply pack and enjoy. Say goodbye to 3 AM bus rides and 40-tab planning sessions, and say hello to comfortable boutique stays and authentic experiences.
            </p>
            <div className="hero-btns" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/start-planning" className="btn btn-primary">Start Planning</Link>
              <Link href="/itineraries" className="btn btn-outline">Explore Destinations</Link>
            </div>
          </div>
          <div className="hero-visuals">
            <img src="/assets/hero.png" alt="Couple traveling" className="blob-shape-1" />
            <img src="/assets/asia.png" alt="Temple" className="blob-shape-2" />
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

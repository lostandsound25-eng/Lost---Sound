import Link from 'next/link';

export default function ItinerariesPage() {
  return (
    <main>
      <section className="container" style={{ padding: '80px 24px' }}>
        <div className="text-center mb-5">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--color-purple)' }}>Free Itineraries</h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', color: '#666' }}>
            Tested and perfected routes that balance adventure with comfort. Explore our favorite trips.
          </p>
        </div>

        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#FAFAFA', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--color-purple)', marginBottom: '1rem' }}>Check back soon!</h3>
          <p style={{ color: '#666' }}>We are currently migrating our itineraries to WordPress. Stay tuned!</p>
        </div>
      </section>

      <section className="conversion-section" style={{ backgroundColor: 'var(--color-cream)', padding: '80px 24px', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)' }}>
            Want us to plan this for you?
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#666' }}>
            We tailor these trips to your dates, budget, and travel style.
          </p>
          <Link href="/start-planning" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
            Book a Free 15-Min Call
          </Link>
        </div>
      </section>
    </main>
  );
}

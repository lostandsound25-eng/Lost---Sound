import { supabase } from '../../../lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ItineraryDetail({ params }) {
  const { slug } = params;

  const { data: itinerary } = await supabase
    .from('itineraries')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!itinerary) {
    notFound();
  }

  const blocks = itinerary.content?.blocks || [];

  return (
    <main>
      <header 
        className="itinerary-hero" 
        style={{
          background: `linear-gradient(rgba(31, 61, 43, 0.4), rgba(31, 61, 43, 0.8)), url('${itinerary.hero_image_url || '/assets/asia.png'}') center/cover`,
          padding: '120px 24px',
          textAlign: 'center'
        }}
      >
        <div className="container" style={{ color: 'white' }}>
          <h1 style={{ color: 'white', fontSize: '3.5rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>{itinerary.title}</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>{itinerary.destination} • {itinerary.duration_days} Days</p>
        </div>
      </header>

      <div className="container" style={{ padding: '80px 24px' }}>
        <div className="route-overview mb-5" style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)' }}>Overview</h2>
          <p style={{ fontSize: '1.1rem', maxWidth: '800px', marginBottom: '2rem' }}>
            {itinerary.description}
          </p>
        </div>

        <div className="split-section" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px', alignItems: 'start' }}>
          <div>
            <h2 style={{ marginBottom: '2rem', color: 'var(--color-purple)', fontFamily: 'var(--font-heading)' }}>The Route</h2>
            
            {blocks.map((block, index) => (
              <div key={index} className="day-breakdown" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--color-orange)', marginBottom: '0.5rem' }}>
                  {block.label}: {block.title}
                </h3>
                <p style={{ fontWeight: 600, color: '#666', marginBottom: '0.5rem' }}>📍 {block.location}</p>
                <p style={{ lineHeight: '1.6' }}>{block.description}</p>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: 'var(--color-cream)', padding: '40px', borderRadius: '16px', border: '1px solid rgba(242, 174, 48, 0.2)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-purple)' }}>About This Route</h3>
            <p style={{ marginBottom: '1rem' }}>
              This is a custom-designed flow built specifically by Lost & Sound to balance adventure with comfort.
            </p>
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ color: 'var(--color-orange)', marginBottom: '0.5rem' }}>Want changes?</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>We can completely customize this exact itinerary for your specific dates, group size, and budget.</p>
              <Link href="/start-planning" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', padding: '10px' }}>
                Customize My Trip
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="conversion-section" style={{ backgroundColor: 'var(--color-purple)', padding: '80px 24px', textAlign: 'center', color: 'white' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)', color: 'white' }}>Want this trip planned for you?</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
            We can book these exact spots, arrange transfers, and build an app-based itinerary just for you.
          </p>
          <Link href="/start-planning" className="btn btn-primary" style={{ backgroundColor: 'white', color: 'var(--color-purple)' }}>
            Book a Free 15-Min Call
          </Link>
        </div>
      </section>
    </main>
  );
}

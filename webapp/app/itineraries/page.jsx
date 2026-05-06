import { supabase } from '../../lib/supabase';
import Link from 'next/link';

// Optional: Revalidate this page every 60 seconds or on-demand
export const dynamic = 'force-dynamic';

export default async function ItinerariesPage() {
  const { data: itineraries, error } = await supabase
    .from('itineraries')
    .select('title, slug, destination, duration_days, description, hero_image_url')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  return (
    <main>
      <section className="container" style={{ padding: '80px 24px' }}>
        <div className="text-center mb-5">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--color-purple)' }}>Free Itineraries</h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', color: '#666' }}>
            Tested and perfected routes that balance adventure with comfort. Explore our favorite trips.
          </p>
        </div>

        {error && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
            <p>Error loading itineraries. Please try again later.</p>
          </div>
        )}

        {itineraries && itineraries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#FAFAFA', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-purple)', marginBottom: '1rem' }}>Check back soon!</h3>
            <p style={{ color: '#666' }}>We are currently building out our collection of free itineraries.</p>
          </div>
        )}

        <div className="cards-grid">
          {itineraries?.map((itinerary) => (
            <div className="card" key={itinerary.slug}>
              <div className="card-img-container">
                {/* Fallback to placeholder if no image URL is provided yet */}
                <img 
                  src={itinerary.hero_image_url || '/assets/hero.png'} 
                  alt={itinerary.destination} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="card-content">
                <h3 style={{ color: 'var(--color-purple)' }}>{itinerary.title}</h3>
                <p>{itinerary.description}</p>
                <Link href={`/itineraries/${itinerary.slug}`} className="btn btn-secondary" style={{ display: 'inline-block', marginTop: '1rem' }}>
                  View Itinerary
                </Link>
              </div>
            </div>
          ))}
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

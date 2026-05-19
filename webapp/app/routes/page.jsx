import Link from 'next/link';

// Enable ISR: Revalidate the page every 60 seconds
export const revalidate = 60;

// Helper to find the first image in HTML content if featured image is missing
function getFirstImageFromContent(htmlContent) {
  const match = htmlContent.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}

async function getItineraries() {
  try {
    const res = await fetch(
      'https://public-api.wordpress.com/rest/v1.1/sites/lostandsoundtravel.wordpress.com/posts?category=itineraries',
      { next: { revalidate: 60 } }
    );
    
    if (!res.ok) {
      throw new Error(`WordPress API responded with status: ${res.status}`);
    }

    const data = await res.json();
    return data.posts || [];
  } catch (err) {
    console.error('Error fetching itineraries:', err);
    return [];
  }
}

export default async function ItinerariesPage() {
  const itineraries = await getItineraries();

  return (
    <main style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      <section className="container" style={{ padding: '100px 24px 60px 24px', textAlign: 'center' }}>
        <div className="text-center mb-5">
          <h1 style={{ fontSize: '4rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--color-purple)' }}>Routes</h1>
          <p style={{ fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto', color: '#555' }}>
            Tried, tested, and perfectly paced routes that balance adventure with comfort.
          </p>
        </div>

        {itineraries.length === 0 ? (
          <div style={{ padding: '100px 20px', backgroundColor: 'white', borderRadius: '30px', border: '1px dashed #ccc' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-purple)' }}>More Routes Coming Soon</h3>
            <p style={{ marginTop: '1rem' }}>We're currently migrating our best routes. Check back in a few days!</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '40px',
            marginTop: '40px'
          }}>
            {itineraries.map((trip) => {
              const featuredImage = trip.featured_image 
                || getFirstImageFromContent(trip.content)
                || '/assets/hero.png';
              
              return (
                <article key={trip.ID} className="card" style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '24px', 
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Link href={`/routes/${trip.slug}`} style={{ display: 'block', height: '300px', overflow: 'hidden' }}>
                    <img 
                      src={featuredImage} 
                      alt={trip.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Link>
                  <div style={{ padding: '30px', textAlign: 'left' }}>
                    <h3 style={{ fontSize: '1.75rem', marginBottom: '15px', color: 'var(--color-purple)' }}>
                      <Link 
                        href={`/routes/${trip.slug}`}
                        dangerouslySetInnerHTML={{ __html: trip.title }}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      />
                    </h3>
                    <div 
                      style={{ color: '#666', lineHeight: '1.6', marginBottom: '20px', fontSize: '1rem' }}
                      dangerouslySetInnerHTML={{ __html: trip.excerpt }}
                    />
                    <Link href={`/routes/${trip.slug}`} className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
                      View Route →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="conversion-section" style={{ backgroundColor: 'var(--color-purple)', padding: '100px 24px', textAlign: 'center', color: 'white' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', color: 'white' }}>
            Want Help Building Your Own Route?
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '1rem', opacity: 0.9 }}>
            Planning long-term travel can get overwhelming fast.
          </p>
          <p style={{ fontSize: '1.25rem', marginBottom: '1rem', opacity: 0.9 }}>
            If you want help building a realistic route based on your:
          </p>
          <ul style={{ 
            listStyleType: 'disc', 
            textAlign: 'left', 
            display: 'inline-block', 
            fontSize: '1.25rem', 
            marginBottom: '2rem', 
            opacity: 0.9,
            paddingLeft: '20px'
          }}>
            <li>budget</li>
            <li>pace</li>
            <li>interests</li>
            <li>timeline</li>
            <li>comfort level</li>
          </ul>
          <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', opacity: 0.9 }}>
            …we now offer custom route planning + strategy calls based on the exact systems we’ve used while traveling full-time across Europe and Southeast Asia.
          </p>
          <Link href="/start-planning" className="btn btn-primary" style={{ backgroundColor: 'white', color: 'var(--color-purple)', padding: '16px 32px', fontSize: '1.2rem' }}>
            Learn More Here
          </Link>
        </div>
      </section>
    </main>
  );
}

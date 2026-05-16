import Link from 'next/link';
import { notFound } from 'next/navigation';

// Enable ISR: Revalidate the post every 60 seconds
export const revalidate = 60;

async function getPost(slug) {
  try {
    const res = await fetch(
      `https://public-api.wordpress.com/rest/v1.1/sites/lostandsoundtravel.wordpress.com/posts/slug:${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } }
    );
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`WordPress API responded with status: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error('Error fetching WordPress post:', err);
    return null;
  }
}

export default async function ItineraryDetailPage({ params }) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  // Smart Image Detection
  const featuredImage = post.featured_image 
    || (post.content.match(/<img[^>]+src="([^">]+)"/) ? post.content.match(/<img[^>]+src="([^">]+)"/)[1] : null)
    || '/assets/hero.png';

  return (
    <article style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Editorial Header */}
      <header style={{ 
        padding: '120px 24px 80px 24px', 
        textAlign: 'center',
        backgroundColor: 'var(--color-bg)'
      }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <Link href="/itineraries" style={{ 
            color: 'var(--color-orange)', 
            fontWeight: 700, 
            textDecoration: 'none',
            display: 'block',
            marginBottom: '20px'
          }}>
            ← Back to Itineraries
          </Link>
          
          <h1 
            style={{ fontSize: '3.5rem', fontFamily: 'var(--font-heading)', color: 'var(--color-purple)', lineHeight: '1.1' }}
            dangerouslySetInnerHTML={{ __html: post.title }}
          />
          
          <div style={{ marginTop: '20px', fontWeight: 600, color: '#666' }}>
            {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="container" style={{ maxWidth: '1100px', padding: '0 24px' }}>
        <img 
          src={featuredImage} 
          alt={post.title} 
          style={{ 
            width: '100%', 
            height: '600px', 
            objectFit: 'cover', 
            borderRadius: '30px',
            marginTop: '-40px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
          }}
        />
      </div>

      {/* Article Body */}
      <div className="container" style={{ maxWidth: '800px', padding: '80px 24px' }}>
        <div 
          className="blog-content"
          style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#333' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* Footer CTA */}
      <section style={{ backgroundColor: 'var(--color-purple)', padding: '100px 24px', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', color: 'white' }}>
            Love this itinerary?
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', opacity: 0.9 }}>
            We can customize this exact route for your specific dates and budget.
          </p>
          <Link href="/start-planning" className="btn btn-primary" style={{ backgroundColor: 'white', color: 'var(--color-purple)', padding: '16px 32px' }}>
            Book a Custom Planning Call
          </Link>
        </div>
      </section>
    </article>
  );
}

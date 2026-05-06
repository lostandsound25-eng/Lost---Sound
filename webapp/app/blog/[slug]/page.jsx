import Link from 'next/link';

async function getPost(slug) {
  try {
    const res = await fetch(
      `https://lostandsoundtravel.wpcomstaging.com/wp-json/wp/v2/posts?slug=${slug}&_embed`,
      { next: { revalidate: 60 } }
    );
    
    if (!res.ok) {
      console.error(`WordPress API responded with status: ${res.status}`);
      return null;
    }

    const data = await res.json();
    
    // WordPress returns an array of posts matching the slug
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    
    console.warn(`No post found for slug: ${slug}`);
    return null;
  } catch (error) {
    console.error('Error fetching WordPress post:', error);
    return null;
  }
}

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);

  if (!post) {
    return (
      <div className="container" style={{ padding: '200px 24px', textAlign: 'center' }}>
        <h1>Post not found</h1>
        <Link href="/blog">Back to Stories</Link>
      </div>
    );
  }

  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/assets/hero.png';

  return (
    <article style={{ backgroundColor: 'white', minHeight: '100vh' }}>
      {/* Editorial Header */}
      <header style={{ 
        padding: '120px 24px 80px 24px', 
        textAlign: 'center',
        backgroundColor: 'var(--color-cream)'
      }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <Link href="/blog" style={{ 
            color: 'var(--color-orange)', 
            fontWeight: 700, 
            textDecoration: 'none',
            display: 'block',
            marginBottom: '20px'
          }}>
            ← Back to Stories
          </Link>
          
          <h1 
            style={{ fontSize: '3.5rem', fontFamily: 'var(--font-heading)', color: 'var(--color-purple)', lineHeight: '1.1' }}
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
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
          alt={post.title.rendered} 
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
        
        {/* Mediavine Ad Placeholder - Top */}
        <div style={{ 
          margin: '0 auto 40px auto', 
          textAlign: 'center', 
          padding: '20px', 
          backgroundColor: '#F9F9F9', 
          borderRadius: '12px',
          border: '1px dashed #ddd',
          fontSize: '0.8rem',
          color: '#999'
        }}>
          MEDIAVINE AD SLOT (TOP)
        </div>

        <div 
          className="blog-content"
          style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#333' }}
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />

        {/* Stay22 Ad Placeholder - Middle/Bottom */}
        <div style={{ 
          margin: '60px 0', 
          padding: '40px', 
          backgroundColor: 'var(--color-cream)', 
          borderRadius: '24px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-purple)', marginBottom: '1rem' }}>
            Book Your Stay
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>Find the best boutique hotels for this trip.</p>
          <div style={{ height: '150px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            STAY22 WIDGET PLACEHOLDER
          </div>
        </div>

        {/* Mediavine Ad Placeholder - Bottom */}
        <div style={{ 
          margin: '40px auto 0 auto', 
          textAlign: 'center', 
          padding: '20px', 
          backgroundColor: '#F9F9F9', 
          borderRadius: '12px',
          border: '1px dashed #ddd',
          fontSize: '0.8rem',
          color: '#999'
        }}>
          MEDIAVINE AD SLOT (BOTTOM)
        </div>
      </div>

      {/* Footer CTA */}
      <section style={{ backgroundColor: 'var(--color-purple)', padding: '100px 24px', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', color: 'white' }}>
            Inspired by this story?
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', opacity: 0.9 }}>
            We can help you turn this dream into a real itinerary.
          </p>
          <Link href="/start-planning" className="btn btn-primary" style={{ backgroundColor: 'white', color: 'var(--color-purple)', padding: '16px 32px' }}>
            Start Planning My Trip
          </Link>
        </div>
      </section>
    </article>
  );
}

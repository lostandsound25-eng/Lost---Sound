import Link from 'next/link';

// This function fetches posts from your WordPress site
async function getPosts() {
  try {
    const res = await fetch(
      'https://public-api.wordpress.com/wp/v2/sites/lostandsoundtravel.wordpress.com/posts?_embed',
      { next: { revalidate: 60 } } // Refresh every minute while building
    );
    
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Error fetching WordPress posts:', error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main style={{ backgroundColor: 'var(--color-cream)', minHeight: '100vh' }}>
      {/* Header Section */}
      <section style={{ padding: '100px 24px 60px 24px', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ 
            fontSize: '4rem', 
            fontFamily: 'var(--font-heading)', 
            color: 'var(--color-purple)',
            marginBottom: '1rem' 
          }}>
            Our Stories
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#555', maxWidth: '700px', margin: '0 auto' }}>
            Travel inspiration, gear reviews, and the occasional deep dive into the world of Lost & Sound.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="container" style={{ padding: '0 24px 100px 24px' }}>
        {posts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '100px 20px', 
            backgroundColor: 'white', 
            borderRadius: '24px',
            border: '1px dashed #ccc'
          }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-purple)' }}>Getting things ready...</h3>
            <p style={{ marginTop: '1rem' }}>We're currently writing some amazing stories. Check back very soon!</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '40px' 
          }}>
            {posts.map((post) => {
              const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/assets/hero.png';
              
              return (
                <article key={post.id} className="magazine-card" style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '20px', 
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Link href={`/blog/${post.slug}`} style={{ display: 'block', height: '250px', overflow: 'hidden' }}>
                    <img 
                      src={featuredImage} 
                      alt={post.title.rendered}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                      className="magazine-img"
                    />
                  </Link>
                  
                  <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: 700, 
                      color: 'var(--color-orange)', 
                      textTransform: 'uppercase', 
                      letterSpacing: '1px',
                      marginBottom: '10px' 
                    }}>
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    
                    <h2 style={{ 
                      fontSize: '1.75rem', 
                      fontFamily: 'var(--font-heading)', 
                      color: 'var(--color-purple)',
                      marginBottom: '15px',
                      lineHeight: '1.2'
                    }}>
                      <Link 
                        href={`/blog/${post.slug}`}
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      />
                    </h2>
                    
                    <div 
                      style={{ color: '#666', lineHeight: '1.6', marginBottom: '20px' }}
                      dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                    />
                    
                    <div style={{ marginTop: 'auto' }}>
                      <Link 
                        href={`/blog/${post.slug}`}
                        style={{ 
                          fontWeight: 700, 
                          color: 'var(--color-purple)', 
                          textDecoration: 'none',
                          borderBottom: '2px solid var(--color-orange)',
                          paddingBottom: '2px'
                        }}
                      >
                        Read Story →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Ad Placeholder for Stay22 or Mediavine */}
      <section style={{ backgroundColor: 'var(--color-jungle)', padding: '60px 24px', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <p style={{ opacity: 0.8, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>Advertisement</p>
          <div style={{ 
            height: '100px', 
            border: '1px dashed rgba(255,255,255,0.3)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '12px'
          }}>
            <span style={{ opacity: 0.5 }}>Stay22 Booking Widget Placeholder</span>
          </div>
        </div>
      </section>
    </main>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import LightboxWrapper from '../../../components/LightboxWrapper';

// Enable ISR: Revalidate the post every 60 seconds
export const revalidate = 60;

import { fetchWithTimeout } from '../../../lib/fetch';

async function getPost(slug) {
  try {
    const res = await fetchWithTimeout(
      `https://public-api.wordpress.com/rest/v1.1/sites/lostandsoundtravel.wordpress.com/posts/slug:${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 }, timeout: 5000 }
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

export default async function RouteDetailPage({ params }) {
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
          <Link href="/routes" style={{ 
            color: 'var(--color-orange)', 
            fontWeight: 700, 
            textDecoration: 'none',
            display: 'block',
            marginBottom: '20px'
          }}>
            ← Back to Routes
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
      <div className="container" style={{ maxWidth: '800px', padding: '0 24px' }}>
        <img 
          src={featuredImage} 
          alt={post.title} 
          style={{ 
            width: '100%', 
            height: 'auto', 
            maxHeight: '450px',
            objectFit: 'cover', 
            borderRadius: '20px',
            marginTop: '-20px',
            boxShadow: '0 15px 40px rgba(0,0,0,0.08)'
          }}
        />
      </div>

      {/* Article Body */}
      <div className="container" style={{ maxWidth: '800px', padding: '80px 24px' }}>
        <LightboxWrapper html={post.content} />
      </div>

      {/* Footer CTA */}
      <section style={{ backgroundColor: 'var(--color-purple)', padding: '100px 24px', color: 'white', textAlign: 'center' }}>
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
    </article>
  );
}

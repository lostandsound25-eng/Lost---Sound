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

// Normalize heading hierarchy & internal blog URLs for SEO:
// 1. Ensures article title is the ONE AND ONLY <h1> tag on the page.
// 2. Rewrites any wpcomstaging.com or wordpress.com internal blog links to /blog/[slug].
function normalizeContent(html) {
  if (!html) return '';
  let cleaned = html
    .replace(/<h1(\s+[^>]*)?>/gi, '<h2$1>')
    .replace(/<\/h1>/gi, '</h2>');

  // Rewrite any wpcomstaging.com or wordpress.com internal post links to /blog/[slug]
  cleaned = cleaned.replace(
    /href="https?:\/\/[a-z0-9-]+\.(wpcomstaging|wordpress)\.com(?:\/\d{4}\/\d{2}\/\d{2})?\/([a-z0-9-]+)\/?"/gi,
    'href="/blog/$2"'
  );

  // Normalize full lostandsoundtravel.com/blog/[slug] URLs to relative /blog/[slug]
  cleaned = cleaned.replace(
    /href="https?:\/\/(www\.)?lostandsoundtravel\.com\/blog\/([a-z0-9-]+)\/?"/gi,
    'href="/blog/$2"'
  );

  return cleaned;
}

export default async function BlogPostPage({ params }) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  // Smart Image Detection
  const featuredImage = post.featured_image 
    || (post.content.match(/<img[^>]+src="([^">]+)"/) ? post.content.match(/<img[^>]+src="([^">]+)"/)[1] : null)
    || '/assets/hero.png';

  const cleanContent = normalizeContent(post.content);

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
          
          {/* Main Article H1 Title (The ONLY <h1> tag on the page for SEO) */}
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

      {/* Article Body with Strict H2-H6 WordPress Hierarchy */}
      <div className="container" style={{ maxWidth: '800px', padding: '80px 24px' }}>
        <LightboxWrapper html={cleanContent} />
      </div>

      {/* Footer CTA */}
      <section style={{ backgroundColor: 'var(--color-purple)', padding: '100px 24px', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', color: 'white' }}>
            Inspired by this story?
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', opacity: 0.9 }}>
            We can help you turn this dream into a real route.
          </p>
          <Link href="/start-planning" className="btn btn-primary" style={{ backgroundColor: 'white', color: 'var(--color-purple)', padding: '16px 32px' }}>
            Start Planning My Trip
          </Link>
        </div>
      </section>
    </article>
  );
}

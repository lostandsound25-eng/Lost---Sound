'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// We disable SSR (Server Side Rendering) entirely for this component 
// to bypass any DNS/Connection issues on Vercel's servers.
const BlogContent = dynamic(() => import('./BlogContent'), { 
  ssr: false,
  loading: () => (
    <div className="container" style={{ padding: '200px 24px', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--color-purple)', fontFamily: 'var(--font-heading)' }}>Loading Story...</h2>
    </div>
  )
});

export default function BlogPostPage({ params }) {
  return <BlogContent params={params} />;
}

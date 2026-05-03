import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default async function Stories() {
  // Fetch travel stories directly from Supabase!
  // Note: we order by created_at so the newest stories show up first.
  const { data: stories, error } = await supabase
    .from('travel_stories')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <Link href="/" className="logo">
            <svg height="50" viewBox="0 0 400 80" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
              <text x="0" y="55" fontFamily="var(--font-heading)" fontWeight="900" fontSize="56" fill="var(--color-golden)">L</text>
              <g transform="translate(45, 10)">
                <circle cx="22" cy="30" r="20" fill="none" stroke="var(--color-golden)" strokeWidth="4"/>
                <path d="M 22 10 Q 34 30 22 50 Q 10 30 22 10" fill="none" stroke="var(--color-golden)" strokeWidth="3"/>
                <line x1="2" y1="30" x2="42" y2="30" stroke="var(--color-golden)" strokeWidth="3"/>
                <line x1="22" y1="10" x2="22" y2="50" stroke="var(--color-golden)" strokeWidth="3"/>
              </g>
              <text x="100" y="55" fontFamily="var(--font-heading)" fontWeight="900" fontSize="56" fill="var(--color-golden)">ST</text>
              <text x="180" y="55" fontFamily="var(--font-heading)" fontWeight="900" fontSize="56" fill="var(--color-orange)">&amp;</text>
              <text x="235" y="55" fontFamily="var(--font-heading)" fontWeight="900" fontSize="56" fill="var(--color-golden)">S</text>
              <g transform="translate(280, 10)">
                <circle cx="22" cy="30" r="20" fill="none" stroke="var(--color-golden)" strokeWidth="4"/>
                <circle cx="22" cy="30" r="4" fill="var(--color-golden)"/>
                <path d="M 22 14 L 26 30 L 22 46 L 18 30 Z" fill="none" stroke="var(--color-golden)" strokeWidth="2"/>
              </g>
              <text x="330" y="55" fontFamily="var(--font-heading)" fontWeight="900" fontSize="56" fill="var(--color-golden)">UND</text>
            </svg>
          </Link>
          <div className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/itineraries">Destinations</Link>
            <Link href="/services">Services</Link>
            <Link href="/stories" style={{ color: 'var(--color-orange)' }}>Travel Stories</Link>
            <button className="btn btn-primary" style={{ padding: '12px 24px', marginLeft: '12px' }}>Start Planning</button>
          </div>
        </div>
      </nav>

      <section className="container" style={{ paddingTop: '100px' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--color-purple)' }}>Travel Stories</h1>
        <p style={{ fontSize: '1.4rem', color: 'var(--color-text)', marginBottom: '4rem' }}>
          Real experiences, honest reviews, and lessons learned on the road.
        </p>

        {error && <p style={{ color: 'var(--color-red)' }}>Oops! There was an error fetching stories.</p>}
        
        {(!stories || stories.length === 0) ? (
          <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'white', borderRadius: 'var(--radius-card)' }}>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--color-orange)' }}>No stories yet!</h3>
            <p style={{ marginTop: '1rem' }}>Go to your Supabase dashboard, open the "travel_stories" table, and add your first post.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {stories.map(story => (
              <div key={story.id} className="card">
                {story.image_url && (
                  <div className="card-img-container">
                    <img src={story.image_url} alt={story.title} />
                  </div>
                )}
                <div className="card-content">
                  <h3>{story.title}</h3>
                  <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {new Date(story.created_at).toLocaleDateString()}
                  </p>
                  <p>{story.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

'use client';
import Link from 'next/link';

export default function StartPlanning() {
  const tiers = [
    {
      name: "Custom Trip Outline",
      price: "$20",
      description: "Perfect for travelers who want direction without spending hours researching.",
      features: [
        "Personalized high-level route",
        "Destinations en route recommendations",
        "Suggested trip pacing",
        "Where to stay + must-do experiences",
        "General transport guidance",
        "Rough budget expectations",
        "7-day delivery"
      ],
      cta: "Get Your Outline",
      link: "/questionnaire",
      color: "var(--color-golden)"
    },
    {
      name: "Detailed Travel Planning",
      price: "$50",
      description: "Best for longer trips, first-time travelers, or anyone wanting a stress-free process.",
      features: [
        "Detailed day-by-day route",
        "Specific accommodation recommendations",
        "Transport logistics + food/activity recs",
        "Hidden gems + local tips",
        "Planning call/video consultation",
        "1 set of revisions based on feedback",
        "Direct support during planning"
      ],
      cta: "Start Planning",
      link: "/questionnaire",
      color: "var(--color-purple)",
      popular: true
    },
    {
      name: "Full Concierge Planning",
      price: "Custom",
      description: "Our most comprehensive package. We build your trip from start to finish.",
      features: [
        "Ongoing support throughout",
        "Multiple planning calls",
        "Flexible route revisions",
        "Booking guidance + live travel support",
        "Content/photo recommendations",
        "Niche experiences tailored to you",
        "Best for complex/group trips"
      ],
      cta: "Enquire Now",
      link: "/book",
      color: "var(--color-orange)"
    }
  ];

  return (
    <main style={{ padding: '120px 0 80px' }}>
      <div className="container">
        <div className="text-center mb-5" style={{ maxWidth: '800px', margin: '0 auto 60px' }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>Start Planning Your Journey</h1>
          <p style={{ fontSize: '1.3rem', color: 'var(--color-text)', opacity: 0.8 }}>
            Whether you just need a nudge in the right direction or someone to handle every single detail, we've got you covered.
          </p>
        </div>

        <div className="pricing-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '30px',
          alignItems: 'start'
        }}>
          {tiers.map((tier, idx) => (
            <div key={idx} style={{ 
              backgroundColor: 'white', 
              borderRadius: '30px', 
              padding: '40px',
              border: `2px solid ${tier.popular ? tier.color : '#eee'}`,
              position: 'relative',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              {tier.popular && (
                <div style={{ 
                  position: 'absolute', 
                  top: '-15px', 
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  backgroundColor: tier.color, 
                  color: 'white', 
                  padding: '4px 20px', 
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textTransform: 'uppercase'
                }}>
                  Most Popular
                </div>
              )}
              
              <h3 style={{ fontSize: '1.8rem', color: tier.color, marginBottom: '0.5rem' }}>{tier.name}</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                {tier.price} <span style={{ fontSize: '1rem', fontWeight: 400, opacity: 0.6 }}>{tier.price !== 'Custom' ? '/ starting' : ''}</span>
              </div>
              
              <p style={{ marginBottom: '2rem', fontSize: '1.05rem', lineHeight: 1.6, opacity: 0.9 }}>
                {tier.description}
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', flex: 1 }}>
                {tier.features.map((feature, fIdx) => (
                  <li key={fIdx} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '12px', 
                    marginBottom: '14px',
                    fontSize: '1rem',
                    lineHeight: 1.4
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tier.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px', flexShrink: 0 }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span style={{ opacity: 0.9 }}>{feature}</span>
                  </li>
                ))}
              </ul>

              {tier.link.startsWith('http') ? (
                <a href={tier.link} target="_blank" rel="noopener noreferrer" className="btn" style={{ 
                  backgroundColor: tier.color, 
                  color: 'white', 
                  textAlign: 'center',
                  padding: '16px',
                  borderRadius: '50px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}>
                  {tier.cta}
                </a>
              ) : (
                <Link href={tier.link} className="btn" style={{ 
                  backgroundColor: tier.color, 
                  color: 'white', 
                  textAlign: 'center',
                  padding: '16px',
                  borderRadius: '50px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}>
                  {tier.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <section style={{ marginTop: '100px', backgroundColor: '#F9F6ED', borderRadius: '40px', padding: '60px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>Not sure which one is right?</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>Book a free 15-minute discovery call and we'll help you decide.</p>
          <Link href="/book" className="btn btn-outline" style={{ display: 'inline-block' }}>Schedule Discovery Call</Link>
        </section>
      </div>
    </main>
  );
}

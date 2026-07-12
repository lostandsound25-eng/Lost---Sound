'use client';
import Link from 'next/link';

export default function StartPlanning() {
  const services = [
    {
      name: "Travel Strategy Call",
      price: "$50",
      description: "Perfect if you're feeling overwhelmed and need expert guidance to confidently plan your own trip.",
      features: [
        "45-minute 1-on-1 video call",
        "Route feasibility & pacing check",
        "Strategies to avoid travel burnout",
        "Tips for traveling realistically as a couple",
        "Guidance on balancing cost vs experience",
        "Post-call strategy notes"
      ],
      cta: "Book a Strategy Call",
      link: "/questionnaire",
      color: "var(--color-golden)"
    },
    {
      name: "Custom Route Coaching",
      price: "$150",
      description: "A collaborative deep-dive to help you build a sustainable, long-term travel system tailored to you.",
      features: [
        "Complete route planning framework",
        "Deep-dive into decision-making filters",
        "Structuring long-term travel sustainably",
        "Budget mapping tools & matrices",
        "Two 60-minute collaborative calls",
        "Direct support while you finalize your route"
      ],
      cta: "Start Curating",
      link: "/questionnaire",
      color: "var(--color-purple)",
      popular: true
    }
  ];

  return (
    <main style={{ padding: '120px 0 80px' }}>
      <div className="container">
        <div className="text-center mb-5" style={{ maxWidth: '900px', margin: '0 auto 80px' }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', color: 'var(--color-purple)', lineHeight: 1.1 }}>
            Travel Smarter, Not Harder.
          </h1>
          <p style={{ fontSize: '1.3rem', color: 'var(--color-text)', opacity: 0.9, lineHeight: 1.8, marginBottom: '2rem' }}>
            We aren’t here to just build a generic itinerary for you. We are travel strategists, and our goal is to give you the systems, tools, and confidence to curate your own unforgettable routes.
          </p>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text)', opacity: 0.8, lineHeight: 1.8 }}>
            Long-term travel isn't always roses and rainbows. It takes strategy to do it affordably and without burning out. We'll show you exactly how to do it.
          </p>
        </div>

        <div className="pricing-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '40px',
          alignItems: 'start',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {services.map((service, idx) => (
            <div key={idx} style={{ 
              backgroundColor: 'white', 
              borderRadius: '30px', 
              padding: '50px 40px',
              border: `2px solid ${service.popular ? service.color : '#eee'}`,
              position: 'relative',
              boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              {service.popular && (
               <div style={{ 
                  position: 'absolute', 
                  top: '-16px', 
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  backgroundColor: service.color, 
                  color: 'white', 
                  padding: '6px 24px', 
                  borderRadius: '30px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Most Popular
                </div>
              )}
              
              <h3 style={{ fontSize: '2rem', color: service.color, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>{service.name}</h3>
              <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
                {service.price}
              </div>
              
              <p style={{ marginBottom: '2.5rem', fontSize: '1.1rem', lineHeight: 1.6, opacity: 0.8 }}>
                {service.description}
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', flex: 1 }}>
                {service.features.map((feature, fIdx) => (
                  <li key={fIdx} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '12px', 
                    marginBottom: '16px',
                    fontSize: '1.05rem',
                    lineHeight: 1.4
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={service.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px', flexShrink: 0 }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span style={{ opacity: 0.9 }}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={service.link} className="btn" style={{ 
                backgroundColor: service.color, 
                color: 'white', 
                textAlign: 'center',
                padding: '18px',
                borderRadius: '50px',
                fontWeight: 700,
                fontSize: '1.1rem',
                textDecoration: 'none',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}>
                {service.cta}
              </Link>
            </div>
          ))}
        </div>

        <section style={{ 
          marginTop: '100px', 
          background: 'linear-gradient(135deg, var(--color-purple) 0%, #4c1f2e 100%)', 
          borderRadius: '30px', 
          padding: '40px', 
          color: 'white',
          boxShadow: '0 15px 35px rgba(133, 58, 81, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'row',
          gap: '30px',
          alignItems: 'center',
          flexWrap: 'wrap',
          textAlign: 'left'
        }}>
          <div style={{ flex: '1 1 350px' }}>
            <span style={{
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--color-golden)',
              display: 'block',
              marginBottom: '6px'
            }}>
              Free Budget Companion App
            </span>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', color: 'white', margin: '0 0 10px' }}>
              Lost & Sound Tracks
            </h2>
            <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.6', margin: '0 0 20px' }}>
              Want to track your budget yourself? Try our free companion tool. Log multi-currency expenses, split costs with partners in real-time, and log travel stories completely free.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/tracker" className="btn" style={{ 
                display: 'inline-block', 
                fontSize: '0.92rem', 
                padding: '12px 24px', 
                backgroundColor: 'var(--color-golden)',
                color: 'var(--color-purple)',
                fontWeight: 800,
                borderRadius: '20px',
                textDecoration: 'none'
              }}>
                🚀 Try Tracks Free
              </Link>
              <Link href="/travel-tricks" className="btn" style={{ 
                display: 'inline-block', 
                fontSize: '0.92rem', 
                padding: '12px 24px', 
                backgroundColor: 'transparent',
                color: 'white',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
                fontWeight: 700,
                borderRadius: '20px',
                textDecoration: 'none'
              }}>
                📖 Read Travel Tricks
              </Link>
            </div>
          </div>
          <div style={{ flex: '1 1 200px', display: 'flex', gap: '10px', justifyContent: 'center', overflow: 'hidden' }}>
            <img src="/assets/screenshot_log_expense.png" alt="Log Expense Screen" style={{ height: '180px', borderRadius: '8px', boxShadow: '0 6px 15px rgba(0,0,0,0.25)' }} />
            <img src="/assets/screenshot_dashboard.png" alt="Dashboard Screen" style={{ height: '180px', borderRadius: '8px', boxShadow: '0 6px 15px rgba(0,0,0,0.25)' }} />
          </div>
        </section>

        <section style={{ marginTop: '100px', backgroundColor: 'var(--color-cream)', borderRadius: '40px', padding: '80px 40px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: 'var(--color-purple)' }}>Not sure where to start?</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', opacity: 0.8, maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Book a free 15-minute discovery call. We'll chat about your travel dreams and see if our planning systems are a good fit for you.
          </p>
          <Link href="/book" className="btn btn-outline" style={{ display: 'inline-block', fontSize: '1.1rem', padding: '16px 32px', backgroundColor: 'white' }}>
            Schedule Free Discovery Call
          </Link>
        </section>
      </div>
    </main>
  );
}

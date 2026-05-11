'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function StorySection({ isExcerpt = false }) {
  const [activeCard, setActiveCard] = useState(null);

  const stats = {
    julie: {
      name: 'Julie 🇮🇪',
      color: 'Emerald Green',
      book: 'The Alchemist',
      vibe: 'Slow mornings & hidden coastal trails',
      fact: 'Has a sixth sense for finding the best local bakeries.'
    },
    harry: {
      name: 'Harry 🇺🇸',
      color: 'Midnight Blue',
      book: 'On the Road',
      vibe: 'Mountain peaks & long-exposure nights',
      fact: 'Once lived in a van for 3 months just to catch a sunrise.'
    }
  };

  return (
    <section id="our-story" style={{ padding: isExcerpt ? '60px 0' : '80px 0', backgroundColor: '#F9F6ED' }}>
      <div className="container" style={{ maxWidth: '750px' }}>
        
        <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '40px', fontFamily: 'var(--font-heading)' }}>Our Story</h2>

        <div style={{ fontSize: '1.05rem', lineHeight: '1.6', color: '#444', display: 'grid', gap: '20px' }}>
          <p>We are Julie 🇮🇪 and Harry 🇺🇸.</p>
          <p>We met in grad school in the U.S. and lived together just outside Chicago before later moving to Denver, at the foot of the Rockies.</p>
          
          {/* Middle Image - Scaled down for compactness */}
          <div style={{ margin: '30px 0', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 15px 40px rgba(0,0,0,0.08)', maxWidth: '100%' }}>
            <Image 
              src="/julie_harry_together_1778512016530.png" 
              alt="Julie and Harry" 
              width={750} 
              height={500} 
              layout="responsive"
              objectFit="cover"
            />
          </div>

          <p>In 2025, Julie’s visa in the U.S. was coming to an end, so we started thinking about a Plan B — slow traveling the world, something we had each always dreamed about independently.</p>
          
          {!isExcerpt ? (
            <>
              <p>The more we talked about Plan B, the more we realized it was the plan we actually wanted all along.</p>
              <p>So when our lease ended in 2025, we decided to quit our jobs and set off on a one-year world journey.</p>
              <p>We spent almost a full year preparing — saving money, planning a rough route, selling our things, and slowly untangling the logistics of the life we were leaving behind.</p>
              <p>In August 2025, we started in Ireland and began moving east, with the goal of eventually making it all the way to Australia.</p>
              <p>Lost & Sound started as a way to keep friends and family updated along the way. But somewhere on the road, we realized this style of travel — slow, flexible, and local — was something special, and a lot more accessible than we ever thought.</p>
              <p>Now, Lost & Sound is our way of sharing what we learn and encouraging others to take the leap, and start on the journey of your lifetime.</p>
              <p>This site, its content, and resources are all designed to make travel feel a little more doable, and a lot more meaningful.</p>
              
              <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
                <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>Cheers and safe travels,</p>
                <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>Julie & Harry</p>
              </div>

              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '25px', marginTop: '30px', borderLeft: '4px solid var(--color-purple)', fontSize: '0.95rem' }}>
                <p style={{ margin: 0, fontStyle: 'italic' }}>
                  <strong>P.S.</strong> The one piece of advice we hear over and over again on our travels is: “Keep going.” A phrase that applies well to travels, but also anything in life.
                </p>
              </div>

              {/* PLAYER CARDS - More compact height */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '60px' }}>
                <div 
                  onClick={() => setActiveCard(activeCard === 'julie' ? null : 'julie')}
                  style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden', borderRadius: '25px', height: '350px' }}
                >
                  <Image src="/julie_player_card_1778512032240.png" alt="Julie" layout="fill" objectFit="cover" />
                  <div style={{ 
                    position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px',
                    transition: 'all 0.4s ease',
                    transform: activeCard === 'julie' ? 'translateY(0)' : 'translateY(100%)',
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(8px)'
                  }}>
                    <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '10px' }}>{stats.julie.name}</h3>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', display: 'grid', gap: '6px' }}>
                      <p><strong>Fav Color:</strong> {stats.julie.color}</p>
                      <p><strong>Fav Book:</strong> {stats.julie.book}</p>
                      <p><strong>Vibe:</strong> {stats.julie.vibe}</p>
                    </div>
                  </div>
                  {!activeCard && <div style={{ position: 'absolute', bottom: '15px', left: '15px', color: 'white', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase' }}>Stats →</div>}
                </div>

                <div 
                  onClick={() => setActiveCard(activeCard === 'harry' ? null : 'harry')}
                  style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden', borderRadius: '25px', height: '350px' }}
                >
                  <Image src="/harry_player_card_1778512044767.png" alt="Harry" layout="fill" objectFit="cover" />
                  <div style={{ 
                    position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px',
                    transition: 'all 0.4s ease',
                    transform: activeCard === 'harry' ? 'translateY(0)' : 'translateY(100%)',
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(8px)'
                  }}>
                    <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '10px' }}>{stats.harry.name}</h3>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', display: 'grid', gap: '6px' }}>
                      <p><strong>Fav Color:</strong> {stats.harry.color}</p>
                      <p><strong>Fav Book:</strong> {stats.harry.book}</p>
                      <p><strong>Vibe:</strong> {stats.harry.vibe}</p>
                    </div>
                  </div>
                  {!activeCard && <div style={{ position: 'absolute', bottom: '15px', left: '15px', color: 'white', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase' }}>Stats →</div>}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link href="/about" className="btn btn-primary" style={{ padding: '10px 25px', fontSize: '0.9rem' }}>Read Full Story</Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function StorySection() {
  const [activeCard, setActiveCard] = useState(null); // 'julie' or 'harry'

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
    <section id="our-story" style={{ padding: '120px 0', backgroundColor: '#F9F6ED' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <h2 style={{ fontSize: '3.5rem', textAlign: 'center', marginBottom: '60px', fontFamily: 'var(--font-heading)' }}>Our Story</h2>

        <div style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#444', display: 'grid', gap: '30px' }}>
          <p>We are Julie 🇮🇪 and Harry 🇺🇸.</p>
          <p>We met in grad school in the U.S. and lived together just outside Chicago before later moving to Denver, at the foot of the Rockies.</p>
          
          {/* Middle Image */}
          <div style={{ margin: '40px 0', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
            <Image 
              src="/julie_harry_together_1778512016530.png" 
              alt="Julie and Harry" 
              width={800} 
              height={800} 
              layout="responsive"
              objectFit="cover"
            />
          </div>

          <p>In 2025, Julie’s visa in the U.S. was coming to an end, so we started thinking about a Plan B — slow traveling the world, something we had each always dreamed about independently.</p>
          <p>The more we talked about Plan B, the more we realized it was the plan we actually wanted all along.</p>
          <p>So when our lease ended in 2025, we decided to quit our jobs and set off on a one-year world journey.</p>
          <p>We spent almost a full year preparing — saving money, planning a rough route, selling our things, and slowly untangling the logistics of the life we were leaving behind.</p>
          <p>In August 2025, we started in Ireland and began moving east, with the goal of eventually making it all the way to Australia.</p>
          <p>Lost & Sound started as a way to keep friends and family updated along the way. But somewhere on the road, we realized this style of travel — slow, flexible, and local — was something special, and a lot more accessible than we ever thought.</p>
          <p>Now, Lost & Sound is our way of sharing what we learn and encouraging others to take the leap, and start on the journey of your lifetime.</p>
          <p>This site, its content, and resources are all designed to make travel feel a little more doable, and a lot more meaningful.</p>
          <p>If you have questions, want advice, or just want to say hi, feel free to reach out via email, social media, or the contact link on the site.</p>
          
          <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '40px' }}>
            <p style={{ fontWeight: 800, fontSize: '1.5rem' }}>Cheers and safe travels,</p>
            <p style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>Julie & Harry</p>
          </div>

          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '30px', marginTop: '40px', borderLeft: '5px solid var(--color-purple)' }}>
            <p style={{ margin: 0, fontStyle: 'italic' }}>
              <strong>P.S.</strong> The one piece of advice we hear over and over again on our travels is: “Keep going.” A phrase that applies well to travels, but also anything in life. And this page is an example of that.
            </p>
          </div>
        </div>

        {/* PLAYER CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '100px' }}>
          
          {/* Julie Card */}
          <div 
            onClick={() => setActiveCard(activeCard === 'julie' ? null : 'julie')}
            style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden', borderRadius: '30px', height: '450px' }}
          >
            <Image 
              src="/julie_player_card_1778512032240.png" 
              alt="Julie" 
              layout="fill" 
              objectFit="cover" 
              className="player-img"
            />
            <div style={{ 
              position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '30px',
              transition: 'all 0.4s ease',
              transform: activeCard === 'julie' ? 'translateY(0)' : 'translateY(100%)',
              backgroundColor: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{ color: 'white', fontSize: '2rem', marginBottom: '15px' }}>{stats.julie.name}</h3>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', display: 'grid', gap: '10px' }}>
                <p><strong>Fav Color:</strong> {stats.julie.color}</p>
                <p><strong>Fav Book:</strong> {stats.julie.book}</p>
                <p><strong>Vibe:</strong> {stats.julie.vibe}</p>
                <p><strong>Fun Fact:</strong> {stats.julie.fact}</p>
              </div>
            </div>
            {!activeCard && (
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'white', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>
                Click for Julie's Stats →
              </div>
            )}
          </div>

          {/* Harry Card */}
          <div 
            onClick={() => setActiveCard(activeCard === 'harry' ? null : 'harry')}
            style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden', borderRadius: '30px', height: '450px' }}
          >
            <Image 
              src="/harry_player_card_1778512044767.png" 
              alt="Harry" 
              layout="fill" 
              objectFit="cover" 
            />
            <div style={{ 
              position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '30px',
              transition: 'all 0.4s ease',
              transform: activeCard === 'harry' ? 'translateY(0)' : 'translateY(100%)',
              backgroundColor: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{ color: 'white', fontSize: '2rem', marginBottom: '15px' }}>{stats.harry.name}</h3>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', display: 'grid', gap: '10px' }}>
                <p><strong>Fav Color:</strong> {stats.harry.color}</p>
                <p><strong>Fav Book:</strong> {stats.harry.book}</p>
                <p><strong>Vibe:</strong> {stats.harry.vibe}</p>
                <p><strong>Fun Fact:</strong> {stats.harry.fact}</p>
              </div>
            </div>
            {!activeCard && (
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'white', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>
                Click for Harry's Stats →
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}

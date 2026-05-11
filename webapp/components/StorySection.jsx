'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function StorySection({ isExcerpt = false }) {
  const [activeCard, setActiveCard] = useState(null);

  const Brand = () => <span style={{ color: 'var(--color-purple)', fontWeight: 800 }}>Lost & Sound</span>;

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
    <section id="our-story" style={{ 
      padding: isExcerpt ? '20px 0 60px' : '30px 0 80px', 
      backgroundColor: '#F9F6ED',
      position: 'relative'
    }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <div style={{ textAlign: 'left', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0', fontFamily: 'var(--font-heading)' }}>
            {isExcerpt ? 'Our Journey' : 'Our Story'}
          </h2>
        </div>

        <div style={{ fontSize: '1.05rem', lineHeight: '1.7', color: '#444' }}>
          
          {/* THE ORGANIC BLOB IMAGE - Now using the Royal Gorge Photo */}
          <div style={{ 
            float: 'right', 
            width: '340px', 
            height: '400px', 
            marginLeft: '30px', 
            marginBottom: '20px',
            shapeOutside: 'inset(0% 0% 0% 0% round 60% 40% 30% 70% / 60% 30% 70% 40%)',
            clipPath: 'inset(0% 0% 0% 0% round 60% 40% 30% 70% / 60% 30% 70% 40%)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            <Image 
              src="/assets/H&J_Royal_Gorge.jpg" 
              alt="Julie and Harry at Royal Gorge" 
              layout="fill"
              objectFit="cover"
            />
          </div>

          {isExcerpt ? (
            <div style={{ fontSize: '1.15rem' }}>
              <p style={{ marginBottom: '20px' }}>
                We are Julie and Harry, and together we are <span style={{ color: 'var(--color-orange)', fontWeight: 800, fontStyle: 'italic' }}>Lost</span> in the world, <span style={{ color: 'var(--color-purple)', fontWeight: 800 }}>& Sound</span> in our journey. 
              </p>
              <p style={{ marginBottom: '20px' }}>
                When we met, we had no clue that our paths crossing would lead us to where we are today, but they did and we couldn't be more happy about it. The story of <Brand /> is one that started with us asking the question "How?" and has blossomed as we have learned to ask the question "Why?"
              </p>
              <div style={{ textAlign: 'left', marginTop: '30px', clear: 'both' }}>
                <Link href="/about" className="btn btn-primary" style={{ padding: '12px 30px', fontSize: '1rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Venture Forth
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p style={{ marginBottom: '20px', fontWeight: 600, fontSize: '1.2rem', color: 'var(--color-purple)' }}>
                Howdy! We are Julie 🇮🇪 and Harry 🇺🇸
              </p>
              
              <p style={{ marginBottom: '15px' }}>
                We met in grad school in the U.S. and lived together just outside Chicago before later moving to Denver, at the foot of the Rockies. In 2025, Julie’s visa in the U.S. was coming to an end, so we started thinking about a Plan B — slow traveling the world, something we had each always dreamed about independently.
              </p>
              <p style={{ marginBottom: '15px' }}>
                The more we talked about Plan B, the more we realized it was the plan we actually wanted all along. So when our lease ended in 2025, we decided to quit our jobs and set off on a one-year world journey. We spent almost a full year preparing — saving money, planning a rough route, selling our things, and slowly untangling the logistics of the life we were leaving behind.
              </p>
              <p style={{ marginBottom: '15px' }}>
                In August 2025, we started in Ireland and began moving east, with the goal of eventually making it all the way to Australia. <Brand /> started as a way to keep friends and family updated along the way. But somewhere on the road, we realized this style of travel — slow, flexible, and local — was something special, and a lot more accessible than we ever thought.
              </p>
              <p style={{ marginBottom: '15px' }}>
                Now, <Brand /> is our way of sharing what we learn and encouraging others to take the leap, and start on the journey of your lifetime. This site, its content, and resources are all designed to make travel feel a little more doable, and a lot more meaningful. If you have questions, want advice, or just want to say hi, feel free to reach out via email, social media, or the contact link on the site.
              </p>
              
              <div style={{ marginTop: '30px' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '5px' }}>Cheers and safe travels,</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-purple)' }}>Julie & Harry</p>
              </div>

              <div style={{ marginTop: '40px', fontSize: '0.95rem' }}>
                <p style={{ margin: 0, fontStyle: 'italic', opacity: 0.8 }}>
                  <strong>P.S.</strong> The one piece of advice we hear over and over again on our travels is: “Keep going.” A phrase that applies well to travels, but also anything in life. 
                  <br />
                  And this site is an example of that.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '60px' }}>
                {/* PLAYER CARDS */}
                <div onClick={() => setActiveCard(activeCard === 'julie' ? null : 'julie')} style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden', borderRadius: '25px', height: '350px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                  <Image src="/webapp/public/julie_player_card_1778512032240.png" alt="Julie" layout="fill" objectFit="cover" />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px', transition: 'all 0.4s ease', transform: activeCard === 'julie' ? 'translateY(0)' : 'translateY(100%)', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
                    <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '10px' }}>{stats.julie.name}</h3>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', display: 'grid', gap: '6px' }}>
                      <p><strong>Fav Color:</strong> {stats.julie.color}</p>
                      <p><strong>Fav Book:</strong> {stats.julie.book}</p>
                      <p><strong>Vibe:</strong> {stats.julie.vibe}</p>
                    </div>
                  </div>
                </div>

                <div onClick={() => setActiveCard(activeCard === 'harry' ? null : 'harry')} style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden', borderRadius: '25px', height: '350px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                  <Image src="/webapp/public/harry_player_card_1778512044767.png" alt="Harry" layout="fill" objectFit="cover" />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px', transition: 'all 0.4s ease', transform: activeCard === 'harry' ? 'translateY(0)' : 'translateY(100%)', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
                    <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '10px' }}>{stats.harry.name}</h3>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', display: 'grid', gap: '6px' }}>
                      <p><strong>Fav Color:</strong> {stats.harry.color}</p>
                      <p><strong>Fav Book:</strong> {stats.harry.book}</p>
                      <p><strong>Vibe:</strong> {stats.harry.vibe}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled-hidden' : ''}`}>
        <div className="container">
          <Link href="/" className="logo">
            <img src="/assets/logo.svg" alt="Lost & Sound" style={{ height: '120px', width: 'auto', display: 'block' }} />
          </Link>
          
          <div className="nav-links">
            <Link href="/blog">Blog</Link>
            <Link href="/itineraries">Itineraries</Link>
            <Link href="/travel-tricks">Travel Tricks</Link>
            <Link href="/about">Our Story</Link>
            <Link href="/work-with-us">Work With Us</Link>
            <Link href="/start-planning" className="btn btn-primary" style={{ padding: '10px 20px', marginLeft: '12px' }}>Start Planning</Link>
            
            <div className="nav-socials">
              <a href="https://www.instagram.com/lost_and_sound.jpg/" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://www.tiktok.com/@lostandsound.jpg?_r=1&_t=ZS-96DtrMvLXi1" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE STEALTH PILL */}
      <div 
        onClick={toggleMenu}
        className={`mobile-menu-pill ${(isScrolled && !isOpen) ? 'visible' : ''}`}
      >
        <span>Menu</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </div>

      {/* MOBILE OVERLAY MENU */}
      <div className={`mobile-overlay ${isOpen ? 'active' : ''}`}>
        <div className="overlay-header">
           <Link href="/" onClick={toggleMenu} className="logo-small">
              <img src="/assets/logo.svg" alt="Lost & Sound" style={{ height: '60px' }} />
           </Link>
           <button onClick={toggleMenu} className="close-btn">✕</button>
        </div>
        <div className="overlay-links">
          <Link href="/blog" onClick={toggleMenu}>Blog</Link>
          <Link href="/itineraries" onClick={toggleMenu}>Itineraries</Link>
          <Link href="/travel-tricks" onClick={toggleMenu}>Travel Tricks</Link>
          <Link href="/about" onClick={toggleMenu}>Our Story</Link>
          <Link href="/work-with-us" onClick={toggleMenu}>Work With Us</Link>
          <Link href="/start-planning" onClick={toggleMenu} className="btn btn-primary">Start Planning</Link>
          
          <div className="overlay-socials">
            <a href="https://www.instagram.com/lost_and_sound.jpg/" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.tiktok.com/@lostandsound.jpg?_r=1&_t=ZS-96DtrMvLXi1" target="_blank" rel="noopener noreferrer">TikTok</a>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Desktop remains exactly as original */
        .navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 24px 0;
          background-color: transparent;
          transition: all 0.4s ease;
        }

        .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-links {
          display: flex;
          gap: 36px;
          align-items: center;
          background: white;
          padding: 8px 12px 8px 36px;
          border-radius: 500px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          color: var(--color-purple);
        }

        .nav-links a {
          font-family: var(--font-heading);
          font-size: 1.05rem;
          font-weight: 600;
          transition: color 0.2s;
        }

        .nav-links a:hover {
          color: var(--color-orange);
        }

        .nav-socials {
          display: flex;
          gap: 12px;
          margin-left: 12px;
          border-left: 1px solid #eee;
          padding-left: 12px;
        }

        /* MOBILE STEALTH PILL */
        .mobile-menu-pill {
          display: none;
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 2000;
          background: var(--color-purple);
          color: white;
          padding: 10px 20px;
          border-radius: 50px;
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 10px 25px rgba(133, 58, 81, 0.3);
          cursor: pointer;
          align-items: center;
          gap: 10px;
          transform: translateX(-150%);
          transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        }

        .mobile-menu-pill.visible {
          display: flex;
          transform: translateX(0);
        }

        /* MOBILE OVERLAY */
        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--color-bg);
          z-index: 3000;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          transform: translateY(-100%);
          transition: transform 0.6s cubic-bezier(0.85, 0, 0.15, 1);
        }

        .mobile-overlay.active {
          transform: translateY(0);
        }

        .overlay-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 50px;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 2rem;
          color: var(--color-purple);
          cursor: pointer;
        }

        .overlay-links {
          display: flex;
          flex-direction: column;
          gap: 25px;
          align-items: center;
        }

        .overlay-links a {
          font-family: var(--font-heading);
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--color-purple);
        }

        .overlay-socials {
          margin-top: 40px;
          display: flex;
          gap: 20px;
          font-weight: 600;
          color: var(--color-orange);
        }

        @media (max-width: 768px) {
          .navbar.scrolled-hidden {
             transform: translateY(-120%);
          }
          
          .nav-links {
            display: none; /* Hide original desktop links on mobile */
          }
          
          .navbar .container {
            flex-direction: column;
            gap: 16px;
          }
          
          /* Show original stacking mobile view at top */
          .navbar {
            padding: 12px 0;
          }
        }
      `}</style>
    </>
  );
}

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <Link href="/" className="logo">
          <img src="/assets/logo.svg" alt="Lost & Sound" />
        </Link>
        
        <div className="nav-links">
          <Link href="/blog">Blog</Link>
          <Link href="/itineraries">Itineraries</Link>
          <Link href="/travel-tricks">Tricks</Link>
          <Link href="/about">Story</Link>
          <Link href="/work-with-us" className="desktop-only">Work With Us</Link>
          <Link href="/start-planning" className="btn btn-primary nav-cta">Start Planning</Link>
          
          <div className="nav-socials">
            <a href="https://www.instagram.com/lost_and_sound.jpg/" target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://www.tiktok.com/@lostandsound.jpg?_r=1&_t=ZS-96DtrMvLXi1" target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* DESKTOP: EXACTLY AS BEFORE */
        .navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 12px 0;
          background-color: transparent;
          transition: background 0.3s ease;
        }

        .navbar.scrolled {
          background-color: rgba(249, 246, 237, 0.95);
          backdrop-filter: blur(10px);
          padding: 8px 0;
        }

        .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .logo img {
          height: 70px;
          width: auto;
          display: block;
        }

        .navbar.scrolled .logo img {
          height: 55px;
        }

        .nav-links {
          display: flex;
          gap: 36px;
          align-items: center;
          background: white;
          padding: 8px 12px 8px 36px;
          border-radius: 500px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }

        .nav-links a {
          font-family: var(--font-heading);
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--color-purple);
        }

        .nav-links a:hover {
          color: var(--color-orange);
        }

        .nav-cta {
          padding: 10px 20px !important;
          margin-left: 12px;
          font-size: 1rem !important;
        }

        .nav-socials {
          display: flex;
          gap: 8px;
          margin-left: 12px;
          align-items: center;
          color: var(--color-purple);
        }

        /* MOBILE: SLIM PILL, SIDE-BY-SIDE, NO STACKING */
        @media (max-width: 768px) {
          .navbar {
            padding: 8px 0;
          }

          .container {
            flex-direction: row !important; /* Force Side-by-Side */
            justify-content: space-between;
            padding: 0 10px;
            gap: 8px;
          }

          .logo img {
            height: 50px; /* Minimal Logo */
          }

          .nav-links {
            gap: 12px;
            padding: 6px 12px;
            margin: 0;
            background: white;
            flex: 1;
            justify-content: flex-start;
            overflow-x: auto;
            max-width: calc(100vw - 70px);
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            -webkit-overflow-scrolling: touch;
          }

          .nav-links::-webkit-scrollbar {
            display: none;
          }

          .nav-links a {
            font-size: 0.8rem;
          }

          .nav-cta {
            padding: 6px 12px !important;
            margin-left: 0;
            font-size: 0.75rem !important;
          }

          .desktop-only {
            display: none;
          }

          .nav-socials {
            margin-left: 8px;
            padding-left: 8px;
            border-left: 1px solid #eee;
          }
          
          .nav-socials svg {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </nav>
  );
}

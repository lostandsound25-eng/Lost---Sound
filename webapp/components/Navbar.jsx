'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
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
          <Link href="/work-with-us" className="desktop-only">Work</Link>
          <Link href="/start-planning" className="btn btn-primary nav-cta">Plan</Link>
          
          <div className="nav-socials">
            <a href="https://www.instagram.com/lost_and_sound.jpg/" target="_blank" rel="noopener noreferrer">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://www.tiktok.com/@lostandsound.jpg?_r=1&_t=ZS-96DtrMvLXi1" target="_blank" rel="noopener noreferrer">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 24px 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background-color: transparent;
        }

        .navbar.scrolled {
          padding: 12px 0;
          background: rgba(249, 246, 237, 0.9);
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 30px rgba(0,0,0,0.05);
        }

        .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo img {
          height: 120px; /* Restored Desktop Height */
          width: auto;
          transition: all 0.4s ease;
        }

        .navbar.scrolled .logo img {
          height: 70px;
        }

        .nav-links {
          display: flex;
          gap: 36px; /* Restored Desktop Gap */
          align-items: center;
          background: white;
          padding: 10px 14px 10px 40px;
          border-radius: 500px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          transition: all 0.4s ease;
        }

        .nav-links a {
          font-family: var(--font-heading);
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-purple);
          white-space: nowrap;
        }

        .nav-links a:hover {
          color: var(--color-orange);
        }

        .nav-cta {
          padding: 10px 24px !important;
          font-size: 1rem !important;
        }

        .nav-socials {
          display: flex;
          gap: 12px;
          padding-left: 16px;
          border-left: 1px solid #eee;
          color: var(--color-purple);
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 10px 0;
          }

          .container {
            padding: 0 12px;
            gap: 10px;
          }

          .logo img {
            height: 70px;
          }

          .navbar.scrolled .logo img {
            height: 60px;
          }

          .nav-links {
            gap: 16px;
            padding: 6px 12px 6px 20px;
            overflow-x: auto;
            max-width: calc(100vw - 90px);
            -webkit-overflow-scrolling: touch;
          }

          .nav-links::-webkit-scrollbar {
            display: none;
          }

          .nav-links a {
            font-size: 0.9rem;
          }

          .desktop-only {
            display: none;
          }

          .nav-socials {
            padding-left: 12px;
            gap: 8px;
          }
        }
      `}</style>
    </nav>
  );
}

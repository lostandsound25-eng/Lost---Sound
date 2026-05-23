'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Search from './Search';

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    
    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the drawer when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const isTracker = pathname === '/tracker';
  const isCollapsed = isTracker || isScrolled;

  return (
    <>
      <nav className={`navbar ${isCollapsed ? 'collapsed-mobile' : ''}`}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Link href="/" className="logo">
            <img 
              src="/assets/logo.svg" 
              alt="Lost & Sound" 
              className="logo-img"
            />
          </Link>
          
          {/* Desktop links - hidden on mobile in collapsed/tracker mode via CSS */}
          <div className="nav-links desktop-only">
            <Search />
            <Link href="/blog">Blog</Link>
            <Link href="/routes">Routes</Link>
            <Link href="/travel-tricks">Travel Tricks</Link>
            <Link href="/about">Our Story</Link>
            <Link href="/start-planning" className="btn btn-primary btn-nav">Start Planning</Link>
            
            <div className="nav-socials">
              <a href="mailto:lostandsound25@gmail.com" aria-label="Email Us">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </a>
              <a href="https://www.instagram.com/lost_and_sound.jpg/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://www.tiktok.com/@lostandsound.jpg?_r=1&_t=ZS-96DtrMvLXi1" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
              </a>
            </div>
          </div>

          {/* Hamburger trigger - shown ONLY on mobile when collapsed or tracker */}
          <button 
            type="button"
            className="hamburger-btn"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-purple)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile drawer menu */}
      {isMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="mobile-drawer" 
            onClick={(e) => e.stopPropagation()}
            ref={menuRef}
          >
            <div className="drawer-header">
              <Link href="/" className="logo-drawer" onClick={() => setIsMenuOpen(false)}>
                <img src="/assets/logo.svg" alt="Lost & Sound" style={{ height: '70px', width: 'auto' }} />
              </Link>
              <button 
                type="button" 
                className="drawer-close-btn"
                onClick={() => setIsMenuOpen(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="drawer-search-wrap">
              <Search />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-purple)', marginLeft: '8px' }}>Search Site</span>
            </div>

            <div className="drawer-links">
              <Link href="/blog" onClick={() => setIsMenuOpen(false)}>Blog</Link>
              <Link href="/routes" onClick={() => setIsMenuOpen(false)}>Routes</Link>
              <Link href="/travel-tricks" onClick={() => setIsMenuOpen(false)}>Travel Tricks</Link>
              <Link href="/about" onClick={() => setIsMenuOpen(false)}>Our Story</Link>
              <Link href="/start-planning" className="btn btn-primary drawer-cta" onClick={() => setIsMenuOpen(false)}>
                Start Planning
              </Link>
            </div>

            <div className="drawer-socials">
              <a href="mailto:lostandsound25@gmail.com" aria-label="Email Us">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </a>
              <a href="https://www.instagram.com/lost_and_sound.jpg/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://www.tiktok.com/@lostandsound.jpg?_r=1&_t=ZS-96DtrMvLXi1" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

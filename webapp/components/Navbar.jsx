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

  const isTracker = pathname?.startsWith('/tracker');
  const isCollapsed = isTracker || isScrolled;

  return (
    <>
      <nav className={`navbar ${isCollapsed ? 'collapsed-mobile' : ''} ${isTracker ? 'navbar-tracker' : ''}`}>
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
            <Link href="/gallery">Gallery</Link>
            <Link href="/travel-tricks">Travel Tricks</Link>
            <Link href="/about">Our Story</Link>
            <Link href="/start-planning" className="btn btn-primary btn-nav">Start Planning</Link>
            
            <div className="nav-socials" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <a href="mailto:lostandsound25@gmail.com" aria-label="Email Us" style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </a>
              <a href="https://www.instagram.com/lost_and_sound.jpg/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://www.tiktok.com/@lostandsound.jpg?_r=1&_t=ZS-96DtrMvLXi1" target="_blank" rel="noopener noreferrer" aria-label="TikTok" style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
              </a>
              <a href="https://pin.it/64nvnZg6i" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-purple)"><path d="M9.686 18.885c.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.02 0 1.513.769 1.513 1.688 0 1.027-.653 2.567-.992 3.993-.284 1.194.598 2.169 1.776 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.397 2.967 7.397 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146"/></svg>
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
              <Link href="/gallery" onClick={() => setIsMenuOpen(false)}>Gallery</Link>
              <Link href="/travel-tricks" onClick={() => setIsMenuOpen(false)}>Travel Tricks</Link>
              <Link href="/about" onClick={() => setIsMenuOpen(false)}>Our Story</Link>
              <Link href="/start-planning" className="btn btn-primary drawer-cta" onClick={() => setIsMenuOpen(false)}>
                Start Planning
              </Link>
            </div>

            <div className="drawer-socials" style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
              <a href="mailto:lostandsound25@gmail.com" aria-label="Email Us" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </a>
              <a href="https://www.instagram.com/lost_and_sound.jpg/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://www.tiktok.com/@lostandsound.jpg?_r=1&_t=ZS-96DtrMvLXi1" target="_blank" rel="noopener noreferrer" aria-label="TikTok" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
              </a>
              <a href="https://pin.it/64nvnZg6i" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-purple)"><path d="M9.686 18.885c.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.02 0 1.513.769 1.513 1.688 0 1.027-.653 2.567-.992 3.993-.284 1.194.598 2.169 1.776 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.397 2.967 7.397 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146"/></svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

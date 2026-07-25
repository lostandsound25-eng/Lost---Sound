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
              <a href="https://pin.it/64nvnZg6i" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" style={{ display: 'flex' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--color-purple)"><path d="M12.14.004C5.464.004.04 5.428.04 12.104c0 5.127 3.193 9.502 7.7 11.253-.106-.957-.202-2.429.04-3.473.22-.947 1.42-6.015 1.42-6.015s-.362-.725-.362-1.796c0-1.682.975-2.937 2.189-2.937 1.032 0 1.53.775 1.53 1.704 0 1.037-.66 2.593-1.002 4.032-.285 1.206.604 2.189 1.793 2.189 2.152 0 3.806-2.27 3.806-5.545 0-2.9-2.083-4.928-5.058-4.928-3.445 0-5.467 2.585-5.467 5.255 0 1.04.4 2.155.9 2.763.1.12.113.226.084.348l-.336 1.373c-.053.222-.176.269-.406.162-1.513-.704-2.458-2.915-2.458-4.692 0-3.82 2.776-7.33 8.002-7.33 4.202 0 7.466 2.994 7.466 6.995 0 4.174-2.631 7.533-6.284 7.533-1.227 0-2.38-.637-2.75-1.39l-.755 2.88c-.273 1.053-1.01 2.372-1.506 3.176 1.185.367 2.443.567 3.748.567 6.677 0 12.102-5.424 12.102-12.1 0-6.678-5.425-12.101-12.102-12.101z"/></svg>
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
              <a href="https://pin.it/64nvnZg6i" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="var(--color-purple)"><path d="M12.14.004C5.464.004.04 5.428.04 12.104c0 5.127 3.193 9.502 7.7 11.253-.106-.957-.202-2.429.04-3.473.22-.947 1.42-6.015 1.42-6.015s-.362-.725-.362-1.796c0-1.682.975-2.937 2.189-2.937 1.032 0 1.53.775 1.53 1.704 0 1.037-.66 2.593-1.002 4.032-.285 1.206.604 2.189 1.793 2.189 2.152 0 3.806-2.27 3.806-5.545 0-2.9-2.083-4.928-5.058-4.928-3.445 0-5.467 2.585-5.467 5.255 0 1.04.4 2.155.9 2.763.1.12.113.226.084.348l-.336 1.373c-.053.222-.176.269-.406.162-1.513-.704-2.458-2.915-2.458-4.692 0-3.82 2.776-7.33 8.002-7.33 4.202 0 7.466 2.994 7.466 6.995 0 4.174-2.631 7.533-6.284 7.533-1.227 0-2.38-.637-2.75-1.39l-.755 2.88c-.273 1.053-1.01 2.372-1.506 3.176 1.185.367 2.443.567 3.748.567 6.677 0 12.102-5.424 12.102-12.1 0-6.678-5.425-12.101-12.102-12.101z"/></svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

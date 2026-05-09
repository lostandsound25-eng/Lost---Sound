import './globals.css'
// Triggering a fresh build for the hero updates
import { Inter, Outfit } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-heading', weight: ['400', '600', '800', '900'] })

export const metadata = {
  title: 'Lost & Sound | Custom Travel Planning',
  description: 'Travel the world without burning out or breaking the bank.',
  icons: {
    icon: '/assets/logo.svg',
  },
}

import Link from 'next/link'
import KeepInTouchForm from '../components/KeepInTouchForm'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <nav className="navbar">
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
              
              <div style={{ display: 'flex', gap: '8px', marginLeft: '12px', alignItems: 'center' }}>
                <a href="#" aria-label="Instagram">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="#" aria-label="TikTok">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                </a>
              </div>
            </div>
          </div>
        </nav>

        {children}

        <footer>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '2rem' }}>
              <a href="#" aria-label="Instagram">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" aria-label="TikTok">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
              </a>
            </div>
            <div className="footer-links">
              <Link href="/blog">Blog</Link>
              <Link href="/itineraries">Destinations</Link>
              <Link href="/travel-tricks">Travel Tricks</Link>
              <Link href="/about">Our Story</Link>
              <Link href="/work-with-us">Work With Us</Link>
            </div>
            
            <div style={{ maxWidth: '400px', margin: '0 auto 3rem auto', backgroundColor: 'rgba(255,255,255,0.1)', padding: '24px', borderRadius: 'var(--radius-card)' }}>
              <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>Keep in Touch</h4>
              <p style={{ opacity: 0.9, marginBottom: '1rem', fontSize: '0.9rem' }}>Drop your email to get our Nomad Tracker and a free itinerary right to your inbox!</p>
              <KeepInTouchForm />
            </div>

            <p style={{ opacity: 0.8 }}>&copy; 2026 Lost & Sound. Travel the world without burning out.</p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  )
}

import './globals.css'
import { Inter, Outfit, Caveat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { GoogleAnalytics } from '@next/third-parties/google'
import Navbar from '../components/Navbar'
import KeepInTouchForm from '../components/KeepInTouchForm'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-heading', weight: ['400', '600', '800', '900'] })
const caveat = Caveat({ subsets: ['latin'], variable: '--font-hand' })

export const metadata = {
  title: 'Lost & Sound | Travel Tips, Blog, and Custom Trips',
  description: 'Travel the world without burning out or breaking the bank.',
  icons: {
    icon: '/assets/logo.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} ${caveat.variable}`}>
        <Navbar />

        {children}

        <footer>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '2rem' }}>
              <a href="https://www.instagram.com/lost_and_sound.jpg/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://www.tiktok.com/@lostandsound.jpg?_r=1&_t=ZS-96DtrMvLXi1" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
              </a>
            </div>
            <div className="footer-links" style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <Link href="/blog">Blog</Link>
              <Link href="/itineraries">Itineraries</Link>
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
        <GoogleAnalytics gaId="G-858PS2M57B" />
      </body>
    </html>
  )
}

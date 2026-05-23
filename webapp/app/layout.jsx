import './globals.css'
import { Inter, Outfit, Caveat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { GoogleAnalytics } from '@next/third-parties/google'
import KeepInTouchForm from '../components/KeepInTouchForm'
import Navbar from '../components/Navbar'
import Link from 'next/link'
import Script from 'next/script'

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
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '2rem' }}>
              <a href="mailto:lostandsound25@gmail.com" aria-label="Email Us" style={{ display: 'flex' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </a>
              <a href="https://www.instagram.com/lost_and_sound.jpg/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ display: 'flex' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://www.tiktok.com/@lostandsound.jpg?_r=1&_t=ZS-96DtrMvLXi1" target="_blank" rel="noopener noreferrer" aria-label="TikTok" style={{ display: 'flex' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
              </a>
            </div>
            <div className="footer-links" style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <Link href="/blog">Blog</Link>
              <Link href="/routes">Routes</Link>
              <Link href="/travel-tricks">Travel Tricks</Link>
              <Link href="/about">Our Story</Link>
            </div>
            
            <div style={{ maxWidth: '400px', margin: '0 auto 3rem auto', backgroundColor: 'rgba(255,255,255,0.1)', padding: '24px', borderRadius: 'var(--radius-card)' }}>
              <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>Keep in Touch</h4>
              <p style={{ opacity: 0.9, marginBottom: '1rem', fontSize: '0.9rem' }}>Drop your email for travel routes right to your inbox!</p>
              <KeepInTouchForm />
            </div>

            <p style={{ opacity: 0.8 }}>&copy; 2026 Lost & Sound. Travel the world without burning out.</p>
          </div>
        </footer>
        <Analytics />
        <GoogleAnalytics gaId="G-858PS2M57B" />
        <Script id="stay22-script" strategy="afterInteractive">
          {`
            (function (s, t, a, y, twenty, two) {
              s.Stay22 = s.Stay22 || {};
              s.Stay22.params = { lmaID: '6a07e3f8eaad88fd98f397a9' };
              twenty = t.createElement(a);
              two = t.getElementsByTagName(a)[0];
              twenty.async = 1;
              twenty.src = y;
              two.parentNode.insertBefore(twenty, two);
            })(window, document, 'script', 'https://scripts.stay22.com/letmeallez.js');
          `}
        </Script>
      </body>
    </html>
  )
}

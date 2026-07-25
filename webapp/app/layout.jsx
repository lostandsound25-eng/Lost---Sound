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
  description: 'Sharing our journey to simplify yours.',
  icons: {
    icon: '/assets/logo.svg',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
              <a href="https://pin.it/64nvnZg6i" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" style={{ display: 'flex' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12.14.004C5.464.004.04 5.428.04 12.104c0 5.127 3.193 9.502 7.7 11.253-.106-.957-.202-2.429.04-3.473.22-.947 1.42-6.015 1.42-6.015s-.362-.725-.362-1.796c0-1.682.975-2.937 2.189-2.937 1.032 0 1.53.775 1.53 1.704 0 1.037-.66 2.593-1.002 4.032-.285 1.206.604 2.189 1.793 2.189 2.152 0 3.806-2.27 3.806-5.545 0-2.9-2.083-4.928-5.058-4.928-3.445 0-5.467 2.585-5.467 5.255 0 1.04.4 2.155.9 2.763.1.12.113.226.084.348l-.336 1.373c-.053.222-.176.269-.406.162-1.513-.704-2.458-2.915-2.458-4.692 0-3.82 2.776-7.33 8.002-7.33 4.202 0 7.466 2.994 7.466 6.995 0 4.174-2.631 7.533-6.284 7.533-1.227 0-2.38-.637-2.75-1.39l-.755 2.88c-.273 1.053-1.01 2.372-1.506 3.176 1.185.367 2.443.567 3.748.567 6.677 0 12.102-5.424 12.102-12.1 0-6.678-5.425-12.101-12.102-12.101z"/></svg>
              </a>
            </div>
            <div className="footer-links" style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <Link href="/blog">Blog</Link>
              <Link href="/gallery">Gallery</Link>
              <Link href="/travel-tricks">Travel Tricks</Link>
              <Link href="/about">Our Story</Link>
            </div>
            
            <div style={{ maxWidth: '400px', margin: '0 auto 3rem auto', backgroundColor: 'rgba(255,255,255,0.1)', padding: '24px', borderRadius: 'var(--radius-card)' }}>
              <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>Keep in Touch</h4>
              <p style={{ opacity: 0.9, marginBottom: '1rem', fontSize: '0.9rem' }}>Drop your email for travel routes right to your inbox!</p>
              <KeepInTouchForm />
            </div>

            <p style={{ opacity: 0.65, fontSize: '0.8rem', maxWidth: '620px', margin: '0 auto 1.5rem auto', lineHeight: 1.5, textAlign: 'center' }}>
              Lost & Sound is reader-supported. As an Amazon Associate and affiliate partner with Booking.com, Agoda, 12Go, and others, we may earn a small commission when you purchase through links on our site at no extra cost to you.
            </p>

            <p style={{ opacity: 0.8 }}>&copy; 2026 Lost & Sound. Sharing our journey to simplify yours.</p>
          </div>
        </footer>
        <Analytics />
        <GoogleAnalytics gaId="G-858PS2M57B" />
        <Script id="stay22-script" strategy="afterInteractive">
          {`
            (function (s, t, a, y, twenty, two) {
              if (window.location.pathname.startsWith('/tracker')) return;
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

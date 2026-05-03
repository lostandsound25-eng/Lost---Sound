import './globals.css'
import { Inter, Outfit } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-heading', weight: ['400', '600', '800', '900'] })

export const metadata = {
  title: 'Lost & Sound | Custom Travel Planning',
  description: 'Travel the world without burning out or breaking the bank.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>
        {children}
      </body>
    </html>
  )
}

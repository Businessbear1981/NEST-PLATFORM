import type { Metadata } from 'next'
import { Cormorant_Garamond, Space_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-space',
  display: 'swap',
})
const ibmMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'NEST — The Architecture of Permanent Wealth',
  description: 'Private bond structuring · PE fund · M&A intelligence · Arden Edge Capital × Soparrow Capital',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${spaceGrotesk.variable} ${ibmMono.variable}`}>
      <body className="bg-nest-void text-nest-cream font-space antialiased">
        {children}
      </body>
    </html>
  )
}

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: 'FuelTrack — Your Fuel Game',
  description: 'Track, compete, and optimize your fuel efficiency. Gamified fuel tracking for the modern rider.',
  generator: 'v0.app',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FuelTrack',
  },
  icons: {
    icon: [
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#171717',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

import SessionProvider from '@/components/auth/session-provider'
import { VehicleProvider } from '@/components/auth/vehicle-provider'
import { CurrencyProvider } from '@/components/currency-provider'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>
          <CurrencyProvider>
            <VehicleProvider>
              {children}
              <Analytics />
            </VehicleProvider>
          </CurrencyProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

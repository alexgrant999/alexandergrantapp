import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'

export const metadata: Metadata = {
  title: 'Alexander Grant | Growth Partner for Independent Retailers',
  description: 'Paid advertising, SEO, email, and custom-built platforms for independent brands. Measured against your revenue, year on year.',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Local runs and preview deployments would otherwise send page views to the live property.
  const gaId = process.env.VERCEL_ENV === 'production' ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID : undefined
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Besley:ital,wght@0,400;0,600;0,700;1,400&family=Libre+Franklin:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  )
}

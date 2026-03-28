import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Alexander Grant — Developer',
  description: 'Full-stack developer building web & mobile products',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display+SC:wght@400;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}

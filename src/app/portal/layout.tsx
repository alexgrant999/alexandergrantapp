import type { Metadata } from 'next'

// Client portal links carry an access token, so they stay out of search results.
// Not blocked in robots.ts, because Google has to crawl a page to see its noindex.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children
}

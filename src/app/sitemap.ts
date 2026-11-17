import type { MetadataRoute } from 'next'

const SITE_URL = 'https://alexandergrant.app'

// Public pages only. /portal holds tokenised client links and must never be listed.
const PUBLIC_PATHS = ['/', '/wix-booking-alternative', '/custom-booking-software-for-studios', '/shopify-marketing-for-independent-stores', '/custom-software-for-small-business', '/resources', '/sms', '/privacy', '/terms']

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map(path => ({ url: `${SITE_URL}${path}` }))
}

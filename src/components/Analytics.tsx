'use client'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { GoogleAnalytics } from '@next/third-parties/google'

const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID

// The manage link carries a token that can cancel or move a call, so no Google tag loads on it and its URL is never recorded.
export function Analytics({ gaId }: { gaId: string }) {
  const pathname = usePathname()
  if (pathname.startsWith('/book/manage')) return null
  return (
    <>
      <GoogleAnalytics gaId={gaId} />
      {/* The Ads tag has to be configured on the landing page, where the ad click id arrives, for the booked call conversion to be credited. */}
      {ADS_ID && (
        <Script id="google-ads-config" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('config',${JSON.stringify(ADS_ID)});`}
        </Script>
      )}
    </>
  )
}

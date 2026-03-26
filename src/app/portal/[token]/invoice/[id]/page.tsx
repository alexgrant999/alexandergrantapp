import { Suspense } from 'react'
import { PortalInvoiceClient } from './PortalInvoiceClient'

export default async function PortalInvoicePage({ params }: { params: Promise<{ token: string; id: string }> }) {
  const { token, id } = await params
  return (
    <Suspense>
      <PortalInvoiceClient token={token} id={id} />
    </Suspense>
  )
}

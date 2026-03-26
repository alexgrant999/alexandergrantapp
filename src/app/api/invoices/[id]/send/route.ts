import { NextResponse } from 'next/server'
import { getInvoice, updateInvoiceStatus } from '@/lib/services/invoices'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await getInvoice(id)
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    to: invoice.client.email,
    subject: `Invoice ${invoice.number} from Alexander Grant`,
    body: `Hi ${invoice.client.name}, please find your invoice below.`,
  })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await getInvoice(id)
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { to, subject, body } = await req.json() as { to: string; subject: string; body: string }
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/${invoice.client.portalToken}/invoice/${invoice.id}`

  await resend.emails.send({
    from: 'Alexander Grant <alex@alexandergrant.app>',
    to,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f9f9f9;">
        <h2 style="color: #1a1a2e; margin-bottom: 8px;">Invoice ${invoice.number}</h2>
        <p style="color: #666; margin-bottom: 32px;">${body.replace(/\n/g, '<br />')}</p>
        <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            ${invoice.items.map(item => `
              <tr>
                <td style="padding: 8px 0; color: #333; border-bottom: 1px solid #f0f0f0;">${item.description}</td>
                <td style="padding: 8px 0; text-align: right; color: #333; border-bottom: 1px solid #f0f0f0;">$${Number(item.amount).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr>
              <td style="padding: 16px 0 8px; color: #666;">Subtotal</td>
              <td style="padding: 16px 0 8px; text-align: right; color: #666;">$${Number(invoice.subtotal).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Tax</td>
              <td style="padding: 4px 0; text-align: right; color: #666;">$${Number(invoice.tax).toFixed(2)}</td>
            </tr>
            <tr style="border-top: 2px solid #eee;">
              <td style="padding: 12px 0 0; font-weight: bold; color: #1a1a2e; font-size: 1.1em;">Total</td>
              <td style="padding: 12px 0 0; text-align: right; font-weight: bold; font-size: 1.2em; color: #6c63ff;">$${Number(invoice.total).toFixed(2)} USD</td>
            </tr>
          </table>
        </div>
        <a href="${portalUrl}" style="display: inline-block; background: #6c63ff; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1em;">View &amp; Pay Invoice →</a>
        <p style="color: #999; font-size: 0.85em; margin-top: 32px;">Due by ${new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <p style="color: #bbb; font-size: 0.8em; margin-top: 8px;">Alexander Grant · alex@alexandergrant.app</p>
      </div>
    `,
  })

  await updateInvoiceStatus(id, 'SENT')
  return NextResponse.json({ ok: true })
}

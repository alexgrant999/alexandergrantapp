import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createCheckoutSession(invoice: {
  id: string
  number: string
  total: string | number
  clientEmail: string
  clientName: string
  portalToken: string
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: invoice.clientEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `Invoice ${invoice.number} — Alexander Grant` },
          unit_amount: Math.round(Number(invoice.total) * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${invoice.portalToken}/invoice/${invoice.id}?paid=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${invoice.portalToken}/invoice/${invoice.id}`,
    metadata: { invoiceId: invoice.id },
  })

  return session
}

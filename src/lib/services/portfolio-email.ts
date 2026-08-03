import { Resend } from 'resend'
import { PORTFOLIO } from '@/lib/voice/portfolio'
import type { EmailExamplesInput } from '@/lib/validators/sms-opt-in'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Sends the same portfolio links the SMS carries, to anyone who would rather not
 * hand over a mobile number.
 *
 * One message, sent because it was asked for. No list, no record kept, nothing
 * recurring, so this stays outside the A2P program entirely.
 *
 * The "from" address has to stay on the verified domain. Support and replies go
 * to the gmail address, which is what every public page prints.
 */
export async function emailPortfolio(input: EmailExamplesInput) {
  const greeting = input.name ? `Hi ${input.name.split(' ')[0]},` : 'Hi,'

  const items = PORTFOLIO.map(
    p => `
      <li style="margin-bottom: 16px;">
        <a href="${p.url}" style="color: #1a1a2e; font-weight: 600; text-decoration: none;">${p.label}</a>
        <div style="color: #666; font-size: 0.9em; margin-top: 2px;">${p.blurb}</div>
      </li>`
  ).join('')

  await resend.emails.send({
    from: 'Alexander Grant <alex@alexandergrant.app>',
    replyTo: 'alexandergrantapp@gmail.com',
    to: input.email,
    subject: 'A few things I have built',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <p style="color: #666;">${greeting}</p>
        <p style="color: #666;">You asked for examples of my work. Here they are.</p>
        <ul style="list-style: none; padding: 0; margin: 24px 0;">${items}</ul>
        <p style="color: #666;">Happy to talk through any of it. Just reply to this email.</p>
        <p style="color: #bbb; font-size: 0.8em; margin-top: 32px;">
          Alexander Grant · alexandergrantapp@gmail.com<br />
          You received this because you requested it at alexandergrant.app/sms.
          You are not subscribed to anything and will not hear from us again unless you ask.
        </p>
      </div>
    `,
  })
}

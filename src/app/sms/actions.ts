'use server'

import { headers } from 'next/headers'
import { smsOptInSchema, emailExamplesSchema } from '@/lib/validators/sms-opt-in'
import { recordSmsOptIn } from '@/lib/services/sms-opt-in'
import { emailPortfolio } from '@/lib/services/portfolio-email'

export type OptInState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  delivered?: boolean
}

export type EmailState = {
  status: 'idle' | 'success' | 'error'
  message?: string
}

export async function submitOptIn(_prev: OptInState, formData: FormData): Promise<OptInState> {
  const parsed = smsOptInSchema.safeParse({
    phone: formData.get('phone'),
    name: formData.get('name'),
    consent: formData.get('consent'),
  })

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Please check the form and try again' }
  }

  const h = await headers()

  try {
    const { delivered } = await recordSmsOptIn(parsed.data, {
      userAgent: h.get('user-agent'),
      ip: h.get('x-forwarded-for')?.split(',')[0]?.trim(),
    })
    return { status: 'success', delivered }
  } catch (err) {
    console.error('[sms-opt-in] failed to save', err)
    return { status: 'error', message: 'Something went wrong. Please email alexandergrantapp@gmail.com instead.' }
  }
}

export async function sendExamplesByEmail(_prev: EmailState, formData: FormData): Promise<EmailState> {
  const parsed = emailExamplesSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
  })

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Please check the form and try again' }
  }

  try {
    await emailPortfolio(parsed.data)
    return { status: 'success' }
  } catch (err) {
    console.error('[portfolio-email] send failed', err)
    return { status: 'error', message: 'Something went wrong. Please email alexandergrantapp@gmail.com instead.' }
  }
}

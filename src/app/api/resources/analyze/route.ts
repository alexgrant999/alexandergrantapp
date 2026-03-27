import { NextResponse } from 'next/server'
import { analyzeUrl } from '@/lib/services/resources'
import { z } from 'zod'

const schema = z.object({
  url: z.string().url(),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  try {
    const result = await analyzeUrl(parsed.data.url)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Analyze failed:', error)
    const hostname = new URL(parsed.data.url).hostname.replace('www.', '')
    return NextResponse.json({
      title: hostname,
      description: '',
      tags: [],
      image: null,
    })
  }
}

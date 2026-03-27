import { prisma } from '@/lib/db/prisma'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function getAllResources() {
  return prisma.resource.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

function extractOgImage(html: string, baseUrl: string): string | null {
  const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
  if (ogMatch?.[1]) {
    const img = ogMatch[1]
    if (img.startsWith('http')) return img
    try {
      return new URL(img, baseUrl).href
    } catch {
      return null
    }
  }
  return null
}

export async function analyzeUrl(url: string): Promise<{
  title: string
  description: string
  tags: string[]
  image: string | null
}> {
  let html = ''
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ResourceBot/1.0)' },
      signal: AbortSignal.timeout(10000),
    })
    html = await response.text()
  } catch {
    html = `Could not fetch page. URL is: ${url}`
  }

  const image = extractOgImage(html, url)
  const trimmed = html.slice(0, 8000)

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `Here is the HTML from ${url}:\n\n${trimmed}\n\nRespond with JSON only, no markdown fences:\n{"title": "short descriptive name for this resource", "description": "1-2 sentence description of what this website/resource offers", "tags": ["tag1", "tag2", "tag3"]}\n\nKeep tags lowercase, max 4 tags. Pick from: ai, skills, tools, components, ui, community, learning, automation, claude, marketplace, open-source, or create a relevant one.`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'

  try {
    const parsed = JSON.parse(text)
    return {
      title: parsed.title || new URL(url).hostname,
      description: parsed.description || '',
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 4) : [],
      image,
    }
  } catch {
    return {
      title: new URL(url).hostname.replace('www.', ''),
      description: '',
      tags: [],
      image,
    }
  }
}

export async function createResource(data: {
  url: string
  title: string
  description?: string
  image?: string
  submittedBy?: string
  tags?: string[]
}) {
  return prisma.resource.create({
    data: {
      url: data.url,
      title: data.title,
      description: data.description || null,
      image: data.image || null,
      submittedBy: data.submittedBy || null,
      tags: data.tags || [],
    },
  })
}

export async function deleteResource(id: string) {
  return prisma.resource.delete({ where: { id } })
}

export async function regenerateDescription(id: string) {
  const resource = await prisma.resource.findUnique({ where: { id } })
  if (!resource) throw new Error('Resource not found')
  const analysis = await analyzeUrl(resource.url)
  return prisma.resource.update({
    where: { id },
    data: {
      description: analysis.description,
      tags: analysis.tags,
    },
  })
}

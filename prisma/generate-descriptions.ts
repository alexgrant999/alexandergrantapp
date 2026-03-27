import { PrismaClient } from '@prisma/client'
import Anthropic from '@anthropic-ai/sdk'

const prisma = new PrismaClient()
const anthropic = new Anthropic()

async function main() {
  const resources = await prisma.resource.findMany({
    where: { description: null },
  })

  console.log(`Generating descriptions for ${resources.length} resources...`)

  for (const resource of resources) {
    try {
      console.log(`Fetching ${resource.url}...`)
      const response = await fetch(resource.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ResourceBot/1.0)' },
        signal: AbortSignal.timeout(10000),
      })
      const html = await response.text()
      const trimmed = html.slice(0, 8000)

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: `Here is the HTML from ${resource.url}:\n\n${trimmed}\n\nWrite a 1-2 sentence description of what this website/resource offers. Be concise and helpful. Just the description, no preamble.`,
          },
        ],
      })

      const description =
        message.content[0].type === 'text' ? message.content[0].text : null

      if (description) {
        await prisma.resource.update({
          where: { id: resource.id },
          data: { description },
        })
        console.log(`✓ ${resource.title}: ${description}`)
      }
    } catch (error) {
      console.error(`✗ ${resource.title}: ${error}`)
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const seedResources = [
  {
    url: 'https://skillsmp.com/categories/cli-tools',
    title: 'Skills MP - CLI Tools',
    tags: ['skills', 'cli', 'marketplace'],
    submittedBy: 'Alex',
  },
  {
    url: 'https://21st.dev/community/components/featured',
    title: '21st.dev - React Components',
    tags: ['react', 'components', 'ui'],
    submittedBy: 'Alex',
  },
  {
    url: 'https://github.com/anthropics/skills/tree/main',
    title: 'Anthropic Official Skills Repo',
    tags: ['skills', 'claude', 'official'],
    submittedBy: 'Alex',
  },
  {
    url: 'https://www.skillhub.club/',
    title: 'SkillHub - AI Agent Skills Marketplace',
    tags: ['skills', 'marketplace', 'ai'],
    submittedBy: 'Alex',
  },
  {
    url: 'https://www.skool.com/scrapes',
    title: 'Agentic Academy (Skool)',
    tags: ['community', 'learning', 'agentic'],
    submittedBy: 'Alex',
  },
]

async function main() {
  for (const resource of seedResources) {
    await prisma.resource.upsert({
      where: { url: resource.url },
      update: {},
      create: resource,
    })
    console.log(`Seeded: ${resource.title}`)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const projects = [
  {
    name: 'Alexander Grant App',
    description: 'Personal portfolio and showcase site.',
    status: 'ACTIVE' as const,
    tech: 'HTML, CSS, JavaScript, Puppeteer',
  },
  {
    name: 'BaliSpirit',
    description: 'Retreat and wellness event platform, Bali-focused.',
    status: 'ACTIVE' as const,
    tech: 'Next.js, TypeScript, Supabase, Tailwind CSS',
  },
  {
    name: 'Claude Brain',
    description: 'Central intelligence layer storing prompts, instructions, how-to guides, and preferences across all projects.',
    status: 'ACTIVE' as const,
    tech: 'Node.js, TypeScript, PostgreSQL, Supabase',
  },
  {
    name: 'FindYoga',
    description: 'Yoga class discovery and booking platform for Australia. Studios list classes; students find and book.',
    status: 'ACTIVE' as const,
    tech: 'Next.js, TypeScript, Supabase, Tailwind CSS, Stripe',
  },
  {
    name: 'iEmerge',
    description: 'Wellness / personal development app.',
    status: 'ACTIVE' as const,
    tech: 'Flutter, Dart',
  },
  {
    name: 'Playday',
    description: 'Event and activity booking platform for families. Parents discover and book kids\' activities, classes, and events.',
    status: 'ACTIVE' as const,
    tech: 'Next.js, TypeScript, Supabase, Tailwind CSS, Stripe, Flutter',
  },
  {
    name: 'Real Estate App',
    description: 'Real estate listings and management tool.',
    status: 'ON_HOLD' as const,
    tech: 'Next.js, TypeScript, Supabase, Tailwind CSS',
  },
  {
    name: 'TCM Study',
    description: 'Traditional Chinese Medicine study aid.',
    status: 'ACTIVE' as const,
    tech: 'Next.js, TypeScript, Supabase, Tailwind CSS',
  },
  {
    name: 'TRNZK Sewing Classes',
    description: 'Booking system for a sewing school. Students book full terms, class packs, or casual sessions.',
    status: 'ACTIVE' as const,
    tech: 'Next.js 15, PostgreSQL, Prisma, Stripe',
  },
  {
    name: 'Vibroacoustic App',
    description: 'Vibroacoustic therapy session player and management tool.',
    status: 'ACTIVE' as const,
    tech: 'Flutter, Dart',
  },
  {
    name: 'Zen Book',
    description: 'Booking/scheduling tool with a minimalist aesthetic.',
    status: 'COMPLETED' as const,
    tech: 'Next.js, TypeScript, Supabase, Tailwind CSS',
  },
]

async function main() {
  console.log('Seeding projects...')

  for (const proj of projects) {
    const client = await prisma.client.upsert({
      where: { email: `${proj.name.toLowerCase().replace(/\s+/g, '-')}@projects.local` },
      update: {},
      create: {
        name: proj.name,
        email: `${proj.name.toLowerCase().replace(/\s+/g, '-')}@projects.local`,
        company: proj.name,
        notes: `Tech: ${proj.tech}`,
      },
    })

    await prisma.project.upsert({
      where: { id: `seed-${proj.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `seed-${proj.name.toLowerCase().replace(/\s+/g, '-')}`,
        clientId: client.id,
        name: proj.name,
        description: proj.description,
        status: proj.status,
      },
    })

    console.log(`  ✓ ${proj.name}`)
  }

  console.log('Done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

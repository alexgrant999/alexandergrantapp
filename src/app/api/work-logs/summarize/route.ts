import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import Anthropic from '@anthropic-ai/sdk'
import postgres from 'postgres'

const anthropic = new Anthropic()

async function getProjectContext(projectName: string) {
  const brainUrl = process.env.CLAUDE_BRAIN_DATABASE_URL
  if (!brainUrl) return null

  const sql = postgres(brainUrl)

  try {
    const [project] = await sql`
      SELECT id, name, slug, description, tech_stack, notes
      FROM projects WHERE name = ${projectName} LIMIT 1
    `
    if (!project) return null

    const instructions = await sql`
      SELECT instruction_type, title, content
      FROM project_instructions
      WHERE (project_id = ${project.id} OR project_id IS NULL) AND active = true
      ORDER BY priority
    `

    const guides = await sql`
      SELECT title, content, tags
      FROM how_to_guides
      WHERE project_id = ${project.id}
      ORDER BY updated_at DESC
    `

    return { project, instructions, guides }
  } finally {
    await sql.end()
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const context = await getProjectContext(project.name)
    if (!context) return NextResponse.json({ error: 'No brain context found' }, { status: 404 })

    const instructionsSummary = context.instructions
      .map((i) => `[${i.instruction_type}] ${i.title}: ${i.content}`)
      .join('\n')

    const guidesSummary = context.guides
      .map((g) => `- ${g.title} (${(g.tags as string[]).join(', ')})`)
      .join('\n')

    const messages: Anthropic.MessageParam[] = [{
      role: 'user',
      content: `You are generating invoice line items for a freelance software developer billing a client.

Project: ${context.project.name}
Description: ${context.project.description || 'N/A'}
Tech Stack: ${JSON.stringify(context.project.tech_stack)}
Notes: ${context.project.notes || 'N/A'}

Here is what was built (architecture decisions, integrations, features):
${instructionsSummary || 'No specific instructions recorded.'}

${guidesSummary ? `Implementation guides completed:\n${guidesSummary}` : ''}

Based on this context, generate 2-5 big-picture invoice line items that summarize the work delivered. Each item should be a clear, professional description a client would understand. Group related work into deliverables.

Respond with ONLY a JSON array of objects with "description" and "quantity" fields. Quantity should be "1" for each item. Do not include rates.

Example format:
[
  {"description": "Platform setup and core architecture", "quantity": "1"},
  {"description": "User authentication and dashboard implementation", "quantity": "1"}
]`,
    }]

    const response = await anthropic.messages.create({ model: 'claude-sonnet-4-20250514', max_tokens: 1024, messages })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 })

    const parsed: Array<{ description: string; quantity: string }> = JSON.parse(jsonMatch[0])
    const items = parsed.map(item => ({
      description: item.description,
      quantity: item.quantity || '1',
      rate: '',
    }))

    return NextResponse.json(items)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('work-logs/summarize error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

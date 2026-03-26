import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import Anthropic from '@anthropic-ai/sdk'
import { execSync } from 'child_process'

const anthropic = new Anthropic()

const repoMap: Record<string, string> = {
  'BaliSpirit': '/Users/alexgrant/development/BaliSpirit',
  'Playday': '/Users/alexgrant/development/playday',
  'FindYoga': '/Users/alexgrant/development/findyoga-nextjs',
  'Alexander Grant App': '/Users/alexgrant/development/alexandergrantapp',
  'iEmerge': '/Users/alexgrant/development/iEmerge',
  'TCM Study': '/Users/alexgrant/development/tcm-study',
  'TRNZK Sewing Classes': '/Users/alexgrant/development/sewing-class',
  'Vibroacoustic App': '/Users/alexgrant/development/vibro-acoustic',
  'Claude Brain': '/Users/alexgrant/development/claude-brain',
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const repoPath = repoMap[project.name]
    if (!repoPath) return NextResponse.json({ error: `No repo mapped for "${project.name}"` }, { status: 404 })

    const commits = execSync('git log --oneline --since="2025-01-01" --no-merges', {
      cwd: repoPath,
      encoding: 'utf-8',
      timeout: 5000,
    }).trim()

    if (!commits) return NextResponse.json([])

    const lines = commits.split('\n')
    const firstDate = execSync('git log --format="%ai" --reverse --since="2025-01-01" --no-merges -1', { cwd: repoPath, encoding: 'utf-8' }).trim().split(' ')[0]
    const lastDate = execSync('git log --format="%ai" --no-merges -1', { cwd: repoPath, encoding: 'utf-8' }).trim().split(' ')[0]

    const messages: Anthropic.MessageParam[] = [{
      role: 'user',
      content: `You are generating invoice line items for a freelance software developer billing a client.

Project: ${project.name}
Date range: ${firstDate} to ${lastDate}
Total commits: ${lines.length}

Here are the git commits for this billing period:
${commits}

Generate 2-5 big-picture invoice line items that summarize this work. Each item should be a clear, professional description a client would understand — not technical jargon or individual commits. Group related work together into deliverables.

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

import { NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'node:crypto'
import { prisma } from '@/lib/db/prisma'
import { hasSession } from '@/lib/auth/session'

export async function GET(req: Request) {
  if (!(await hasSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const unbilledOnly = searchParams.get('unbilled') === 'true'

  const workLogs = await prisma.workLog.findMany({
    where: {
      ...(projectId ? { projectId } : {}),
      ...(unbilledOnly ? { billed: false } : {}),
    },
    include: { project: { include: { client: true } } },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(workLogs)
}

export async function POST(req: Request) {
  const apiKey = process.env.WORK_LOG_API_KEY
  const authorized =
    !!apiKey &&
    timingSafeEqual(
      createHash('sha256').update(req.headers.get('authorization') ?? '').digest(),
      createHash('sha256').update(`Bearer ${apiKey}`).digest(),
    )
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { repoName, commits } = body as {
    repoName: string
    commits: Array<{ hash: string; message: string; date: string }>
  }

  const project = await prisma.project.findUnique({ where: { repoName } })
  if (!project) {
    return NextResponse.json({ error: `No project linked to repo "${repoName}"` }, { status: 404 })
  }

  const created = []
  for (const commit of commits) {
    try {
      const log = await prisma.workLog.create({
        data: {
          projectId: project.id,
          commitHash: commit.hash,
          message: commit.message,
          date: new Date(commit.date),
        },
      })
      created.push(log)
    } catch {
      // duplicate commitHash — skip
    }
  }

  return NextResponse.json({ created: created.length }, { status: 201 })
}

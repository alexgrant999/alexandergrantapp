import { NextResponse } from 'next/server'
import { getProjects, createProject } from '@/lib/services/projects'
import { projectSchema } from '@/lib/validators/project'
import { hasSession } from '@/lib/auth/session'

export async function GET() {
  if (!(await hasSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const projects = await getProjects()
  return NextResponse.json(projects)
}

export async function POST(req: Request) {
  if (!(await hasSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const parsed = projectSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const project = await createProject(parsed.data)
  return NextResponse.json(project, { status: 201 })
}

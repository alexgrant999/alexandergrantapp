import { NextResponse } from 'next/server'
import { getProjects, createProject } from '@/lib/services/projects'
import { projectSchema } from '@/lib/validators/project'

export async function GET() {
  const projects = await getProjects()
  return NextResponse.json(projects)
}

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = projectSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const project = await createProject(parsed.data)
  return NextResponse.json(project, { status: 201 })
}

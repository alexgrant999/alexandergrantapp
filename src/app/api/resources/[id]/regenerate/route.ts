import { NextResponse } from 'next/server'
import { regenerateDescription } from '@/lib/services/resources'
import { hasSession } from '@/lib/auth/session'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await hasSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const resource = await regenerateDescription(id)
  return NextResponse.json(resource)
}

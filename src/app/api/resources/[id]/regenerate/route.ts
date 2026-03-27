import { NextResponse } from 'next/server'
import { regenerateDescription } from '@/lib/services/resources'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const resource = await regenerateDescription(id)
  return NextResponse.json(resource)
}

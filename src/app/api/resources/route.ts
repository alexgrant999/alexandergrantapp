import { NextResponse } from 'next/server'
import { getAllResources, createResource } from '@/lib/services/resources'
import { createResourceSchema } from '@/lib/validators/resource'

export async function GET() {
  const resources = await getAllResources()
  return NextResponse.json(resources)
}

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = createResourceSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  try {
    const resource = await createResource(parsed.data)
    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create resource'
    const isDuplicate = message.includes('Unique constraint')
    return NextResponse.json(
      { error: isDuplicate ? 'This URL has already been shared' : message },
      { status: isDuplicate ? 409 : 500 }
    )
  }
}

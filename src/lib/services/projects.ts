import { prisma } from '@/lib/db/prisma'
import type { ProjectInput } from '@/lib/validators/project'
import { Decimal } from '@prisma/client/runtime/library'

export async function getProjects() {
  return prisma.project.findMany({
    include: {
      client: true,
      _count: { select: { timeEntries: true, expenses: true, invoices: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      timeEntries: { orderBy: { date: 'desc' } },
      expenses: { orderBy: { date: 'desc' } },
      invoices: true,
    },
  })
}

export async function createProject(data: ProjectInput) {
  return prisma.project.create({
    data: {
      clientId: data.clientId,
      name: data.name,
      description: data.description,
      status: data.status ?? 'ACTIVE',
      budget: data.budget ? new Decimal(data.budget) : null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  })
}

export async function updateProject(id: string, data: Partial<ProjectInput>) {
  return prisma.project.update({
    where: { id },
    data: {
      ...data,
      budget: data.budget ? new Decimal(data.budget) : undefined,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
  })
}

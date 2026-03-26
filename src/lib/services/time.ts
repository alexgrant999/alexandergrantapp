import { prisma } from '@/lib/db/prisma'
import type { TimeEntryInput } from '@/lib/validators/time'
import { Decimal } from '@prisma/client/runtime/library'

export async function getTimeEntries(projectId?: string) {
  return prisma.timeEntry.findMany({
    where: projectId ? { projectId } : undefined,
    include: { project: { include: { client: true } } },
    orderBy: { date: 'desc' },
  })
}

export async function createTimeEntry(data: TimeEntryInput) {
  return prisma.timeEntry.create({
    data: {
      projectId: data.projectId,
      date: new Date(data.date),
      hours: new Decimal(data.hours),
      description: data.description,
      billable: data.billable,
      hourlyRate: data.hourlyRate ? new Decimal(data.hourlyRate) : null,
    },
  })
}

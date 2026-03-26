import { prisma } from '@/lib/db/prisma'
import type { ClientInput } from '@/lib/validators/client'

export async function getClients() {
  return prisma.client.findMany({
    include: {
      projects: { select: { id: true, name: true } },
      _count: { select: { projects: true, invoices: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getClient(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: { projects: true, invoices: { include: { items: true } } },
  })
}

export async function createClient(data: ClientInput) {
  return prisma.client.create({ data })
}

export async function updateClient(id: string, data: Partial<ClientInput>) {
  return prisma.client.update({ where: { id }, data })
}

export async function deleteClient(id: string) {
  return prisma.client.delete({ where: { id } })
}

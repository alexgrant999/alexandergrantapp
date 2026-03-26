import { prisma } from '@/lib/db/prisma'
import type { ExpenseInput } from '@/lib/validators/expense'
import { Decimal } from '@prisma/client/runtime/library'
import { ExpenseCategory } from '@prisma/client'

export async function getExpenses(projectId?: string) {
  return prisma.expense.findMany({
    where: projectId ? { projectId } : undefined,
    include: { project: { include: { client: true } } },
    orderBy: { date: 'desc' },
  })
}

export async function createExpense(data: ExpenseInput) {
  return prisma.expense.create({
    data: {
      projectId: data.projectId,
      date: new Date(data.date),
      amount: new Decimal(data.amount),
      description: data.description,
      category: data.category as ExpenseCategory,
      billable: data.billable,
    },
  })
}

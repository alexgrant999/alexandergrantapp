import { NextResponse } from 'next/server'
import { getExpenses, createExpense } from '@/lib/services/expenses'
import { expenseSchema } from '@/lib/validators/expense'

export async function GET() {
  const expenses = await getExpenses()
  return NextResponse.json(expenses)
}

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = expenseSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const expense = await createExpense(parsed.data)
  return NextResponse.json(expense, { status: 201 })
}

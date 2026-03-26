export type { Client, Project, Invoice, InvoiceItem, TimeEntry, Expense } from '@prisma/client'
export { ProjectStatus, InvoiceStatus, ExpenseCategory } from '@prisma/client'

export interface PortalData {
  client: {
    id: string
    name: string
    company: string | null
    email: string
  }
  projects: Array<{
    id: string
    name: string
    status: string
    description: string | null
  }>
  invoices: Array<{
    id: string
    number: string
    status: string
    total: string
    dueDate: string
    issueDate: string
  }>
  subscriptions: Array<{
    id: string
    name: string
    amount: string
    interval: string
    status: string
    cancelAtPeriodEnd: boolean
    currentPeriodEnd: string | null
  }>
}

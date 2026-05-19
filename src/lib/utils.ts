import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const n = Number(amount)
  const hasCents = n % 1 !== 0
  return `AU$${new Intl.NumberFormat('en-AU', { minimumFractionDigits: hasCents ? 2 : 0, maximumFractionDigits: 2 }).format(n)}`
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date))
}

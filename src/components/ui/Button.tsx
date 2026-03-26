import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 font-semibold rounded-lg transition-all cursor-pointer border-none',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        variant === 'primary' && 'bg-[#6c63ff] text-white hover:bg-[#5a52e0]',
        variant === 'ghost' && 'bg-[#1e1e2e] text-[#6b6b8a] hover:bg-[#252535] hover:text-[#e8e8f0]',
        variant === 'danger' && 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
        props.disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

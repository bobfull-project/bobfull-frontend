import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'hero'
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; fullWidth?: boolean }

export function Button({ variant = 'primary', fullWidth, className, ...props }: ButtonProps) {
  return <button className={cn('inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50', variant === 'primary' && 'bg-brand text-white hover:bg-brand-active', variant === 'secondary' && 'border border-line bg-white text-ink hover:bg-brand-soft hover:text-brand', variant === 'ghost' && 'bg-transparent text-ink hover:bg-accent-soft', variant === 'hero' && 'border border-white bg-transparent text-white hover:bg-brand-active', fullWidth && 'w-full', className)} {...props} />
}

import { cn } from '@/lib/utils'

interface BrandLogoProps {
  subtitle?: string
  className?: string
  imageClassName?: string
  subtitleClassName?: string
}

export function BrandLogo({ subtitle, className, imageClassName, subtitleClassName }: BrandLogoProps) {
  return <span className={cn('inline-flex items-center gap-2.5', className)}>
    <img src="/bobfull-favicon.png" alt="" aria-hidden="true" className={cn('size-9 object-contain', imageClassName)} />
    <span className="inline-flex items-baseline gap-2">
      <span className="text-xl font-bold tracking-[-.04em] text-ink">밥풀</span>
      {subtitle && <span className={cn('text-[11px] font-medium tracking-normal text-muted', subtitleClassName)}>{subtitle}</span>}
    </span>
  </span>
}

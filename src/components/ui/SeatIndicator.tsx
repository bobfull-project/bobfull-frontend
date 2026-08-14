import { cn } from '@/lib/utils'

interface SeatIndicatorProps {
  capacity: number
  occupied: number
  size?: 'sm' | 'md'
  className?: string
  showLabel?: boolean
}

export function SeatIndicator({ capacity, occupied, size = 'md', className, showLabel = true }: SeatIndicatorProps) {
  const safeCapacity = Math.max(0, Math.min(capacity, 10))
  const safeOccupied = Math.max(0, Math.min(occupied, safeCapacity))

  return <div className={cn('flex flex-wrap items-center gap-2', className)} aria-label={`현재 ${occupied}명, 전체 ${capacity}명`}>
    <span className="flex items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: safeCapacity }, (_, index) => <span
        key={index}
        className={cn(
          'block shrink-0 rounded-full border transition-colors',
          size === 'sm' ? 'size-2.5' : 'size-3.5',
          index < safeOccupied ? 'border-brand bg-brand' : 'border-dashed border-[#cbbfb2] bg-transparent',
        )}
      />)}
    </span>
    {showLabel && <span className="text-xs text-muted"><strong className="font-semibold text-ink">현재 {occupied}명</strong> / {capacity}명</span>}
  </div>
}

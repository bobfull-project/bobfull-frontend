import { cn } from '@/lib/utils'

interface ReservationProgressTextProps {
  confirmed: boolean
  currentParticipantCount: number
  confirmationThreshold: number
  availableCapacity: number
  className?: string
}

export function ReservationProgressText({
  confirmed,
  currentParticipantCount,
  confirmationThreshold,
  availableCapacity,
  className,
}: ReservationProgressTextProps) {
  const participantsNeeded = Math.max(confirmationThreshold - currentParticipantCount, 0)
  const remainingLabel = availableCapacity === 1 ? '잔여 1석' : `${availableCapacity}자리 남음`

  return <p className={cn('flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm', className)}>
    <span className={cn('font-semibold', confirmed ? 'text-[#52704a]' : 'text-ink')}>
      {confirmed ? '성사 확정' : `성사까지 ${participantsNeeded}명`}
    </span>
    <span className="text-line" aria-hidden="true">·</span>
    <span className={cn('font-medium', availableCapacity === 1 ? 'text-accent-active' : 'text-muted')}>
      {remainingLabel}
    </span>
  </p>
}

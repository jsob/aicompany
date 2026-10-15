import { cn } from '@/lib/utils'

export function OrbitMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 128 128" className={cn('h-8 w-8', className)} aria-hidden="true">
      <rect width="128" height="128" rx="28" fill="#0B1020" />
      <circle cx="64" cy="64" r="31" fill="none" stroke="#25D9F2" strokeWidth="7" />
      <ellipse
        cx="64"
        cy="64"
        rx="48"
        ry="18"
        transform="rotate(-34 64 64)"
        fill="none"
        stroke="#4F7DFF"
        strokeWidth="5"
      />
      <circle cx="94" cy="35" r="7" fill="#F4F7FB" />
      <circle cx="64" cy="64" r="8" fill="#25D9F2" />
    </svg>
  )
}

export function Logo({
  className,
  markClassName,
  showWordmark = true,
}: {
  className?: string
  markClassName?: string
  showWordmark?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <OrbitMark className={markClassName} />
      {showWordmark && (
        <span className="text-lg font-semibold tracking-[0.18em] text-foreground">NEXORA</span>
      )}
    </span>
  )
}

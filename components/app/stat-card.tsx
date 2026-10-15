import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string
  hint?: string
  accent?: 'default' | 'success' | 'warning' | 'danger'
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-2 text-2xl font-semibold tracking-tight',
          accent === 'success' && 'text-success',
          accent === 'warning' && 'text-warning',
          accent === 'danger' && 'text-destructive',
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

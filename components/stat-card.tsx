import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"

interface StatCardProps {
  label: string
  value: string
  unit: string
  icon: IconSvgElement
  trend?: "up" | "down" | "neutral"
  className?: string
}

export function StatCard({ label, value, unit, icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl bg-surface-container-low p-4 transition-all duration-300 hover:bg-surface-container animate-m3-fade-in",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <HugeiconsIcon icon={icon} className="size-4" strokeWidth={1.5} />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5 min-w-0">
        <span className="text-[20px] sm:text-[22px] font-bold tracking-tight text-foreground leading-none animate-count-up truncate">{value}</span>
        <span className="text-[10px] text-muted-foreground font-medium shrink-0">{unit}</span>
      </div>
    </div>
  )
}

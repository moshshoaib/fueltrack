import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string
  unit: string
  icon: LucideIcon
  iconBg?: string
  iconColor?: string
  className?: string
}

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  iconBg = "bg-primary/8",
  iconColor = "text-primary",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-sans text-[26px] font-bold leading-none tracking-tight text-foreground">
          {value}
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

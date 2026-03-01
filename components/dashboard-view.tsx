import { useFuelEntries } from "@/lib/hooks/use-fuel-entries"
import { StatCard } from "@/components/stat-card"
import { VehicleSelector } from "@/components/vehicle-selector"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Dollar01Icon,
  ChartIncreaseIcon,
  DropletIcon,
  Location01Icon,
  DashboardSpeed01Icon,
  FuelStationIcon,
  FuelIcon,
  Target02Icon,
} from "@hugeicons/core-free-icons"
import { useVehicles } from "@/components/auth/vehicle-provider"
import { useCurrency } from "@/components/currency-provider"
import { useSession } from "next-auth/react"

interface DashboardViewProps {
  onAddEntry: () => void
}

export function DashboardView({ onAddEntry }: DashboardViewProps) {
  const { vehicles, selectedVehicle } = useVehicles()
  const { currency } = useCurrency()
  const { data: session } = useSession()
  const {
    entries: recentEntries,
    summary,
    isLoading,
  } = useFuelEntries("monthly", selectedVehicle?.id)

  const totalCount = summary?.total_entries ?? 0

  const fuelScore = summary?.avg_efficiency
    ? Math.min(100, Math.round(summary.avg_efficiency * 7))
    : 0

  const level = totalCount < 5 ? "Rookie" : totalCount < 20 ? "Rider" : totalCount < 50 ? "Pro" : "Master"
  const levelEmoji = totalCount < 5 ? "🏁" : totalCount < 20 ? "🚗" : totalCount < 50 ? "⚡" : "👑"

  const username = session?.user?.name?.split(" ")[0] || "Rider"
  const userInitial = session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || "U"

  return (
    <div className="flex flex-col gap-6 px-4 pb-28 pt-6 max-w-2xl mx-auto md:px-0">
      <header className="flex items-start justify-between gap-4 animate-m3-fade-in relative z-50">
        <div className="flex flex-col gap-1 min-w-0 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-foreground leading-tight truncate">
              Hey, {username}!
            </h1>
            {totalCount > 0 && (
              <span className="shrink-0 text-[10px] bg-primary/12 text-primary font-bold px-2 py-0.5 rounded-full outline outline-1 outline-primary/20">
                {levelEmoji} {level}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">Track your fuel game efficiently</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {vehicles.length > 0 && <VehicleSelector />}
        </div>
      </header>

      {/* Fuel Score Hero Card - THIS MONTH */}
      {!isLoading && summary && summary.total_entries > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-surface-container-low border border-primary/20 p-6 animate-m3-scale-in group hover:border-primary/40 transition-colors duration-500">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl transition-opacity group-hover:opacity-100" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />

          <div className="relative flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-sm">This Month</span>
              <span className="text-xs font-medium text-muted-foreground">
                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5 min-w-0">
                <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wide truncate">Monthly Cost</span>
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span className="text-3xl sm:text-4xl font-bold text-foreground leading-none tracking-tight animate-count-up truncate" style={{ animationDelay: "150ms" }}>
                    {currency}{(summary.total_cost ?? 0).toFixed(0)}
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 truncate">
                  For {(summary.total_liters ?? 0).toFixed(0)}L of fuel
                </span>
              </div>

              {/* Score Ring */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="relative flex items-center justify-center w-[72px] h-[72px] sm:w-[84px] sm:h-[84px]">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 84 84">
                    <circle cx="42" cy="42" r="36" fill="none" stroke="var(--surface-container-highest)" strokeWidth="6" />
                    <circle
                      cx="42" cy="42" r="36" fill="none" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 36}`} strokeDashoffset={`${2 * Math.PI * 36 * (1 - fuelScore / 100)}`}
                      className="transition-all duration-1000 ease-out z-10"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg sm:text-xl font-bold text-primary leading-none tracking-tighter" style={{ marginLeft: "2px" }}>{fuelScore}</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Score</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 stagger-children border-t border-border/20 pt-6 mt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[96px] animate-pulse rounded-2xl bg-surface-container-low" />
          ))}
        </div>
      ) : summary && summary.total_entries > 0 ? (
        <div className="grid grid-cols-2 gap-3 stagger-children pt-2">
          <StatCard label="Efficiency" value={summary.avg_efficiency ? summary.avg_efficiency.toFixed(1) : "--"} unit="km/L" icon={ChartIncreaseIcon} />
          <StatCard label="Distance" value={(summary.total_distance ?? 0).toFixed(0)} unit="km" icon={Location01Icon} />
          <StatCard label="Best Trip" value={summary.best_efficiency ? summary.best_efficiency.toFixed(1) : "--"} unit="km/L" icon={DashboardSpeed01Icon} />
          <StatCard label="Avg Price" value={(summary.avg_price_per_liter ?? 0).toFixed(2)} unit={`${currency}/L`} icon={FuelStationIcon} />
        </div>
      ) : (
        <EmptyState onAddEntry={onAddEntry} />
      )}

      {/* Recent Activity */}
      <section className="flex flex-col gap-3 animate-m3-fade-in" style={{ animationDelay: "250ms" }}>
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recent Fills</h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[72px] animate-pulse rounded-2xl bg-surface-container-low" />
            ))}
          </div>
        ) : recentEntries && recentEntries.length > 0 ? (
          <div className="flex flex-col gap-2">
            {recentEntries.slice(0, 4).map((entry, i) => (
              <div
                key={entry.id}
                className="m3-state-layer flex items-center justify-between p-4 rounded-2xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors cursor-default animate-m3-fade-in border border-border/20"
                style={{ animationDelay: `${i * 50 + 100}ms` }}
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-container-high text-primary/80">
                    <HugeiconsIcon icon={FuelIcon} className="size-5" strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-foreground">
                      {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {entry.liters}L
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold text-foreground">{currency}{Number(entry.total_cost).toFixed(2)}</span>
                  {entry.fuel_efficiency && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-wide">
                      {Number(entry.fuel_efficiency).toFixed(1)} km/L
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center rounded-2xl border border-dashed border-border/50 bg-surface-container-low/30">
            <p className="text-xs text-muted-foreground font-medium">No recent logs recorded.</p>
          </div>
        )}
      </section>
    </div>
  )
}

function EmptyState({ onAddEntry }: { onAddEntry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-3xl bg-surface-container-low/50 border border-border/20 px-8 py-16 animate-m3-scale-in">
      <div className="relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary animate-pulse-glow rotate-12">
          <HugeiconsIcon icon={Target02Icon} className="size-8" strokeWidth={1.5} />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 max-w-[260px]">
        <h3 className="text-base font-bold text-foreground tracking-tight">Ready to Play? 🏁</h3>
        <p className="text-center text-xs text-muted-foreground leading-relaxed font-medium">
          Start logging fuel to unlock your score, discover your monthly costs, and earn badges.
        </p>
      </div>

      <button
        onClick={onAddEntry}
        className="m3-state-layer flex items-center justify-center gap-2 h-11 px-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-95 mt-2"
      >
        <HugeiconsIcon icon={FuelIcon} className="size-4" strokeWidth={2} />
        Add First Log
      </button>
    </div>
  )
}

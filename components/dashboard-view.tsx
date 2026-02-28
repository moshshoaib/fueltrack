"use client"

import useSWR from "swr"
import { StatCard } from "@/components/stat-card"
import { Fuel, DollarSign, Gauge, MapPin, TrendingUp, Droplets } from "lucide-react"
import type { FuelEntry, FuelSummary, PeriodData } from "@/lib/types"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return res.json()
}

export function DashboardView() {
  const { data: summaryData, isLoading: summaryLoading } = useSWR<{
    summary: FuelSummary
    periodData: PeriodData[]
  }>("/api/fuel-entries/summary?period=monthly", fetcher)

  const { data: recentEntries, isLoading: entriesLoading } = useSWR<FuelEntry[]>(
    "/api/fuel-entries?limit=5",
    fetcher
  )

  const summary = summaryData?.summary

  return (
    <div className="flex flex-col gap-6 px-5 pb-28 pt-6">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <p className="text-[13px] font-medium text-muted-foreground">Welcome back</p>
        <h1 className="text-[28px] font-bold leading-tight tracking-tight text-foreground text-balance">
          FuelTrack
        </h1>
      </header>

      {/* Stats Grid */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[106px] animate-pulse rounded-2xl bg-muted/60" />
          ))}
        </div>
      ) : summary && (summary.total_entries ?? 0) > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total Cost"
            value={(summary.total_cost ?? 0).toFixed(0)}
            unit="total"
            icon={DollarSign}
            iconBg="bg-chart-1/10"
            iconColor="text-chart-1"
          />
          <StatCard
            label="Avg Efficiency"
            value={summary.avg_efficiency ? (summary.avg_efficiency).toFixed(1) : "--"}
            unit="km/L"
            icon={TrendingUp}
            iconBg="bg-chart-2/10"
            iconColor="text-chart-2"
          />
          <StatCard
            label="Total Liters"
            value={(summary.total_liters ?? 0).toFixed(0)}
            unit="L"
            icon={Droplets}
            iconBg="bg-chart-3/10"
            iconColor="text-chart-3"
          />
          <StatCard
            label="Distance"
            value={(summary.total_distance ?? 0).toFixed(0)}
            unit="km"
            icon={MapPin}
            iconBg="bg-chart-4/10"
            iconColor="text-chart-4"
          />
          <StatCard
            label="Best km/L"
            value={summary.best_efficiency ? (summary.best_efficiency).toFixed(1) : "--"}
            unit="km/L"
            icon={Gauge}
            iconBg="bg-chart-2/10"
            iconColor="text-chart-2"
          />
          <StatCard
            label="Avg Price"
            value={(summary.avg_price_per_liter ?? 0).toFixed(2)}
            unit="per L"
            icon={Fuel}
            iconBg="bg-chart-5/10"
            iconColor="text-chart-5"
          />
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Recent Fill-ups */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
          Recent Fill-ups
        </h2>
        {entriesLoading ? (
          <div className="flex flex-col gap-2.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[68px] animate-pulse rounded-2xl bg-muted/60" />
            ))}
          </div>
        ) : recentEntries && recentEntries.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-card px-4 py-3.5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8">
                    <Fuel className="h-[18px] w-[18px] text-primary" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-semibold text-foreground">
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {entry.liters}L {entry.station ? `at ${entry.station}` : ""}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="font-mono text-[13px] font-bold text-foreground">
                    {Number(entry.total_cost).toFixed(2)}
                  </span>
                  {entry.fuel_efficiency && (
                    <span className="text-[11px] font-semibold text-accent">
                      {Number(entry.fuel_efficiency).toFixed(1)} km/L
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-[13px] text-muted-foreground">
            No recent fill-ups
          </p>
        )}
      </section>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 px-8 py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8">
        <Fuel className="h-8 w-8 text-primary" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-[15px] font-semibold text-foreground">
          No fuel entries yet
        </p>
        <p className="text-center text-[13px] leading-relaxed text-muted-foreground">
          Tap the Add tab to record your first fill-up
        </p>
      </div>
    </div>
  )
}

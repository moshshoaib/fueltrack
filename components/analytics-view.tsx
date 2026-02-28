"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import { cn } from "@/lib/utils"
import type { FuelSummary, PeriodData, ViewPeriod } from "@/lib/types"
import { BarChart3, TrendingUp, Droplets, DollarSign } from "lucide-react"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return res.json()
}

const periods: { id: ViewPeriod; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
]

function formatPeriodLabel(period: string, viewPeriod: ViewPeriod) {
  if (viewPeriod === "daily") {
    const d = new Date(period)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
  if (viewPeriod === "monthly") {
    const [year, month] = period.split("-")
    const d = new Date(parseInt(year), parseInt(month) - 1)
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
  }
  return period
}

const chartCardClass =
  "rounded-2xl border border-border/70 bg-card p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]"

const tooltipStyle = {
  background: "oklch(1 0 0)",
  border: "1px solid oklch(0.93 0.005 260)",
  borderRadius: "14px",
  fontSize: "12px",
  fontFamily: "'Inter', system-ui, sans-serif",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  padding: "8px 12px",
}

const axisTickStyle = { fontSize: 10, fill: "oklch(0.55 0.015 260)", fontFamily: "'Inter', system-ui" }
const gridStroke = "oklch(0.93 0.005 260)"

export function AnalyticsView() {
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>("monthly")

  const { data, isLoading } = useSWR<{
    summary: FuelSummary
    periodData: PeriodData[]
  }>(`/api/fuel-entries/summary?period=${viewPeriod}`, fetcher)

  const chartData = data?.periodData
    ? [...data.periodData].reverse().map((d) => ({
        ...d,
        label: formatPeriodLabel(d.period, viewPeriod),
        total_cost: Number(d.total_cost?.toFixed(2) || 0),
        total_liters: Number(d.total_liters?.toFixed(1) || 0),
        avg_efficiency: d.avg_efficiency ? Number(d.avg_efficiency.toFixed(1)) : null,
      }))
    : []

  return (
    <div className="flex flex-col gap-6 px-5 pb-28 pt-6">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight text-foreground">
          Analytics
        </h1>
        <p className="text-[13px] font-medium text-muted-foreground">
          Track your fuel trends over time
        </p>
      </header>

      {/* Period Switcher */}
      <div className="flex rounded-2xl bg-secondary p-1">
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setViewPeriod(p.id)}
            className={cn(
              "flex-1 rounded-xl py-2.5 text-[12px] font-semibold tracking-wide transition-all duration-150",
              viewPeriod === p.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <div className="h-[260px] animate-pulse rounded-2xl bg-muted/60" />
          <div className="h-[260px] animate-pulse rounded-2xl bg-muted/60" />
        </div>
      ) : chartData.length > 0 ? (
        <div className="flex flex-col gap-4">
          {/* Cost Chart */}
          <div className={chartCardClass}>
            <div className="mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-chart-1" />
              <h3 className="text-[13px] font-semibold text-foreground">Fuel Cost</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.50 0.18 260)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="oklch(0.50 0.18 260)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="label" tick={axisTickStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={36} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="total_cost"
                  stroke="oklch(0.50 0.18 260)"
                  fill="url(#costGradient)"
                  strokeWidth={2}
                  name="Cost"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Liters Chart */}
          <div className={chartCardClass}>
            <div className="mb-4 flex items-center gap-2">
              <Droplets className="h-4 w-4 text-chart-2" />
              <h3 className="text-[13px] font-semibold text-foreground">Liters Consumed</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="4 4" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="label" tick={axisTickStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={36} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="total_liters"
                  fill="oklch(0.62 0.19 155)"
                  radius={[8, 8, 0, 0]}
                  name="Liters"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Efficiency Chart */}
          <div className={chartCardClass}>
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-chart-3" />
              <h3 className="text-[13px] font-semibold text-foreground">Efficiency (km/L)</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="4 4" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="label" tick={axisTickStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={36} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="avg_efficiency"
                  stroke="oklch(0.68 0.15 45)"
                  strokeWidth={2.5}
                  dot={{ fill: "oklch(0.68 0.15 45)", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "oklch(1 0 0)" }}
                  name="Efficiency"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Period Breakdown */}
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="border-b border-border/50 px-4 py-3">
              <h3 className="text-[13px] font-semibold text-foreground">Period Summary</h3>
            </div>
            <div className="flex flex-col divide-y divide-border/50">
              {data?.periodData.map((item) => (
                <div
                  key={item.period}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/20"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-semibold text-foreground">
                      {formatPeriodLabel(item.period, viewPeriod)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {item.entries_count} fill-up{item.entries_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="font-mono text-[13px] font-bold text-foreground">
                      {Number(item.total_cost).toFixed(2)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {Number(item.total_liters).toFixed(1)}L
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 px-8 py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-[15px] font-semibold text-foreground">No data yet</p>
            <p className="text-center text-[13px] text-muted-foreground">
              Add fuel entries to see analytics
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

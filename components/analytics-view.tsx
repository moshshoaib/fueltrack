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
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Dollar01Icon,
  DropletIcon,
  ChartIncreaseIcon,
  ChartHistogramIcon,
} from "@hugeicons/core-free-icons"
import { useVehicles } from "@/components/auth/vehicle-provider"
import { VehicleSelector } from "@/components/vehicle-selector"
import { useCurrency } from "@/components/currency-provider"

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

const tooltipStyle = {
  background: "var(--surface-container-high)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "500",
  fontFamily: "var(--font-sans)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  padding: "8px 12px",
}

const axisTickStyle = {
  fontSize: 10,
  fill: "var(--muted-foreground)",
  fontWeight: "500",
  fontFamily: "var(--font-sans)",
}
const gridStroke = "var(--outline-variant)"

export function AnalyticsView() {
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>("monthly")
  const { selectedVehicle } = useVehicles()
  const { currency } = useCurrency()

  const { data, isLoading } = useSWR<{
    summary: FuelSummary
    periodData: PeriodData[]
  }>(`/api/fuel-entries/summary?period=${viewPeriod}${selectedVehicle ? `&vehicleId=${selectedVehicle.id}` : ''}`, fetcher)

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
    <div className="flex flex-col gap-6 px-4 pb-28 pt-6 max-w-2xl mx-auto md:px-0">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 animate-m3-fade-in">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground truncate">Vehicle Insights</h1>
          <p className="text-[11px] text-muted-foreground truncate">Spending and efficiency trends</p>
        </div>
        <div className="shrink-0">
          <VehicleSelector />
        </div>
      </header>

      {/* M3 Segmented Button Period Switcher */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container-low rounded-full max-w-[280px]">
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setViewPeriod(p.id)}
            className={cn(
              "rounded-full py-2 text-xs font-medium transition-all duration-200",
              viewPeriod === p.id
                ? "bg-secondary text-secondary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <div className="h-[260px] animate-pulse rounded-2xl bg-surface-container-low" />
          <div className="h-[260px] animate-pulse rounded-2xl bg-surface-container-low" />
        </div>
      ) : chartData.length > 0 ? (
        <div className="flex flex-col gap-4">
          {/* Spending Chart */}
          <ChartCard icon={Dollar01Icon} title="Fuel Spending" subtitle="Total cost over time">
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke={gridStroke} strokeOpacity={0.3} vertical={false} />
                <XAxis dataKey="label" tick={axisTickStyle} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="total_cost" stroke="var(--primary)" fill="url(#costGradient)" strokeWidth={2.5} name="Spent" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Volume Chart */}
          <ChartCard icon={DropletIcon} title="Fuel Volume" subtitle="Liters consumed">
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="0" stroke={gridStroke} strokeOpacity={0.3} vertical={false} />
                <XAxis dataKey="label" tick={axisTickStyle} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--primary)', fillOpacity: 0.04 }} />
                <Bar dataKey="total_liters" fill="var(--primary)" radius={[8, 8, 0, 0]} name="Liters" barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Efficiency Chart */}
          <ChartCard icon={ChartIncreaseIcon} title="Usage Trends" subtitle="Fuel efficiency (km/L)">
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="0" stroke={gridStroke} strokeOpacity={0.3} vertical={false} />
                <XAxis dataKey="label" tick={axisTickStyle} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="avg_efficiency"
                  stroke="oklch(0.55 0.16 150)"
                  strokeWidth={2.5}
                  dot={{ fill: "oklch(0.55 0.16 150)", r: 3.5, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
                  name="Efficiency"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Breakdown */}
          <div className="rounded-2xl bg-surface-container-low overflow-hidden">
            <div className="px-4 py-3 border-b border-border/30">
              <h3 className="text-sm font-medium text-foreground">Summary Breakdown</h3>
            </div>
            <div className="divide-y divide-border/30">
              {data?.periodData.map((item) => (
                <div key={item.period} className="m3-state-layer flex items-center justify-between px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {formatPeriodLabel(item.period, viewPeriod)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {item.entries_count} {item.entries_count !== 1 ? "records" : "record"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-sm font-semibold text-foreground">{currency}{Number(item.total_cost).toFixed(2)}</span>
                    <span className="text-[11px] font-medium text-primary">{Number(item.total_liters).toFixed(1)}L</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-surface-container-low px-8 py-14 mt-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
            <HugeiconsIcon icon={ChartHistogramIcon} className="size-7" strokeWidth={1.2} />
          </div>
          <div className="flex flex-col items-center gap-1 max-w-[240px]">
            <h3 className="text-sm font-semibold text-foreground">Insufficient data</h3>
            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              Add more fuel logs to generate analytics.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function ChartCard({ icon, title, subtitle, children }: {
  icon: any
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl bg-surface-container-low p-4">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary">
          <HugeiconsIcon icon={icon} className="size-[18px]" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

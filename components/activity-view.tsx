"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    FuelIcon,
    Calendar03Icon,
    DashboardSpeed01Icon,
    Location01Icon,
    Delete02Icon,
    Edit02Icon,
    ChartHistogramIcon,
    Dollar01Icon,
    DropletIcon,
    ChartIncreaseIcon,
    Clock01Icon,
} from "@hugeicons/core-free-icons"
import type { FuelEntry, FuelSummary, PeriodData, ViewPeriod } from "@/lib/types"
import { cn } from "@/lib/utils"
import { EditEntryForm } from "./edit-entry-form"
import { useVehicles } from "@/components/auth/vehicle-provider"
import { VehicleSelector } from "@/components/vehicle-selector"
import { useCurrency } from "@/components/currency-provider"
import { useFuelEntries } from "@/lib/hooks/use-fuel-entries"
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

export function ActivityView() {
    const [activeMode, setActiveMode] = useState<"logs" | "stats">("logs")
    const [viewPeriod, setViewPeriod] = useState<ViewPeriod>("monthly")
    const { selectedVehicle } = useVehicles()
    const { currency } = useCurrency()

    const {
        entries,
        isLoading: entriesLoading,
        deleteEntry,
    } = useFuelEntries("monthly", selectedVehicle?.id)

    const { data: analyticsData, isLoading: analyticsLoading } = useSWR<{
        summary: FuelSummary
        periodData: PeriodData[]
    }>(
        `/api/fuel-entries/summary?period=${viewPeriod}${selectedVehicle ? `&vehicleId=${selectedVehicle.id}` : ""
        }`,
        fetcher
    )

    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [editingId, setEditingId] = useState<number | null>(null)

    const handleDelete = async (id: number) => {
        setDeletingId(id)
        try {
            const res = await deleteEntry(id)
            const ok = "ok" in res ? res.ok : (res as Response).ok
            if (ok) setExpandedId(null)
        } catch (error) {
            console.error("Failed to delete entry:", error)
        } finally {
            setDeletingId(null)
        }
    }

    const chartData = analyticsData?.periodData
        ? [...analyticsData.periodData].reverse().map((d) => ({
            ...d,
            label: formatPeriodLabel(d.period, viewPeriod),
            total_cost: Number(d.total_cost?.toFixed(2) || 0),
            total_liters: Number(d.total_liters?.toFixed(1) || 0),
            avg_efficiency: d.avg_efficiency ? Number(d.avg_efficiency.toFixed(1)) : null,
        }))
        : []

    return (
        <div className="flex flex-col gap-6 px-4 pb-28 pt-6 max-w-2xl mx-auto md:px-0">
            <header className="flex items-start justify-between gap-4 animate-m3-fade-in">
                <div className="flex flex-col gap-0.5 min-w-0 text-left">
                    <h1 className="text-xl font-bold tracking-tight text-foreground truncate">
                        {activeMode === "logs" ? "Fuel Activity" : "Vehicle Insights"}
                    </h1>
                    <p className="text-[11px] text-muted-foreground truncate">
                        {activeMode === "logs"
                            ? `${entries?.length || 0} fill-up records`
                            : "Spending and efficiency trends"}
                    </p>
                </div>
                <div className="shrink-0">
                    <VehicleSelector />
                </div>
            </header>

            {/* Mode Switcher */}
            <div className="flex p-1 bg-surface-container-low rounded-full w-full max-w-[240px] border border-border/10">
                <button
                    onClick={() => setActiveMode("logs")}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-semibold transition-all duration-300",
                        activeMode === "logs"
                            ? "bg-primary text-primary-foreground shadow-sm scale-[1.02]"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <HugeiconsIcon icon={Clock01Icon} className="size-3.5" strokeWidth={2.5} />
                    Logs
                </button>
                <button
                    onClick={() => setActiveMode("stats")}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-semibold transition-all duration-300",
                        activeMode === "stats"
                            ? "bg-primary text-primary-foreground shadow-sm scale-[1.02]"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <HugeiconsIcon icon={ChartHistogramIcon} className="size-3.5" strokeWidth={2.5} />
                    Stats
                </button>
            </div>

            <div className="animate-m3-fade-in">
                {activeMode === "logs" ? (
                    /* LOGS CONTENT */
                    entriesLoading ? (
                        <div className="flex flex-col gap-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-[72px] animate-pulse rounded-2xl bg-surface-container-low" />
                            ))}
                        </div>
                    ) : entries && entries.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {entries.map((entry) => {
                                const isExpanded = expandedId === entry.id
                                const isEditing = editingId === entry.id

                                return (
                                    <div
                                        key={entry.id}
                                        className="overflow-hidden rounded-2xl bg-surface-container-low transition-all border border-border/20 outline outline-0 outline-primary/20 hover:outline-1"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (isEditing) return
                                                setExpandedId(isExpanded ? null : entry.id)
                                            }}
                                            className={cn(
                                                "m3-state-layer flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors",
                                                isEditing && "cursor-default"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                                    <HugeiconsIcon icon={FuelIcon} className="size-[18px]" strokeWidth={1.5} />
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-bold text-foreground">
                                                        {Number(entry.liters).toFixed(1)}L Fill-up
                                                    </span>
                                                    <span className="text-[11px] font-medium text-muted-foreground">
                                                        {new Date(entry.date).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-0.5">
                                                <span className="text-sm font-bold text-foreground">
                                                    {currency}
                                                    {Number(entry.total_cost).toFixed(2)}
                                                </span>
                                                {entry.fuel_efficiency && (
                                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                                        {Number(entry.fuel_efficiency).toFixed(1)} km/L
                                                    </span>
                                                )}
                                            </div>
                                        </button>

                                        <div
                                            className={cn(
                                                "grid transition-all duration-300",
                                                isExpanded || isEditing ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                            )}
                                        >
                                            <div className="overflow-hidden">
                                                {isEditing ? (
                                                    <EditEntryForm
                                                        entry={entry}
                                                        onCancel={() => setEditingId(null)}
                                                        onSuccess={() => setEditingId(null)}
                                                    />
                                                ) : (
                                                    <div className="border-t border-border/20 bg-surface-container-low/50 px-4 pb-4 pt-3">
                                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                                            <DetailItem
                                                                icon={Dollar01Icon}
                                                                label="Price"
                                                                value={`${currency}${Number(entry.price_per_liter).toFixed(2)} /L`}
                                                            />
                                                            <DetailItem
                                                                icon={DashboardSpeed01Icon}
                                                                label="Odometer"
                                                                value={`${Number(entry.odometer).toLocaleString()} km`}
                                                            />
                                                            {entry.distance && (
                                                                <DetailItem
                                                                    icon={Location01Icon}
                                                                    label="Trip"
                                                                    value={`${Number(entry.distance).toFixed(0)} km`}
                                                                />
                                                            )}
                                                            {entry.fuel_type && (
                                                                <DetailItem icon={FuelIcon} label="Type" value={entry.fuel_type} />
                                                            )}
                                                        </div>
                                                        {entry.notes && (
                                                            <div className="mt-3 px-3 py-2.5 rounded-xl bg-surface-container-high/50 border border-border/10">
                                                                <p className="text-xs text-muted-foreground italic leading-relaxed">
                                                                    &ldquo;{entry.notes}&rdquo;
                                                                </p>
                                                            </div>
                                                        )}
                                                        <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-border/10">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setEditingId(entry.id)
                                                                }}
                                                                className="m3-state-layer flex items-center justify-center gap-1.5 px-4 h-9 rounded-full text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                                                            >
                                                                <HugeiconsIcon icon={Edit02Icon} className="size-3.5" strokeWidth={2} />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleDelete(entry.id)
                                                                }}
                                                                disabled={deletingId === entry.id}
                                                                className="m3-state-layer flex items-center justify-center gap-1.5 px-4 h-9 rounded-full text-xs font-bold text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors disabled:opacity-30"
                                                            >
                                                                <HugeiconsIcon icon={Delete02Icon} className="size-3.5" strokeWidth={2} />
                                                                {deletingId === entry.id ? "Removing..." : "Delete"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-surface-container-low px-8 py-16 mt-4 border border-dashed border-border/30">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <HugeiconsIcon icon={FuelIcon} className="size-8" strokeWidth={1.2} />
                            </div>
                            <div className="flex flex-col items-center gap-1 max-w-[240px]">
                                <h3 className="text-base font-bold text-foreground">No Logs Yet</h3>
                                <p className="text-center text-xs text-muted-foreground leading-relaxed font-medium">
                                    Start tracking your fuel to see your historical activity here.
                                </p>
                            </div>
                        </div>
                    )
                ) : (
                    /* STATS CONTENT */
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container-low rounded-full max-w-[260px] border border-border/10">
                            {periods.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setViewPeriod(p.id)}
                                    className={cn(
                                        "rounded-full py-2 text-xs font-semibold transition-all duration-200",
                                        viewPeriod === p.id
                                            ? "bg-primary-container text-on-primary-container shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {analyticsLoading ? (
                            <div className="flex flex-col gap-4">
                                <div className="h-[220px] animate-pulse rounded-2xl bg-surface-container-low" />
                                <div className="h-[220px] animate-pulse rounded-2xl bg-surface-container-low" />
                            </div>
                        ) : chartData.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                <ChartCard
                                    icon={Dollar01Icon}
                                    title="Fuel Spending"
                                    subtitle="Total cost over time"
                                >
                                    <ResponsiveContainer width="100%" height={190}>
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.15} />
                                                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid
                                                strokeDasharray="0"
                                                stroke={gridStroke}
                                                strokeOpacity={0.3}
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="label"
                                                tick={axisTickStyle}
                                                axisLine={false}
                                                tickLine={false}
                                                dy={8}
                                            />
                                            <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={30} />
                                            <Tooltip
                                                contentStyle={tooltipStyle}
                                                cursor={{
                                                    stroke: "var(--primary)",
                                                    strokeWidth: 1,
                                                    strokeDasharray: "4 4",
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="total_cost"
                                                stroke="var(--primary)"
                                                fill="url(#costGradient)"
                                                strokeWidth={3}
                                                name="Spent"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <ChartCard icon={DropletIcon} title="Fuel Volume" subtitle="Liters consumed">
                                    <ResponsiveContainer width="100%" height={190}>
                                        <BarChart data={chartData}>
                                            <CartesianGrid
                                                strokeDasharray="0"
                                                stroke={gridStroke}
                                                strokeOpacity={0.3}
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="label"
                                                tick={axisTickStyle}
                                                axisLine={false}
                                                tickLine={false}
                                                dy={8}
                                            />
                                            <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={30} />
                                            <Tooltip
                                                contentStyle={tooltipStyle}
                                                cursor={{ fill: "var(--primary)", fillOpacity: 0.05 }}
                                            />
                                            <Bar
                                                dataKey="total_liters"
                                                fill="var(--primary)"
                                                radius={[8, 8, 0, 0]}
                                                name="Liters"
                                                barSize={28}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <ChartCard
                                    icon={ChartIncreaseIcon}
                                    title="Usage Trends"
                                    subtitle="Fuel efficiency (km/L)"
                                >
                                    <ResponsiveContainer width="100%" height={190}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid
                                                strokeDasharray="0"
                                                stroke={gridStroke}
                                                strokeOpacity={0.3}
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="label"
                                                tick={axisTickStyle}
                                                axisLine={false}
                                                tickLine={false}
                                                dy={8}
                                            />
                                            <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={30} />
                                            <Tooltip contentStyle={tooltipStyle} />
                                            <Line
                                                type="monotone"
                                                dataKey="avg_efficiency"
                                                stroke="oklch(0.60 0.16 150)"
                                                strokeWidth={3}
                                                dot={{ fill: "oklch(0.60 0.16 150)", r: 4, strokeWidth: 0 }}
                                                activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--background)" }}
                                                name="Efficiency"
                                                connectNulls
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                {/* Breakdown List */}
                                <div className="rounded-3xl bg-surface-container-low border border-border/20 overflow-hidden mt-2">
                                    <div className="px-5 py-4 border-b border-border/20">
                                        <h3 className="text-sm font-bold text-foreground">History Breakdown</h3>
                                    </div>
                                    <div className="divide-y divide-border/20">
                                        {analyticsData?.periodData.map((item) => (
                                            <div
                                                key={item.period}
                                                className="m3-state-layer flex items-center justify-between px-5 py-4"
                                            >
                                                <div className="flex flex-col gap-0.5 text-left">
                                                    <span className="text-sm font-bold text-foreground">
                                                        {formatPeriodLabel(item.period, viewPeriod)}
                                                    </span>
                                                    <span className="text-[11px] font-medium text-muted-foreground">
                                                        {item.entries_count} {item.entries_count !== 1 ? "records" : "record"}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-sm font-bold text-foreground">
                                                        {currency}
                                                        {Number(item.total_cost).toFixed(2)}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                        {Number(item.total_liters).toFixed(1)}L
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-surface-container-low px-8 py-16 mt-4 border border-dashed border-border/30">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <HugeiconsIcon icon={ChartHistogramIcon} className="size-8" strokeWidth={1.2} />
                                </div>
                                <div className="flex flex-col items-center gap-1 max-w-[240px]">
                                    <h3 className="text-base font-bold text-foreground">Insufficient Data</h3>
                                    <p className="text-center text-xs text-muted-foreground leading-relaxed font-medium">
                                        Log more fuel entries to unlock spending and efficiency charts.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

function DetailItem({ icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-center gap-2">
            <HugeiconsIcon
                icon={icon}
                className="size-3.5 text-muted-foreground shrink-0"
                strokeWidth={1.5}
            />
            <span className="text-[11px] text-muted-foreground font-medium">
                <span className="text-muted-foreground/60">{label}:</span> {value}
            </span>
        </div>
    )
}

function ChartCard({
    icon,
    title,
    subtitle,
    children,
}: {
    icon: any
    title: string
    subtitle: string
    children: React.ReactNode
}) {
    return (
        <div className="rounded-3xl bg-surface-container-low p-5 border border-border/20">
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <HugeiconsIcon icon={icon} className="size-[20px]" strokeWidth={1.5} />
                </div>
                <div className="text-left">
                    <h3 className="text-sm font-bold text-foreground tracking-tight">{title}</h3>
                    <p className="text-[11px] font-medium text-muted-foreground">{subtitle}</p>
                </div>
            </div>
            {children}
        </div>
    )
}

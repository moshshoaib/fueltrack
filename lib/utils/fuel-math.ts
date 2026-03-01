import type { FuelEntry, FuelSummary, PeriodData } from "../types"

export function calculateSummary(entries: FuelEntry[]): FuelSummary {
    if (entries.length === 0) {
        return {
            total_entries: 0,
            total_liters: 0,
            total_cost: 0,
            total_distance: 0,
            avg_price_per_liter: 0,
            avg_efficiency: 0,
            avg_cost_per_km: 0,
            best_efficiency: 0,
            worst_efficiency: 0,
        }
    }

    const total_entries = entries.length
    const total_liters = entries.reduce((acc, e) => acc + Number(e.liters), 0)
    const total_cost = entries.reduce((acc, e) => acc + Number(e.total_cost), 0)
    const total_distance = entries.reduce((acc, e) => acc + (Number(e.distance) || 0), 0)
    const avg_price_per_liter = entries.reduce((acc, e) => acc + Number(e.price_per_liter), 0) / total_entries

    const efficiencyEntries = entries.filter(e => e.fuel_efficiency !== null)
    const avg_efficiency = efficiencyEntries.length > 0
        ? efficiencyEntries.reduce((acc, e) => acc + Number(e.fuel_efficiency), 0) / efficiencyEntries.length
        : 0

    const costPerKmEntries = entries.filter(e => e.cost_per_km !== null)
    const avg_cost_per_km = costPerKmEntries.length > 0
        ? costPerKmEntries.reduce((acc, e) => acc + Number(e.cost_per_km), 0) / costPerKmEntries.length
        : 0

    const efficiencies = efficiencyEntries.map(e => Number(e.fuel_efficiency))
    const best_efficiency = efficiencies.length > 0 ? Math.max(...efficiencies) : 0
    const worst_efficiency = efficiencies.length > 0 ? Math.min(...efficiencies) : 0

    return {
        total_entries,
        total_liters,
        total_cost,
        total_distance,
        avg_price_per_liter,
        avg_efficiency,
        avg_cost_per_km,
        best_efficiency,
        worst_efficiency,
    }
}

export function calculatePeriodData(entries: FuelEntry[], period: "daily" | "monthly" | "yearly"): PeriodData[] {
    const groups: Record<string, { liters: number, cost: number, distance: number, efficiencies: number[], count: number }> = {}

    entries.forEach(e => {
        const date = new Date(e.date)
        let key = ""
        if (period === "daily") key = date.toISOString().split("T")[0]
        else if (period === "yearly") key = date.getFullYear().toString()
        else key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

        if (!groups[key]) {
            groups[key] = { liters: 0, cost: 0, distance: 0, efficiencies: [], count: 0 }
        }

        groups[key].liters += Number(e.liters)
        groups[key].cost += Number(e.total_cost)
        groups[key].distance += Number(e.distance) || 0
        if (e.fuel_efficiency) groups[key].efficiencies.push(Number(e.fuel_efficiency))
        groups[key].count += 1
    })

    return Object.entries(groups).map(([period, data]) => ({
        period,
        total_liters: data.liters,
        total_cost: data.cost,
        total_distance: data.distance,
        avg_efficiency: data.efficiencies.length > 0
            ? data.efficiencies.reduce((a, b) => a + b, 0) / data.efficiencies.length
            : null,
        entries_count: data.count
    })).sort((a, b) => b.period.localeCompare(a.period))
}

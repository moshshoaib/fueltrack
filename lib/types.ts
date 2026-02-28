export interface FuelEntry {
  id: number
  date: string
  liters: number
  price_per_liter: number
  total_cost: number
  odometer: number
  distance: number | null
  fuel_efficiency: number | null
  cost_per_km: number | null
  fuel_type: string
  station: string | null
  notes: string | null
  created_at: string
}

export interface FuelSummary {
  total_entries: number
  total_liters: number
  total_cost: number
  total_distance: number
  avg_efficiency: number | null
  avg_cost_per_km: number | null
  avg_price_per_liter: number
  best_efficiency: number | null
  worst_efficiency: number | null
}

export interface PeriodData {
  period: string
  total_liters: number
  total_cost: number
  total_distance: number
  avg_efficiency: number | null
  entries_count: number
}

export type ViewPeriod = "daily" | "monthly" | "yearly"

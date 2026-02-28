"use client"

import useSWR, { useSWRConfig } from "swr"
import { Trash2, Fuel, MapPin, Gauge, Calendar } from "lucide-react"
import type { FuelEntry } from "@/lib/types"
import { useState } from "react"
import { cn } from "@/lib/utils"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return res.json()
}

export function HistoryView() {
  const { mutate } = useSWRConfig()
  const { data: entries, isLoading } = useSWR<FuelEntry[]>(
    "/api/fuel-entries?limit=50",
    fetcher
  )
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/fuel-entries/${id}`, { method: "DELETE" })
      if (res.ok) {
        mutate("/api/fuel-entries?limit=50")
        mutate("/api/fuel-entries?limit=5")
        mutate("/api/fuel-entries/summary?period=daily")
        mutate("/api/fuel-entries/summary?period=monthly")
        mutate("/api/fuel-entries/summary?period=yearly")
      }
    } catch (error) {
      console.error("Failed to delete entry:", error)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 px-5 pb-28 pt-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight text-foreground">
          History
        </h1>
        <p className="text-[13px] font-medium text-muted-foreground">
          {entries?.length || 0} fill-up{(entries?.length || 0) !== 1 ? "s" : ""} recorded
        </p>
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-[76px] animate-pulse rounded-2xl bg-muted/60" />
          ))}
        </div>
      ) : entries && entries.length > 0 ? (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => {
            const isExpanded = expandedId === entry.id
            return (
              <div
                key={entry.id}
                className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-muted/30"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8">
                      <Fuel className="h-[18px] w-[18px] text-primary" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-semibold text-foreground">
                        {Number(entry.liters).toFixed(1)}L &middot; {entry.fuel_type}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
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
                </button>

                {/* Expanded Details */}
                <div
                  className={cn(
                    "grid transition-all duration-200",
                    isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-border/50 px-4 pb-4 pt-3">
                      <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                        <DetailItem
                          icon={Calendar}
                          text={`Price/L: ${Number(entry.price_per_liter).toFixed(2)}`}
                        />
                        <DetailItem
                          icon={Gauge}
                          text={`Odo: ${Number(entry.odometer).toFixed(0)} km`}
                        />
                        {entry.distance && (
                          <DetailItem
                            icon={MapPin}
                            text={`Dist: ${Number(entry.distance).toFixed(0)} km`}
                          />
                        )}
                        {entry.station && (
                          <DetailItem icon={Fuel} text={entry.station} />
                        )}
                      </div>
                      {entry.notes && (
                        <p className="mt-2.5 text-[11px] italic leading-relaxed text-muted-foreground">
                          {entry.notes}
                        </p>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(entry.id)
                        }}
                        disabled={deletingId === entry.id}
                        className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-destructive transition-opacity hover:opacity-70 disabled:opacity-30"
                        aria-label={`Delete entry from ${entry.date}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingId === entry.id ? "Deleting..." : "Delete Entry"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 px-8 py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8">
            <Fuel className="h-8 w-8 text-primary" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-[15px] font-semibold text-foreground">No history yet</p>
            <p className="text-center text-[13px] text-muted-foreground">
              Your fuel entries will appear here
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailItem({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>
  text: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
      <span className="text-[11px] text-muted-foreground">{text}</span>
    </div>
  )
}

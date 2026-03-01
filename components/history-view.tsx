import { HugeiconsIcon } from "@hugeicons/react"
import {
  FuelIcon,
  Calendar03Icon,
  DashboardSpeed01Icon,
  Location01Icon,
  Delete02Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons"
import type { FuelEntry } from "@/lib/types"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { EditEntryForm } from "./edit-entry-form"
import { useVehicles } from "@/components/auth/vehicle-provider"
import { VehicleSelector } from "@/components/vehicle-selector"
import { useCurrency } from "@/components/currency-provider"
import { useFuelEntries } from "@/lib/hooks/use-fuel-entries"

export function HistoryView() {
  const { selectedVehicle } = useVehicles()
  const { currency } = useCurrency()
  const { entries, isLoading, deleteEntry } = useFuelEntries("monthly", selectedVehicle?.id)
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

  return (
    <div className="flex flex-col gap-5 px-4 pb-28 pt-6 max-w-2xl mx-auto md:px-0">
      <header className="flex items-start justify-between gap-4 animate-m3-fade-in">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground truncate">Fuel Activity</h1>
          <p className="text-[11px] text-muted-foreground truncate">
            {entries?.length || 0} {(entries?.length || 0) !== 1 ? "records" : "record"} in your log
          </p>
        </div>
        <div className="shrink-0">
          <VehicleSelector />
        </div>
      </header>

      {isLoading ? (
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
                className="overflow-hidden rounded-2xl bg-surface-container-low transition-all"
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
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                      <HugeiconsIcon icon={FuelIcon} className="size-[18px]" strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {Number(entry.liters).toFixed(1)}L Fill-up
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-sm font-semibold text-foreground">
                      {currency}{Number(entry.total_cost).toFixed(2)}
                    </span>
                    {entry.fuel_efficiency && (
                      <span className="text-[10px] font-medium text-primary">
                        {Number(entry.fuel_efficiency).toFixed(1)} km/L
                      </span>
                    )}
                  </div>
                </button>

                {/* Expanded section */}
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
                      <div className="border-t border-border/30 bg-surface-container px-4 pb-4 pt-3">
                        <div className="grid grid-cols-2 gap-3">
                          <DetailItem icon={Calendar03Icon} label="Price" value={`${currency}${Number(entry.price_per_liter).toFixed(2)} /L`} />
                          <DetailItem icon={DashboardSpeed01Icon} label="Odometer" value={`${Number(entry.odometer).toLocaleString()} km`} />
                          {entry.distance && (
                            <DetailItem icon={Location01Icon} label="Trip" value={`${Number(entry.distance).toFixed(0)} km`} />
                          )}
                          {entry.fuel_type && (
                            <DetailItem icon={FuelIcon} label="Type" value={entry.fuel_type} />
                          )}
                        </div>
                        {entry.notes && (
                          <div className="mt-3 px-3 py-2.5 rounded-xl bg-surface-container-high">
                            <p className="text-xs text-muted-foreground italic leading-relaxed">
                              &ldquo;{entry.notes}&rdquo;
                            </p>
                          </div>
                        )}
                        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border/30">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingId(entry.id) }}
                            className="m3-state-layer flex items-center gap-1.5 px-4 h-8 rounded-full text-xs font-medium text-primary bg-secondary transition-colors"
                          >
                            <HugeiconsIcon icon={Edit02Icon} className="size-3.5" strokeWidth={1.5} />
                            Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(entry.id) }}
                            disabled={deletingId === entry.id}
                            className="m3-state-layer flex items-center gap-1.5 px-4 h-8 rounded-full text-xs font-medium text-destructive bg-destructive/8 transition-colors disabled:opacity-30"
                          >
                            <HugeiconsIcon icon={Delete02Icon} className="size-3.5" strokeWidth={1.5} />
                            {deletingId === entry.id ? "Removing..." : "Remove"}
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
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-surface-container-low px-8 py-14 mt-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
            <HugeiconsIcon icon={FuelIcon} className="size-7" strokeWidth={1.2} />
          </div>
          <div className="flex flex-col items-center gap-1 max-w-[240px]">
            <h3 className="text-sm font-semibold text-foreground">No activity logged</h3>
            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              Add your first entry to see it here.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailItem({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <HugeiconsIcon icon={icon} className="size-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
      <span className="text-[11px] text-muted-foreground">
        <span className="font-medium">{label}:</span> {value}
      </span>
    </div>
  )
}

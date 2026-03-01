"use client"

import { useState, useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle01Icon,
  Loading03Icon,
  FuelStationIcon,
  CloudIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { useFuelEntries } from "@/lib/hooks/use-fuel-entries"
import { useCurrency } from "@/components/currency-provider"
import { useVehicles } from "@/components/auth/vehicle-provider"
import { VehicleForm } from "@/components/vehicle-form"
import { getVehicleIcon } from "@/components/vehicle-icon"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface AddEntryViewProps {
  onSuccess?: () => void
}

const fuelTypes = ["Petrol", "Diesel", "Premium", "E85"]

export function AddEntryView({ onSuccess }: AddEntryViewProps) {
  const { vehicles, selectedVehicle, setSelectedVehicleId, refresh: refreshVehicles } = useVehicles()
  const [targetVehicleId, setTargetVehicleId] = useState(selectedVehicle?.id || "")
  const { addEntry } = useFuelEntries("monthly", targetVehicleId)
  const { currency } = useCurrency()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isAddingFirstVehicle, setIsAddingFirstVehicle] = useState(false)
  const [selectedFuelType, setSelectedFuelType] = useState("Petrol")

  const [form, setForm] = useState({
    date: "",
    liters: "",
    price_per_liter: "",
    odometer: "",
    station: "",
    notes: "",
  })

  // Sync targetVehicleId when selectedVehicle changes (e.g. on mount)
  useEffect(() => {
    if (selectedVehicle?.id && !targetVehicleId) {
      setTargetVehicleId(selectedVehicle.id)
    }
  }, [selectedVehicle, targetVehicleId])

  useEffect(() => {
    setForm((prev) => ({ ...prev, date: new Date().toISOString().split("T")[0] }))
  }, [])

  const totalCost =
    form.liters && form.price_per_liter
      ? (parseFloat(form.liters) * parseFloat(form.price_per_liter)).toFixed(2)
      : "0.00"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.liters || !form.price_per_liter || !form.odometer) return

    setIsSubmitting(true)
    try {
      const ok = await addEntry({ ...form, fuel_type: selectedFuelType })
      if (ok) {
        setShowSuccess(true)
        setForm({ date: new Date().toISOString().split("T")[0], liters: "", price_per_liter: "", odometer: "", station: "", notes: "" })
        setTimeout(() => { setShowSuccess(false); onSuccess?.() }, 1500)
      }
    } catch (error) {
      console.error("Failed to add entry:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }))

  if (vehicles.length === 0 || isAddingFirstVehicle) {
    return (
      <div className="flex flex-col gap-6 px-4 pb-28 pt-6 max-w-lg mx-auto md:px-0">
        <header className="flex flex-col gap-1 animate-m3-fade-in">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Welcome! 🚗</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">Let's add your first vehicle to start tracking.</p>
        </header>

        <div className="animate-m3-scale-in">
          <VehicleForm
            onCancel={() => { }}
            onSuccess={() => {
              setIsAddingFirstVehicle(false)
              refreshVehicles()
            }}
          />
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 px-4 pb-28 pt-32 max-w-md mx-auto animate-m3-scale-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary glow-primary">
          <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-10" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-lg font-bold text-foreground">Nice fill! 🔥</p>
          <p className="text-sm text-muted-foreground">Entry logged. Keep the streak going!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-28 pt-6 max-w-lg mx-auto md:px-0">
      <header className="flex items-center justify-between animate-m3-fade-in">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Log Fuel ⛽
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Record your fill-up
          </p>
        </div>
      </header>

      {/* Cloud sync prompt for non-authenticated users */}
      {!session?.user && (
        <div className="flex items-center gap-3 rounded-2xl bg-surface-container-low px-4 py-3 animate-m3-fade-in" style={{ animationDelay: "50ms" }}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HugeiconsIcon icon={CloudIcon} className="size-[18px]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground">Want cloud backup?</p>
            <p className="text-[10px] text-muted-foreground">Sign in to sync across devices</p>
          </div>
          <Link
            href="/login"
            className="text-xs font-semibold text-primary hover:underline underline-offset-2 shrink-0"
          >
            Sign in →
          </Link>
        </div>
      )}

      {/* Cost Preview */}
      <div className="flex flex-col items-center gap-1 rounded-2xl bg-surface-container-low py-6 animate-m3-scale-in" style={{ animationDelay: "100ms" }}>
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Total Cost</span>
        <span className="text-[36px] font-bold tracking-tight text-foreground leading-none mt-1 animate-count-up">
          {currency}{totalCost}
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 animate-m3-fade-in" style={{ animationDelay: "150ms" }}>
        {/* Fuel Type Segmented */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-0.5">Fuel Type</label>
          <div className="grid grid-cols-4 gap-1 p-1 bg-surface-container-low rounded-full">
            {fuelTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedFuelType(type)}
                className={cn(
                  "rounded-full py-2 text-xs font-medium transition-all duration-200",
                  selectedFuelType === type
                    ? "bg-primary-container text-on-primary-container shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Selection Field */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-0.5">Vehicle</label>
          <div className="relative">
            <select
              value={targetVehicleId}
              onChange={(e) => {
                const id = e.target.value
                setTargetVehicleId(id)
                setSelectedVehicleId(id)
              }}
              className="w-full h-12 rounded-xl border border-border bg-surface-container-low px-4 text-sm text-foreground appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-medium"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5 rotate-90" strokeWidth={2} />
            </div>
          </div>
        </div>

        <M3Field label="Date" id="date" type="date" value={form.date} onChange={(v) => updateField("date", v)} />

        <div className="grid grid-cols-2 gap-3">
          <M3Field label="Volume (L)" id="liters" type="number" step="0.01" placeholder="0.00" value={form.liters} onChange={(v) => updateField("liters", v)} required />
          <M3Field label="Price / L" id="price" type="number" step="0.01" placeholder="0.00" value={form.price_per_liter} onChange={(v) => updateField("price_per_liter", v)} required />
        </div>

        <M3Field label="Odometer (km)" id="odometer" type="number" step="0.1" placeholder="Current reading" value={form.odometer} onChange={(v) => updateField("odometer", v)} required />
        <M3Field label="Station" id="station" type="text" placeholder="e.g. Shell" value={form.station} onChange={(v) => updateField("station", v)} />

        <div className="flex flex-col gap-2">
          <label htmlFor="notes" className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-0.5">Notes</label>
          <textarea
            id="notes"
            rows={2}
            placeholder="Optional notes..."
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            className="w-full rounded-xl border border-border bg-transparent px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !form.liters || !form.price_per_liter || !form.odometer}
          className="m3-state-layer flex items-center justify-center gap-2 w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold text-sm glow-primary transition-all disabled:opacity-30 disabled:shadow-none mt-2 active:scale-[0.97]"
        >
          {isSubmitting ? (
            <HugeiconsIcon icon={Loading03Icon} className="size-5 animate-spin" />
          ) : (
            <HugeiconsIcon icon={FuelStationIcon} className="size-5" strokeWidth={1.5} />
          )}
          {isSubmitting ? "Logging..." : "Log Entry 🔥"}
        </button>
      </form>
    </div>
  )
}

function M3Field({ label, id, type = "text", step, placeholder, value, onChange, required }: {
  label: string; id: string; type?: string; step?: string; placeholder?: string; value: string; onChange: (v: string) => void; required?: boolean
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (type === "number" && ["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-0.5">{label}</label>
      <input
        id={id} type={type} step={step} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        required={required}
        className="w-full h-12 rounded-xl border border-border bg-transparent px-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
      />
    </div>
  )
}

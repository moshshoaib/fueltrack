"use client"

import { useState } from "react"
import { useSWRConfig } from "swr"
import { Fuel, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddEntryViewProps {
  onSuccess?: () => void
}

const fuelTypes = ["Petrol", "Diesel", "Premium", "E85"]

export function AddEntryView({ onSuccess }: AddEntryViewProps) {
  const { mutate } = useSWRConfig()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedFuelType, setSelectedFuelType] = useState("Petrol")

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    liters: "",
    price_per_liter: "",
    odometer: "",
    station: "",
    notes: "",
  })

  const totalCost =
    form.liters && form.price_per_liter
      ? (parseFloat(form.liters) * parseFloat(form.price_per_liter)).toFixed(2)
      : "0.00"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.liters || !form.price_per_liter || !form.odometer) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/fuel-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fuel_type: selectedFuelType,
        }),
      })

      if (response.ok) {
        setShowSuccess(true)
        setForm({
          date: new Date().toISOString().split("T")[0],
          liters: "",
          price_per_liter: "",
          odometer: "",
          station: "",
          notes: "",
        })
        mutate("/api/fuel-entries?limit=5")
        mutate("/api/fuel-entries?limit=50")
        mutate("/api/fuel-entries/summary?period=daily")
        mutate("/api/fuel-entries/summary?period=monthly")
        mutate("/api/fuel-entries/summary?period=yearly")
        setTimeout(() => {
          setShowSuccess(false)
          onSuccess?.()
        }, 1500)
      }
    } catch (error) {
      console.error("Failed to add entry:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 px-5 pb-28 pt-32">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/12">
          <Check className="h-10 w-10 text-accent" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-lg font-bold text-foreground">Entry Added</p>
          <p className="text-[13px] text-muted-foreground">
            Your fuel fill-up has been recorded
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-5 pb-28 pt-6">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight text-foreground">
          Add Fill-up
        </h1>
        <p className="text-[13px] font-medium text-muted-foreground">
          Record your latest fuel purchase
        </p>
      </header>

      {/* Total Cost Hero */}
      <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/70 bg-card px-6 py-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Total Cost
        </span>
        <span className="font-mono text-[42px] font-bold leading-none tracking-tighter text-foreground">
          {totalCost}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Fuel Type */}
        <fieldset className="flex flex-col gap-2.5">
          <legend className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Fuel Type
          </legend>
          <div className="grid grid-cols-4 gap-2">
            {fuelTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedFuelType(type)}
                className={cn(
                  "rounded-xl py-2.5 text-[12px] font-semibold transition-all duration-150",
                  selectedFuelType === type
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Date */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="date"
            className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Date
          </label>
          <input
            id="date"
            type="date"
            value={form.date}
            onChange={(e) => updateField("date", e.target.value)}
            className="h-12 rounded-xl border border-input bg-card px-4 text-[14px] font-medium text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* Liters & Price */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="liters"
              className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Liters
            </label>
            <input
              id="liters"
              type="number"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={form.liters}
              onChange={(e) => updateField("liters", e.target.value)}
              className="h-12 rounded-xl border border-input bg-card px-4 font-mono text-[14px] font-medium text-foreground placeholder:text-muted-foreground/40 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="price"
              className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Price / Liter
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={form.price_per_liter}
              onChange={(e) => updateField("price_per_liter", e.target.value)}
              className="h-12 rounded-xl border border-input bg-card px-4 font-mono text-[14px] font-medium text-foreground placeholder:text-muted-foreground/40 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              required
            />
          </div>
        </div>

        {/* Odometer */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="odometer"
            className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Odometer (km)
          </label>
          <input
            id="odometer"
            type="number"
            step="0.1"
            inputMode="decimal"
            placeholder="Current reading"
            value={form.odometer}
            onChange={(e) => updateField("odometer", e.target.value)}
            className="h-12 rounded-xl border border-input bg-card px-4 font-mono text-[14px] font-medium text-foreground placeholder:text-muted-foreground/40 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            required
          />
        </div>

        {/* Station */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="station"
            className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Station
            <span className="ml-1 normal-case tracking-normal text-muted-foreground/60">
              optional
            </span>
          </label>
          <input
            id="station"
            type="text"
            placeholder="Station name"
            value={form.station}
            onChange={(e) => updateField("station", e.target.value)}
            className="h-12 rounded-xl border border-input bg-card px-4 text-[14px] font-medium text-foreground placeholder:text-muted-foreground/40 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="notes"
            className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Notes
            <span className="ml-1 normal-case tracking-normal text-muted-foreground/60">
              optional
            </span>
          </label>
          <textarea
            id="notes"
            placeholder="Any additional notes..."
            rows={2}
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            className="resize-none rounded-xl border border-input bg-card px-4 py-3 text-[14px] font-medium text-foreground placeholder:text-muted-foreground/40 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !form.liters || !form.price_per_liter || !form.odometer}
          className="flex h-[52px] items-center justify-center gap-2.5 rounded-2xl bg-primary text-[15px] font-semibold text-primary-foreground shadow-sm transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? (
            <Loader2 className="h-[18px] w-[18px] animate-spin" />
          ) : (
            <Fuel className="h-[18px] w-[18px]" />
          )}
          {isSubmitting ? "Saving..." : "Save Fill-up"}
        </button>
      </form>
    </div>
  )
}

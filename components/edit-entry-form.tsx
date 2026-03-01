"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Loading03Icon,
    Tick02Icon,
    Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { FuelEntry } from "@/lib/types"
import { useFuelEntries } from "@/lib/hooks/use-fuel-entries"
import { useVehicles } from "@/components/auth/vehicle-provider"
import { useCurrency } from "@/components/currency-provider"

interface EditEntryFormProps {
    entry: FuelEntry
    onSuccess: () => void
    onCancel: () => void
}

const fuelTypes = ["Petrol", "Diesel", "Premium", "E85"]

export function EditEntryForm({ entry, onSuccess, onCancel }: EditEntryFormProps) {
    const { updateEntry } = useFuelEntries("monthly")
    const { currency } = useCurrency()
    const { vehicles } = useVehicles()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedFuelType, setSelectedFuelType] = useState(entry.fuel_type || "Petrol")

    const [form, setForm] = useState({
        date: new Date(entry.date).toISOString().split("T")[0],
        liters: entry.liters.toString(),
        price_per_liter: entry.price_per_liter.toString(),
        odometer: entry.odometer.toString(),
        station: entry.station || "",
        notes: entry.notes || "",
        vehicle_id: entry.vehicle_id || "",
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
            const ok = await updateEntry(entry.id, {
                ...form,
                fuel_type: selectedFuelType,
            })
            if (ok) onSuccess()
        } catch (error) {
            console.error("Failed to update entry:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const updateField = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    return (
        <div className="flex flex-col gap-5 bg-surface-container px-4 pb-4 pt-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-foreground">Edit Entry</h3>
                    <p className="text-[11px] text-muted-foreground">Modify fuel log details</p>
                </div>
                <button
                    onClick={onCancel}
                    className="m3-state-layer rounded-full p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <HugeiconsIcon icon={Cancel01Icon} className="size-4" strokeWidth={1.5} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Fuel Type */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-surface-container-high rounded-full">
                    {fuelTypes.map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setSelectedFuelType(type)}
                            className={cn(
                                "rounded-full py-1.5 text-[11px] font-medium transition-all",
                                selectedFuelType === type
                                    ? "bg-secondary text-secondary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Vehicle Selector */}
                {vehicles.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <label htmlFor="edit-vehicle" className="text-[11px] font-medium text-muted-foreground tracking-wide px-0.5">Vehicle</label>
                        <select
                            id="edit-vehicle"
                            value={form.vehicle_id}
                            onChange={(e) => updateField("vehicle_id", e.target.value)}
                            className="w-full h-11 rounded-xl border border-border bg-transparent px-3.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                        >
                            <option value="">No Vehicle Selected</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.name} {v.license_plate ? `(${v.license_plate})` : ""}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Fields */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="edit-date" className="text-[11px] font-medium text-muted-foreground tracking-wide px-0.5">Date</label>
                    <input
                        id="edit-date"
                        type="date"
                        value={form.date}
                        onChange={(e) => updateField("date", e.target.value)}
                        className="w-full h-11 rounded-xl border border-border bg-transparent px-3.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="edit-liters" className="text-[11px] font-medium text-muted-foreground tracking-wide px-0.5">Volume (L)</label>
                        <input
                            id="edit-liters"
                            type="number"
                            step="0.01"
                            value={form.liters}
                            onChange={(e) => updateField("liters", e.target.value)}
                            onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                            className="w-full h-11 rounded-xl border border-border bg-transparent px-3.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="edit-price" className="text-[11px] font-medium text-muted-foreground tracking-wide px-0.5">Price / L</label>
                        <input
                            id="edit-price"
                            type="number"
                            step="0.01"
                            value={form.price_per_liter}
                            onChange={(e) => updateField("price_per_liter", e.target.value)}
                            onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                            className="w-full h-11 rounded-xl border border-border bg-transparent px-3.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            required
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="edit-odometer" className="text-[11px] font-medium text-muted-foreground tracking-wide px-0.5">Odometer (km)</label>
                    <input
                        id="edit-odometer"
                        type="number"
                        step="0.1"
                        value={form.odometer}
                        onChange={(e) => updateField("odometer", e.target.value)}
                        onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                        className="w-full h-11 rounded-xl border border-border bg-transparent px-3.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        required
                    />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Total</span>
                        <span className="text-lg font-semibold text-foreground">{currency}{totalCost}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="m3-state-layer h-10 px-5 rounded-full text-sm font-medium text-foreground bg-surface-container-high transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="m3-state-layer flex items-center gap-1.5 h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-sm transition-all disabled:opacity-40"
                        >
                            {isSubmitting ? (
                                <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
                            ) : (
                                <HugeiconsIcon icon={Tick02Icon} className="size-4" strokeWidth={2} />
                            )}
                            Save
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

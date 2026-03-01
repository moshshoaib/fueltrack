"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Loading03Icon,
    Cancel01Icon,
    Car01Icon,
} from "@hugeicons/core-free-icons"
import { useVehicles } from "@/components/auth/vehicle-provider"
import { vehicleIcons, getVehicleIcon } from "@/components/vehicle-icon"
import { cn } from "@/lib/utils"
import { Vehicle } from "@/lib/types"

interface VehicleFormProps {
    vehicle?: Vehicle
    onCancel: () => void
    onSuccess: () => void
}

export function VehicleForm({ vehicle, onCancel, onSuccess }: VehicleFormProps) {
    const { addVehicle, updateVehicle } = useVehicles()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [form, setForm] = useState({
        name: vehicle?.name || "",
        make: vehicle?.make || "",
        model: vehicle?.model || "",
        year: vehicle?.year?.toString() || "",
        licensePlate: vehicle?.license_plate || "",
        icon: vehicle?.icon || "car",
    })

    const updateField = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name.trim()) {
            setError("Vehicle name is required")
            return
        }

        setIsSubmitting(true)
        setError("")

        try {
            const data = {
                name: form.name.trim(),
                make: form.make.trim() || undefined,
                model: form.model.trim() || undefined,
                year: form.year ? parseInt(form.year) : undefined,
                licensePlate: form.licensePlate.trim() || undefined,
                icon: form.icon,
            }

            if (vehicle) {
                await updateVehicle(vehicle.id, data)
            } else {
                await addVehicle(data)
            }
            onSuccess()
        } catch (err: any) {
            setError(err.message || "Failed to save vehicle")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="rounded-2xl bg-surface-container-low p-5">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-primary">
                        <HugeiconsIcon icon={getVehicleIcon(form.icon)} className="size-[18px]" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-foreground">{vehicle ? "Edit Vehicle" : "New Vehicle"}</h3>
                        <p className="text-[11px] text-muted-foreground">{vehicle ? "Update vehicle details" : "Add vehicle details"}</p>
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    className="m3-state-layer rounded-full p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <HugeiconsIcon icon={Cancel01Icon} className="size-4" strokeWidth={1.5} />
                </button>
            </div>

            {error && (
                <div className="bg-destructive/8 text-destructive text-xs font-medium rounded-xl px-3 py-2.5 mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label htmlFor="v-name" className="text-[11px] font-medium text-muted-foreground tracking-wide px-0.5">
                        Nickname *
                    </label>
                    <div className="relative">
                        <select
                            id="v-icon"
                            value={form.icon}
                            onChange={(e) => updateField("icon", e.target.value)}
                            className="absolute left-1 top-1/2 -translate-y-1/2 h-9 w-12 opacity-0 cursor-pointer z-10"
                        >
                            {vehicleIcons.map(vi => (
                                <option key={vi.id} value={vi.id}>{vi.label}</option>
                            ))}
                        </select>
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none flex items-center justify-center w-5 h-5">
                            <HugeiconsIcon icon={getVehicleIcon(form.icon)} className="size-4" strokeWidth={1.5} />
                            <div className="absolute -right-2 top-2.5 w-1.5 h-1.5 border-r border-b border-muted-foreground/50 rotate-45" />
                        </div>
                        <input
                            id="v-name"
                            type="text"
                            placeholder="e.g. My Sedan"
                            value={form.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            required
                            className="w-full h-11 rounded-xl border border-border bg-transparent pl-[3.25rem] pr-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="v-make" className="text-[11px] font-medium text-muted-foreground tracking-wide px-0.5">Make</label>
                        <input
                            id="v-make"
                            type="text"
                            placeholder="e.g. Toyota"
                            value={form.make}
                            onChange={(e) => updateField("make", e.target.value)}
                            className="w-full h-11 rounded-xl border border-border bg-transparent px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="v-model" className="text-[11px] font-medium text-muted-foreground tracking-wide px-0.5">Model</label>
                        <input
                            id="v-model"
                            type="text"
                            placeholder="e.g. Camry"
                            value={form.model}
                            onChange={(e) => updateField("model", e.target.value)}
                            className="w-full h-11 rounded-xl border border-border bg-transparent px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="v-year" className="text-[11px] font-medium text-muted-foreground tracking-wide px-0.5">Year</label>
                        <input
                            id="v-year"
                            type="number"
                            placeholder="e.g. 2023"
                            value={form.year}
                            onChange={(e) => updateField("year", e.target.value)}
                            onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                            className="w-full h-11 rounded-xl border border-border bg-transparent px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="v-plate" className="text-[11px] font-medium text-muted-foreground tracking-wide px-0.5">License Plate</label>
                        <input
                            id="v-plate"
                            type="text"
                            placeholder="e.g. ABC-1234"
                            value={form.licensePlate}
                            onChange={(e) => updateField("licensePlate", e.target.value)}
                            className="w-full h-11 rounded-xl border border-border bg-transparent px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>
                </div>

                <div className="flex gap-2 mt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="m3-state-layer flex-1 h-10 rounded-full text-sm font-medium text-foreground bg-surface-container-high transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="m3-state-layer flex-1 flex items-center justify-center gap-2 h-10 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-sm transition-all disabled:opacity-40"
                    >
                        {isSubmitting && <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />}
                        {isSubmitting ? "Saving..." : vehicle ? "Save Changes" : "Add Vehicle"}
                    </button>
                </div>
            </form>
        </div>
    )
}

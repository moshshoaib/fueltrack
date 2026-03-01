"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Car01Icon, PlusSignCircleIcon, Tick02Icon, ArrowLeft02Icon } from "@hugeicons/core-free-icons"
import { useVehicles } from "@/components/auth/vehicle-provider"
import { VehicleForm } from "@/components/vehicle-form"
import { Vehicle } from "@/lib/types"
import { getVehicleIcon } from "@/components/vehicle-icon"

export function GarageView({ onBack }: { onBack?: () => void }) {
    const { vehicles, refresh } = useVehicles()
    const [isAddingVehicle, setIsAddingVehicle] = useState(false)

    return (
        <div className="flex flex-col gap-6 px-4 pb-28 pt-6 max-w-2xl mx-auto md:px-0">
            <header className="flex flex-col gap-4 animate-m3-fade-in">
                {onBack && (
                    <button onClick={onBack} className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest w-max">
                        <HugeiconsIcon icon={ArrowLeft02Icon} className="size-3.5" strokeWidth={2.5} />
                        Back
                    </button>
                )}
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-xl font-bold tracking-tight text-foreground">Your Garage 🚘</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">Manage the vehicles in your garage</p>
                </div>
            </header>

            {isAddingVehicle ? (
                <div className="animate-m3-scale-in">
                    <VehicleForm
                        onCancel={() => setIsAddingVehicle(false)}
                        onSuccess={() => { setIsAddingVehicle(false); refresh() }}
                    />
                </div>
            ) : (
                <section className="flex flex-col gap-3 animate-m3-fade-in" style={{ animationDelay: "100ms" }}>
                    <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-0.5">My Vehicles</h2>

                    {vehicles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {vehicles.map((v: Vehicle) => {
                                return (
                                    <div
                                        key={v.id}
                                        className="relative flex flex-col text-left gap-1 rounded-2xl p-5 outline outline-1 -outline-offset-1 bg-surface-container-low outline-transparent hover:outline-border transition-all"
                                    >
                                        <div className="flex items-start justify-between w-full">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-high text-muted-foreground">
                                                <HugeiconsIcon icon={getVehicleIcon(v.icon)} className="size-[18px]" strokeWidth={1.5} />
                                            </div>
                                        </div>
                                        <div className="mt-3 flex flex-col">
                                            <span className="text-sm font-bold text-foreground">{v.name}</span>
                                            <span className="text-[11px] text-muted-foreground mt-0.5">
                                                {v.make} {v.model} {v.year ? `(${v.year})` : ""}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 rounded-3xl bg-surface-container-low py-12 px-6">
                            <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-muted-foreground">
                                <HugeiconsIcon icon={Car01Icon} className="size-7" strokeWidth={1.2} />
                            </div>
                            <div className="flex flex-col items-center gap-1.5 text-center max-w-[200px]">
                                <p className="text-sm font-bold text-foreground">Empty Garage</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">Add your first vehicle to start tracking fuel.</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setIsAddingVehicle(true)}
                        className="m3-state-layer flex items-center justify-center gap-2 w-full py-4 mt-2 rounded-2xl border border-dashed border-border/50 bg-surface-container-low/50 text-sm font-medium text-foreground hover:bg-surface-container-low transition-colors"
                    >
                        <HugeiconsIcon icon={PlusSignCircleIcon} className="size-4" strokeWidth={1.5} />
                        Add New Vehicle
                    </button>
                </section>
            )}
        </div>
    )
}

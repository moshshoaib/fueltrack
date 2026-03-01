"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
    Car01Icon,
    ArrowDown01Icon,
} from "@hugeicons/core-free-icons"
import { useVehicles } from "@/components/auth/vehicle-provider"
import { getVehicleIcon } from "@/components/vehicle-icon"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"

export function VehicleSelector() {
    const { vehicles, selectedVehicle, setSelectedVehicleId } = useVehicles()
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    if (vehicles.length === 0) return null

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="m3-state-layer flex items-center gap-1.5 sm:gap-2 rounded-full bg-surface-container-high px-2.5 sm:px-3.5 h-9 text-[11px] sm:text-xs font-medium text-foreground transition-colors"
            >
                <HugeiconsIcon icon={getVehicleIcon(selectedVehicle ? selectedVehicle.icon : null)} className="size-3.5 sm:size-4" strokeWidth={1.5} />
                <span className="max-w-[70px] sm:max-w-[100px] truncate">{selectedVehicle ? selectedVehicle.name : "All Vehicles"}</span>
                <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    className={cn("size-2.5 sm:size-3 transition-transform", open && "rotate-180")}
                    strokeWidth={2}
                />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[200px] rounded-2xl bg-surface-container-high p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
                    <button
                        onClick={() => {
                            setSelectedVehicleId("all")
                            setOpen(false)
                        }}
                        className={cn(
                            "m3-state-layer flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                            !selectedVehicle
                                ? "bg-secondary text-secondary-foreground font-medium"
                                : "text-foreground"
                        )}
                    >
                        <HugeiconsIcon icon={Car01Icon} className="size-4 shrink-0 text-primary/60" strokeWidth={1.5} />
                        <div className="flex flex-col items-start min-w-0">
                            <span className="text-[13px] truncate w-full">All Vehicles</span>
                        </div>
                    </button>
                    <div className="h-px bg-border/50 my-1 mx-2" />
                    {vehicles.map((v) => (
                        <button
                            key={v.id}
                            onClick={() => {
                                setSelectedVehicleId(v.id)
                                setOpen(false)
                            }}
                            className={cn(
                                "m3-state-layer flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                                selectedVehicle?.id === v.id
                                    ? "bg-secondary text-secondary-foreground font-medium"
                                    : "text-foreground"
                            )}
                        >
                            <HugeiconsIcon icon={getVehicleIcon(v.icon)} className="size-4 shrink-0 text-primary" strokeWidth={1.5} />
                            <div className="flex flex-col items-start min-w-0">
                                <span className="text-[13px] truncate w-full">{v.name}</span>
                                {v.make && (
                                    <span className="text-[10px] text-muted-foreground truncate w-full">
                                        {v.make} {v.model}
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

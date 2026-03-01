"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import useSWR from "swr"
import { useSession } from "next-auth/react"
import type { Vehicle } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface VehicleContextType {
    vehicles: Vehicle[]
    selectedVehicle: Vehicle | null
    setSelectedVehicleId: (id: string) => void
    isLoading: boolean
    refresh: () => void
    addVehicle: (data: Partial<Vehicle> & { licensePlate?: string }) => Promise<boolean>
    updateVehicle: (id: string, data: Partial<Vehicle>) => Promise<boolean>
    deleteVehicle: (id: string) => Promise<boolean>
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined)

export function VehicleProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const isAuthenticated = status === "authenticated"

    const { data: vehicles, isLoading: swrLoading, mutate } = useSWR<Vehicle[]>(
        isAuthenticated ? "/api/vehicles" : null,
        fetcher
    )

    const [guestVehicles, setGuestVehicles] = useState<Vehicle[]>([])
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
        // Load guest vehicles immediately on client
        if (status === "unauthenticated") {
            const local = localStorage.getItem("guest_vehicles")
            if (local) {
                setGuestVehicles(JSON.parse(local))
            }
        }
    }, [status])

    useEffect(() => {
        // Try to load from localStorage first
        const saved = localStorage.getItem("selected_vehicle_id")
        if (saved) {
            setSelectedVehicleId(saved)
        }
    }, [])

    const activeVehicles = isAuthenticated ? (vehicles || []) : guestVehicles
    const isLoading = isAuthenticated ? swrLoading : !isClient

    useEffect(() => {
        if (!isLoading && activeVehicles.length > 0) {
            if (!selectedVehicleId) {
                const def = activeVehicles.find((v) => v.is_default) || activeVehicles[0]
                setSelectedVehicleId(def.id)
            } else if (selectedVehicleId !== "all") {
                // Ensure the selected vehicle still exists
                const exists = activeVehicles.find((v) => v.id === selectedVehicleId)
                if (!exists) {
                    const def = activeVehicles.find((v) => v.is_default) || activeVehicles[0]
                    setSelectedVehicleId(def.id)
                }
            }
        }
    }, [activeVehicles, selectedVehicleId, isLoading])

    useEffect(() => {
        if (selectedVehicleId) {
            localStorage.setItem("selected_vehicle_id", selectedVehicleId)
        }
    }, [selectedVehicleId])

    const selectedVehicle = activeVehicles.find((v) => v.id === selectedVehicleId) || null

    const addVehicle = async (data: Partial<Vehicle> & { licensePlate?: string }) => {
        if (isAuthenticated) {
            const res = await fetch("/api/vehicles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.name,
                    make: data.make,
                    model: data.model,
                    year: data.year,
                    license_plate: data.licensePlate || data.license_plate, // handle both formats
                    icon: data.icon || 'car',
                }),
            })
            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || "Failed to add vehicle")
            }
            mutate()
            return true
        } else {
            const newVehicle: Vehicle = {
                id: `local_vehicle_${Date.now()}`,
                name: data.name || "My Car",
                make: data.make || "",
                model: data.model || "",
                year: data.year || null,
                license_plate: data.licensePlate || data.license_plate || null,
                is_default: guestVehicles.length === 0,
                icon: data.icon || 'car',
                created_at: new Date().toISOString(),
                userId: "guest",
            }
            const updated = [newVehicle, ...guestVehicles]
            setGuestVehicles(updated)
            localStorage.setItem("guest_vehicles", JSON.stringify(updated))
            setSelectedVehicleId(newVehicle.id) // auto select the newly added vehicle
            return true
        }
    }

    const updateVehicle = async (id: string, data: Partial<Vehicle>) => {
        if (isAuthenticated) {
            const res = await fetch(`/api/vehicles/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Failed to update vehicle")
            mutate()
            return true
        } else {
            const updated = guestVehicles.map((v) => (v.id === id ? { ...v, ...data } : v))
            setGuestVehicles(updated)
            localStorage.setItem("guest_vehicles", JSON.stringify(updated))
            return true
        }
    }

    const deleteVehicle = async (id: string) => {
        if (isAuthenticated) {
            const res = await fetch(`/api/vehicles/${id}`, {
                method: "DELETE",
            })
            if (!res.ok) throw new Error("Failed to delete vehicle")
            mutate()
            return true
        } else {
            const updated = guestVehicles.filter((v) => v.id !== id)
            setGuestVehicles(updated)
            localStorage.setItem("guest_vehicles", JSON.stringify(updated))
            if (selectedVehicleId === id) {
                const nextId = updated[0]?.id || null
                setSelectedVehicleId(nextId)
            }
            return true
        }
    }

    return (
        <VehicleContext.Provider
            value={{
                vehicles: activeVehicles,
                selectedVehicle,
                setSelectedVehicleId,
                isLoading,
                refresh: mutate,
                addVehicle,
                updateVehicle,
                deleteVehicle,
            }}
        >
            {children}
        </VehicleContext.Provider>
    )
}

export function useVehicles() {
    const context = useContext(VehicleContext)
    if (context === undefined) {
        throw new Error("useVehicles must be used within a VehicleProvider")
    }
    return context
}

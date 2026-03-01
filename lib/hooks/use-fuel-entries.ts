import useSWR, { mutate } from "swr"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import type { FuelEntry, FuelSummary, PeriodData, ViewPeriod } from "@/lib/types"
import { calculateSummary, calculatePeriodData } from "../utils/fuel-math"

const API_PATH = "/api/fuel-entries"
const STORAGE_KEY = "guest_fuel_entries"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useFuelEntries(period: ViewPeriod = "monthly", vehicleId?: string | null) {
    const { data: session, status } = useSession()
    const isAuthenticated = status === "authenticated"
    const [guestEntries, setGuestEntries] = useState<FuelEntry[]>([])

    // Load guest entries from localStorage once on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                setGuestEntries(JSON.parse(stored))
            }
        }
    }, [])

    const apiVehicleId = vehicleId === "all" ? null : vehicleId

    // SWR for authenticated user entries
    const { data: dbEntries, isLoading: dbEntriesLoading } = useSWR<FuelEntry[]>(
        isAuthenticated ? `${API_PATH}?limit=50${apiVehicleId ? `&vehicleId=${apiVehicleId}` : ''}` : null,
        fetcher
    )

    // SWR for authenticated user summary
    const { data: dbSummaryData, isLoading: dbSummaryLoading } = useSWR<{ summary: FuelSummary, periodData: PeriodData[] }>(
        isAuthenticated ? `${API_PATH}/summary?period=${period}${apiVehicleId ? `&vehicleId=${apiVehicleId}` : ''}` : null,
        fetcher
    )

    const guestFiltered = (vehicleId && vehicleId !== "all") ? guestEntries.filter(e => e.vehicle_id === vehicleId) : guestEntries
    const entries = isAuthenticated ? (dbEntries || []) : guestFiltered

    // Calculate summary and period data locally for guest
    const guestSummary = calculateSummary(guestFiltered)
    const guestPeriodData = calculatePeriodData(guestFiltered, period)

    const summary = isAuthenticated ? (dbSummaryData?.summary || calculateSummary([])) : guestSummary
    const periodData = isAuthenticated ? (dbSummaryData?.periodData || []) : guestPeriodData

    const isLoading = isAuthenticated
        ? (dbEntriesLoading || dbSummaryLoading)
        : status === "loading"

    const saveGuestEntries = (newEntries: FuelEntry[]) => {
        setGuestEntries(newEntries)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries))
    }

    const addEntry = async (entryData: any) => {
        if (isAuthenticated) {
            const res = await fetch(API_PATH, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...entryData, vehicle_id: vehicleId }),
            })
            if (res.ok) {
                refresh()
            }
            return res
        } else {
            const newEntry: FuelEntry = {
                ...entryData,
                id: Date.now(),
                created_at: new Date().toISOString(),
                distance: null,
                fuel_efficiency: null,
                cost_per_km: null,
                vehicle_id: entryData.vehicle_id || vehicleId || null,
                total_cost: parseFloat((parseFloat(entryData.liters) * parseFloat(entryData.price_per_liter)).toFixed(2))
            }

            const vehicleEntries = guestEntries.filter(e => e.vehicle_id === newEntry.vehicle_id)
            const prev = vehicleEntries.length > 0 ? vehicleEntries[0] : null
            if (prev) {
                const dist = parseFloat(newEntry.odometer.toString()) - parseFloat(prev.odometer.toString())
                if (dist > 0) {
                    newEntry.distance = dist
                    newEntry.fuel_efficiency = parseFloat((dist / parseFloat(newEntry.liters.toString())).toFixed(2))
                    newEntry.cost_per_km = parseFloat((newEntry.total_cost / dist).toFixed(4))
                }
            }

            saveGuestEntries([newEntry, ...guestEntries])
            return { ok: true }
        }
    }

    const deleteEntry = async (id: number) => {
        if (isAuthenticated) {
            const res = await fetch(`${API_PATH}/${id}`, { method: "DELETE" })
            if (res.ok) {
                refresh()
            }
            return res
        } else {
            saveGuestEntries(guestEntries.filter(e => e.id !== id))
            return { ok: true }
        }
    }

    const updateEntry = async (id: number, entryData: any) => {
        if (isAuthenticated) {
            const res = await fetch(`${API_PATH}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entryData),
            })
            if (res.ok) {
                refresh()
            }
            return res
        } else {
            const updated = guestEntries.map(e => {
                if (e.id === id) {
                    const total_cost = parseFloat((parseFloat(entryData.liters) * parseFloat(entryData.price_per_liter)).toFixed(2))
                    return { ...e, ...entryData, total_cost }
                }
                return e
            })
            saveGuestEntries(updated)
            return { ok: true }
        }
    }

    const sync = async () => {
        if (!isAuthenticated || guestEntries.length === 0) return

        for (const entry of [...guestEntries].reverse()) {
            await fetch(API_PATH, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: entry.date,
                    liters: entry.liters,
                    price_per_liter: entry.price_per_liter,
                    odometer: entry.odometer,
                    fuel_type: entry.fuel_type,
                    station: entry.station,
                    notes: entry.notes,
                    vehicle_id: vehicleId
                }),
            })
        }

        localStorage.removeItem(STORAGE_KEY)
        setGuestEntries([])
        refresh()
    }

    const refresh = () => {
        const vId = apiVehicleId ? `&vehicleId=${apiVehicleId}` : ''
        mutate(`${API_PATH}?limit=50${vId}`)
        mutate(`${API_PATH}?limit=5${vId}`)
        mutate(`${API_PATH}/summary?period=daily${vId}`)
        mutate(`${API_PATH}/summary?period=monthly${vId}`)
        mutate(`${API_PATH}/summary?period=yearly${vId}`)
        mutate(isAuthenticated ? `${API_PATH}/summary?period=${period}${vId}` : null)
    }

    return {
        entries,
        summary,
        periodData,
        isLoading,
        addEntry,
        deleteEntry,
        updateEntry,
        sync,
        isAuthenticated,
        hasGuestEntries: guestEntries.length > 0
    }
}

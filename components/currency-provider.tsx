"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

const CurrencyContext = createContext<{
    currency: string
    setCurrency: (currency: string) => void
}>({
    currency: "BDT ",
    setCurrency: () => { },
})

export const currencies = [
    { value: "BDT ", label: "BDT (৳)" },
    { value: "$", label: "USD ($)" },
    { value: "€", label: "EUR (€)" },
    { value: "£", label: "GBP (£)" },
    { value: "₹", label: "INR (₹)" },
]

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState("BDT ")

    useEffect(() => {
        const saved = localStorage.getItem("app_currency")
        if (saved) {
            setCurrencyState(saved)
        }
    }, [])

    const setCurrency = (curr: string) => {
        setCurrencyState(curr)
        localStorage.setItem("app_currency", curr)
    }

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export function useCurrency() {
    return useContext(CurrencyContext)
}

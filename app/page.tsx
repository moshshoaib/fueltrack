"use client"

import { useState } from "react"
import { TabNavigation } from "@/components/tab-navigation"
import { DashboardView } from "@/components/dashboard-view"
import { AddEntryView } from "@/components/add-entry-view"
import { HistoryView } from "@/components/history-view"
import { AnalyticsView } from "@/components/analytics-view"

export default function FuelTrackerApp() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-background">
      <main className="flex-1">
        {activeTab === "dashboard" && <DashboardView />}
        {activeTab === "add" && (
          <AddEntryView onSuccess={() => setActiveTab("dashboard")} />
        )}
        {activeTab === "history" && <HistoryView />}
        {activeTab === "analytics" && <AnalyticsView />}
      </main>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

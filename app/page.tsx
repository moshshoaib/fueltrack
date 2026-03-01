"use client"

import { useState } from "react"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { TabNavigation } from "@/components/tab-navigation"
import { DashboardView } from "@/components/dashboard-view"
import { AddEntryView } from "@/components/add-entry-view"
import { HistoryView } from "@/components/history-view"
import { AnalyticsView } from "@/components/analytics-view"
import { SettingsView } from "@/components/settings-view"
import { GarageView } from "@/components/garage-view"

export default function FuelTrackerApp() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="flex min-h-dvh bg-background">
      <DesktopSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col md:ml-[260px]">
        <div className="mx-auto w-full max-w-lg flex-1 flex flex-col md:max-w-3xl md:px-8">
          <main className="flex-1">
            {activeTab === "dashboard" && (
              <DashboardView
                onOpenSettings={() => setActiveTab("settings")}
                onAddEntry={() => setActiveTab("add")}
              />
            )}
            {activeTab === "add" && <AddEntryView onSuccess={() => setActiveTab("dashboard")} />}
            {activeTab === "history" && <HistoryView />}
            {activeTab === "analytics" && <AnalyticsView />}
            {activeTab === "garage" && <GarageView />}
            {activeTab === "settings" && <SettingsView onBack={() => setActiveTab("dashboard")} />}
          </main>
          {activeTab !== "settings" && (
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          )}
        </div>
      </div>
    </div>
  )
}

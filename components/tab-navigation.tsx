"use client"

import { cn } from "@/lib/utils"
import { Fuel, BarChart3, Clock, PlusCircle } from "lucide-react"

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "dashboard", label: "Home", icon: Fuel },
  { id: "history", label: "History", icon: Clock },
  { id: "add", label: "Add", icon: PlusCircle },
  { id: "analytics", label: "Stats", icon: BarChart3 },
]

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 border-t border-border/60 bg-card/90 backdrop-blur-2xl backdrop-saturate-150"
      role="tablist"
    >
      <div className="flex items-stretch justify-around px-1 pb-7 pt-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const isAdd = tab.id === "add"

          return (
            <button
              key={tab.id}
              role="tab"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "group relative flex flex-col items-center gap-0.5 px-5 py-1 transition-colors duration-150",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={tab.label}
              aria-selected={isActive}
            >
              {isActive && (
                <span className="absolute -top-1.5 left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full bg-primary" />
              )}
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center transition-transform duration-150",
                  isAdd && "h-8 w-8",
                  isActive && "scale-105"
                )}
              >
                <Icon
                  className={cn(
                    "h-[22px] w-[22px] transition-all duration-150",
                    isAdd && "h-6 w-6",
                    isActive ? "stroke-[2.4px]" : "stroke-[1.8px]"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] leading-tight tracking-wide",
                  isActive ? "font-semibold" : "font-medium"
                )}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

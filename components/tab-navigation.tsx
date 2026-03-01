"use client"

import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Home01Icon,
  Clock01Icon,
  PlusSignCircleIcon,
  ChartHistogramIcon,
  UserCircleIcon,
  Car01Icon,
} from "@hugeicons/core-free-icons"

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "dashboard", label: "Home", icon: Home01Icon },
  { id: "activity", label: "Activity", icon: Clock01Icon },
  { id: "add", label: "Fuel", icon: PlusSignCircleIcon, isFab: true },
  { id: "garage", label: "Garage", icon: Car01Icon },
  { id: "settings", label: "Profile", icon: UserCircleIcon },
]

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container/95 backdrop-blur-xl md:hidden"
      role="tablist"
    >
      <div className="flex items-end justify-around px-1 pt-1.5 pb-7">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          if (tab.isFab) {
            return (
              <button
                key={tab.id}
                role="tab"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative -mt-5 flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 active:scale-90",
                  isActive
                    ? "bg-primary text-primary-foreground glow-primary scale-105"
                    : "bg-surface-container-high text-foreground"
                )}
                aria-label={tab.label}
                aria-selected={isActive}
              >
                <HugeiconsIcon icon={tab.icon} className="size-6" strokeWidth={isActive ? 2.2 : 1.5} />
              </button>
            )
          }

          return (
            <button
              key={tab.id}
              role="tab"
              onClick={() => onTabChange(tab.id)}
              className="group flex flex-col items-center gap-1 flex-1 transition-all active:scale-90"
              aria-label={tab.label}
              aria-selected={isActive}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-full h-8 transition-all duration-300 ease-out",
                  isActive
                    ? "w-16 bg-primary/15 text-primary"
                    : "w-8 bg-transparent text-muted-foreground"
                )}
              >
                <HugeiconsIcon
                  icon={tab.icon}
                  className="size-[22px]"
                  strokeWidth={isActive ? 2.2 : 1.5}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] leading-none transition-all",
                  isActive
                    ? "font-semibold text-primary"
                    : "font-medium text-muted-foreground"
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

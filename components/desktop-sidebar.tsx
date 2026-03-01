"use client"

import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Home01Icon,
    Clock01Icon,
    PlusSignCircleIcon,
    ChartHistogramIcon,
    Car01Icon,
    FuelStationIcon,
} from "@hugeicons/core-free-icons"

interface DesktopSidebarProps {
    activeTab: string
    onTabChange: (tab: string) => void
}

const tabs = [
    { id: "dashboard", label: "Home", icon: Home01Icon },
    { id: "history", label: "Activity", icon: Clock01Icon },
    { id: "add", label: "New Log", icon: PlusSignCircleIcon },
    { id: "analytics", label: "Insights", icon: ChartHistogramIcon },
    { id: "garage", label: "Garage", icon: Car01Icon },
]

export function DesktopSidebar({ activeTab, onTabChange }: DesktopSidebarProps) {
    return (
        <aside className="hidden md:flex flex-col w-[260px] h-screen fixed left-0 top-0 bg-surface-container-low border-r border-border/30 overflow-y-auto">
            {/* Brand */}
            <div className="px-6 pt-8 pb-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground glow-primary-sm">
                        <HugeiconsIcon icon={FuelStationIcon} className="size-5" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-[15px] font-bold tracking-tight text-foreground leading-none">
                            Fuel<span className="text-primary">Track</span>
                        </h1>
                        <p className="text-[10px] text-muted-foreground mt-1 font-medium tracking-wide uppercase">Your Fuel Game</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 flex flex-col gap-0.5">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "m3-state-layer flex items-center gap-3 px-4 py-3 rounded-full text-sm transition-all duration-200",
                                isActive
                                    ? "bg-primary/12 text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <HugeiconsIcon
                                icon={tab.icon}
                                className="size-5"
                                strokeWidth={isActive ? 2 : 1.5}
                            />
                            <span>{tab.label}</span>
                        </button>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-border/20">
                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-medium">
                    FuelTrack v2.0
                </p>
            </div>
        </aside>
    )
}

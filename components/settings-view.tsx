"use client"

import { useFuelEntries } from "@/lib/hooks/use-fuel-entries"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    UserCircleIcon,
    CircleArrowReload01Icon,
    InformationCircleIcon,
    Shield01Icon,
    Logout01Icon,
    ArrowLeft01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { useCurrency, currencies } from "@/components/currency-provider"
import { useSession } from "next-auth/react"
import { logout } from "@/lib/actions/auth"
import Link from "next/link"

interface SettingsViewProps {
    onBack: () => void
}

export function SettingsView({ onBack }: SettingsViewProps) {
    const { sync, isLoading } = useFuelEntries("monthly")
    const { currency, setCurrency } = useCurrency()
    const { data: session } = useSession()

    const guestEntriesCount = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('fuel_entries_guest') || '[]').length
        : 0

    const initial = session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || "U"

    return (
        <div className="flex flex-col gap-8 px-4 pb-28 pt-6 max-w-2xl mx-auto md:px-0">
            <header className="flex items-center gap-3 animate-m3-fade-in">
                <button
                    onClick={onBack}
                    className="m3-state-layer flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-foreground border border-border/50 hover:border-primary/50 transition-colors"
                >
                    <HugeiconsIcon icon={ArrowLeft01Icon} className="size-5" strokeWidth={2} />
                </button>
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-xl font-bold tracking-tight text-foreground">Profile & Settings</h1>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Manage Account</p>
                </div>
            </header>

            {/* Account Card */}
            <section className="flex flex-col gap-3 animate-m3-fade-in" style={{ animationDelay: "50ms" }}>
                <SectionLabel icon={UserCircleIcon} label="Account" />
                <div className="rounded-3xl bg-surface-container-low p-6 border border-border/20">
                    {session?.user ? (
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold shrink-0 overflow-hidden outline outline-1 outline-primary/20">
                                    {session.user.image ? (
                                        <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                                    ) : initial}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <p className="text-base font-bold text-foreground truncate">{session.user.name || "User"}</p>
                                    <p className="text-[11px] text-muted-foreground truncate font-medium">{session.user.email}</p>
                                </div>
                            </div>
                            <form action={logout}>
                                <button
                                    type="submit"
                                    className="m3-state-layer w-full flex items-center justify-center gap-2 bg-surface-container-high text-foreground font-semibold py-3.5 rounded-2xl text-sm transition-colors mt-2"
                                >
                                    <HugeiconsIcon icon={Logout01Icon} className="size-4" strokeWidth={2} />
                                    Sign Out
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5 items-center py-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-muted-foreground border border-border/50">
                                <HugeiconsIcon icon={UserCircleIcon} className="size-8" strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <p className="text-sm font-bold text-foreground">Guest Mode</p>
                                <p className="text-[11px] font-medium text-muted-foreground tracking-wide">Ready for Cloud Sync? Sign in.</p>
                            </div>
                            <Link
                                href="/login"
                                className="m3-state-layer w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-full text-sm text-center transition-colors glow-primary"
                            >
                                Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Cloud Sync */}
            <section className="flex flex-col gap-3 animate-m3-fade-in" style={{ animationDelay: "100ms" }}>
                <SectionLabel icon={CircleArrowReload01Icon} label="Cloud Sync" />
                <div className="rounded-3xl bg-surface-container-low p-5 border border-border/20">
                    <div className="flex items-start gap-4">
                        <div className="flex-1 flex flex-col gap-1">
                            <p className="text-sm font-bold text-foreground">Local Records</p>
                            <p className="text-[11px] font-medium text-muted-foreground/80 leading-relaxed">
                                {guestEntriesCount > 0
                                    ? `${guestEntriesCount} local un-synced events.`
                                    : "All data backed up."}
                            </p>
                        </div>
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <HugeiconsIcon icon={CircleArrowReload01Icon} className={cn("size-5", isLoading && "animate-spin")} strokeWidth={1.5} />
                        </div>
                    </div>
                    {guestEntriesCount > 0 && (
                        <button
                            onClick={() => sync()}
                            disabled={isLoading}
                            className="m3-state-layer mt-5 w-full bg-surface-container-high text-foreground font-semibold py-3.5 rounded-2xl text-sm transition-all disabled:opacity-40"
                        >
                            {isLoading ? "Syncing to Database..." : "Upload to Cloud"}
                        </button>
                    )}
                </div>
            </section>

            {/* Display Settings */}
            <section className="flex flex-col gap-3 animate-m3-fade-in" style={{ animationDelay: "150ms" }}>
                <SectionLabel icon={InformationCircleIcon} label="Preferences" />
                <div className="rounded-3xl bg-surface-container-low p-5 border border-border/20 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-foreground">Currency</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Change local symbol</p>
                    </div>
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="bg-surface-container-high h-10 px-3 pr-8 rounded-xl text-sm font-medium focus:ring-1 focus:ring-primary appearance-none outline-none border border-border/20"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                    >
                        {currencies.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                </div>
            </section>

            {/* App Info */}
            <section className="flex flex-col gap-3 animate-m3-fade-in" style={{ animationDelay: "200ms" }}>
                <SectionLabel icon={InformationCircleIcon} label="Application Info" />
                <div className="rounded-3xl bg-surface-container-low overflow-hidden divide-y divide-border/20 border border-border/20">
                    <InfoRow label="Version" value="2.1 Modernized" />
                    <InfoRow label="Environment" value="Production" />
                </div>
            </section>

            {/* Privacy */}
            <section className="flex flex-col gap-3 animate-m3-fade-in" style={{ animationDelay: "250ms" }}>
                <SectionLabel icon={Shield01Icon} label="Privacy" />
                <div className="rounded-3xl bg-surface-container-low p-5 border border-border/20">
                    <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                        Your telemetry and fuel data is encrypted and completely private. Drive safe!
                    </p>
                </div>
            </section>
        </div >
    )
}

function SectionLabel({ icon, label }: { icon: any; label: string }) {
    return (
        <div className="flex items-center gap-2 px-1">
            <HugeiconsIcon icon={icon} className="size-4 text-primary" strokeWidth={2} />
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</h2>
        </div>
    )
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between px-5 py-4">
            <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
            <span className="text-sm font-bold text-foreground">{value}</span>
        </div>
    )
}

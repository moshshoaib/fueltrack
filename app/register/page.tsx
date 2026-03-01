"use client"

import { useActionState } from "react"
import { register, signInWithGoogle } from "@/lib/actions/auth"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { FuelStationIcon } from "@hugeicons/core-free-icons"

export default function RegisterPage() {
    const [state, action, pending] = useActionState(register, undefined)

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground mb-5 shadow-lg shadow-primary/15">
                        <HugeiconsIcon icon={FuelStationIcon} className="size-7" strokeWidth={1.8} />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create Account</h1>
                    <p className="text-sm text-muted-foreground mt-1.5">Join FuelTrack and start logging.</p>
                </div>

                {/* Card */}
                <div className="rounded-3xl bg-surface-container-low p-8 relative overflow-hidden">
                    {state?.error && (
                        <div className="bg-destructive/8 text-destructive text-xs font-medium rounded-xl px-3.5 py-2.5 mb-6">
                            {state.error}
                        </div>
                    )}

                    {/* Google */}
                    <form action={signInWithGoogle}>
                        <button
                            type="submit"
                            className="m3-state-layer w-full flex items-center justify-center gap-3 bg-surface-container-high text-foreground font-medium text-sm py-3 rounded-full transition-colors mb-6"
                        >
                            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1c-4.3 0-8.01 2.47-9.82 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Join with Google
                        </button>
                    </form>

                    <div className="relative mb-6 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/40"></div>
                        </div>
                        <span className="relative bg-surface-container-low px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                            or sign up with email
                        </span>
                    </div>

                    <form action={action} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="name" className="text-[11px] font-medium text-muted-foreground tracking-wide px-0.5">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                placeholder="John Doe"
                                className="w-full h-12 rounded-xl border border-border bg-transparent px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-[11px] font-medium text-muted-foreground tracking-wide px-0.5">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="you@example.com"
                                className="w-full h-12 rounded-xl border border-border bg-transparent px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="text-[11px] font-medium text-muted-foreground tracking-wide px-0.5">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={6}
                                placeholder="Min. 6 characters"
                                className="w-full h-12 rounded-xl border border-border bg-transparent px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={pending}
                            className="m3-state-layer w-full h-12 bg-primary text-primary-foreground font-medium rounded-full text-sm shadow-sm transition-all disabled:opacity-40 mt-1"
                        >
                            {pending ? "Creating account..." : "Create Account"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-muted-foreground mt-8">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}

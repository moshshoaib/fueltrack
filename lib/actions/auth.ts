"use server"

import { signIn, signOut } from "@/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { AuthError } from "next-auth"

type ActionState = { error: string } | undefined

export async function register(
    _state: ActionState,
    formData: FormData
): Promise<ActionState> {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!name || !email || !password) {
        return { error: "All fields are required" }
    }
    if (password.length < 6) {
        return { error: "Password must be at least 6 characters" }
    }

    const existing = await db.select().from(users).where(eq(users.email, email))
    if (existing.length > 0) {
        return { error: "Email already in use" }
    }

    const hashed = await bcrypt.hash(password, 10)
    await db.insert(users).values({
        id: crypto.randomUUID(),
        name,
        email,
        password: hashed,
    })

    redirect("/login?registered=true")
}

export async function login(
    _state: ActionState,
    formData: FormData
): Promise<ActionState> {
    try {
        await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: "/",
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid email or password" }
                default:
                    return { error: "Something went wrong" }
            }
        }
        throw error
    }
}

export async function signInWithGoogle() {
    await signIn("google", { redirectTo: "/" })
}

export async function signInWithEmail(
    _state: ActionState,
    formData: FormData
): Promise<ActionState> {
    const email = formData.get("email") as string
    if (!email) return { error: "Email is required" }

    try {
        await signIn("resend", {
            email,
            redirectTo: "/login?sent=true",
        })
    } catch (error) {
        if (error instanceof AuthError) {
            return { error: "Failed to send magic link" }
        }
        throw error
    }
}

export async function logout() {
    await signOut({ redirectTo: "/login" })
}

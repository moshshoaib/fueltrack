import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import { users } from "@/lib/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: DrizzleAdapter(db),
    session: { strategy: "jwt" },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, credentials.email as string))

                if (!user || !user.password) return null

                const passwordsMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                )

                if (passwordsMatch) return user
                return null
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // Persist the user id in the JWT token when signing in
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            // Expose the user id on the session object so API routes can use it
            if (token?.id) {
                session.user.id = token.id as string
            }
            return session
        },
    },
})

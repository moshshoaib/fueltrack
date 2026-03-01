import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const { nextUrl, auth: session } = req
    const isLoggedIn = !!session
    const isAuthPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register")

    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL("/", nextUrl))
    }
    return NextResponse.next()
    return NextResponse.next()
})

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.png|.*\\.svg|.*\\.ico|.*\\.jpg|.*\\.webp).*)",
    ],
}

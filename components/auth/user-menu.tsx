import { auth } from "@/auth"
import { logout } from "@/lib/actions/auth"

export default async function UserMenu() {
    const session = await auth()
    if (!session?.user) return null

    const initial = session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || "U"

    return (
        <div className="flex items-center gap-3 px-4 py-2 bg-card border-b border-border">
            <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                    {session.user.image ? (
                        <img src={session.user.image} alt={session.user.name || "User"} className="w-8 h-8 rounded-full object-cover" />
                    ) : initial}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{session.user.name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                </div>
            </div>
            <form action={logout}>
                <button
                    type="submit"
                    className="text-xs text-muted-foreground hover:text-destructive-foreground hover:bg-destructive/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                    Sign out
                </button>
            </form>
        </div>
    )
}

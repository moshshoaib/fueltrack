import { auth } from "@/auth"
import { logout } from "@/lib/actions/auth"

export default async function UserMenu() {
    const session = await auth()
    if (!session?.user) return null

    const initial = session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || "U"

    return (
        <div className="flex items-center gap-4 px-6 py-4 bg-card border-b border-border/50">
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-[14px] font-bold shadow-sm overflow-hidden shrink-0 border border-primary/20">
                    {session.user.image ? (
                        <img src={session.user.image} alt={session.user.name || "User"} className="w-10 h-10 object-cover" />
                    ) : initial}
                </div>
                <div className="flex flex-col min-w-0">
                    <p className="text-[14px] font-bold tracking-tight text-foreground truncate leading-tight">
                        {session.user.name || "User"}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground truncate opacity-80">
                        {session.user.email}
                    </p>
                </div>
            </div>
            <form action={logout}>
                <button
                    type="submit"
                    className="text-[12px] font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/5 px-4 py-2 rounded-xl border border-transparent hover:border-destructive/10 transition-all active:scale-[0.98]"
                >
                    Sign Out
                </button>
            </form>
        </div>
    )
}

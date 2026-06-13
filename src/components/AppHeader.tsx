import Link from "next/link";
import { SafeUser } from "@/lib/user";
import { Logo } from "./Logo";

export function AppHeader({ user }: { user: SafeUser }) {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Logo compact />
        <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
          <Link href="/dashboard" className="hover:text-orange">Dashboard</Link>
          <Link href="/library" className="hover:text-orange">Library</Link>
          <Link href="/pricing" className="hover:text-orange">Pricing</Link>
          <Link href="/profile" className="hover:text-orange">Profile</Link>
          {(user.role === "STAFF" || user.role === "ADMIN") && (
            <Link href="/admin" className="hover:text-orange">Admin</Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/profile" className="flex items-center gap-2 text-sm font-semibold">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange/10 text-orange font-bold">
                {(user.name || user.email)[0].toUpperCase()}
              </span>
            )}
            <span className="hidden sm:inline">{user.name || user.email.split("@")[0]}</span>
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-sm font-semibold text-muted hover:text-charcoal">Sign Out</button>
          </form>
        </div>
      </div>
    </header>
  );
}

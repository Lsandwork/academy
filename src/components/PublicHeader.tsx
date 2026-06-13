import Link from "next/link";
import { Logo } from "./Logo";

export function PublicHeader({ dark = false }: { dark?: boolean }) {
  return (
    <header
      className={
        dark
          ? "sticky top-0 z-50 border-b border-white/10 bg-[#0d1117]/95 backdrop-blur"
          : "sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur"
      }
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Logo dark={dark} />
        <nav className={`hidden items-center gap-8 text-sm font-semibold md:flex ${dark ? "text-white/80" : "text-charcoal"}`}>
          <Link href="/#courses" className="hover:text-orange">Courses</Link>
          <Link href="/#how-it-works" className="hover:text-orange">How It Works</Link>
          <Link href="/#pricing" className="hover:text-orange">Pricing</Link>
          <Link href="/#resources" className="hover:text-orange">Resources ▾</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={`hidden text-sm font-semibold sm:block ${dark ? "text-white/70 hover:text-white" : "text-muted hover:text-charcoal"}`}
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-orange px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-dark"
          >
            Start Training →
          </Link>
        </div>
      </div>
    </header>
  );
}

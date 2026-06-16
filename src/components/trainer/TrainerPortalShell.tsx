"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import {
  trainerPortalSections,
  trainerPortalHref,
  type TrainerPortalSectionId
} from "@/data/trainerPortalNav";
import type { SafeUser } from "@/lib/user";

function sectionFromPath(pathname: string, basePath: string): TrainerPortalSectionId | null {
  const rest = pathname.replace(basePath, "").replace(/^\//, "");
  const section = rest.split("/")[0];
  if (trainerPortalSections.some((s) => s.id === section)) {
    return section as TrainerPortalSectionId;
  }
  return null;
}

function itemFromPath(pathname: string, basePath: string, sectionId: string): string | null {
  const prefix = `${basePath}/${sectionId}/`;
  if (!pathname.startsWith(prefix)) return null;
  return pathname.slice(prefix.length).split("/")[0] || null;
}

export function TrainerPortalShell({
  user,
  basePath,
  portalTitle,
  backHref,
  children
}: {
  user: SafeUser;
  basePath: string;
  portalTitle: string;
  backHref?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeSection = sectionFromPath(pathname, basePath);

  return (
    <div className="min-h-screen bg-soft-bg">
      {!backHref && <AppHeader user={user} />}
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 lg:flex-row lg:py-10">
        <aside className="w-full shrink-0 lg:w-72">
          <div className="sticky top-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            {backHref && (
              <Link href={backHref} className="text-sm font-bold text-orange hover:underline">
                ← Back to Admin
              </Link>
            )}
            <p className="mt-2 text-xs font-black uppercase tracking-[0.15em] text-orange">{portalTitle}</p>
            <p className="mt-1 text-lg font-black text-charcoal">{user.name || user.email.split("@")[0]}</p>

            <nav className="mt-6 space-y-6">
              {trainerPortalSections.map((section) => {
                const sectionActive = activeSection === section.id;
                return (
                  <div key={section.id}>
                    <Link
                      href={trainerPortalHref(basePath, section.id)}
                      className={`block rounded-xl px-3 py-2 text-sm font-black transition ${
                        sectionActive && !itemFromPath(pathname, basePath, section.id)
                          ? "bg-orange text-white"
                          : sectionActive
                            ? "bg-orange/10 text-orange"
                            : "text-charcoal hover:bg-soft-bg"
                      }`}
                    >
                      {section.label}
                    </Link>
                    <ul className="mt-2 space-y-1 border-l-2 border-gray-100 pl-3">
                      {section.items.map((item) => {
                        const href = trainerPortalHref(basePath, section.id, item.slug);
                        const itemActive = pathname === href;
                        return (
                          <li key={item.slug}>
                            <Link
                              href={href}
                              className={`block rounded-lg px-2 py-1.5 text-xs font-semibold leading-snug transition ${
                                itemActive ? "bg-orange/10 text-orange" : "text-muted hover:text-charcoal"
                              }`}
                            >
                              {item.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

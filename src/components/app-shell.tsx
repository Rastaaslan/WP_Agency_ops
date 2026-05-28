import Link from "next/link";
import type { ReactNode } from "react";
import { APP_NAME, APP_TAGLINE } from "@/lib/app-info";

const navigationItems = [
  {
    href: "/clients",
    label: "Clients",
  },
  {
    href: "/sites",
    label: "Sites",
  },
  {
    href: "/api/health",
    label: "API Health",
  },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f7f9] text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link className="group max-w-sm" href="/">
            <span className="block text-base font-semibold text-zinc-950">
              {APP_NAME}
            </span>
            <span className="block text-sm text-zinc-600">{APP_TAGLINE}</span>
          </Link>
          <nav aria-label="Navigation principale">
            <ul className="flex flex-wrap gap-2">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    className="inline-flex min-h-10 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:border-cyan-300 hover:text-cyan-800"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

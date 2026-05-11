'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid3X3, LogOut, Plus, Settings } from "lucide-react";

import {
  formatBytes,
  getPlan,
  getStoragePercentage,
} from "@/lib/plans";
import { cn } from "@/lib/utils";

interface UserInfo {
  email?: string;
  name: string;
  plan: string;
  storage_used_bytes?: number;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  user?: UserInfo;
}

const navItems = [
  { label: "Overview", href: "/admin", icon: Grid3X3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout({ children, user }: AdminLayoutProps) {
  const pathname = usePathname();
  const plan = getPlan(user?.plan ?? "free");
  const storageUsedBytes = user?.storage_used_bytes ?? 0;
  const storagePercentage = getStoragePercentage(storageUsedBytes, plan.id);

  return (
    <div className="page-backdrop min-h-screen">
      <div className="page-noise" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[96rem] flex-col lg:flex-row">
        <aside className="hidden w-[20rem] shrink-0 border-r border-white/8 px-6 py-6 lg:flex lg:flex-col">
          <Link href="/admin" className="space-y-2 rounded-[1.6rem] px-1 py-3">
            <p className="kicker">Studio</p>
            <h1 className="headline text-4xl text-[var(--foreground-strong)]">
              Atelier
            </h1>
          </Link>

          <div className="section-card mt-6 px-5 py-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
              Signed in
            </p>
            <p className="mt-3 text-lg text-[var(--foreground-strong)]">
              {user?.name || "Atelier studio"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-strong)]">
              {user?.email || `${plan.name} plan`}
            </p>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                <span>{plan.name} storage</span>
                <span>{storagePercentage}% used</span>
              </div>
              <div className="storage-bar">
                <div
                  className={cn(
                    "storage-bar-fill",
                    storagePercentage >= 90
                      ? "danger"
                      : storagePercentage >= 75
                        ? "warning"
                        : "",
                  )}
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
              <p className="text-sm text-[var(--muted-strong)]">
                {formatBytes(storageUsedBytes)} of {plan.storageLimitLabel}
              </p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href
                || (item.href !== "/admin" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-[1.2rem] px-4 py-3 text-sm transition-colors",
                    isActive
                      ? "bg-[var(--accent-bg)] text-[var(--foreground-strong)]"
                      : "text-[var(--muted-strong)] hover:bg-white/4 hover:text-[var(--foreground-strong)]",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 space-y-3">
            <Link href="/admin#new-gallery" className="btn-primary w-full px-4 py-3 text-sm">
              <Plus className="h-4 w-4" />
              Create gallery
            </Link>
            <Link href="/pricing" className="btn-secondary w-full px-4 py-3 text-sm">
              Review pricing
            </Link>
          </div>

          <form action="/api/admin/logout" method="post" className="mt-auto pt-8">
            <button className="btn-ghost w-full justify-start px-4 py-3 text-sm text-[var(--muted-strong)] hover:text-[var(--foreground-strong)]">
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </form>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(12,13,12,0.72)] px-4 py-4 backdrop-blur-2xl sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="kicker">Studio dashboard</p>
                <p className="mt-2 text-sm text-[var(--muted-strong)]">
                  Secure delivery, gallery creation, and storage visibility in one place.
                </p>
              </div>

              <div className="hidden items-center gap-3 sm:flex">
                <span className="rounded-full border border-white/10 bg-white/4 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted-strong)]">
                  {plan.name}
                </span>
                <Link href="/admin#new-gallery" className="btn-primary px-4 py-3 text-sm lg:hidden">
                  <Plus className="h-4 w-4" />
                  Create
                </Link>
              </div>
            </div>
          </header>

          <main id="main-content" className="flex-1 pb-24 lg:pb-10">{children}</main>

          <nav className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-[rgba(12,13,12,0.9)] px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href
                || (item.href !== "/admin" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-2 text-sm",
                    isActive
                      ? "bg-[var(--accent-bg)] text-[var(--foreground-strong)]"
                      : "text-[var(--muted-strong)]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

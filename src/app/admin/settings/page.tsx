import Link from "next/link";
import { CreditCard, Fingerprint, HardDrive, Mail, Shield } from "lucide-react";

import { AdminLayout } from "@/components/admin/admin-layout";
import {
  OVERAGE_PRICE_PER_100GB,
  formatBytes,
  getPlan,
  getStoragePercentage,
} from "@/lib/plans";
import { requireAuthUser } from "@/lib/server-auth";

export default async function SettingsPage() {
  const user = await requireAuthUser();
  const plan = getPlan(user.plan);
  const storagePercentage = getStoragePercentage(user.storage_used_bytes, user.plan);

  return (
    <AdminLayout user={user}>
      <div className="mx-auto flex w-full max-w-[72rem] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="section-card px-6 py-8 sm:px-8">
          <p className="kicker">Settings</p>
          <h1 className="headline mt-3 text-[clamp(3rem,6vw,4.8rem)] leading-[0.92] text-[var(--foreground-strong)]">
            Account, billing, and trust posture.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted-strong)]">
            This view keeps the current account state honest: plan, storage usage,
            and the operational promises clients rely on when you use Atelier for delivery.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="section-card px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/10 bg-white/4">
                <Mail className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                  Account
                </p>
                <h2 className="headline mt-2 text-3xl text-[var(--foreground-strong)]">
                  Studio identity
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.2rem] border border-white/8 bg-white/4 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Name
                </p>
                <p className="mt-3 text-lg text-[var(--foreground-strong)]">
                  {user.name}
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-white/8 bg-white/4 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Email
                </p>
                <p className="mt-3 text-lg text-[var(--foreground-strong)]">
                  {user.email}
                </p>
              </div>
            </div>
          </article>

          <article className="section-card px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/10 bg-white/4">
                <HardDrive className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                  Storage
                </p>
                <h2 className="headline mt-2 text-3xl text-[var(--foreground-strong)]">
                  Plan usage
                </h2>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-[var(--muted-strong)]">
                  {formatBytes(user.storage_used_bytes)} of {plan.storageLimitLabel}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  {plan.name} plan
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/4 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted-strong)]">
                {storagePercentage}% used
              </span>
            </div>

            <div className="mt-5 storage-bar">
              <div
                className={`storage-bar-fill ${storagePercentage >= 90 ? "danger" : storagePercentage >= 75 ? "warning" : ""}`}
                style={{ width: `${storagePercentage}%` }}
              />
            </div>

            <p className="mt-4 text-sm leading-7 text-[var(--muted-strong)]">
              Additional storage is billed at ${OVERAGE_PRICE_PER_100GB} per 100 GB per month.
              Usage stays visible here so billing never arrives as a surprise.
            </p>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="editorial-card px-6 py-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/10 bg-white/4">
              <Shield className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <h2 className="headline mt-6 text-3xl text-[var(--foreground-strong)]">
              Delivery security
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--muted-strong)]">
              Original downloads remain behind authenticated application routes and
              private object storage. Gallery access still happens through per-gallery codes.
            </p>
          </article>

          <article className="editorial-card px-6 py-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/10 bg-white/4">
              <Fingerprint className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <h2 className="headline mt-6 text-3xl text-[var(--foreground-strong)]">
              Trust cues
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--muted-strong)]">
              Clear storage limits, private originals, and calm client presentation are
              part of the product promise, not hidden implementation details.
            </p>
          </article>

          <article className="editorial-card px-6 py-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/10 bg-white/4">
              <CreditCard className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <h2 className="headline mt-6 text-3xl text-[var(--foreground-strong)]">
              Billing help
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--muted-strong)]">
              Need plan changes, invoice support, or onboarding help? Reach the team directly.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/pricing"
                className="btn-secondary px-4 py-2 text-sm"
              >
                Review plans
              </Link>
              <a
                href="mailto:support@atelier.gallery?subject=Atelier%20billing"
                className="btn-primary px-4 py-2 text-sm"
              >
                Email support
              </a>
            </div>
          </article>
        </section>
      </div>
    </AdminLayout>
  );
}

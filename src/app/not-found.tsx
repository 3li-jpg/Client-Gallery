import Link from "next/link";

import { MarketingShell } from "@/components/marketing/site";

export default function NotFound() {
  return (
    <MarketingShell>
      <section className="page-shell pt-10">
        <div className="section-card max-w-4xl px-6 py-12 text-center sm:px-10">
          <p className="kicker">Page not found</p>
          <h1 className="headline mt-4 text-[clamp(3rem,8vw,6rem)] text-[var(--foreground-strong)]">
            The page you asked for is not here.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--muted-strong)]">
            The route may have changed, the gallery may no longer exist, or the
            link was copied incorrectly. Use one of the main paths below to get
            back into the product.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-primary px-5 py-3 text-sm">
              Return home
            </Link>
            <Link href="/login" className="btn-secondary px-5 py-3 text-sm">
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

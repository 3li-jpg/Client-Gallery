import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden px-6 py-10 sm:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,164,106,0.18),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(117,136,176,0.12),_transparent_30%)]" />
      <div className="glass-panel relative mx-auto flex w-full max-w-6xl flex-col gap-16 rounded-[2rem] px-6 py-8 sm:px-10 sm:py-12 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="mb-5 text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Private Delivery For Finished Photography
          </p>
          <h1 className="headline max-w-3xl text-5xl leading-none text-[var(--foreground)] sm:text-7xl">
            Built for curated client reveal, not generic file sharing.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            Direct uploads to R2. Private originals. Authenticated downloads.
            A gallery presentation designed to feel editorial on desktop and
            mobile.
          </p>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-3">
          <Link
            href="/admin"
            className="btn-primary px-6 py-4 text-center text-sm uppercase tracking-[0.18em]"
          >
            Open Admin Panel
          </Link>
          <p className="text-sm leading-6 text-[var(--muted)]">
            Share galleries directly with clients at
            <span className="mx-1 font-mono text-[var(--muted-strong)]">
              /gallery/[slug]
            </span>
            using per-gallery access codes.
          </p>
        </div>
      </div>
    </main>
  );
}

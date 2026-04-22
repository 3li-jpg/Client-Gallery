'use client';

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface AccessGateProps {
  slug: string;
  name: string;
  clientName: string;
}

export function AccessGate({ slug, name, clientName }: AccessGateProps) {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/gallery/${slug}/access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessCode }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(payload?.error ?? "Access code not accepted.");
        return;
      }

      router.refresh();
    });
  };

  return (
    <main className="page-backdrop min-h-screen">
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="section-card px-8 py-10 sm:px-10">
            <p className="kicker">Private Client Gallery</p>
            <h1 className="headline mt-4 text-5xl leading-none text-[var(--foreground)] sm:text-6xl">
              {name}
            </h1>
            <p className="font-body mt-5 max-w-xl text-base leading-8 text-[var(--muted)]">
              Created for {clientName}. This gallery keeps previews fast and
              full-resolution downloads protected behind a private access code.
            </p>

            <div className="mt-10 grid gap-4">
              {[
                "A calmer client reveal on desktop and mobile",
                "Private originals that stay behind authenticated download routes",
                "A delivery flow tuned for photographers, not generic file sharing",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] border border-[rgba(0,0,0,0.08)] bg-white/54 px-4 py-4 font-body text-sm leading-7 text-[var(--muted)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] px-8 py-10 sm:px-10">
            <p className="kicker">Unlock access</p>
            <h2 className="headline mt-4 text-4xl leading-none text-[var(--foreground)]">
              Enter the gallery code.
            </h2>
            <p className="font-body mt-4 text-sm leading-7 text-[var(--muted)]">
              Once accepted, you can browse the full collection and download the
              approved originals.
            </p>

            <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="gallery-access-code"
                  className="form-label"
                >
                  Access code
                </label>
                <input
                  id="gallery-access-code"
                  name="accessCode"
                  className="field font-mono uppercase tracking-[0.3em]"
                  value={accessCode}
                  onChange={(event) => setAccessCode(event.target.value.toUpperCase())}
                  placeholder="ABCD1234…"
                  autoComplete="one-time-code"
                  spellCheck={false}
                  aria-invalid={Boolean(error)}
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="btn-primary font-ui w-full px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Verifying..." : "Unlock Gallery"}
              </button>

              {error ? (
                <div
                  aria-live="polite"
                  className="rounded-2xl border border-[rgba(255,107,107,0.35)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]"
                >
                  {error}
                </div>
              ) : null}
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

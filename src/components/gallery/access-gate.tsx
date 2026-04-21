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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,164,106,0.18),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(117,136,176,0.12),_transparent_28%)]" />
      <div className="glass-panel relative w-full max-w-xl rounded-[2rem] px-8 py-10 sm:px-10">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
          Private Client Gallery
        </p>
        <h1 className="headline mt-4 text-5xl leading-none text-[var(--foreground)] sm:text-6xl">
          {name}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)] sm:text-base">
          Created for {clientName}. Enter the gallery access code to unlock the
          full-resolution collection and download privileges.
        </p>

        <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm text-[var(--muted-strong)]">Access code</label>
            <input
              className="field font-mono uppercase tracking-[0.3em]"
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value.toUpperCase())}
              placeholder="ABCD1234"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full px-5 py-3 text-sm uppercase tracking-[0.22em] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Verifying..." : "Unlock Gallery"}
          </button>

          {error ? (
            <div className="rounded-2xl border border-[rgba(255,107,107,0.35)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </div>
          ) : null}
        </form>
      </div>
    </main>
  );
}

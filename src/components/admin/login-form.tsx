'use client';

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(payload?.error ?? "Invalid password.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm text-[var(--muted-strong)]">Admin password</label>
        <input
          type="password"
          className="field"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter the admin password"
          autoFocus
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full px-5 py-3 text-sm uppercase tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Unlocking..." : "Enter Admin"}
      </button>

      {error ? (
        <div className="rounded-2xl border border-[rgba(255,107,107,0.35)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </div>
      ) : null}
    </form>
  );
}

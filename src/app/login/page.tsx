import { redirect } from "next/navigation";
import Link from "next/link";

import { LoginForm } from "@/components/admin/login-form";
import { auth } from "@/lib/auth-config";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/admin");
  }

  return (
    <main className="page-backdrop min-h-screen flex items-center justify-center">
      <div className="w-full max-w-[480px] px-6">
        <div className="text-center mb-10">
          <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-[var(--foreground-strong)]">
            Atelier
          </Link>
        </div>

        <div className="glass-panel p-8 sm:p-10">
          <div className="text-center mb-8">
            <p className="kicker">Welcome back</p>
            <h1 className="headline mt-3 text-3xl text-[var(--foreground-strong)]">
              Sign in to your studio
            </h1>
            <p className="font-body mt-3 text-sm text-[var(--muted)]">
              Access your galleries, manage deliveries, and track your studio from one dashboard.
            </p>
          </div>

          <LoginForm />

          <div className="mt-8 text-center">
            <p className="font-body text-sm text-[var(--muted)]">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[var(--foreground)] underline underline-offset-4 hover:text-[var(--foreground-strong)]">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

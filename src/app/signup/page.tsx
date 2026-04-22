import { redirect } from "next/navigation";
import Link from "next/link";

import { SignUpForm } from "@/components/auth/signup-form";
import { auth } from "@/lib/auth-config";

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
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
            <p className="kicker">Get started free</p>
            <h1 className="headline mt-3 text-3xl text-[var(--foreground-strong)]">
              Create your studio
            </h1>
            <p className="font-body mt-3 text-sm text-[var(--muted)]">
              Set up your photographer account and start delivering premium client galleries in minutes.
            </p>
          </div>

          <SignUpForm />

          <div className="mt-8 text-center">
            <p className="font-body text-sm text-[var(--muted)]">
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--foreground)] underline underline-offset-4 hover:text-[var(--foreground-strong)]">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="font-body mt-6 text-center text-xs text-[var(--muted)]">
          By creating an account you agree to the{" "}
          <Link href="#" className="underline underline-offset-2 hover:text-[var(--foreground)]">Terms</Link>
          {" "}and{" "}
          <Link href="#" className="underline underline-offset-2 hover:text-[var(--foreground)]">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}

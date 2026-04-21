import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="glass-panel w-full max-w-md rounded-[2rem] px-8 py-10 sm:px-10">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
          Admin Access
        </p>
        <h1 className="headline mt-4 text-5xl leading-none text-[var(--foreground)]">
          Private control room.
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          Authenticate with the server-side `ADMIN_PASSWORD` and receive a signed
          httpOnly session cookie.
        </p>

        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

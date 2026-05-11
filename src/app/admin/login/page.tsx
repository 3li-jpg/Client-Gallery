import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-config";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/admin");
  }

  // Redirect to new unified login page
  redirect("/login");
}

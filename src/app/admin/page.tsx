import { AdminShell } from "@/components/admin/admin-shell";
import { listGalleries } from "@/lib/data";
import { requireAdminSession } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminSession();
  const galleries = await listGalleries();

  return <AdminShell galleries={galleries} />;
}

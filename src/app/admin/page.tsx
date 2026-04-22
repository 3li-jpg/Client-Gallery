import { AdminShell } from "@/components/admin/admin-shell";
import { listGalleries } from "@/lib/data";
import { requireAuthUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAuthUser();
  const galleries = await listGalleries(user.id);

  return <AdminShell galleries={galleries} user={user} />;
}

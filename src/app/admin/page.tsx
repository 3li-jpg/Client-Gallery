import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminShell } from "@/components/admin/admin-shell";
import { listGalleries } from "@/lib/data";
import { requireAuthUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAuthUser();
  const galleries = await listGalleries(user.id);

  return (
    <AdminLayout user={user}>
      <AdminShell galleries={galleries} user={user} />
    </AdminLayout>
  );
}

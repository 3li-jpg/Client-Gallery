import { redirect } from "next/navigation";

import { getAdminSession, getGallerySession } from "@/lib/auth";

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function getGallerySessionForSlug(slug: string) {
  const session = await getGallerySession();

  if (!session) {
    return null;
  }

  if (session.slug !== slug) {
    return null;
  }

  return session;
}

export async function hasAdminSession() {
  const session = await getAdminSession();
  return Boolean(session);
}

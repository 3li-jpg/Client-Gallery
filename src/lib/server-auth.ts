import { redirect } from "next/navigation";

import { auth } from "@/lib/auth-config";
import { getGallerySession } from "@/lib/auth";
import { getUserById } from "@/lib/data";

export async function requireAuthSession() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session;
}

export async function requireAuthUser() {
  const session = await requireAuthSession();
  const userId = session.user?.id;
  if (!userId) {
    redirect("/login");
  }
  const user = await getUserById(userId);

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getAuthSession() {
  const session = await auth();
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

export async function hasAuthSession() {
  const session = await auth();
  return Boolean(session?.user?.id);
}

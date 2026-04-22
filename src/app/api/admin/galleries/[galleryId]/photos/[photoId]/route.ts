import { NextResponse } from "next/server";

import { deletePhotoRecord, getGalleryById, getPhotoById } from "@/lib/data";
import { deletePhotoObjects } from "@/lib/r2";
import { auth } from "@/lib/auth-config";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ galleryId: string; photoId: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { galleryId, photoId } = await context.params;
  const gallery = await getGalleryById(galleryId);

  if (!gallery || gallery.user_id !== session.user.id) {
    return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
  }

  const photo = await getPhotoById(galleryId, photoId);

  if (!photo) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  try {
    await deletePhotoObjects(photo.r2_key);
    await deletePhotoRecord(galleryId, photoId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete photo." }, { status: 500 });
  }
}

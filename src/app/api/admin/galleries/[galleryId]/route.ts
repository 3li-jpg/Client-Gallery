import { NextResponse } from "next/server";

import { deleteGalleryAndPhotos, getGalleryById } from "@/lib/data";
import { deleteGalleryObjects } from "@/lib/r2";
import { hasAdminSession } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ galleryId: string }> },
) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { galleryId } = await context.params;
  const gallery = await getGalleryById(galleryId);

  if (!gallery) {
    return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
  }

  try {
    await deleteGalleryObjects(galleryId);
    await deleteGalleryAndPhotos(galleryId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete gallery." }, { status: 500 });
  }
}

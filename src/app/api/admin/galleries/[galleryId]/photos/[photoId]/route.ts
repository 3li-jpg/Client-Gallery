import { NextResponse } from "next/server";

import { deletePhotoRecord, getPhotoById } from "@/lib/data";
import { deletePrivateObject } from "@/lib/r2";
import { hasAdminSession } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ galleryId: string; photoId: string }> },
) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { galleryId, photoId } = await context.params;
  const photo = await getPhotoById(galleryId, photoId);

  if (!photo) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  try {
    await deletePrivateObject(photo.r2_key);
    await deletePhotoRecord(galleryId, photoId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete photo." }, { status: 500 });
  }
}

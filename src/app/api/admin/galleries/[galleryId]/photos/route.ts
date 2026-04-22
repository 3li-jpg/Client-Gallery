import { NextResponse } from "next/server";

import {
  deletePhotoRecord,
  getGalleryById,
  getPhotoById,
  insertPhoto,
} from "@/lib/data";
import { assertAllowedImageType, deletePhotoObjects } from "@/lib/r2";
import { auth } from "@/lib/auth-config";
import { sanitizeDisplayFilename } from "@/lib/utils";
import { bulkPhotoActionSchema, finalizePhotoSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ galleryId: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { galleryId } = await context.params;
  const gallery = await getGalleryById(galleryId);

  if (!gallery || gallery.user_id !== session.user.id) {
    return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
  }

  try {
    const body = finalizePhotoSchema.parse(await request.json());
    assertAllowedImageType(body.contentType);

    if (!body.r2Key.startsWith(`galleries/${galleryId}/`)) {
      return NextResponse.json({ error: "Invalid object key." }, { status: 400 });
    }

    const photo = await insertPhoto({
      photoId: body.photoId,
      galleryId,
      filename: sanitizeDisplayFilename(body.filename),
      r2Key: body.r2Key,
      contentType: body.contentType,
      sizeBytes: body.sizeBytes,
      width: body.width,
      height: body.height,
      blurDataUrl: body.blurDataUrl,
    });

    return NextResponse.json({ photo }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save photo metadata." }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ galleryId: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { galleryId } = await context.params;
  const gallery = await getGalleryById(galleryId);

  if (!gallery || gallery.user_id !== session.user.id) {
    return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
  }

  try {
    const body = bulkPhotoActionSchema.parse(await request.json());
    const uniquePhotoIds = Array.from(new Set(body.photoIds));
    const photos = (
      await Promise.all(uniquePhotoIds.map((photoId) => getPhotoById(galleryId, photoId)))
    ).filter((photo) => photo !== null);

    if (photos.length === 0) {
      return NextResponse.json({ error: "No matching photos found." }, { status: 404 });
    }

    for (const photo of photos) {
      await deletePhotoObjects(photo.r2_key);
      await deletePhotoRecord(galleryId, photo.id);
    }

    return NextResponse.json({
      ok: true,
      deletedPhotoIds: photos.map((photo) => photo.id),
    });
  } catch {
    return NextResponse.json({ error: "Could not delete selected photos." }, { status: 400 });
  }
}

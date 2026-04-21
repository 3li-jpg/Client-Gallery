import { NextResponse } from "next/server";

import { getGalleryById, insertPhoto } from "@/lib/data";
import { assertAllowedImageType, headPrivateObject } from "@/lib/r2";
import { hasAdminSession } from "@/lib/server-auth";
import { sanitizeDisplayFilename } from "@/lib/utils";
import { finalizePhotoSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(
  request: Request,
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
    const body = finalizePhotoSchema.parse(await request.json());
    assertAllowedImageType(body.contentType);

    if (!body.r2Key.startsWith(`galleries/${galleryId}/`)) {
      return NextResponse.json({ error: "Invalid object key." }, { status: 400 });
    }

    const objectHead = await headPrivateObject(body.r2Key);
    const photo = await insertPhoto({
      photoId: body.photoId,
      galleryId,
      filename: sanitizeDisplayFilename(body.filename),
      r2Key: body.r2Key,
      contentType: objectHead.ContentType ?? body.contentType,
      sizeBytes: Number(objectHead.ContentLength ?? body.sizeBytes ?? 0) || undefined,
      width: body.width,
      height: body.height,
      blurDataUrl: body.blurDataUrl,
    });

    return NextResponse.json({ photo }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save photo metadata." }, { status: 400 });
  }
}

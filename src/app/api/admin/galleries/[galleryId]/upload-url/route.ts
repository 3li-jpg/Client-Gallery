import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { getGalleryById } from "@/lib/data";
import { createPresignedUploadUrl, assertAllowedImageType } from "@/lib/r2";
import { auth } from "@/lib/auth-config";
import {
  buildStorageKey,
  buildThumbnailStorageKey,
  buildViewerStorageKey,
  sanitizeDisplayFilename,
} from "@/lib/utils";
import { uploadUrlSchema } from "@/lib/validation";

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
    const body = uploadUrlSchema.parse(await request.json());
    assertAllowedImageType(body.contentType);
    const filename = sanitizeDisplayFilename(body.filename);
    const r2Key = buildStorageKey(galleryId, filename);
    const thumbnailKey = buildThumbnailStorageKey(r2Key);
    const viewerKey = buildViewerStorageKey(r2Key);
    const [uploadUrl, thumbnailUploadUrl, viewerUploadUrl] = await Promise.all([
      createPresignedUploadUrl({
        key: r2Key,
        contentType: body.contentType,
      }),
      createPresignedUploadUrl({
        key: thumbnailKey,
        contentType: "image/jpeg",
      }),
      createPresignedUploadUrl({
        key: viewerKey,
        contentType: "image/jpeg",
      }),
    ]);

    return NextResponse.json({
      photoId: randomUUID(),
      filename,
      r2Key,
      uploadUrl,
      thumbnailKey,
      thumbnailUploadUrl,
      viewerKey,
      viewerUploadUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not generate upload URL.",
      },
      { status: 400 },
    );
  }
}

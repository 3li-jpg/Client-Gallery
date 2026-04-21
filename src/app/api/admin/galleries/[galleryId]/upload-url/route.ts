import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { getGalleryById } from "@/lib/data";
import { createPresignedUploadUrl, assertAllowedImageType } from "@/lib/r2";
import { hasAdminSession } from "@/lib/server-auth";
import { buildStorageKey, sanitizeDisplayFilename } from "@/lib/utils";
import { uploadUrlSchema } from "@/lib/validation";

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
    const body = uploadUrlSchema.parse(await request.json());
    assertAllowedImageType(body.contentType);
    const filename = sanitizeDisplayFilename(body.filename);
    const r2Key = buildStorageKey(galleryId, filename);
    const uploadUrl = await createPresignedUploadUrl({
      key: r2Key,
      contentType: body.contentType,
    });

    return NextResponse.json({
      photoId: randomUUID(),
      filename,
      r2Key,
      uploadUrl,
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

import { Readable } from "node:stream";

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth-config";
import { getGallerySession } from "@/lib/auth";
import { getGalleryById, getPhotoById } from "@/lib/data";
import { getPrivateObject } from "@/lib/r2";
import { sanitizeDisplayFilename } from "@/lib/utils";

export const runtime = "nodejs";

function buildContentDisposition(filename: string) {
  const fallback = sanitizeDisplayFilename(filename).replace(/"/g, "");
  const encoded = encodeURIComponent(filename)
    .replace(/['()]/g, escape)
    .replace(/\*/g, "%2A");

  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

function toWebStream(body: unknown): ReadableStream {
  if (body && typeof body === "object" && "transformToWebStream" in body) {
    return (body as { transformToWebStream: () => ReadableStream }).transformToWebStream();
  }

  return Readable.toWeb(body as Readable) as ReadableStream;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ galleryId: string; photoId: string }> },
) {
  const [session, gallerySession] = await Promise.all([
    auth(),
    getGallerySession(),
  ]);

  if (!session?.user?.id && !gallerySession) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { galleryId, photoId } = await context.params;

  const gallery = await getGalleryById(galleryId);

  if (!gallery) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  const hasGalleryAccess = gallerySession?.galleryId === galleryId;
  const hasOwnerAccess = session?.user?.id === gallery.user_id;

  if (!hasGalleryAccess && !hasOwnerAccess) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  const photo = await getPhotoById(galleryId, photoId);

  if (!photo) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  try {
    const object = await getPrivateObject(photo.r2_key);
    const body = object.Body;

    if (!body) {
      return NextResponse.json({ error: "Original file missing." }, { status: 404 });
    }

    return new NextResponse(toWebStream(body), {
      status: 200,
      headers: {
        "Content-Type": object.ContentType ?? photo.content_type,
        "Content-Disposition": buildContentDisposition(photo.filename),
        ...(object.ContentLength
          ? { "Content-Length": String(object.ContentLength) }
          : {}),
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not stream file." }, { status: 500 });
  }
}

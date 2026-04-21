import { NextResponse } from "next/server";

import { getGalleryBySlug, touchGalleryLastAccessed } from "@/lib/data";
import { setGallerySessionCookie } from "@/lib/auth";
import { verifyHashedSecret } from "@/lib/utils";
import { galleryAccessSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const gallery = await getGalleryBySlug(slug);

  if (!gallery) {
    return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
  }

  try {
    const body = galleryAccessSchema.parse(await request.json());
    const providedCode = body.accessCode.trim().toUpperCase();
    const isValid = verifyHashedSecret(providedCode, gallery.access_code);

    if (!isValid) {
      return NextResponse.json({ error: "Access code is incorrect." }, { status: 401 });
    }

    await setGallerySessionCookie(gallery.id, gallery.slug);
    await touchGalleryLastAccessed(gallery.id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not verify access code." }, { status: 400 });
  }
}

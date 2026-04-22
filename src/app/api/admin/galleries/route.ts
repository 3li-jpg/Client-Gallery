import { NextResponse } from "next/server";

import { createGallery, gallerySlugExists } from "@/lib/data";
import { generateAccessCode, hashSecretValue, sanitizeSlug } from "@/lib/utils";
import { createGallerySchema } from "@/lib/validation";
import { auth } from "@/lib/auth-config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = createGallerySchema.parse(await request.json());
    const slug = sanitizeSlug(body.slug);

    if (!slug) {
      return NextResponse.json({ error: "Slug is required." }, { status: 400 });
    }

    if (await gallerySlugExists(slug)) {
      return NextResponse.json({ error: "That slug is already taken." }, { status: 409 });
    }

    const accessCode = body.accessCode?.trim().toUpperCase() || generateAccessCode();
    const gallery = await createGallery({
      name: body.name.trim(),
      clientName: body.clientName.trim(),
      slug,
      hashedAccessCode: hashSecretValue(accessCode),
      userId: session.user.id,
    });

    return NextResponse.json(
      {
        gallery: {
          id: gallery.id,
          name: gallery.name,
          slug: gallery.slug,
        },
        accessCode,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Could not create gallery." }, { status: 400 });
  }
}

import { NextResponse } from "next/server";

import { createGallery, gallerySlugExists, getUserById, listGalleries } from "@/lib/data";
import { canCreateGallery, getPlan } from "@/lib/plans";
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

    const [user, galleries] = await Promise.all([
      getUserById(session.user.id),
      listGalleries(session.user.id),
    ]);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!canCreateGallery(user.plan, galleries.length)) {
      const plan = getPlan(user.plan);

      return NextResponse.json(
        { error: `${plan.name} includes up to ${plan.galleryLimit} galleries.` },
        { status: 403 },
      );
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

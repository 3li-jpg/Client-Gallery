import { notFound } from "next/navigation";

import { AccessGate } from "@/components/gallery/access-gate";
import { GalleryExperience } from "@/components/gallery/gallery-experience";
import { getGalleryBySlug, listPhotosForGallery } from "@/lib/data";
import { getGallerySessionForSlug } from "@/lib/server-auth";
import { getPhotoVariants } from "@/lib/thumbnails";

export const dynamic = "force-dynamic";

export default async function GalleryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string | string[]; sort?: string | string[] }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const gallery = await getGalleryBySlug(slug);

  if (!gallery) {
    notFound();
  }

  const session = await getGallerySessionForSlug(slug);

  if (!session || session.galleryId !== gallery.id) {
    return (
      <AccessGate
        slug={slug}
        name={gallery.name}
        clientName={gallery.client_name}
      />
    );
  }

  const photos = await listPhotosForGallery(gallery.id);
  const galleryPhotos = await Promise.all(
    photos.map(async (photo) => {
      const variants = await getPhotoVariants({
        galleryId: gallery.id,
        photoId: photo.id,
        r2Key: photo.r2_key,
      });

      return {
        id: photo.id,
        filename: photo.filename,
        width: photo.width,
        height: photo.height,
        size_bytes: photo.size_bytes,
        uploaded_at: photo.uploaded_at,
        blurDataUrl: photo.blur_data_url,
        thumbnailUrl: variants.thumbnailUrl,
        viewerUrl: variants.viewerUrl,
        downloadUrl: `/api/download/${gallery.id}/${photo.id}`,
      };
    }),
  );

  return (
    <GalleryExperience
      galleryName={gallery.name}
      clientName={gallery.client_name}
      photoCount={galleryPhotos.length}
      photos={galleryPhotos}
      initialSearchQuery={
        typeof resolvedSearchParams.q === "string"
          ? resolvedSearchParams.q
          : Array.isArray(resolvedSearchParams.q)
            ? resolvedSearchParams.q[0] ?? ""
            : ""
      }
      initialSortBy={
        resolvedSearchParams.sort === "newest"
        || resolvedSearchParams.sort === "name"
        || resolvedSearchParams.sort === "size"
          ? resolvedSearchParams.sort
          : "oldest"
      }
    />
  );
}

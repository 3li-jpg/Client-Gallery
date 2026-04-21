import { notFound } from "next/navigation";

import { AccessGate } from "@/components/gallery/access-gate";
import { GalleryExperience } from "@/components/gallery/gallery-experience";
import { getGalleryBySlug, listPhotosForGallery } from "@/lib/data";
import { getGallerySessionForSlug } from "@/lib/server-auth";
import { getPhotoVariants } from "@/lib/thumbnails";

export const dynamic = "force-dynamic";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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
    />
  );
}

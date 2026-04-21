import { notFound } from "next/navigation";

import { UploadPanel } from "@/components/admin/upload-panel";
import { getGalleryById, listPhotosForGallery } from "@/lib/data";
import { getPhotoVariants } from "@/lib/thumbnails";
import { requireAdminSession } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function AdminGalleryDetailPage({
  params,
}: {
  params: Promise<{ galleryId: string }>;
}) {
  await requireAdminSession();
  const { galleryId } = await params;
  const gallery = await getGalleryById(galleryId);

  if (!gallery) {
    notFound();
  }

  const photos = await listPhotosForGallery(galleryId);
  const photoCards = await Promise.all(
    photos.map(async (photo) => {
      const variants = await getPhotoVariants({
        galleryId,
        photoId: photo.id,
        r2Key: photo.r2_key,
      });

      return {
        id: photo.id,
        filename: photo.filename,
        size_bytes: photo.size_bytes,
        uploaded_at: photo.uploaded_at,
        thumbnailUrl: variants.thumbnailUrl,
      };
    }),
  );

  return (
    <UploadPanel
      gallery={{
        id: gallery.id,
        name: gallery.name,
        client_name: gallery.client_name,
        slug: gallery.slug,
        created_at: gallery.created_at,
      }}
      photos={photoCards}
    />
  );
}

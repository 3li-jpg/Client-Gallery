import { notFound } from "next/navigation";

import { UploadPanel } from "@/components/admin/upload-panel";
import { getGalleryById, listPhotosForGallery } from "@/lib/data";
import { getPhotoVariants } from "@/lib/thumbnails";
import { requireAuthUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function AdminGalleryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ galleryId: string }>;
  searchParams: Promise<{ q?: string | string[]; sort?: string | string[] }>;
}) {
  const user = await requireAuthUser();
  const { galleryId } = await params;
  const resolvedSearchParams = await searchParams;
  const gallery = await getGalleryById(galleryId);

  if (!gallery || gallery.user_id !== user.id) {
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
        width: photo.width,
        height: photo.height,
        uploaded_at: photo.uploaded_at,
        thumbnailUrl: variants.thumbnailUrl,
        downloadUrl: `/api/download/${galleryId}/${photo.id}`,
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

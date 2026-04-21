import { getEnv } from "@/lib/env";
import { signThumbnailToken } from "@/lib/auth";

export async function getSignedImageUrl(input: {
  galleryId: string;
  photoId: string;
  r2Key: string;
  width: number;
  quality: number;
}) {
  const token = await signThumbnailToken({
    galleryId: input.galleryId,
    photoId: input.photoId,
    r2Key: input.r2Key,
    width: input.width,
    quality: input.quality,
  });
  const base = getEnv().R2_PUBLIC_URL.replace(/\/$/, "");
  const url = new URL(`${base}/thumb/${input.photoId}`);

  url.searchParams.set("token", token);
  url.searchParams.set("w", String(input.width));
  url.searchParams.set("q", String(input.quality));

  return url.toString();
}

export async function getPhotoVariants(input: {
  galleryId: string;
  photoId: string;
  r2Key: string;
}) {
  const [thumbnailUrl, viewerUrl] = await Promise.all([
    getSignedImageUrl({
      galleryId: input.galleryId,
      photoId: input.photoId,
      r2Key: input.r2Key,
      width: 600,
      quality: 80,
    }),
    getSignedImageUrl({
      galleryId: input.galleryId,
      photoId: input.photoId,
      r2Key: input.r2Key,
      width: 1800,
      quality: 88,
    }),
  ]);

  return { thumbnailUrl, viewerUrl };
}

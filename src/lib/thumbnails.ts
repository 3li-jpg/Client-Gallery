import { getEnv } from "@/lib/env";
import { signThumbnailToken } from "@/lib/auth";
import { buildThumbnailStorageKey, buildViewerStorageKey } from "@/lib/utils";

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
      r2Key: buildThumbnailStorageKey(input.r2Key),
      width: 320,
      quality: 48,
    }),
    getSignedImageUrl({
      galleryId: input.galleryId,
      photoId: input.photoId,
      r2Key: buildViewerStorageKey(input.r2Key),
      width: 1600,
      quality: 82,
    }),
  ]);

  return { thumbnailUrl, viewerUrl };
}

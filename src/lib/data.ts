import { randomUUID } from "node:crypto";

import { getDb, withDbClient } from "@/lib/db";
import type { GalleryListItem, GalleryRecord, PhotoRecord } from "@/lib/types";

export async function listGalleries() {
  const result = await getDb().sql<GalleryListItem>`
    SELECT
      g.id,
      g.slug,
      g.name,
      g.client_name,
      g.access_code,
      g.created_at,
      g.last_accessed,
      COUNT(p.id)::int AS photo_count
    FROM galleries g
    LEFT JOIN photos p ON p.gallery_id = g.id
    GROUP BY g.id
    ORDER BY g.created_at DESC
  `;

  return result.rows;
}

export async function getGalleryById(galleryId: string) {
  const result = await getDb().sql<GalleryRecord>`
    SELECT *
    FROM galleries
    WHERE id = ${galleryId}
    LIMIT 1
  `;

  return result.rows[0] ?? null;
}

export async function getGalleryBySlug(slug: string) {
  const result = await getDb().sql<GalleryRecord>`
    SELECT *
    FROM galleries
    WHERE slug = ${slug}
    LIMIT 1
  `;

  return result.rows[0] ?? null;
}

export async function gallerySlugExists(slug: string) {
  const result = await getDb().sql<{ exists: boolean }>`
    SELECT EXISTS(
      SELECT 1
      FROM galleries
      WHERE slug = ${slug}
    ) AS exists
  `;

  return result.rows[0]?.exists ?? false;
}

export async function createGallery(input: {
  name: string;
  clientName: string;
  slug: string;
  hashedAccessCode: string;
}) {
  const galleryId = randomUUID();

  const result = await getDb().sql<GalleryRecord>`
    INSERT INTO galleries (id, slug, name, client_name, access_code)
    VALUES (${galleryId}, ${input.slug}, ${input.name}, ${input.clientName}, ${input.hashedAccessCode})
    RETURNING *
  `;

  return result.rows[0]!;
}

export async function touchGalleryLastAccessed(galleryId: string) {
  await getDb().sql`
    UPDATE galleries
    SET last_accessed = NOW()
    WHERE id = ${galleryId}
  `;
}

export async function listPhotosForGallery(galleryId: string) {
  const result = await getDb().sql<PhotoRecord>`
    SELECT *
    FROM photos
    WHERE gallery_id = ${galleryId}
    ORDER BY uploaded_at ASC, filename ASC
  `;

  return result.rows;
}

export async function getPhotoById(galleryId: string, photoId: string) {
  const result = await getDb().sql<PhotoRecord>`
    SELECT *
    FROM photos
    WHERE gallery_id = ${galleryId}
      AND id = ${photoId}
    LIMIT 1
  `;

  return result.rows[0] ?? null;
}

export async function insertPhoto(input: {
  photoId: string;
  galleryId: string;
  filename: string;
  r2Key: string;
  contentType: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  blurDataUrl?: string;
}) {
  const result = await getDb().sql<PhotoRecord>`
    INSERT INTO photos (
      id,
      gallery_id,
      filename,
      r2_key,
      content_type,
      size_bytes,
      width,
      height,
      blur_data_url
    )
    VALUES (
      ${input.photoId},
      ${input.galleryId},
      ${input.filename},
      ${input.r2Key},
      ${input.contentType},
      ${input.sizeBytes ?? null},
      ${input.width ?? null},
      ${input.height ?? null},
      ${input.blurDataUrl ?? null}
    )
    RETURNING *
  `;

  return result.rows[0]!;
}

export async function deletePhotoRecord(galleryId: string, photoId: string) {
  const result = await getDb().sql<PhotoRecord>`
    DELETE FROM photos
    WHERE gallery_id = ${galleryId}
      AND id = ${photoId}
    RETURNING *
  `;

  return result.rows[0] ?? null;
}

export async function deleteGalleryRecord(galleryId: string) {
  const result = await getDb().sql<GalleryRecord>`
    DELETE FROM galleries
    WHERE id = ${galleryId}
    RETURNING *
  `;

  return result.rows[0] ?? null;
}

export async function deleteGalleryAndPhotos(galleryId: string) {
  return withDbClient(async (client) => {
    await client.query("BEGIN");

    try {
      const photosResult = await client.sql<PhotoRecord>`
        DELETE FROM photos
        WHERE gallery_id = ${galleryId}
        RETURNING *
      `;

      const galleryResult = await client.sql<GalleryRecord>`
        DELETE FROM galleries
        WHERE id = ${galleryId}
        RETURNING *
      `;

      await client.query("COMMIT");

      return {
        gallery: galleryResult.rows[0] ?? null,
        photos: photosResult.rows,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

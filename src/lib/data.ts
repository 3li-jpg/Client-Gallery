import { randomUUID } from "node:crypto";

import { getDb, withDbClient } from "@/lib/db";
import type { GalleryListItem, GalleryRecord, PhotoRecord, UserRecord } from "@/lib/types";

// ── User queries ──

export async function getUserByEmail(email: string) {
  const result = await getDb().sql<UserRecord>`
    SELECT *
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;

  return result.rows[0] ?? null;
}

export async function getUserById(userId: string) {
  const result = await getDb().sql<UserRecord>`
    SELECT *
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;

  return result.rows[0] ?? null;
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  const userId = randomUUID();

  const result = await getDb().sql<UserRecord>`
    INSERT INTO users (id, name, email, password_hash)
    VALUES (${userId}, ${input.name}, ${input.email}, ${input.passwordHash})
    RETURNING *
  `;

  return result.rows[0]!;
}

export async function createOAuthUser(input: {
  name: string;
  email: string;
  image: string | null;
  provider: string;
  providerAccountId: string;
}) {
  return withDbClient(async (client) => {
    await client.query("BEGIN");

    try {
      const userId = randomUUID();
      const accountId = randomUUID();

      const userResult = await client.sql<UserRecord>`
        INSERT INTO users (id, name, email, image, email_verified)
        VALUES (${userId}, ${input.name}, ${input.email}, ${input.image}, NOW())
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          image = COALESCE(EXCLUDED.image, users.image),
          updated_at = NOW()
        RETURNING *
      `;

      const user = userResult.rows[0]!;

      await client.sql`
        INSERT INTO accounts (id, user_id, type, provider, provider_account_id)
        VALUES (${accountId}, ${user.id}, 'oauth', ${input.provider}, ${input.providerAccountId})
        ON CONFLICT (provider, provider_account_id) DO NOTHING
      `;

      await client.query("COMMIT");
      return user;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function updateUser(userId: string, updates: {
  name?: string;
  image?: string | null;
  plan?: string;
  stripe_customer_id?: string;
  storage_used_bytes?: number;
}) {
  const setClauses: string[] = [];
  const values: unknown[] = [];

  if (updates.name !== undefined) {
    values.push(updates.name);
    setClauses.push(`name = $${values.length}`);
  }
  if (updates.image !== undefined) {
    values.push(updates.image);
    setClauses.push(`image = $${values.length}`);
  }
  if (updates.plan !== undefined) {
    values.push(updates.plan);
    setClauses.push(`plan = $${values.length}`);
  }
  if (updates.stripe_customer_id !== undefined) {
    values.push(updates.stripe_customer_id);
    setClauses.push(`stripe_customer_id = $${values.length}`);
  }
  if (updates.storage_used_bytes !== undefined) {
    values.push(updates.storage_used_bytes);
    setClauses.push(`storage_used_bytes = $${values.length}`);
  }

  if (setClauses.length === 0) return null;

  setClauses.push("updated_at = NOW()");
  values.push(userId);

  const query = `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING *`;
  const result = await getDb().query<UserRecord>(query, values);

  return result.rows[0] ?? null;
}

export async function recalculateUserStorage(userId: string) {
  const result = await getDb().sql<{ total_bytes: string }>`
    SELECT COALESCE(SUM(p.size_bytes), 0)::text AS total_bytes
    FROM photos p
    JOIN galleries g ON g.id = p.gallery_id
    WHERE g.user_id = ${userId}
  `;

  const totalBytes = parseInt(result.rows[0]?.total_bytes ?? "0", 10);

  await getDb().sql`
    UPDATE users SET storage_used_bytes = ${totalBytes}, updated_at = NOW()
    WHERE id = ${userId}
  `;

  return totalBytes;
}

// ── Gallery queries ──

export async function listGalleries(userId?: string) {
  if (userId) {
    const result = await getDb().sql<GalleryListItem>`
      SELECT
        g.id,
        g.slug,
        g.name,
        g.client_name,
        g.access_code,
        g.user_id,
        g.created_at,
        g.last_accessed,
        COUNT(p.id)::int AS photo_count
      FROM galleries g
      LEFT JOIN photos p ON p.gallery_id = g.id
      WHERE g.user_id = ${userId}
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `;
    return result.rows;
  }

  const result = await getDb().sql<GalleryListItem>`
    SELECT
      g.id,
      g.slug,
      g.name,
      g.client_name,
      g.access_code,
      g.user_id,
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
  userId?: string;
}) {
  const galleryId = randomUUID();

  const result = await getDb().sql<GalleryRecord>`
    INSERT INTO galleries (id, slug, name, client_name, access_code, user_id)
    VALUES (${galleryId}, ${input.slug}, ${input.name}, ${input.clientName}, ${input.hashedAccessCode}, ${input.userId ?? null})
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

import { z } from "zod";

export const createGallerySchema = z.object({
  name: z.string().trim().min(1).max(120),
  clientName: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(64),
  accessCode: z.string().trim().max(64).optional(),
});

export const loginSchema = z.object({
  password: z.string().min(1),
});

export const galleryAccessSchema = z.object({
  accessCode: z.string().trim().min(1).max(64),
});

export const uploadUrlSchema = z.object({
  filename: z.string().trim().min(1).max(180),
  contentType: z.string().trim().min(1).max(120),
  sizeBytes: z.number().int().positive(),
});

export const finalizePhotoSchema = z.object({
  photoId: z.string().uuid(),
  filename: z.string().trim().min(1).max(180),
  r2Key: z.string().trim().min(1).max(260),
  sizeBytes: z.number().int().positive().optional(),
  contentType: z.string().trim().min(1).max(120),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  blurDataUrl: z.string().trim().max(20000).optional(),
});

export const bulkPhotoActionSchema = z.object({
  photoIds: z.array(z.string().uuid()).min(1).max(500),
});

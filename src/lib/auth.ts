import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

import {
  GALLERY_COOKIE_NAME,
  GALLERY_SESSION_DAYS,
} from "@/lib/constants";
import { getEnv, isProduction } from "@/lib/env";

type SessionKind = "gallery" | "thumbnail";

interface BasePayload extends JWTPayload {
  kind: SessionKind;
}

export interface GallerySessionPayload extends BasePayload {
  kind: "gallery";
  galleryId: string;
  slug: string;
}

export interface ThumbnailTokenPayload extends BasePayload {
  kind: "thumbnail";
  galleryId: string;
  photoId: string;
  r2Key: string;
  width: number;
  quality: number;
}

function getJwtSecret() {
  return new TextEncoder().encode(getEnv().JWT_SECRET);
}

async function signToken(payload: BasePayload, expiresIn: string) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret());
}

export async function signGalleryToken(galleryId: string, slug: string) {
  return signToken({ kind: "gallery", galleryId, slug }, `${GALLERY_SESSION_DAYS}d`);
}

export async function signThumbnailToken(payload: Omit<ThumbnailTokenPayload, keyof JWTPayload>) {
  return signToken({ kind: "thumbnail", ...payload }, "20m");
}

async function verifyToken<T extends BasePayload>(token: string, kind: SessionKind) {
  const { payload } = await jwtVerify(token, getJwtSecret());

  if (payload.kind !== kind) {
    throw new Error("Invalid session kind");
  }

  return payload as T;
}

export async function verifyGalleryToken(token: string) {
  return verifyToken<GallerySessionPayload>(token, "gallery");
}

export async function verifyThumbnailToken(token: string) {
  return verifyToken<ThumbnailTokenPayload>(token, "thumbnail");
}

export async function setGallerySessionCookie(galleryId: string, slug: string) {
  const cookieStore = await cookies();
  const token = await signGalleryToken(galleryId, slug);

  cookieStore.set(GALLERY_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: isProduction(),
    path: "/",
    maxAge: GALLERY_SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearGallerySessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(GALLERY_COOKIE_NAME);
}

export async function getGallerySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(GALLERY_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifyGalleryToken(token);
  } catch {
    return null;
  }
}

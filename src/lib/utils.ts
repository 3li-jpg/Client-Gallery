import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import path from "node:path";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function formatDate(value: string | Date | null) {
  if (!value) {
    return "Never";
  }

  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function generateAccessCode(length = 8) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(length);

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export function sanitizeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function sanitizeDisplayFilename(input: string) {
  const parsed = path.parse(input.trim());
  const safeName = parsed.name
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const safeExt = parsed.ext
    .toLowerCase()
    .replace(/[^.a-z0-9]/g, "")
    .slice(0, 10);

  const name = safeName || "photo";

  return `${name}${safeExt}`;
}

export function buildStorageKey(galleryId: string, filename: string) {
  const safeFilename = sanitizeDisplayFilename(filename);
  const parsed = path.parse(safeFilename);
  const suffix = randomUUID();

  return `galleries/${galleryId}/${parsed.name}-${suffix}${parsed.ext.toLowerCase()}`;
}

export function buildThumbnailStorageKey(storageKey: string) {
  return `${storageKey}.thumb.jpg`;
}

export function buildViewerStorageKey(storageKey: string) {
  return `${storageKey}.viewer.jpg`;
}

export function buildPhotoObjectKeys(storageKey: string) {
  return [
    storageKey,
    buildThumbnailStorageKey(storageKey),
    buildViewerStorageKey(storageKey),
  ];
}

export function hashSecretValue(value: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(value, salt, 64).toString("hex");

  return `scrypt:${salt}:${derivedKey}`;
}

export function verifyHashedSecret(value: string, hashedValue: string) {
  const [algorithm, salt, expected] = hashedValue.split(":");

  if (algorithm !== "scrypt" || !salt || !expected) {
    return false;
  }

  const derived = scryptSync(value, salt, 64);
  const expectedBuffer = Buffer.from(expected, "hex");

  if (derived.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(derived, expectedBuffer);
}

export function safeCompare(value: string, expected: string) {
  const left = Buffer.from(value);
  const right = Buffer.from(expected);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export function getExtension(filename: string) {
  return path.extname(filename).toLowerCase();
}

export function buildAbsoluteUrl(pathname: string) {
  return new URL(pathname, process.env.NEXT_PUBLIC_APP_URL).toString();
}

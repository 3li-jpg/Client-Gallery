/* eslint-disable @next/next/no-img-element */
'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface PhotoCard {
  id: string;
  filename: string;
  size_bytes: number | null;
  uploaded_at: string;
  thumbnailUrl: string;
}

interface GalleryDetail {
  id: string;
  name: string;
  client_name: string;
  slug: string;
  created_at: string;
}

interface UploadPanelProps {
  gallery: GalleryDetail;
  photos: PhotoCard[];
}

interface ImageMetadataResult {
  width?: number;
  height?: number;
  blurDataUrl?: string;
}

type UploadState = "queued" | "signing" | "uploading" | "saving" | "done" | "error";

interface UploadEntry {
  id: string;
  fileName: string;
  progress: number;
  status: UploadState;
  message?: string;
}

async function generateBlurDataUrl(file: File): Promise<ImageMetadataResult> {
  const src = URL.createObjectURL(file);

  try {
    const image = new Image();
    const loaded = await new Promise<HTMLImageElement>((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Image metadata could not be read"));
      image.src = src;
    });

    const canvas = document.createElement("canvas");
    const maxWidth = 24;
    const targetWidth = maxWidth;
    const targetHeight = Math.max(1, Math.round((loaded.height / loaded.width) * maxWidth));
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      return {};
    }

    context.drawImage(loaded, 0, 0, targetWidth, targetHeight);

    return {
      width: loaded.width,
      height: loaded.height,
      blurDataUrl: canvas.toDataURL("image/jpeg", 0.55),
    };
  } finally {
    URL.revokeObjectURL(src);
  }
}

function putFileWithProgress(url: string, file: File, contentType: string, onProgress: (progress: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url);
    request.setRequestHeader("Content-Type", contentType);

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${request.status}`));
      }
    };

    request.onerror = () => reject(new Error("Upload failed"));
    request.send(file);
  });
}

function formatFileSize(bytes: number | null) {
  if (!bytes) {
    return "Unknown size";
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function UploadPanel({ gallery, photos }: UploadPanelProps) {
  const router = useRouter();
  const [uploads, setUploads] = useState<UploadEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const uploadAccept = useMemo(() => "image/jpeg,image/png,image/webp,image/avif", []);

  const updateUpload = (id: string, updater: (current: UploadEntry) => UploadEntry) => {
    setUploads((current) => current.map((entry) => (entry.id === id ? updater(entry) : entry)));
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) {
      return;
    }

    setError(null);
    const files = Array.from(fileList);
    const queued: UploadEntry[] = files.map((file) => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      progress: 0,
      status: "queued",
    }));

    setUploads((current) => [...queued, ...current]);

    await Promise.allSettled(
      files.map(async (file, index) => {
        const uploadId = queued[index]!.id;

        try {
          updateUpload(uploadId, (current) => ({
            ...current,
            status: "signing",
            message: "Requesting upload slot",
          }));

          const signResponse = await fetch(
            `/api/admin/galleries/${gallery.id}/upload-url`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                filename: file.name,
                contentType: file.type,
              }),
            },
          );
          const signPayload = await signResponse.json();

          if (!signResponse.ok) {
            throw new Error(signPayload.error ?? "Unable to prepare upload");
          }

          const imageMetadata: ImageMetadataResult = await generateBlurDataUrl(file).catch(
            () => ({}),
          );

          updateUpload(uploadId, (current) => ({
            ...current,
            status: "uploading",
            message: "Uploading directly to storage",
          }));

          await putFileWithProgress(signPayload.uploadUrl, file, file.type, (progress) => {
            updateUpload(uploadId, (current) => ({
              ...current,
              progress,
            }));
          });

          updateUpload(uploadId, (current) => ({
            ...current,
            status: "saving",
            progress: 100,
            message: "Saving metadata",
          }));

          const finalizeResponse = await fetch(`/api/admin/galleries/${gallery.id}/photos`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              photoId: signPayload.photoId,
              filename: signPayload.filename,
              r2Key: signPayload.r2Key,
              sizeBytes: file.size,
              contentType: file.type,
              width: imageMetadata.width,
              height: imageMetadata.height,
              blurDataUrl: imageMetadata.blurDataUrl,
            }),
          });
          const finalizePayload = await finalizeResponse.json();

          if (!finalizeResponse.ok) {
            throw new Error(finalizePayload.error ?? "Unable to finalize upload");
          }

          updateUpload(uploadId, (current) => ({
            ...current,
            status: "done",
            progress: 100,
            message: "Ready",
          }));
        } catch (uploadError) {
          updateUpload(uploadId, (current) => ({
            ...current,
            status: "error",
            message:
              uploadError instanceof Error ? uploadError.message : "Upload failed",
          }));
        }
      }),
    );

    router.refresh();
  };

  const handlePhotoDelete = async (photoId: string) => {
    const confirmed = window.confirm("Delete this photo from the gallery and private storage?");

    if (!confirmed) {
      return;
    }

    setDeletingPhotoId(photoId);
    setError(null);

    const response = await fetch(`/api/admin/galleries/${gallery.id}/photos/${photoId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? "Could not delete photo.");
    }

    setDeletingPhotoId(null);
    router.refresh();
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 sm:px-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href="/admin" className="text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]">
            Back to admin
          </Link>
          <p className="mt-5 text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Gallery Detail
          </p>
          <h1 className="headline mt-3 text-5xl text-[var(--foreground)] sm:text-6xl">
            {gallery.name}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
            {gallery.client_name} • /gallery/{gallery.slug}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            className="btn-secondary px-5 py-3 text-sm uppercase tracking-[0.18em]"
            href={`/gallery/${gallery.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            Preview client gallery
          </a>
          <button
            type="button"
            className="btn-primary px-5 py-3 text-sm uppercase tracking-[0.18em]"
            onClick={() =>
              navigator.clipboard.writeText(`${window.location.origin}/gallery/${gallery.slug}`)
            }
          >
            Copy share link
          </button>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <div className="glass-panel rounded-[1.75rem] p-6">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Upload Originals
            </p>
            <h2 className="headline mt-3 text-3xl text-[var(--foreground)]">
              Direct browser to R2.
            </h2>
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-[var(--line-strong)] bg-[rgba(255,255,255,0.02)] px-6 py-12 text-center transition hover:border-[rgba(212,164,106,0.45)] hover:bg-[rgba(255,255,255,0.04)]">
            <span className="headline text-3xl text-[var(--foreground)]">
              Drop images here
            </span>
            <span className="mt-3 max-w-xs text-sm leading-6 text-[var(--muted)]">
              Uploads go straight to private R2 storage with server-signed PUT
              URLs. The Next.js app only signs and finalizes metadata.
            </span>
            <span className="btn-secondary mt-6 px-5 py-3 text-sm">
              Choose files
            </span>
            <input
              type="file"
              multiple
              accept={uploadAccept}
              className="hidden"
              onChange={(event) => void handleFiles(event.target.files)}
            />
          </label>

          <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.02)] p-4 text-sm text-[var(--muted)]">
            Supported delivery formats: JPEG, PNG, WebP, AVIF.
          </div>

          {uploads.length ? (
            <div className="mt-5 space-y-3">
              {uploads.map((upload) => (
                <div
                  key={upload.id}
                  className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.025)] p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-[var(--foreground)]">{upload.fileName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                        {upload.message ?? upload.status}
                      </p>
                    </div>
                    <p className="font-mono text-xs text-[var(--muted-strong)]">
                      {upload.progress}%
                    </p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        upload.status === "error"
                          ? "bg-[var(--danger)]"
                          : "bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))]"
                      }`}
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-2xl border border-[rgba(255,107,107,0.35)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </div>
          ) : null}
        </div>

        <div className="glass-panel rounded-[1.75rem] p-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Gallery Files
              </p>
              <h2 className="headline mt-3 text-3xl text-[var(--foreground)]">
                {photos.length} uploaded photos
              </h2>
            </div>
          </div>

          {photos.length ? (
            <div className="masonry-grid">
              {photos.map((photo) => (
                <article key={photo.id} className="masonry-item overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,255,255,0.03)]">
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.filename}
                    className="h-auto w-full object-cover"
                  />
                  <div className="space-y-2 p-4">
                    <p className="truncate text-sm text-[var(--foreground)]">{photo.filename}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      {formatFileSize(photo.size_bytes)}
                    </p>
                    <button
                      type="button"
                      className="btn-secondary w-full px-4 py-2 text-sm text-[var(--danger)]"
                      disabled={deletingPhotoId === photo.id}
                      onClick={() => void handlePhotoDelete(photo.id)}
                    >
                      {deletingPhotoId === photo.id ? "Deleting..." : "Delete photo"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.4rem] border border-dashed border-[var(--line)] px-6 py-14 text-center text-sm text-[var(--muted)]">
              No photos uploaded yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

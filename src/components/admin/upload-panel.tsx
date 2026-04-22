/* eslint-disable @next/next/no-img-element */
'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { formatDate } from "@/lib/utils";

interface PhotoCard {
  id: string;
  filename: string;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  uploaded_at: string;
  thumbnailUrl: string;
  downloadUrl: string;
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
  initialSearchQuery?: string;
  initialSortBy?: PhotoSort;
}

type UploadState =
  | "queued"
  | "signing"
  | "uploading"
  | "saving"
  | "processing"
  | "done"
  | "error";

type PhotoSort = "oldest" | "newest" | "name" | "size";

interface UploadEntry {
  id: string;
  fileName: string;
  progress: number;
  status: UploadState;
  message?: string;
}

interface PreparedDerivatives {
  width?: number;
  height?: number;
  thumbnailFile?: File;
  viewerFile?: File;
}

const MAX_CONCURRENT_UPLOADS = 4;

async function canvasToJpegFile(
  canvas: HTMLCanvasElement,
  filename: string,
  quality: number,
) {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });

  return blob ? new File([blob], filename, { type: "image/jpeg" }) : undefined;
}

async function prepareDerivatives(file: File): Promise<PreparedDerivatives> {
  const objectUrl = URL.createObjectURL(file);
  let bitmap: ImageBitmap | null = null;

  try {
    if ("createImageBitmap" in window) {
      bitmap = await createImageBitmap(file);
    }

    const imageElement = bitmap
      ? null
      : await new Promise<HTMLImageElement>((resolve, reject) => {
          const nextImage = new Image();
          nextImage.decoding = "async";
          nextImage.onload = () => resolve(nextImage);
          nextImage.onerror = () => reject(new Error("Image could not be decoded"));
          nextImage.src = objectUrl;
        });

    const image = bitmap ?? imageElement;
    const width = bitmap ? bitmap.width : imageElement?.naturalWidth ?? 0;
    const height = bitmap ? bitmap.height : imageElement?.naturalHeight ?? 0;

    if (!width || !height) {
      return {};
    }

    const thumbWidth = Math.min(320, width);
    const thumbHeight = Math.max(1, Math.round((height / width) * thumbWidth));
    const thumbCanvas = document.createElement("canvas");
    thumbCanvas.width = thumbWidth;
    thumbCanvas.height = thumbHeight;
    const thumbContext = thumbCanvas.getContext("2d");

    const viewerWidth = Math.min(1800, width);
    const viewerHeight = Math.max(1, Math.round((height / width) * viewerWidth));
    const viewerCanvas = document.createElement("canvas");
    viewerCanvas.width = viewerWidth;
    viewerCanvas.height = viewerHeight;
    const viewerContext = viewerCanvas.getContext("2d");

    if (!thumbContext || !viewerContext || !image) {
      return { width, height };
    }

    thumbContext.drawImage(image, 0, 0, thumbWidth, thumbHeight);
    viewerContext.drawImage(image, 0, 0, viewerWidth, viewerHeight);

    const [thumbnailFile, viewerFile] = await Promise.all([
      canvasToJpegFile(thumbCanvas, `${file.name}.thumb.jpg`, 0.68),
      canvasToJpegFile(viewerCanvas, `${file.name}.viewer.jpg`, 0.82),
    ]);

    return {
      width,
      height,
      thumbnailFile,
      viewerFile,
    };
  } finally {
    bitmap?.close();
    URL.revokeObjectURL(objectUrl);
  }
}

function putFileWithProgress(
  url: string,
  file: File,
  contentType: string,
  onProgress: (progress: number) => void,
) {
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

function formatPhotoDimensions(photo: Pick<PhotoCard, "width" | "height">) {
  if (!photo.width || !photo.height) {
    return "Dimensions pending";
  }

  return `${photo.width} × ${photo.height}`;
}

function triggerDownloads(items: Array<Pick<PhotoCard, "downloadUrl">>) {
  items.forEach((item, index) => {
    window.setTimeout(() => {
      const anchor = document.createElement("a");
      anchor.href = item.downloadUrl;
      anchor.rel = "noreferrer";
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }, index * 180);
  });
}

function sortPhotos(photos: PhotoCard[], sortBy: PhotoSort) {
  const sorted = [...photos];

  sorted.sort((left, right) => {
    if (sortBy === "name") {
      return left.filename.localeCompare(right.filename, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    }

    if (sortBy === "size") {
      return (right.size_bytes ?? 0) - (left.size_bytes ?? 0);
    }

    const leftTime = new Date(left.uploaded_at).getTime();
    const rightTime = new Date(right.uploaded_at).getTime();

    if (sortBy === "newest") {
      return rightTime - leftTime;
    }

    return leftTime - rightTime;
  });

  return sorted;
}

async function runWithConcurrencyLimit<T>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>,
) {
  let nextIndex = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      await worker(items[currentIndex]!, currentIndex);
    }
  });

  await Promise.allSettled(runners);
}

function createTaskQueue(limit: number) {
  let activeCount = 0;
  const pending: Array<() => void> = [];

  return async function enqueue<T>(task: () => Promise<T>) {
    return new Promise<T>((resolve, reject) => {
      const runTask = () => {
        activeCount += 1;

        task()
          .then(resolve, reject)
          .finally(() => {
            activeCount -= 1;
            pending.shift()?.();
          });
      };

      if (activeCount < limit) {
        runTask();
      } else {
        pending.push(runTask);
      }
    });
  };
}

export function UploadPanel({
  gallery,
  photos,
  initialSearchQuery = "",
  initialSortBy = "oldest",
}: UploadPanelProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [uploads, setUploads] = useState<UploadEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyPhotoIds, setBusyPhotoIds] = useState<string[]>([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortBy, setSortBy] = useState<PhotoSort>(initialSortBy);
  const [isDragActive, setIsDragActive] = useState(false);
  const uploadAccept = useMemo(() => "image/jpeg,image/png,image/webp,image/avif", []);
  const runDerivativeTask = useMemo(() => createTaskQueue(1), []);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    setSortBy(initialSortBy);
  }, [initialSortBy]);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const availablePhotoIds = new Set(photos.map((photo) => photo.id));
    setSelectedPhotoIds((current) => current.filter((photoId) => availablePhotoIds.has(photoId)));
  }, [photos]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    } else {
      params.delete("q");
    }

    if (sortBy !== "oldest") {
      params.set("sort", sortBy);
    } else {
      params.delete("sort");
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchQuery, sortBy]);

  const updateUpload = (id: string, updater: (current: UploadEntry) => UploadEntry) => {
    setUploads((current) => current.map((entry) => (entry.id === id ? updater(entry) : entry)));
  };

  const queuedCount = uploads.filter((upload) => upload.status === "queued").length;
  const activeCount = uploads.filter(
    (upload) =>
      upload.status === "signing"
      || upload.status === "uploading"
      || upload.status === "saving"
      || upload.status === "processing",
  ).length;

  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
  const visiblePhotos = sortPhotos(
    photos.filter((photo) =>
      normalizedQuery.length === 0
        ? true
        : photo.filename.toLowerCase().includes(normalizedQuery),
    ),
    sortBy,
  );
  const selectedPhotoIdSet = new Set(selectedPhotoIds);
  const selectedPhotos = photos.filter((photo) => selectedPhotoIdSet.has(photo.id));
  const visibleSelectedCount = visiblePhotos.filter((photo) => selectedPhotoIdSet.has(photo.id)).length;
  const allVisibleSelected = visiblePhotos.length > 0 && visibleSelectedCount === visiblePhotos.length;

  const scheduleRefresh = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    refreshTimeoutRef.current = setTimeout(() => {
      router.refresh();
    }, 350);
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotoIds((current) =>
      current.includes(photoId)
        ? current.filter((id) => id !== photoId)
        : [...current, photoId],
    );
  };

  const selectVisiblePhotos = () => {
    setSelectedPhotoIds(Array.from(new Set(visiblePhotos.map((photo) => photo.id))));
  };

  const clearSelection = () => {
    setSelectedPhotoIds([]);
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

    await runWithConcurrencyLimit(files, MAX_CONCURRENT_UPLOADS, async (file, index) => {
      const uploadId = queued[index]!.id;

      try {
        updateUpload(uploadId, (current) => ({
          ...current,
          status: "signing",
          progress: 5,
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

        updateUpload(uploadId, (current) => ({
          ...current,
          status: "uploading",
          progress: Math.max(current.progress, 10),
          message: "Uploading original",
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
          message: "Registering original",
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
          }),
        });
        const finalizePayload = await finalizeResponse.json();

        if (!finalizeResponse.ok) {
          throw new Error(finalizePayload.error ?? "Unable to finalize upload");
        }

        updateUpload(uploadId, (current) => ({
          ...current,
          status: "processing",
          progress: 100,
          message: "Original ready, optimizing previews",
        }));

        void runDerivativeTask(async () => {
          try {
            const derivativeAsset: PreparedDerivatives = await prepareDerivatives(file).catch(
              () => ({}),
            );

            const uploads = [
              derivativeAsset.thumbnailFile
                ? putFileWithProgress(
                    signPayload.thumbnailUploadUrl,
                    derivativeAsset.thumbnailFile,
                    derivativeAsset.thumbnailFile.type,
                    () => undefined,
                  )
                : Promise.resolve(),
              derivativeAsset.viewerFile
                ? putFileWithProgress(
                    signPayload.viewerUploadUrl,
                    derivativeAsset.viewerFile,
                    derivativeAsset.viewerFile.type,
                    () => undefined,
                  )
                : Promise.resolve(),
            ];

            await Promise.allSettled(uploads);

            updateUpload(uploadId, (current) => ({
              ...current,
              status: "done",
              message: "Ready",
            }));

            scheduleRefresh();
          } catch {
            updateUpload(uploadId, (current) => ({
              ...current,
              status: "done",
              message: "Ready",
            }));
          }
        });
      } catch (uploadError) {
        updateUpload(uploadId, (current) => ({
          ...current,
          status: "error",
          progress: 0,
          message:
            uploadError instanceof Error ? uploadError.message : "Upload failed",
        }));
      }
    });

    router.refresh();
  };

  const handlePhotoDelete = async (photoId: string) => {
    const confirmed = window.confirm("Delete this photo from the gallery and private storage?");

    if (!confirmed) {
      return;
    }

    setBusyPhotoIds([photoId]);
    setError(null);

    const response = await fetch(`/api/admin/galleries/${gallery.id}/photos/${photoId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? "Could not delete photo.");
    } else {
      setSelectedPhotoIds((current) => current.filter((id) => id !== photoId));
    }

    setBusyPhotoIds([]);
    router.refresh();
  };

  const handleDeleteSelected = async () => {
    if (selectedPhotoIds.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedPhotoIds.length} selected photo${selectedPhotoIds.length === 1 ? "" : "s"} from the gallery and private storage?`,
    );

    if (!confirmed) {
      return;
    }

    setBusyPhotoIds(selectedPhotoIds);
    setError(null);

    const response = await fetch(`/api/admin/galleries/${gallery.id}/photos`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        photoIds: selectedPhotoIds,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? "Could not delete selected photos.");
    } else {
      clearSelection();
    }

    setBusyPhotoIds([]);
    router.refresh();
  };

  return (
    <main className="page-backdrop min-h-screen">
      <div className="page-shell flex flex-col gap-8">
      <div className="section-card flex flex-col gap-6 px-6 py-8 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div>
          <Link href="/admin" className="font-ui text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]">
            Back to admin
          </Link>
          <p className="kicker mt-5">
            Gallery Detail
          </p>
          <h1 className="headline mt-3 text-5xl text-[var(--foreground)] sm:text-6xl">
            {gallery.name}
          </h1>
          <p className="font-body mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
            {gallery.client_name} • /gallery/{gallery.slug}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            className="btn-secondary font-ui px-5 py-3 text-sm"
            href={`/gallery/${gallery.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            Preview client gallery
          </a>
          <button
            type="button"
            className="btn-primary font-ui px-5 py-3 text-sm"
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
            <p className="kicker">
              Upload Originals
            </p>
            <h2 className="headline mt-3 text-3xl text-[var(--foreground)]">
              Direct browser to R2.
            </h2>
          </div>

          <label
            className={`flex cursor-pointer flex-col items-center justify-center rounded-[1.6rem] border border-dashed px-6 py-12 text-center transition ${
              isDragActive
                ? "border-[var(--line-strong)] bg-white/84"
                : "border-[var(--line-strong)] bg-white/58 hover:border-[var(--line-strong)] hover:bg-white/78"
            }`}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragActive(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
                return;
              }
              setIsDragActive(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragActive(false);
              void handleFiles(event.dataTransfer.files);
            }}
          >
            <span className="headline text-3xl text-[var(--foreground)]">
              {isDragActive ? "Release to upload" : "Drop images here"}
            </span>
            <span className="mt-3 max-w-xs text-sm leading-6 text-[var(--muted)]">
              Uploads go straight to private R2 storage with server-signed PUT
              URLs. Originals go first, then lightweight preview assets finish in
              the background.
            </span>
            <span className="btn-secondary font-ui mt-6 px-5 py-3 text-sm">
              Choose files
            </span>
            <input
              type="file"
              multiple
              accept={uploadAccept}
              className="hidden"
              onChange={(event) => {
                const nextFiles = event.target.files;
                void handleFiles(nextFiles);
                event.currentTarget.value = "";
              }}
            />
          </label>

            <div className="subtle-card mt-5 rounded-2xl p-4 text-sm text-[var(--muted)]">
              Supported delivery formats: JPEG, PNG, WebP, AVIF.
            </div>

          {uploads.length ? (
            <div className="mt-5 space-y-3">
              <div className="subtle-card rounded-2xl px-4 py-3 text-sm text-[var(--muted)]">
                {activeCount} active, {queuedCount} waiting. Originals upload first, then preview assets are optimized in a separate background queue.
              </div>
              {uploads.map((upload) => (
                <div
                  key={upload.id}
                  className="subtle-card rounded-[1.25rem] p-4"
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
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/8">
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
            <div
              className="mt-5 rounded-2xl border border-[rgba(255,107,107,0.35)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]"
              aria-live="polite"
            >
              {error}
            </div>
          ) : null}
        </div>

        <div className="glass-panel rounded-[1.75rem] p-6">
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="kicker">
                  Gallery Files
                </p>
                <h2 className="headline mt-3 text-3xl text-[var(--foreground)]">
                  {visiblePhotos.length} of {photos.length} uploaded photos
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by filename"
                  aria-label="Search uploaded photos"
                  className="field min-w-[220px]"
                />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as PhotoSort)}
                  aria-label="Sort uploaded photos"
                  className="field min-w-[180px]"
                >
                  <option value="oldest">Sort: Oldest first</option>
                  <option value="newest">Sort: Newest first</option>
                  <option value="name">Sort: Name</option>
                  <option value="size">Sort: Largest file</option>
                </select>
              </div>
            </div>

            {photos.length ? (
              <div className="flex flex-wrap items-center gap-3 rounded-[1.4rem] border border-[var(--line)] bg-white/66 px-4 py-3 text-sm text-[var(--muted)]">
                <span>{selectedPhotoIds.length} selected</span>
                <button
                  type="button"
                  className="btn-secondary font-ui px-4 py-2 text-sm"
                  onClick={allVisibleSelected ? clearSelection : selectVisiblePhotos}
                >
                  {allVisibleSelected ? "Clear visible" : "Select visible"}
                </button>
                <button
                  type="button"
                  className="btn-secondary font-ui px-4 py-2 text-sm"
                  disabled={selectedPhotoIds.length === 0}
                  onClick={clearSelection}
                >
                  Clear selection
                </button>
                <button
                  type="button"
                  className="btn-secondary font-ui px-4 py-2 text-sm"
                  disabled={selectedPhotos.length === 0}
                  onClick={() => triggerDownloads(selectedPhotos)}
                >
                  Download selected
                </button>
                <button
                  type="button"
                  className="btn-secondary font-ui px-4 py-2 text-sm text-[var(--danger)]"
                  disabled={selectedPhotoIds.length === 0 || busyPhotoIds.length > 0}
                  onClick={() => void handleDeleteSelected()}
                >
                  {busyPhotoIds.length > 1 ? "Deleting..." : "Delete selected"}
                </button>
              </div>
            ) : null}
          </div>

          {visiblePhotos.length ? (
            <div className="masonry-grid">
              {visiblePhotos.map((photo) => {
                const isSelected = selectedPhotoIdSet.has(photo.id);
                const isBusy = busyPhotoIds.includes(photo.id);

                return (
                  <article
                    key={photo.id}
                    className={`masonry-item overflow-hidden rounded-[1.5rem] border bg-white/72 shadow-[0_18px_40px_rgba(0,0,0,0.06)] transition ${
                      isSelected
                        ? "border-black/20 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]"
                        : "border-[var(--line)]"
                    }`}
                    style={{ contentVisibility: "auto", containIntrinsicSize: "360px 500px" }}
                  >
                    <div className="relative">
                      <img
                        src={photo.thumbnailUrl}
                        alt={photo.filename}
                        className="h-auto w-full object-cover"
                      />
                      <button
                        type="button"
                        className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                          isSelected
                            ? "border-black/20 bg-black text-white"
                            : "border-black/10 bg-white/80 text-black/82 hover:bg-white"
                        }`}
                        onClick={() => togglePhotoSelection(photo.id)}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </button>
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="space-y-1">
                        <p className="font-display truncate text-[1.1rem] leading-tight tracking-[-0.04em] text-[var(--foreground)]">{photo.filename}</p>
                        <p className="font-ui text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                          {formatFileSize(photo.size_bytes)} • {formatPhotoDimensions(photo)}
                        </p>
                        <p className="font-body text-xs text-[var(--muted)]">
                          Uploaded {formatDate(photo.uploaded_at)}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          className="btn-secondary font-ui px-4 py-2 text-sm"
                          onClick={() => triggerDownloads([photo])}
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          className="btn-secondary font-ui px-4 py-2 text-sm text-[var(--danger)]"
                          disabled={isBusy}
                          onClick={() => void handlePhotoDelete(photo.id)}
                        >
                          {isBusy ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[1.4rem] border border-dashed border-[var(--line)] px-6 py-14 text-center text-sm text-[var(--muted)]">
              {photos.length === 0 ? "No photos uploaded yet." : "No photos match the current search."}
            </div>
          )}
        </div>
      </section>
    </div>
    </main>
  );
}

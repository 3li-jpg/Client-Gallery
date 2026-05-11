/* eslint-disable @next/next/no-img-element */
'use client';

import { useDeferredValue, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { cn, formatDate } from "@/lib/utils";

interface GalleryPhoto {
  id: string;
  filename: string;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  uploaded_at: string;
  blurDataUrl: string | null;
  thumbnailUrl: string;
  viewerUrl: string;
  downloadUrl: string;
}

interface GalleryExperienceProps {
  galleryName: string;
  clientName: string;
  photoCount: number;
  photos: GalleryPhoto[];
  initialSearchQuery?: string;
  initialSortBy?: PhotoSort;
}

type PhotoSort = "oldest" | "newest" | "name" | "size";

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

function formatPhotoDimensions(photo: Pick<GalleryPhoto, "width" | "height">) {
  if (!photo.width || !photo.height) {
    return "Dimensions pending";
  }

  return `${photo.width} × ${photo.height}`;
}

function sortPhotos(photos: GalleryPhoto[], sortBy: PhotoSort) {
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

function triggerDownloads(items: Array<Pick<GalleryPhoto, "downloadUrl">>) {
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

function GalleryImage({
  photo,
  isSelected,
  onClick,
  onToggleSelect,
  onWarm,
}: {
  photo: GalleryPhoto;
  isSelected: boolean;
  onClick: () => void;
  onToggleSelect: () => void;
  onWarm: () => void;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[1.7rem] border bg-[rgba(255,255,255,0.78)] shadow-[0_18px_45px_rgba(0,0,0,0.055)] transition",
        isSelected
          ? "border-[rgba(0,0,0,0.18)] shadow-[0_0_0_1px_rgba(0,0,0,0.08)]"
          : "border-[var(--line)] hover:-translate-y-0.5 hover:border-[rgba(0,0,0,0.16)]",
      )}
    >
      <button
        type="button"
        onClick={onToggleSelect}
        className={cn(
          "font-ui absolute left-4 top-4 z-10 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em] backdrop-blur-md transition",
          isSelected
            ? "border-black/16 bg-black text-white"
            : "border-black/10 bg-white/82 text-black/76 hover:bg-white",
        )}
      >
        {isSelected ? "Selected" : "Select"}
      </button>

      <button
        type="button"
        onClick={onClick}
        onMouseEnter={onWarm}
        onFocus={onWarm}
        className="block w-full text-left"
      >
        <img
          src={photo.thumbnailUrl}
          alt={photo.filename}
          loading="lazy"
          decoding="async"
          className="relative h-auto w-full object-cover transition duration-700 ease-out group-hover:scale-[1.015]"
        />
        <div className="border-t border-[var(--line)] px-4 py-4">
          <p className="font-display truncate text-[1.05rem] tracking-[-0.04em] text-[var(--foreground)]">
            {photo.filename}
          </p>
          <p className="font-ui mt-2 text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
            {formatPhotoDimensions(photo)} • {formatFileSize(photo.size_bytes)}
          </p>
        </div>
      </button>
    </div>
  );
}

function Lightbox({
  photos,
  photoId,
  selectedPhotoIds,
  onClose,
  onNavigate,
  onToggleSelect,
}: {
  photos: GalleryPhoto[];
  photoId: string;
  selectedPhotoIds: string[];
  onClose: () => void;
  onNavigate: (direction: -1 | 1) => void;
  onToggleSelect: (photoId: string) => void;
}) {
  const index = photos.findIndex((photo) => photo.id === photoId);
  const photo = index >= 0 ? photos[index] : null;
  const [viewerLoaded, setViewerLoaded] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowLeft") {
        onNavigate(-1);
      }

      if (event.key === "ArrowRight") {
        onNavigate(1);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, onNavigate]);

  if (!photo || index === -1) {
    return null;
  }

  const isSelected = selectedPhotoIds.includes(photo.id);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(248,248,244,0.94)] px-4 py-6 backdrop-blur-2xl"
    >
      <button
        type="button"
        aria-label="Previous photo"
        className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/78 text-[var(--foreground)] shadow-[0_12px_30px_rgba(0,0,0,0.06)] backdrop-blur-md transition hover:bg-white sm:left-8"
        onClick={() => onNavigate(-1)}
      >
        ←
      </button>

      <button
        type="button"
        aria-label="Next photo"
        className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/78 text-[var(--foreground)] shadow-[0_12px_30px_rgba(0,0,0,0.06)] backdrop-blur-md transition hover:bg-white sm:right-8"
        onClick={() => onNavigate(1)}
      >
        →
      </button>

      <header className="absolute left-0 top-0 flex w-full items-center justify-between px-5 py-5 text-[var(--foreground)] sm:px-8">
        <div>
          <p className="font-ui text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
            Viewing {index + 1} of {photos.length}
          </p>
          <p className="font-display mt-2 text-2xl tracking-[-0.04em] text-[var(--foreground)]">
            {photo.filename}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn-secondary font-ui px-4 py-2 text-sm"
            onClick={() => onToggleSelect(photo.id)}
          >
            {isSelected ? "Remove from selection" : "Select photo"}
          </button>
          <a
            href={photo.downloadUrl}
            className="btn-primary font-ui px-4 py-2 text-sm"
          >
            Download original
          </a>
          <button
            type="button"
            aria-label="Close lightbox"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/78 text-sm shadow-[0_12px_30px_rgba(0,0,0,0.06)] backdrop-blur-md transition hover:bg-white"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </header>

      <div className="flex w-full max-w-[84rem] flex-col items-center gap-5 pt-20">
        <div className="relative flex max-h-[80vh] w-full items-center justify-center">
          <div className="relative flex max-h-[80vh] w-full items-center justify-center rounded-[0.35rem] bg-white p-4 shadow-[0_24px_60px_rgba(0,0,0,0.06)] sm:p-5">
            <img
              src={photo.thumbnailUrl}
              alt=""
              aria-hidden="true"
              className={cn(
                "absolute inset-4 max-h-[calc(80vh-2rem)] w-[calc(100%-2rem)] rounded-[0.25rem] object-contain blur-xl transition-opacity duration-300 sm:inset-5 sm:max-h-[calc(80vh-2.5rem)] sm:w-[calc(100%-2.5rem)]",
                viewerLoaded ? "opacity-0" : "opacity-100",
              )}
            />
            <img
              src={photo.viewerUrl}
              alt={photo.filename}
              decoding="async"
              fetchPriority="high"
              onLoad={() => setViewerLoaded(true)}
              className={cn(
                "max-h-[calc(80vh-2rem)] w-full rounded-[0.25rem] object-contain transition-opacity duration-300 sm:max-h-[calc(80vh-2.5rem)]",
                viewerLoaded ? "opacity-100" : "opacity-0",
              )}
            />

            <div className="pointer-events-none absolute bottom-8 left-8 flex flex-wrap items-center gap-5 text-[10px] uppercase tracking-[0.22em] text-white mix-blend-difference">
              <span>{formatPhotoDimensions(photo)}</span>
              <span>{formatFileSize(photo.size_bytes)}</span>
              <span>Uploaded {formatDate(photo.uploaded_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-5xl items-center justify-between gap-4 rounded-full border border-black/8 bg-white/74 px-6 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <div className="font-ui flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
            Private gallery delivery
          </div>
          <div className="font-body text-sm text-[var(--muted)]">
            Use the arrow keys to move through the collection.
          </div>
        </div>
      </div>
    </div>
  );
}

export function GalleryExperience({
  galleryName,
  clientName,
  photoCount,
  photos,
  initialSearchQuery = "",
  initialSortBy = "oldest",
}: GalleryExperienceProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortBy, setSortBy] = useState<PhotoSort>(initialSortBy);
  const warmedUrls = useRef(new Set<string>());
  const deferredSearchQuery = useDeferredValue(searchQuery);

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

  const warmImage = (url: string) => {
    if (warmedUrls.current.has(url)) {
      return;
    }

    const image = new Image();
    image.decoding = "async";
    image.src = url;
    warmedUrls.current.add(url);
  };

  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
  const visiblePhotos = sortPhotos(
    photos.filter((photo) =>
      normalizedQuery.length === 0
        ? true
        : photo.filename.toLowerCase().includes(normalizedQuery),
    ),
    sortBy,
  );
  const availablePhotoIds = new Set(photos.map((photo) => photo.id));
  const selectedPhotoIdSet = new Set(
    selectedPhotoIds.filter((photoId) => availablePhotoIds.has(photoId)),
  );
  const selectedPhotos = photos.filter((photo) => selectedPhotoIdSet.has(photo.id));
  const visibleSelectedCount = visiblePhotos.filter((photo) => selectedPhotoIdSet.has(photo.id)).length;
  const allVisibleSelected = visiblePhotos.length > 0 && visibleSelectedCount === visiblePhotos.length;
  const activePhotoId =
    selectedPhotoId && visiblePhotos.some((photo) => photo.id === selectedPhotoId)
      ? selectedPhotoId
      : null;

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

  const handleNavigate = (direction: -1 | 1) => {
    if (!activePhotoId || visiblePhotos.length === 0) {
      return;
    }

    const currentIndex = visiblePhotos.findIndex((photo) => photo.id === activePhotoId);

    if (currentIndex === -1) {
      return;
    }

    const nextIndex =
      (currentIndex + direction + visiblePhotos.length) % visiblePhotos.length;

    setSelectedPhotoId(visiblePhotos[nextIndex]!.id);
  };

  useEffect(() => {
    if (!activePhotoId || visiblePhotos.length === 0) {
      return;
    }

    const currentIndex = visiblePhotos.findIndex((photo) => photo.id === activePhotoId);

    if (currentIndex === -1) {
      return;
    }

    const currentPhoto = visiblePhotos[currentIndex];
    const nextPhoto = visiblePhotos[(currentIndex + 1) % visiblePhotos.length];
    const previousPhoto = visiblePhotos[(currentIndex - 1 + visiblePhotos.length) % visiblePhotos.length];

    if (currentPhoto) {
      warmImage(currentPhoto.viewerUrl);
    }

    if (nextPhoto) {
      warmImage(nextPhoto.viewerUrl);
    }

    if (previousPhoto) {
      warmImage(previousPhoto.viewerUrl);
    }
  }, [activePhotoId, visiblePhotos]);

  return (
    <>
      <main id="main-content" className="page-backdrop min-h-screen">
        <div className="page-shell flex max-w-7xl flex-col gap-8">
        <section className="fade-up section-card px-6 py-10 sm:px-10">
          <p className="kicker">
            Private Client Gallery
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="headline text-5xl leading-none text-[var(--foreground)] sm:text-7xl">
                {galleryName}
              </h1>
              <p className="font-body mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                Curated for {clientName}. Originals stay private, and downloads
                are delivered only through authenticated app streaming.
              </p>
              <div className="mt-7 flex flex-wrap gap-8">
                <div>
                  <p className="font-ui text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
                    Client
                  </p>
                  <p className="font-display mt-2 text-2xl tracking-[-0.04em] text-[var(--foreground)]">
                    {clientName}
                  </p>
                </div>
                <div>
                  <p className="font-ui text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
                    Collection
                  </p>
                  <p className="font-display mt-2 text-2xl tracking-[-0.04em] text-[var(--foreground)]">
                    {photoCount} finals
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-full border border-[var(--line)] bg-white/66 px-5 py-3 text-sm text-[var(--muted-strong)]">
              {photoCount} photos
            </div>
          </div>
        </section>

        <section className="fade-up section-card sticky top-4 z-20 px-5 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="kicker">
                Browse and download
              </p>
              <p className="font-body mt-2 text-sm text-[var(--muted)]">
                {visiblePhotos.length} visible • {selectedPhotoIds.length} selected
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search photos"
                aria-label="Search photos"
                className="field min-w-[220px]"
              />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as PhotoSort)}
                aria-label="Sort photos"
                className="field min-w-[180px]"
              >
                <option value="oldest">Sort: Oldest first</option>
                <option value="newest">Sort: Newest first</option>
                <option value="name">Sort: Name</option>
                <option value="size">Sort: Largest file</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-secondary font-ui px-4 py-2 text-xs uppercase tracking-[0.18em]"
              onClick={allVisibleSelected ? clearSelection : selectVisiblePhotos}
            >
              {allVisibleSelected ? "Clear visible" : "Select visible"}
            </button>
            <button
              type="button"
              className="btn-secondary font-ui px-4 py-2 text-xs uppercase tracking-[0.18em]"
              disabled={selectedPhotoIds.length === 0}
              onClick={clearSelection}
            >
              Clear selection
            </button>
          </div>
        </section>

        {visiblePhotos.length ? (
          <section className="masonry-grid">
            {visiblePhotos.map((photo) => (
              <div
                key={photo.id}
                className="masonry-item fade-up"
                style={{ contentVisibility: "auto", containIntrinsicSize: "380px 520px" }}
              >
                <GalleryImage
                  photo={photo}
                  isSelected={selectedPhotoIdSet.has(photo.id)}
                  onClick={() => setSelectedPhotoId(photo.id)}
                  onToggleSelect={() => togglePhotoSelection(photo.id)}
                  onWarm={() => warmImage(photo.viewerUrl)}
                />
              </div>
            ))}
          </section>
        ) : (
          <section className="fade-up rounded-[1.6rem] border border-dashed border-[var(--line)] px-6 py-16 text-center text-sm text-[var(--muted)]">
            No photos match the current search.
          </section>
        )}
        </div>
      </main>

      {selectedPhotos.length ? (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-full border border-black/8 bg-white/78 px-3 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <div className="font-ui flex items-center gap-3 rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
            {selectedPhotos.length} selected
          </div>
          <button
            type="button"
            className="btn-secondary font-ui px-4 py-2 text-xs uppercase tracking-[0.18em]"
            onClick={clearSelection}
          >
            Clear
          </button>
          <button
            type="button"
            className="btn-primary font-ui px-5 py-2 text-xs uppercase tracking-[0.18em]"
            onClick={() => triggerDownloads(selectedPhotos)}
          >
            Download selected
          </button>
        </div>
      ) : null}

      {activePhotoId ? (
        <Lightbox
          key={activePhotoId}
          photos={visiblePhotos}
          photoId={activePhotoId}
          selectedPhotoIds={Array.from(selectedPhotoIdSet)}
          onClose={() => setSelectedPhotoId(null)}
          onNavigate={handleNavigate}
          onToggleSelect={togglePhotoSelection}
        />
      ) : null}
    </>
  );
}

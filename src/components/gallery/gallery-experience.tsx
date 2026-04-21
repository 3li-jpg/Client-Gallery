/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface GalleryPhoto {
  id: string;
  filename: string;
  width: number | null;
  height: number | null;
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
}

function GalleryImage({
  photo,
  onClick,
}: {
  photo: GalleryPhoto;
  onClick: () => void;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative block w-full overflow-hidden rounded-[1.5rem] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] text-left transition hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.18)]"
    >
      <div className="relative">
        {photo.blurDataUrl ? (
          <img
            src={photo.blurDataUrl}
            alt=""
            aria-hidden="true"
            className={cn(
              "absolute inset-0 h-full w-full scale-110 object-cover blur-2xl transition-opacity duration-500",
              loaded ? "opacity-0" : "opacity-100",
            )}
          />
        ) : null}
        <img
          src={photo.thumbnailUrl}
          alt={photo.filename}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={cn(
            "relative h-auto w-full object-cover transition duration-500",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    </button>
  );
}

function Lightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: GalleryPhoto[];
  index: number;
  onClose: () => void;
  onNavigate: (direction: -1 | 1) => void;
}) {
  const photo = photos[index];

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

  if (!photo) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/96 px-4 py-6"
    >
      <button
        type="button"
        aria-label="Close lightbox"
        className="absolute right-4 top-4 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white transition hover:bg-white/10"
        onClick={onClose}
      >
        Close
      </button>

      <button
        type="button"
        aria-label="Previous photo"
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/12 bg-white/6 px-4 py-3 text-white transition hover:bg-white/10"
        onClick={() => onNavigate(-1)}
      >
        ←
      </button>

      <button
        type="button"
        aria-label="Next photo"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/12 bg-white/6 px-4 py-3 text-white transition hover:bg-white/10"
        onClick={() => onNavigate(1)}
      >
        →
      </button>

      <div className="flex w-full max-w-6xl flex-col items-center gap-5">
        <div className="flex w-full items-center justify-between gap-4 text-sm text-white/76">
          <p className="font-mono">
            {index + 1} / {photos.length}
          </p>
          <a
            href={photo.downloadUrl}
            className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-white transition hover:bg-white/12"
          >
            Download original
          </a>
        </div>

        <div className="relative max-h-[82vh] w-full overflow-hidden rounded-[1.6rem]">
          <img
            src={photo.viewerUrl}
            alt={photo.filename}
            className="max-h-[82vh] w-full rounded-[1.6rem] object-contain"
          />
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
}: GalleryExperienceProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleNavigate = (direction: -1 | 1) => {
    setSelectedIndex((current) => {
      if (current === null) {
        return current;
      }

      const nextIndex = current + direction;

      if (nextIndex < 0) {
        return photos.length - 1;
      }

      if (nextIndex >= photos.length) {
        return 0;
      }

      return nextIndex;
    });
  };

  return (
    <>
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-10">
        <section className="fade-up mb-8 rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(14,16,19,0.92),rgba(8,10,13,0.9))] px-6 py-10 shadow-[0_30px_100px_rgba(0,0,0,0.3)] sm:px-10">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Private Client Gallery
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="headline text-5xl leading-none text-[var(--foreground)] sm:text-7xl">
                {galleryName}
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                Curated for {clientName}. Originals stay private, and downloads
                are delivered only through authenticated app streaming.
              </p>
            </div>
            <div className="rounded-full border border-[var(--line)] bg-[rgba(255,255,255,0.03)] px-5 py-3 text-sm text-[var(--muted-strong)]">
              {photoCount} photos
            </div>
          </div>
        </section>

        <section className="masonry-grid">
          {photos.map((photo, index) => (
            <div key={photo.id} className="masonry-item fade-up">
              <GalleryImage photo={photo} onClick={() => setSelectedIndex(index)} />
            </div>
          ))}
        </section>
      </main>

      {selectedIndex !== null ? (
        <Lightbox
          photos={photos}
          index={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNavigate={handleNavigate}
        />
      ) : null}
    </>
  );
}

'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { formatDate } from "@/lib/utils";

interface GalleryListItem {
  id: string;
  name: string;
  client_name: string;
  slug: string;
  photo_count: number;
  created_at: string;
  last_accessed: string | null;
}

interface AdminShellProps {
  galleries: GalleryListItem[];
}

interface CreatedGalleryState {
  accessCode: string;
  name: string;
  slug: string;
  id: string;
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function AdminShell({ galleries }: AdminShellProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createdGallery, setCreatedGallery] = useState<CreatedGalleryState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [slug, setSlug] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [slugLocked, setSlugLocked] = useState(false);

  const handleCreateGallery = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/admin/galleries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          clientName,
          slug,
          accessCode,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Unable to create gallery.");
        return;
      }

      setCreatedGallery({
        accessCode: payload.accessCode,
        name: payload.gallery.name,
        slug: payload.gallery.slug,
        id: payload.gallery.id,
      });
      setName("");
      setClientName("");
      setSlug("");
      setAccessCode("");
      setSlugLocked(false);
      router.refresh();
    });
  };

  const handleGalleryDelete = async (galleryId: string) => {
    const confirmed = window.confirm(
      "Delete this gallery, all photo metadata, and every original file in R2?",
    );

    if (!confirmed) {
      return;
    }

    setDeleteId(galleryId);
    setError(null);

    const response = await fetch(`/api/admin/galleries/${galleryId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? "Unable to delete gallery.");
    }

    setDeleteId(null);
    router.refresh();
  };

  const handleCopy = async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setError(message);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-8 sm:px-10">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Admin Workspace
          </p>
          <h1 className="headline mt-3 text-5xl text-[var(--foreground)] sm:text-6xl">
            Private client delivery.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
            Create galleries, issue access codes, upload originals directly to
            private R2 storage, and deliver full-resolution downloads through
            app-controlled authorization only.
          </p>
        </div>

        <form action="/api/admin/logout" method="post">
          <button className="btn-secondary px-5 py-3 text-sm uppercase tracking-[0.18em]">
            Log Out
          </button>
        </form>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <div className="glass-panel rounded-[1.75rem] p-6">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              New Gallery
            </p>
            <h2 className="headline mt-3 text-3xl text-[var(--foreground)]">
              Create and hand off.
            </h2>
          </div>

          <form className="space-y-4" onSubmit={handleCreateGallery}>
            <div className="space-y-2">
              <label className="text-sm text-[var(--muted-strong)]">
                Gallery name
              </label>
              <input
                required
                className="field"
                value={name}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setName(nextValue);

                  if (!slugLocked) {
                    setSlug(slugify(nextValue));
                  }
                }}
                placeholder="Autumn Editorial"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[var(--muted-strong)]">
                Client name
              </label>
              <input
                required
                className="field"
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                placeholder="Morgan Tate"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[var(--muted-strong)]">Slug</label>
              <input
                required
                className="field font-mono"
                value={slug}
                onChange={(event) => {
                  setSlugLocked(true);
                  setSlug(slugify(event.target.value));
                }}
                placeholder="morgan-tate-autumn"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[var(--muted-strong)]">
                Access code
              </label>
              <input
                className="field font-mono uppercase"
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value.toUpperCase())}
                placeholder="Leave blank to auto-generate"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full px-5 py-3 text-sm uppercase tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Creating..." : "Create Gallery"}
            </button>
          </form>

          {error ? (
            <div className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.35)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </div>
          ) : null}

          {createdGallery ? (
            <div className="mt-5 rounded-[1.5rem] border border-[rgba(212,164,106,0.25)] bg-[rgba(212,164,106,0.08)] p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                Access Code
              </p>
              <div className="mt-3 flex flex-col gap-3">
                <p className="font-mono text-2xl tracking-[0.35em] text-[var(--foreground)]">
                  {createdGallery.accessCode}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="btn-secondary px-4 py-2 text-sm"
                    onClick={() =>
                      handleCopy(
                        createdGallery.accessCode,
                        "Could not copy the access code.",
                      )
                    }
                  >
                    Copy code
                  </button>
                  <button
                    type="button"
                    className="btn-secondary px-4 py-2 text-sm"
                    onClick={() =>
                      handleCopy(
                        `${window.location.origin}/gallery/${createdGallery.slug}`,
                        "Could not copy the gallery link.",
                      )
                    }
                  >
                    Copy link
                  </button>
                  <Link
                    href={`/admin/galleries/${createdGallery.id}`}
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    Open uploader
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="glass-panel rounded-[1.75rem] p-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Gallery Library
              </p>
              <h2 className="headline mt-3 text-3xl text-[var(--foreground)]">
                Current deliveries
              </h2>
            </div>
            <div className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--muted)]">
              {galleries.length} total
            </div>
          </div>

          <div className="space-y-3">
            {galleries.map((gallery) => (
              <article
                key={gallery.id}
                className="rounded-[1.4rem] border border-[var(--line)] bg-[rgba(255,255,255,0.025)] p-4 transition hover:border-[var(--line-strong)]"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                      {gallery.client_name}
                    </p>
                    <h3 className="mt-2 text-xl font-medium text-[var(--foreground)]">
                      {gallery.name}
                    </h3>
                    <p className="mt-2 font-mono text-xs text-[var(--muted)]">
                      /gallery/{gallery.slug}
                    </p>
                  </div>

                  <div className="grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-3 xl:min-w-[360px]">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                        Photos
                      </p>
                      <p className="mt-1 text-[var(--muted-strong)]">
                        {gallery.photo_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                        Created
                      </p>
                      <p className="mt-1 text-[var(--muted-strong)]">
                        {formatDate(gallery.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                        Last accessed
                      </p>
                      <p className="mt-1 text-[var(--muted-strong)]">
                        {formatDate(gallery.last_accessed)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/admin/galleries/${gallery.id}`}
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    Manage gallery
                  </Link>
                  <button
                    type="button"
                    className="btn-secondary px-4 py-2 text-sm"
                    onClick={() =>
                      handleCopy(
                        `${window.location.origin}/gallery/${gallery.slug}`,
                        "Could not copy the gallery link.",
                      )
                    }
                  >
                    Copy link
                  </button>
                  <button
                    type="button"
                    className="btn-secondary px-4 py-2 text-sm text-[var(--danger)]"
                    disabled={deleteId === gallery.id}
                    onClick={() => handleGalleryDelete(gallery.id)}
                  >
                    {deleteId === gallery.id ? "Deleting..." : "Delete gallery"}
                  </button>
                </div>
              </article>
            ))}

            {galleries.length === 0 ? (
              <div className="rounded-[1.4rem] border border-dashed border-[var(--line)] px-6 py-12 text-center text-sm text-[var(--muted)]">
                No galleries yet. Create one and start uploading.
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

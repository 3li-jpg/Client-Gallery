'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

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

interface UserInfo {
  id: string;
  name: string;
  email: string;
  plan: string;
  storage_used_bytes: number;
}

interface AdminShellProps {
  galleries: GalleryListItem[];
  user: UserInfo;
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

  const stats = useMemo(() => {
    const totalPhotos = galleries.reduce((sum, gallery) => sum + gallery.photo_count, 0);
    const activeClients = new Set(galleries.map((gallery) => gallery.client_name)).size;
    const recentlyOpened = galleries.filter((gallery) => gallery.last_accessed !== null).length;

    return { totalPhotos, activeClients, recentlyOpened };
  }, [galleries]);

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
    <main className="page-backdrop min-h-screen">
      <div className="page-shell flex flex-col gap-8">
        <header className="section-card flex flex-col gap-6 px-6 py-8 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-3xl">
            <p className="kicker">Studio Workspace</p>
            <h1 className="headline mt-4 text-5xl leading-none text-[var(--foreground)] sm:text-6xl">
              Run delivery like part of the brand.
            </h1>
            <p className="font-body mt-5 text-base leading-8 text-[var(--muted)]">
              Create client galleries, upload the finals, and manage the handoff
              from one private studio dashboard. The UI follows the same refined
              system clients see on the public-facing side.
            </p>
          </div>

          <form action="/api/admin/logout" method="post">
            <button className="btn-secondary font-ui px-5 py-3 text-sm">
              Log Out
            </button>
          </form>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Galleries", value: galleries.length },
            { label: "Photos delivered", value: stats.totalPhotos },
            { label: "Clients served", value: stats.activeClients || 0 },
          ].map((stat) => (
            <div key={stat.label} className="stat-card px-6 py-5">
              <p className="font-ui text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                {stat.label}
              </p>
              <p className="headline mt-5 text-5xl leading-none text-[var(--foreground)]">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="glass-panel rounded-[1.75rem] p-6">
            <div className="mb-6">
              <p className="kicker">New Gallery</p>
              <h2 className="headline mt-3 text-4xl text-[var(--foreground)]">
                Create and hand off.
              </h2>
              <p className="font-body mt-4 text-sm leading-7 text-[var(--muted)]">
                Start a new client reveal with a clean slug, a private code, and
                a dedicated upload workspace.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleCreateGallery}>
              <div className="space-y-2">
                <label
                  htmlFor="gallery-name"
                  className="form-label"
                >
                  Gallery name
                </label>
                <input
                  id="gallery-name"
                  name="name"
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
                  placeholder="Spring brand campaign…"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="client-name"
                  className="form-label"
                >
                  Client name
                </label>
                <input
                  id="client-name"
                  name="clientName"
                  required
                  className="field"
                  value={clientName}
                  onChange={(event) => setClientName(event.target.value)}
                  placeholder="City of Victoria…"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="gallery-slug"
                  className="form-label"
                >
                  Slug
                </label>
                <input
                  id="gallery-slug"
                  name="slug"
                  required
                  className="field font-mono"
                  value={slug}
                  onChange={(event) => {
                    setSlugLocked(true);
                    setSlug(slugify(event.target.value));
                  }}
                  placeholder="city-of-victoria-spring…"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="gallery-access-code"
                  className="form-label"
                >
                  Access code
                </label>
                <input
                  id="gallery-access-code"
                  name="accessCode"
                  className="field font-mono uppercase"
                  value={accessCode}
                  onChange={(event) => setAccessCode(event.target.value.toUpperCase())}
                  placeholder="Leave blank to auto-generate…"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="btn-primary font-ui w-full px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Creating..." : "Create gallery"}
              </button>
            </form>

            {error ? (
              <div
                aria-live="polite"
                className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.35)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]"
              >
                {error}
              </div>
            ) : null}

            {createdGallery ? (
              <div className="subtle-card mt-5 rounded-[1.5rem] p-4">
                <p className="kicker">New access code</p>
                <div className="mt-3 flex flex-col gap-3">
                  <p className="font-mono text-2xl tracking-[0.35em] text-[var(--foreground)]">
                    {createdGallery.accessCode}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="btn-secondary font-ui px-4 py-2 text-sm"
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
                      className="btn-secondary font-ui px-4 py-2 text-sm"
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
                      className="btn-primary font-ui px-4 py-2 text-sm"
                    >
                      Open uploader
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="glass-panel rounded-[1.75rem] p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="kicker">Gallery Library</p>
                <h2 className="headline mt-3 text-4xl text-[var(--foreground)]">
                  Current deliveries
                </h2>
                <p className="font-body mt-4 text-sm leading-7 text-[var(--muted)]">
                  {stats.recentlyOpened} galleries have been opened by clients at
                  least once.
                </p>
              </div>
              <div className="subtle-card rounded-full px-4 py-2 text-sm text-[var(--muted)]">
                {galleries.length} total
              </div>
            </div>

            <div className="space-y-3">
              {galleries.map((gallery) => (
                <article
                  key={gallery.id}
                  className="subtle-card rounded-[1.5rem] p-5 transition hover:border-[var(--line-strong)]"
                >
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] xl:items-start">
                    <div className="min-w-0">
                      <p className="font-ui text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                        {gallery.client_name}
                      </p>
                      <h3 className="font-display mt-2 text-[2.25rem] leading-[0.92] tracking-[-0.05em] text-[var(--foreground)]">
                        {gallery.name}
                      </h3>
                      <p className="mt-3 font-mono text-xs text-[var(--muted)]">
                        /gallery/{gallery.slug}
                      </p>
                    </div>

                    <div className="grid gap-4 text-sm text-[var(--muted)] sm:grid-cols-3">
                      <div>
                        <p className="font-ui text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                          Photos
                        </p>
                        <p className="mt-2 text-[var(--muted-strong)]">
                          {gallery.photo_count}
                        </p>
                      </div>
                      <div>
                        <p className="font-ui text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                          Created
                        </p>
                        <p className="mt-2 text-[var(--muted-strong)]">
                          {formatDate(gallery.created_at)}
                        </p>
                      </div>
                      <div>
                        <p className="font-ui text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                          Last opened
                        </p>
                        <p className="mt-2 text-[var(--muted-strong)]">
                          {formatDate(gallery.last_accessed)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/admin/galleries/${gallery.id}`}
                      className="btn-primary font-ui px-4 py-2 text-sm"
                    >
                      Manage gallery
                    </Link>
                    <button
                      type="button"
                      className="btn-secondary font-ui px-4 py-2 text-sm"
                      onClick={() =>
                        handleCopy(
                          `${window.location.origin}/gallery/${gallery.slug}`,
                          "Could not copy the gallery link.",
                        )
                      }
                    >
                      Copy client link
                    </button>
                    <button
                      type="button"
                      className="btn-secondary font-ui px-4 py-2 text-sm text-[var(--danger)]"
                      disabled={deleteId === gallery.id}
                      onClick={() => void handleGalleryDelete(gallery.id)}
                    >
                      {deleteId === gallery.id ? "Deleting..." : "Delete gallery"}
                    </button>
                  </div>
                </article>
              ))}

              {galleries.length === 0 ? (
                <div className="rounded-[1.4rem] border border-dashed border-[var(--line)] px-6 py-14 text-center text-sm text-[var(--muted)]">
                  No galleries yet. Create one and start uploading.
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, FolderOpen, Link2, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import {
  formatBytes,
  getPlan,
  getStoragePercentage,
} from "@/lib/plans";
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

export function AdminShell({ galleries, user }: AdminShellProps) {
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

  const plan = getPlan(user.plan);
  const storagePercentage = getStoragePercentage(user.storage_used_bytes, user.plan);

  const stats = useMemo(() => {
    const totalPhotos = galleries.reduce((sum, gallery) => sum + gallery.photo_count, 0);
    const activeClients = new Set(galleries.map((gallery) => gallery.client_name)).size;
    const recentlyOpened = galleries.filter((gallery) => gallery.last_accessed !== null).length;
    const recentAccess = [...galleries]
      .filter((gallery) => gallery.last_accessed)
      .sort((left, right) => {
        const leftTime = new Date(left.last_accessed ?? 0).getTime();
        const rightTime = new Date(right.last_accessed ?? 0).getTime();
        return rightTime - leftTime;
      })
      .slice(0, 4);

    return { totalPhotos, activeClients, recentlyOpened, recentAccess };
  }, [galleries]);

  const handleCreateGallery = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/admin/galleries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className="mx-auto flex w-full max-w-[72rem] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div className="space-y-4">
          <p className="kicker">Overview</p>
          <h1 className="headline max-w-[11ch] text-[clamp(3rem,6vw,5rem)] leading-[0.9] text-[var(--foreground-strong)]">
            Run delivery like part of the brand.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-[var(--muted-strong)]">
            Create private client galleries, watch storage with clarity, and keep
            original downloads behind authenticated routes.
          </p>
        </div>

        <div className="section-card px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                Plan and storage
              </p>
              <p className="mt-3 text-2xl text-[var(--foreground-strong)]">
                {plan.name}
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/4 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted-strong)]">
              {storagePercentage}% used
            </span>
          </div>

          <div className="mt-5 space-y-2">
            <div className="storage-bar">
              <div
                className={`storage-bar-fill ${storagePercentage >= 90 ? "danger" : storagePercentage >= 75 ? "warning" : ""}`}
                style={{ width: `${storagePercentage}%` }}
              />
            </div>
            <p className="text-sm text-[var(--muted-strong)]">
              {formatBytes(user.storage_used_bytes)} of {plan.storageLimitLabel}
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Galleries", value: galleries.length },
          { label: "Photos delivered", value: stats.totalPhotos },
          { label: "Clients served", value: stats.activeClients || 0 },
          { label: "Opened by clients", value: stats.recentlyOpened },
        ].map((stat) => (
          <article key={stat.label} className="stat-card px-5 py-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
              {stat.label}
            </p>
            <p className="headline mt-5 text-5xl leading-none text-[var(--foreground-strong)]">
              {stat.value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        <div id="new-gallery" className="section-card px-6 py-6">
          <div className="max-w-xl">
            <p className="kicker">New gallery</p>
            <h2 className="headline mt-3 text-4xl text-[var(--foreground-strong)]">
              Create the handoff.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--muted-strong)]">
              Start a private reveal with a clean slug, a dedicated access code,
              and a direct upload workspace ready for the final selects.
            </p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleCreateGallery}>
            <div className="space-y-2">
              <label htmlFor="gallery-name" className="form-label">
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
                placeholder="Mayfair townhouse wedding"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="client-name" className="form-label">
                Client name
              </label>
              <input
                id="client-name"
                name="clientName"
                required
                className="field"
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                placeholder="Elena and Marco"
                autoComplete="off"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="gallery-slug" className="form-label">
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
                  placeholder="elena-marco-mayfair"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="gallery-access-code" className="form-label">
                  Access code
                </label>
                <input
                  id="gallery-access-code"
                  name="accessCode"
                  className="field font-mono uppercase"
                  value={accessCode}
                  onChange={(event) => setAccessCode(event.target.value.toUpperCase())}
                  placeholder="Leave blank to auto-generate"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Creating gallery…" : "Create gallery"}
            </button>
          </form>

          {error ? (
            <div
              aria-live="polite"
              className="mt-4 rounded-[1.2rem] border border-[rgba(234,127,121,0.32)] bg-[rgba(234,127,121,0.08)] px-4 py-3 text-sm text-[var(--danger)]"
            >
              {error}
            </div>
          ) : null}

          {createdGallery ? (
            <div className="subtle-card mt-5 rounded-[1.5rem] p-5">
              <p className="kicker">Ready to share</p>
              <div className="mt-3 flex flex-col gap-3">
                <p className="font-mono text-2xl tracking-[0.35em] text-[var(--foreground-strong)]">
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
                    <Copy className="h-4 w-4" />
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
                    <Link2 className="h-4 w-4" />
                    Copy link
                  </button>
                  <Link
                    href={`/admin/galleries/${createdGallery.id}`}
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    <FolderOpen className="h-4 w-4" />
                    Open uploader
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="section-card px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="kicker">Recent access</p>
              <h2 className="headline mt-3 text-4xl text-[var(--foreground-strong)]">
                Client activity
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted-strong)]">
                {stats.recentlyOpened} galleries have been opened at least once.
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/4 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted-strong)]">
              {galleries.length} total galleries
            </span>
          </div>

          <div className="mt-8 space-y-3">
            {stats.recentAccess.length ? (
              stats.recentAccess.map((gallery) => (
                <article
                  key={gallery.id}
                  className="subtle-card rounded-[1.4rem] px-5 py-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                        {gallery.client_name}
                      </p>
                      <h3 className="headline mt-2 text-3xl text-[var(--foreground-strong)]">
                        {gallery.name}
                      </h3>
                      <p className="mt-2 text-sm text-[var(--muted-strong)]">
                        Opened {formatDate(gallery.last_accessed)}
                      </p>
                    </div>
                    <Link
                      href={`/admin/galleries/${gallery.id}`}
                      className="btn-secondary px-4 py-2 text-sm"
                    >
                      Manage gallery
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-[var(--line)] px-6 py-12 text-sm text-[var(--muted-strong)]">
                No client activity yet. Once galleries are opened, recent access will
                appear here.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section-card px-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="kicker">Gallery library</p>
            <h2 className="headline mt-3 text-4xl text-[var(--foreground-strong)]">
              Current deliveries
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-[var(--muted-strong)]">
            Every gallery keeps the delivery path simple: private slug, access code,
            and authenticated original download.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {galleries.map((gallery) => (
            <article
              key={gallery.id}
              className="subtle-card rounded-[1.5rem] px-5 py-5"
            >
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] xl:items-start">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                    {gallery.client_name}
                  </p>
                  <h3 className="headline mt-2 text-[2.3rem] leading-[0.92] text-[var(--foreground-strong)]">
                    {gallery.name}
                  </h3>
                  <p className="mt-3 font-mono text-xs text-[var(--muted)]">
                    /gallery/{gallery.slug}
                  </p>
                </div>

                <div className="grid gap-4 text-sm text-[var(--muted-strong)] sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      Photos
                    </p>
                    <p className="mt-2">{gallery.photo_count}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      Created
                    </p>
                    <p className="mt-2">{formatDate(gallery.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      Last opened
                    </p>
                    <p className="mt-2">{formatDate(gallery.last_accessed)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/admin/galleries/${gallery.id}`}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  <FolderOpen className="h-4 w-4" />
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
                  <Link2 className="h-4 w-4" />
                  Copy client link
                </button>
                <button
                  type="button"
                  className="btn-danger px-4 py-2 text-sm"
                  disabled={deleteId === gallery.id}
                  onClick={() => void handleGalleryDelete(gallery.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  {deleteId === gallery.id ? "Deleting…" : "Delete gallery"}
                </button>
              </div>
            </article>
          ))}

          {galleries.length === 0 ? (
            <div className="rounded-[1.4rem] border border-dashed border-[var(--line)] px-6 py-14 text-center text-sm text-[var(--muted-strong)]">
              No galleries yet. Create your first delivery above to open the upload flow.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

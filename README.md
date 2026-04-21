# Atelier Client Gallery

Private photographer client galleries built with Next.js 16, App Router, TypeScript, Tailwind CSS, Vercel Postgres, and Cloudflare R2.

## Stack

- Frontend: Next.js App Router + TypeScript + Tailwind CSS
- Hosting: Vercel
- Database: Vercel Postgres via `DATABASE_URL`
- Object storage: Cloudflare R2 private bucket
- Image delivery: Cloudflare Worker + Cloudflare image transformations
- Auth:
  - admin password session via signed httpOnly JWT cookie
  - per-gallery access code session via signed httpOnly JWT cookie

## What the app does

- `/admin/login` verifies `ADMIN_PASSWORD` server-side and issues a signed admin cookie
- `/admin` creates galleries, lists them, copies share links, and deletes galleries
- `/admin/galleries/[galleryId]` uploads directly from the browser to R2 with presigned PUT URLs and shows per-file progress
- `/gallery/[slug]` prompts for a gallery access code when no valid gallery cookie exists
- `/api/download/[galleryId]/[photoId]` verifies the gallery JWT cookie and streams the original file from private R2 without buffering the whole file

## Environment variables

Copy `.env.example` to `.env.local` and fill these values:

```bash
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
DATABASE_URL=
ADMIN_PASSWORD=
JWT_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Notes:

- `R2_PUBLIC_URL` must be the base URL for your Cloudflare-controlled thumbnail layer, not a public bucket URL.
- `JWT_SECRET` must be shared by the Next.js app and the Cloudflare thumbnail worker.
- `NEXT_PUBLIC_APP_URL` should be the full public app origin in each environment.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Run the SQL migration:

```bash
npm run db:migrate
```

3. Start the app:

```bash
npm run dev
```

## Database schema

The initial migration is in [migrations/001_initial.sql](./migrations/001_initial.sql).

Tables:

- `galleries`
  - `id UUID PRIMARY KEY`
  - `slug TEXT UNIQUE NOT NULL`
  - `name TEXT NOT NULL`
  - `client_name TEXT NOT NULL`
  - `access_code TEXT NOT NULL`
  - `created_at TIMESTAMP DEFAULT NOW()`
  - `last_accessed TIMESTAMP`
- `photos`
  - required fields from the brief
  - additional metadata for presentation and downloads:
    - `content_type`
    - `width`
    - `height`
    - `blur_data_url`

`access_code` stores a salted `scrypt` hash, not plaintext.

## Private thumbnail delivery

Original files remain private in R2. Thumbnails and lightbox display images are expected to be served by a Cloudflare Worker that:

1. Verifies the signed thumbnail JWT from the app
2. Pulls the original from the private R2 bucket
3. Applies Cloudflare image transformations
4. Returns an optimized image response

Example worker files:

- [cloudflare/thumbnail-worker.ts](./cloudflare/thumbnail-worker.ts)
- [cloudflare/wrangler.toml.example](./cloudflare/wrangler.toml.example)

Suggested `R2_PUBLIC_URL`:

```txt
https://images.yourdomain.com
```

The Next.js app signs thumbnail URLs against that worker base URL.

## Runtime compatibility note

The download route and all R2 S3 operations are pinned to the Node.js runtime.

Reason:

- the app requires true streaming for large original downloads
- `@aws-sdk/client-s3` compatibility in Edge runtime should not be assumed for this flow
- correctness and private-access guarantees are more important here than forcing Edge

That means:

- presigned PUT generation runs in Node route handlers
- original file retrieval runs in Node route handlers
- `/api/download/[galleryId]/[photoId]` streams the `GetObject` body directly to the browser

## Security model

- R2 credentials never reach the browser
- uploads go directly from browser to R2 using presigned PUT URLs
- original file URLs are never exposed to clients
- gallery access uses app-issued signed httpOnly cookies
- downloads always re-check gallery ownership server-side
- gallery deletion removes R2 objects under `galleries/[galleryId]/`

## Deploying to Vercel

1. Create the Vercel Postgres database and copy its `DATABASE_URL`
2. Create a private Cloudflare R2 bucket
3. Configure the Cloudflare Worker and point `R2_PUBLIC_URL` at it
4. Add all environment variables in Vercel
5. Deploy the app to Vercel

## Important constraints preserved

- direct browser-to-R2 uploads only
- private bucket only
- no OAuth or client accounts
- no public original URLs
- authenticated original downloads only
- no full-file buffering during download
- full-resolution originals preserved in R2

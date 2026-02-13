# Cache + Supabase Setup (Production)

Last updated: 2026-02-13

## 0) Quick Checklist (When Adding or Updating Venues)

Use this order for bulk data updates:

1. Add/update venue JSON in `../data-for-website/enriched_venues`.
2. Dry run import:
   `npm run db:import:venues -- --mode=upsert --dry-run --data-dir=../data-for-website/enriched_venues`
3. Real import:
   `npm run db:import:venues -- --mode=upsert --data-dir=../data-for-website/enriched_venues`
4. Backfill normalized category fields:
   `npm run db:backfill:hardware-brands -- --dry-run`
   `npm run db:backfill:hardware-brands`
   `npm run db:backfill:software-slugs -- --dry-run`
   `npm run db:backfill:software-slugs`
5. Rebuild category config:
   `npm run categories:analyze`
6. Optional safety checks:
   `npm run lint`
   `npm run build`

Default mode:

1. Use `--mode=upsert` for normal updates.
2. Use `--mode=fresh` only when intentionally wiping/reloading all venues.

## 1) Goals

This setup is optimized to:

1. Keep SEO pages heavily cached.
2. Minimize Vercel Fast Origin Transfer.
3. Reduce Supabase query load and egress.
4. Keep key user flows working: auth, favorites, claim, submit, correction reports.

## 2) Rendering + Cache Strategy (Current)

The app uses three patterns:

1. Static pre-render for small route sets.
2. ISR with `revalidate = 15552000` (6 months) for heavy SEO routes.
3. Dynamic rendering only where freshness is required.

### 2.1) Static pre-render (small sets)

Examples:

1. `app/venue/us/[state]/page.tsx` via `generateStaticParams` (51 states).
2. Global best detail routes via `generateStaticParams` (bounded category sets):
   `app/best/[tag]/page.tsx`
   `app/best/vibe/[vibe]/page.tsx`
   `app/best/who-its-for/[segment]/page.tsx`
   `app/best/hardware/[brand]/page.tsx`
   `app/best/software/[software]/page.tsx`
   `app/best/amenities/[amenity]/page.tsx`
   `app/best/launch-monitor/[type]/page.tsx`
3. Launch monitor detail pages:
   `app/launch-monitors/[slug]/page.tsx`

Important:

1. City pages and venue detail pages are no longer pre-rendered at build-time.
2. This is intentional to avoid massive build output/transfer.

### 2.2) ISR 6-month routes

These are cached for 6 months and regenerated on demand after expiry:

1. `app/venue/us/page.tsx`
2. `app/venue/us/[state]/page.tsx`
3. `app/venue/us/[state]/[city]/page.tsx`
4. `app/venue/us/[state]/[city]/page/[page]/page.tsx`
5. `app/venue/us/[state]/[city]/[venueSlug]/page.tsx`
6. City best index/detail pages:
   `app/venue/us/[state]/[city]/best/page.tsx`
   `app/venue/us/[state]/[city]/best/vibe/page.tsx`
   `app/venue/us/[state]/[city]/best/who-its-for/page.tsx`
   `app/venue/us/[state]/[city]/best/hardware/page.tsx`
   `app/venue/us/[state]/[city]/best/software/page.tsx`
   `app/venue/us/[state]/[city]/best/amenities/page.tsx`
   `app/venue/us/[state]/[city]/best/launch-monitor/page.tsx`
   and all matching detail routes under those folders.
7. Global best detail pages under `app/best/*/[param]/page.tsx`
8. `app/robots.ts`
9. `app/sitemap.ts`
10. `app/sitemaps/city-best/sitemap.ts`
11. `app/launch-monitors/[slug]/page.tsx`

### 2.3) Dynamic (intentionally uncached)

1. `app/search/page.tsx`
   - `dynamic = "force-dynamic"`
   - `revalidate = 0`
   - robots noindex/nofollow + blocked in `robots.txt`

## 3) Data Caching Layer (Next.js `unstable_cache`)

Shared Supabase queries are wrapped in `unstable_cache` with 6-month TTL:

1. `lib/cached-queries.ts` (`SIX_MONTHS = 15552000`)
2. `lib/best-by-data.ts` (`CACHE_DURATION = 15552000`)

Common cache tags:

1. `state-venue-counts`
2. `city-venue-counts`
3. `cities-in-state`
4. `featured-venues`
5. `total-active-venue-count`
6. `nearby-cities`
7. `nearby-venues`
8. `category-counts`

## 4) Build Snapshot Cache (`.cache/venues.json`)

Build step:

1. `prebuild` runs `scripts/prebuild-venues-cache.ts`
2. Script fetches active US venues and writes `.cache/venues.json`

Usage:

1. Build-time pages can read snapshot data instead of hitting Supabase repeatedly.
2. Runtime only uses snapshot if `USE_VENUE_SNAPSHOT=1` (or during build phase).

Why this matters:

1. Fewer Supabase calls during builds.
2. Lower build-time origin transfer and faster build consistency.

## 5) Middleware Auth Refresh Scope (`proxy.ts`)

Auth refresh is intentionally limited via `shouldRefreshAuth(...)` in `proxy.ts`.

Session refresh runs only for:

1. `/dashboard*`
2. `/admin*`
3. `/api/admin*`
4. `/api/venues`
5. `/api/venues/:id/favorite`
6. `/api/venues/:id/claim`
7. `/api/venues/:id/update`

Result:

1. Public SEO pages avoid unnecessary auth round-trips.
2. Lower per-request overhead and transfer.

## 6) URL Normalization and Redirects

`proxy.ts` also handles:

1. Underscore to hyphen 301 redirects (canonical slug normalization).
2. Legacy city pagination query redirect:
   `/venue/us/:state/:city?page=2` -> `/venue/us/:state/:city/page/2`

## 7) On-Demand Revalidation After Mutations

`lib/revalidate-venue.ts` is called by mutation/admin endpoints:

1. `app/api/venues/[id]/update/route.ts`
2. `app/api/admin/review-claim/route.ts`
3. `app/api/admin/review-correction/route.ts`
4. `app/api/admin/approve-submission/route.ts`

It revalidates:

1. Core pages (`/`, `/venue/us`, state/city/venue pages).
2. Best-by route patterns (city and global).
3. Metadata routes (`/robots.txt`, `/sitemap.xml`, city-best sitemap).
4. Cache tags listed in section 3.

## 8) Environment Variables (Vercel + Local)

Required:

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`
4. `REVALIDATE_SECRET` (for on-demand blog revalidation endpoint)

What each key is used for:

1. `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`: client/browser auth and middleware session client.
3. `SUPABASE_SERVICE_ROLE_KEY`: server-side/admin queries and prebuild snapshot script.

Optional (Prisma tooling only):

1. `DATABASE_URL`
2. `DIRECT_URL`

Optional (content source switch):

1. `BLOG_CONTENT_SOURCE` (`supabase` default, `filesystem` fallback)

Note:

1. Runtime app traffic uses Supabase JS clients, not Prisma query runtime.
2. Prisma URLs are only needed for Prisma commands (`db:push`, migrate, etc.).

## 9) Freshness Rules

Under normal traffic:

1. SEO pages can remain cached up to 6 months.
2. Mutations through app/admin APIs trigger revalidation quickly.
3. Blog publishes/updates should call `POST /api/revalidate-blog` with `REVALIDATE_SECRET`.

If data is changed outside API routes (direct SQL or bulk import scripts):

1. Trigger a new deploy to refresh caches safely.
2. Or add/execute a manual revalidation endpoint/script (future improvement).

## 10) Monitoring Checklist

Weekly checks:

1. Vercel usage dashboard:
   - Fast Origin Transfer trend
   - Function invocation spikes
2. Supabase usage:
   - DB load
   - egress trend
3. `lib/category-config.generated.ts` freshness after imports
4. Spot-check:
   - one city page
   - one venue detail page
   - one city best page
   - search page behavior

If usage spikes:

1. Confirm no accidental `revalidate` reductions.
2. Confirm no new global middleware/auth work on public routes.
3. Confirm large route sets were not reintroduced to `generateStaticParams`.

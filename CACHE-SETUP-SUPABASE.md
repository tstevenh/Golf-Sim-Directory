# Cache + Supabase Setup (Production)

Last updated: 2026-02-10

## 0) Top Checklist (When Adding New Venues)

Use this exact order:

1. Add new JSON files into `../data-for-website/enriched_venues`.
2. Import dry-run:
   `npm run db:import:venues -- --mode=upsert --dry-run --data-dir=../data-for-website/enriched_venues`
3. Import real:
   `npm run db:import:venues -- --mode=upsert --data-dir=../data-for-website/enriched_venues`
4. Refresh normalized hardware/software (dry-run then real):
   `npm run db:backfill:hardware-brands -- --dry-run`
   `npm run db:backfill:hardware-brands`
   `npm run db:backfill:software-slugs -- --dry-run`
   `npm run db:backfill:software-slugs`
5. Regenerate category counts:
   `npm run categories:analyze`
6. Optional safety checks:
   `npm run lint`
   `npx tsc --noEmit`

Default mode:

1. Use `--mode=upsert` for normal updates.
2. Only use `--mode=fresh` if you intentionally want to wipe and reload all venues.

## 1) Goal

This setup is designed to:

1. Keep venue browse pages fast.
2. Reduce Supabase database load on Free plan.
3. Reduce egress and repeated DB reads during traffic spikes.
4. Keep search page real-time while most browse pages are cached.

## 2) Current Rendering Strategy

The app now uses 3 rendering modes:

1. Static (`force-static`)
- Used on index-style category pages that do not need live data every request.

2. ISR cache (`revalidate = 86400`)
- Used on heavy listing/detail browse pages.
- Cached for 24 hours, then refreshed in background.

3. Dynamic (`force-dynamic`)
- Used on `app/search/page.tsx` so filtering/search stays live.

## 3) What `revalidate = 86400` Means

`86400` seconds = 24 hours.

Effect:

1. First request after deploy/build generates page data.
2. Next users get cached HTML/data from Vercel.
3. After 24h, one request triggers background refresh.
4. Most requests do not hit Supabase directly.

Tradeoff:

1. Much lower DB load and better stability.
2. Venue edits may take up to 24h to appear automatically.

## 4) Files Using 24h Cache

### Venue browse hierarchy

1. `app/venue/us/page.tsx`
2. `app/venue/us/[state]/page.tsx`
3. `app/venue/us/[state]/[city]/page.tsx`
4. `app/venue/us/[state]/[city]/[venueSlug]/page.tsx`

### City best index pages

1. `app/venue/us/[state]/[city]/best/vibe/page.tsx`
2. `app/venue/us/[state]/[city]/best/hardware/page.tsx`
3. `app/venue/us/[state]/[city]/best/who-its-for/page.tsx`

### City best detail pages

1. `app/venue/us/[state]/[city]/best/[tag]/page.tsx`
2. `app/venue/us/[state]/[city]/best/vibe/[vibe]/page.tsx`
3. `app/venue/us/[state]/[city]/best/who-its-for/[segment]/page.tsx`
4. `app/venue/us/[state]/[city]/best/hardware/[brand]/page.tsx`
5. `app/venue/us/[state]/[city]/best/software/[software]/page.tsx`
6. `app/venue/us/[state]/[city]/best/amenities/[amenity]/page.tsx`
7. `app/venue/us/[state]/[city]/best/launch-monitor/[type]/page.tsx`

### Global best detail pages

1. `app/best/[tag]/page.tsx`
2. `app/best/vibe/[vibe]/page.tsx`
3. `app/best/who-its-for/[segment]/page.tsx`
4. `app/best/hardware/[brand]/page.tsx`
5. `app/best/software/[software]/page.tsx`
6. `app/best/amenities/[amenity]/page.tsx`
7. `app/best/launch-monitor/[type]/page.tsx`

## 5) Pages Intentionally Kept Dynamic

1. `app/search/page.tsx`
- `force-dynamic`
- `revalidate = 0`
- Reason: users expect live filtering and immediate result updates.

## 6) Supabase Connection Setup (Free Plan Safe)

Use transaction pooler URL for app traffic.

Recommended `.env` shape:

```env
DATABASE_URL="postgresql://<user>:<password>@aws-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://<user>:<password>@aws-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

Notes:

1. `DATABASE_URL`: used for app queries.
2. `DIRECT_URL`: Prisma often uses this for schema operations.
3. On IPv4-only networks, direct host `db.<project>.supabase.co:5432` may fail to connect.
4. In that case, using pooler URL for both is acceptable for this project setup.
5. `connection_limit` must be numeric (example: `connection_limit=1`, not `connection_limit=1s`).

## 6.1) SQL Editor Fallback for Schema Changes

If `npm run db:push` fails or hangs on pooled connections, apply schema changes directly in Supabase SQL Editor.

Current required SQL for software category optimization:

```sql
alter table public."venues"
add column if not exists "softwareSlugs" text[] not null default '{}';

create index if not exists "idx_venues_software_slugs_gin"
on public."venues"
using gin ("softwareSlugs");
```

After running SQL in Supabase, run local Prisma client generation and backfill scripts from app:

1. `npx prisma generate`
2. `npm run db:backfill:software-slugs -- --dry-run`
3. `npm run db:backfill:software-slugs`
4. `npm run categories:analyze`

## 7) Connection Limits Explained

From your Supabase settings screenshot:

1. Pool Size: `15`
2. Max Client Connections: `200`

Important:

1. This is not equal to "60 users max on website".
2. Limit is active DB connections, not total visitors.
3. Static cached pages can serve many users with little/no DB activity.
4. Connection issues happen when many requests need live DB at same time.

What users see if limit is hit:

1. Some pages become slow.
2. Some requests error or timeout.
3. Data is not deleted; access is temporarily blocked until pressure drops.

## 8) Why This Setup Helps Long-Term Usage

1. Fewer DB calls per request due to cached pages.
2. Less data transfer from DB for repeated traffic.
3. Better resilience during spikes.
4. Lower chance of hitting Free-plan connection/egress limits.

## 9) Operational Runbook

After large data imports or schema updates:

1. `npx prisma generate`
2. `npm run db:push` (or use SQL Editor fallback in section 6.1)
3. `npm run db:backfill:hardware-brands -- --dry-run`
4. `npm run db:backfill:hardware-brands`
5. `npm run db:backfill:software-slugs -- --dry-run`
6. `npm run db:backfill:software-slugs`
7. `npm run categories:analyze`

Why step 7 matters:

1. It regenerates `lib/category-config.generated.ts`.
2. Keeps category counts/links aligned with latest venue dataset.

## 10) Content Freshness Rules

With 24h cache:

1. New or updated venue content may not show instantly.
2. Typical max wait is 24h without manual action.

If immediate update is needed:

1. Redeploy app.
2. Or temporarily lower `revalidate` on specific pages.
3. Future improvement: add on-demand revalidation endpoint triggered by admin updates.

## 11) Current Known Limitation

City page "Browse by Category" currently uses global static category config in:

1. `app/venue/us/[state]/[city]/page.tsx`

Impact:

1. Some category links may exist globally but have 0 venues in that specific city.

Recommended next improvement:

1. Switch city related category links to city-local counts only.

## 12) Quick Health Checklist

Weekly checks:

1. Supabase usage dashboard: connection peaks, egress trend.
2. Verify category file freshness date in `lib/category-config.generated.ts`.
3. Test one city page, one category page, and one search page for response time.

If performance drops:

1. Confirm no accidental `revalidate` reductions.
2. Confirm search queries still paginated.
3. Check for heavy new DB queries added without cache.

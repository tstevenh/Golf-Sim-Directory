# Prisma → Supabase SDK Migration Plan

## Overview

Migrate the golf simulator venue directory from **Prisma ORM** (direct PostgreSQL connections) to **Supabase Client SDK** (REST API) to eliminate connection pool issues on the Supabase free tier.

**Why:** Direct database connections via Prisma exhaust the free tier's ~60 connection limit, causing `P1001: Can't reach database server` errors. The Supabase SDK uses REST API calls instead — no connection pool, no limits, proven to work (indoor-climbing-gym project).

**Estimated Time:** 4-6 hours
**Risk Level:** Low-Medium
**Rollback:** Keep Prisma installed until Phase 13

---

## Current Architecture

```
Next.js App → Prisma Client → PostgreSQL (direct connection via pgbouncer)
                                ↓
                         Connection pool limit (~60)
                         ❌ Fails under traffic
```

## Target Architecture

```
Next.js App → Supabase SDK → Supabase REST API → PostgreSQL
                                ↓
                         No connection limits
                         ✅ Works on free tier
```

---

## Database Schema (7 tables)

| Table | Prisma Model | Supabase Table | Notes |
|-------|-------------|----------------|-------|
| venues | Venue | venues | Main table, 56 columns |
| users | User | users | Auth users |
| favorites | Favorite | favorites | User-venue relation |
| correction_reports | CorrectionReport | correction_reports | User corrections |
| submissions | Submission | submissions | Venue submissions |
| claim_requests | ClaimRequest | claim_requests | Ownership claims |
| featured_listings | FeaturedListing | featured_listings | Paid features |

---

## Files to Migrate (56 total)

### Core Libraries (4 files)
- [ ] `lib/db.ts` → Replace with Supabase client
- [ ] `lib/auth.ts` → Update queries
- [ ] `lib/best-by-data.ts` → Update queries
- [ ] `types/index.ts` → Replace Prisma types

### Pages (30 files)
- [ ] `app/page.tsx` — Homepage
- [ ] `app/search/page.tsx` — Search
- [ ] `app/claim/page.tsx` — Claim a venue
- [ ] `app/sitemap.ts` — Sitemap generation
- [ ] `app/dashboard/page.tsx` — User dashboard
- [ ] `app/dashboard/venues/[id]/edit/page.tsx` — Venue edit
- [ ] `app/dashboard/venues/[id]/edit/VenueEditForm.tsx` — Edit form
- [ ] `app/dashboard/venues/[id]/edit/VenueEditFormFull.tsx` — Full edit form
- [ ] `app/admin/claims/page.tsx` — Admin claims
- [ ] `app/admin/corrections/page.tsx` — Admin corrections
- [ ] `app/admin/submissions/page.tsx` — Admin submissions
- [ ] `app/venue/us/page.tsx` — US venues index
- [ ] `app/venue/us/[state]/page.tsx` — State page
- [ ] `app/venue/us/[state]/[city]/page.tsx` — City page
- [ ] `app/venue/us/[state]/[city]/[venueSlug]/page.tsx` — Venue detail
- [ ] `app/venue/us/[state]/[city]/[venueSlug]/report/page.tsx` — Report page
- [ ] `app/venue/us/[state]/[city]/[venueSlug]/report/ReportCorrectionForm.tsx` — Report form
- [ ] `app/best/[tag]/page.tsx` — Tag category
- [ ] `app/best/amenities/[amenity]/page.tsx` — Amenity category
- [ ] `app/best/hardware/[brand]/page.tsx` — Hardware category
- [ ] `app/best/launch-monitor/[type]/page.tsx` — Launch monitor category
- [ ] `app/best/software/[software]/page.tsx` — Software category
- [ ] `app/best/vibe/[vibe]/page.tsx` — Vibe category
- [ ] `app/best/who-its-for/[segment]/page.tsx` — Segment category
- [ ] `app/venue/us/[state]/[city]/best/[tag]/page.tsx` — City tag
- [ ] `app/venue/us/[state]/[city]/best/amenities/[amenity]/page.tsx` — City amenity
- [ ] `app/venue/us/[state]/[city]/best/hardware/[brand]/page.tsx` — City hardware
- [ ] `app/venue/us/[state]/[city]/best/hardware/page.tsx` — City hardware index
- [ ] `app/venue/us/[state]/[city]/best/launch-monitor/[type]/page.tsx` — City launch monitor
- [ ] `app/venue/us/[state]/[city]/best/software/[software]/page.tsx` — City software
- [ ] `app/venue/us/[state]/[city]/best/vibe/[vibe]/page.tsx` — City vibe
- [ ] `app/venue/us/[state]/[city]/best/vibe/page.tsx` — City vibe index
- [ ] `app/venue/us/[state]/[city]/best/who-its-for/[segment]/page.tsx` — City segment
- [ ] `app/venue/us/[state]/[city]/best/who-its-for/page.tsx` — City segment index

### API Routes (10 files)
- [ ] `app/api/auth/register/route.ts` — User registration
- [ ] `app/api/venues/route.ts` — Venue listing API
- [ ] `app/api/venues/cities/route.ts` — Cities API
- [ ] `app/api/venues/[id]/claim/route.ts` — Claim venue
- [ ] `app/api/venues/[id]/corrections/route.ts` — Submit correction
- [ ] `app/api/venues/[id]/favorite/route.ts` — Toggle favorite
- [ ] `app/api/venues/[id]/update/route.ts` — Update venue
- [ ] `app/api/admin/approve-submission/route.ts` — Approve submission
- [ ] `app/api/admin/review-claim/route.ts` — Review claim
- [ ] `app/api/admin/review-correction/route.ts` — Review correction

### Scripts (will NOT migrate - keep Prisma for scripts or convert later)
- `prisma/seed.ts`
- `scripts/seed-real-data.ts`
- `scripts/backfill-hardware-brands.ts`
- `scripts/backfill-software-slugs.ts`
- `scripts/update-zip-email.ts`
- `scripts/analyze-categories.ts`

---

## Query Translation Cheat Sheet

| Prisma | Supabase SDK |
|--------|-------------|
| `db.venue.findMany()` | `supabase.from('venues').select('*')` |
| `db.venue.findUnique({ where: { slug } })` | `supabase.from('venues').select('*').eq('slug', slug).single()` |
| `db.venue.findMany({ where: { status: 'active' } })` | `supabase.from('venues').select('*').eq('status', 'active')` |
| `db.venue.findMany({ where: { city: { equals: x, mode: 'insensitive' } } })` | `supabase.from('venues').select('*').ilike('city', x)` |
| `db.venue.findMany({ where: { tags: { has: 'x' } } })` | `supabase.from('venues').select('*').contains('tags', ['x'])` |
| `db.venue.findMany({ where: { OR: [...] } })` | `supabase.from('venues').select('*').or('name.ilike.%q%,zip_code.ilike.%q%')` |
| `db.venue.findMany({ orderBy: { rating: 'desc' } })` | `supabase.from('venues').select('*').order('rating_overall', { ascending: false })` |
| `db.venue.findMany({ take: 10, skip: 20 })` | `supabase.from('venues').select('*').range(20, 29)` |
| `db.venue.count({ where })` | `supabase.from('venues').select('*', { count: 'exact', head: true }).eq(...)` |
| `db.venue.create({ data })` | `supabase.from('venues').insert(data).select().single()` |
| `db.venue.update({ where, data })` | `supabase.from('venues').update(data).eq('id', id).select().single()` |
| `db.venue.delete({ where })` | `supabase.from('venues').delete().eq('id', id)` |
| `include: { venue: true }` | `.select('*, venues(*)')` |

### Column Names: camelCase (NO mapping needed!)

Prisma created the database with **camelCase column names**. The Supabase SDK will use the exact same names. No column name translation required!

Examples: `venueType`, `zipCode`, `heroImage`, `ratingOverall`, `createdAt`, etc.

> **Verified against live database schema on 2026-02-10.**

---

## Detailed Migration Phases

### SETUP (Tasks #2-4)

#### Task #2: Install Supabase packages
```bash
npm install @supabase/supabase-js @supabase/ssr
```

Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL="https://jemhiomfwpjwrkkeefmk.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-anon-key>"
```

#### Task #3: Generate TypeScript types from Supabase
```bash
npx supabase gen types typescript --project-id jemhiomfwpjwrkkeefmk > types/supabase.ts
```

#### Task #4: Create Supabase client utilities
Create `lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export function createSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

### PHASE 1: Authentication (Tasks #5-6)

#### Task #5: Migrate lib/auth.ts
Change `db.user.findUnique()` → `supabase.from('users').select().eq().single()`

#### Task #6: Manual test
- [ ] Login with existing credentials
- [ ] Verify session persists
- [ ] Logout and login again
- [ ] Check dashboard access

---

### PHASE 2: Homepage (Tasks #7-8)

#### Task #7: Migrate app/page.tsx
Convert featured venues query and state/city data queries.

#### Task #8: Manual test
- [ ] Homepage loads without errors
- [ ] Featured venues display correctly
- [ ] Venue cards show proper data
- [ ] Links work

---

### PHASE 3: Search (Tasks #9-10)

#### Task #9: Migrate app/search/page.tsx
Convert search with text search, filters, sorting, and pagination.

#### Task #10: Manual test
- [ ] Text search works
- [ ] State/city filter works
- [ ] Pagination works
- [ ] Result count is accurate

---

### PHASE 4: Venue Detail (Tasks #11-12)

#### Task #11: Migrate venue detail page
Convert single venue query by slug.

#### Task #12: Manual test
- [ ] Venue page loads
- [ ] All data displays correctly
- [ ] Related venues show
- [ ] Save/report buttons work

---

### PHASE 5: City/State Pages (Tasks #13-14)

#### Task #13: Migrate city and state index pages
Convert `app/venue/us/page.tsx`, `app/venue/us/[state]/page.tsx`, `app/venue/us/[state]/[city]/page.tsx`.

#### Task #14: Manual test
- [ ] State listing page loads
- [ ] City listing page loads
- [ ] Venue counts correct
- [ ] Browse categories work

---

### PHASE 6: Category Pages (Tasks #15-16)

#### Task #15: Migrate global best/* pages
Convert all 7 category page types under `app/best/`.

#### Task #16: Manual test
- [ ] Vibe pages work
- [ ] Hardware pages work
- [ ] Software pages work
- [ ] All other categories work

---

### PHASE 7: Dashboard (Tasks #17-18)

#### Task #17: Migrate dashboard page
Convert favorites (with venue join), claimed venues, submissions.

#### Task #18: Manual test
- [ ] Dashboard loads
- [ ] Favorites display with venue info
- [ ] Submissions list shows
- [ ] Edit links work

---

### PHASE 8: Venue Editing (Tasks #19-20)

#### Task #19: Migrate venue edit pages
Convert edit form data fetching and update mutations.

#### Task #20: Manual test
- [ ] Edit form loads with data
- [ ] Can save changes
- [ ] Validation works
- [ ] Data updates in database

---

### PHASE 9: API Routes (Tasks #21-25)

#### Task #21: Migrate venue API routes
Convert `app/api/venues/route.ts` and `app/api/venues/cities/route.ts`.

#### Task #22: Migrate admin API routes
Convert all routes in `app/api/admin/`.

#### Task #23: Migrate auth register route
Convert `app/api/auth/register/route.ts`.

#### Task #24: Migrate venue action routes
Convert favorite, claim, corrections, update routes.

#### Task #25: Manual test
- [ ] Registration works
- [ ] Favorite toggle works
- [ ] Correction submission works
- [ ] Admin approvals work

---

### PHASE 10: Remaining Pages (Tasks #26-30)

#### Task #26: Migrate claim, admin, sitemap pages

#### Task #27: Migrate city-level category pages
All `app/venue/us/[state]/[city]/best/*` pages.

#### Task #28: Migrate lib/best-by-data.ts
Shared data helper used by category pages.

#### Task #29: Migrate venue detail + report pages

#### Task #30: Manual test
- [ ] Admin pages load
- [ ] City category pages work
- [ ] Report form works
- [ ] Sitemap generates

---

### PHASE 11: Type Cleanup (Task #31)

#### Task #31: Replace Prisma types
Update `types/index.ts` to use Supabase generated types. Create type aliases.

---

### PHASE 12: Full Regression Test (Task #32)

#### Task #32: Complete app test
- [ ] Homepage
- [ ] Search (text, filters, pagination)
- [ ] Every venue detail page type
- [ ] City/state pages
- [ ] All category pages (global + city-level)
- [ ] Dashboard (favorites, submissions)
- [ ] Venue editing
- [ ] Admin panel (claims, corrections, submissions)
- [ ] Auth flow (register, login, logout)
- [ ] API routes (favorite, claim, correction)
- [ ] Sitemap generation
- [ ] No console errors
- [ ] No TypeScript errors (`npm run build`)

---

### PHASE 13: Remove Prisma (Task #33)

#### Task #33: Final cleanup
- [ ] Remove `@prisma/client` from package.json
- [ ] Remove `prisma` from package.json
- [ ] Remove `@auth/prisma-adapter` from package.json
- [ ] Delete `prisma/` directory (keep a backup)
- [ ] Delete `lib/db.ts`
- [ ] Delete `lib/mock-db.ts`
- [ ] Remove Prisma scripts from package.json (`db:generate`, `db:migrate`, `db:push`, `db:studio`, `db:seed`)
- [ ] Remove `DIRECT_URL` from `.env` and `.env.local`
- [ ] Run `npm install` to clean lockfile
- [ ] Final `npm run build` to verify no errors
- [ ] Test dev server one more time

---

## Rollback Plan

If anything goes wrong during migration:

1. **Per-file rollback:** Each file is migrated individually. If a file breaks, revert just that file to use `db` import.
2. **Full rollback:** Since Prisma stays installed until Phase 13, you can revert all changes and go back to Prisma at any time.
3. **Git safety:** Commit after each phase so you can `git revert` any phase.

---

## Environment Variables (Final State)

```env
# Supabase (replaces DATABASE_URL)
NEXT_PUBLIC_SUPABASE_URL="https://jemhiomfwpjwrkkeefmk.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-anon-key>"

# NextAuth (unchanged)
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Stripe (unchanged)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## Success Criteria

- [ ] All pages load without errors
- [ ] All CRUD operations work
- [ ] Authentication works
- [ ] Search works with filters and pagination
- [ ] `npm run build` succeeds with zero errors
- [ ] No Prisma dependencies remain
- [ ] No `P1001` connection errors ever again

# GolfSimMap - Agent Documentation

This document provides essential information for AI coding agents working on the GolfSimMap project.

## Project Overview

**GolfSimMap** is a programmatic SEO-driven directory for indoor golf simulator venues across the United States. The application generates ~12,000 auto-generated pages (cities, states, venues, categories) with comprehensive venue data, user features, and monetization capabilities.

### Core Purpose
- Help golfers find indoor golf simulator venues near them
- Compare launch monitors (TrackMan, Foresight, Uneekor, etc.)
- Allow business owners to claim and manage their listings
- Generate SEO-optimized content for organic discovery

### Production URL
https://golfsimmap.com

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui + Radix UI |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| ORM | Prisma |
| Icons | Lucide React |
| Animation | Framer Motion |
| Payments | Stripe (optional) |
| Fonts | Space Grotesk + JetBrains Mono |

---

## Project Structure

```
my-app/
├── app/                          # Next.js App Router
│   ├── (seo)/                    # SEO route group (legacy)
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin endpoints (approve, review)
│   │   ├── auth/register/        # User registration
│   │   └── venues/               # Venue CRUD endpoints
│   ├── admin/                    # Admin dashboard pages
│   ├── best/                     # Global category pages
│   │   ├── [tag]/                # Tag-based listings
│   │   ├── vibe/[vibe]/          # Vibe category pages
│   │   ├── hardware/[brand]/     # Hardware brand pages
│   │   └── ...
│   ├── dashboard/                # User dashboard
│   ├── launch-monitors/          # Launch monitor guide pages
│   ├── search/                   # Search page (dynamic)
│   ├── submit/                   # Venue submission form
│   ├── venue/us/                 # Venue browse hierarchy
│   │   ├── [state]/              # State pages
│   │   ├── [state]/[city]/       # City pages
│   │   └── [state]/[city]/[venueSlug]/  # Venue detail pages
│   ├── about/                    # About page
│   ├── contact/                  # Contact page
│   ├── layout.tsx                # Root layout with fonts
│   ├── page.tsx                  # Homepage
│   ├── sitemap.ts                # Dynamic sitemap
│   └── robots.ts                 # Robots.txt
├── components/
│   ├── auth-provider.tsx         # Auth context provider
│   ├── navbar.tsx                # Navigation bar
│   ├── footer.tsx                # Footer
│   ├── home/                     # Homepage sections
│   ├── venue/                    # Venue-related components
│   ├── seo/                      # SEO components (schemas, breadcrumbs)
│   ├── ui/                       # UI components (badges, buttons)
│   └── design/                   # Design system components
├── lib/
│   ├── supabase.ts               # Server-side Supabase client
│   ├── supabase/client.ts        # Browser Supabase client
│   ├── supabase/server.ts        # Server client with cookies
│   ├── auth.ts                   # Authentication helpers
│   ├── utils.ts                  # Utility functions (cn)
│   ├── states.ts                 # State mappings
│   ├── best-by.ts                # Category matching functions
│   ├── best-by-config.ts         # Category configuration
│   ├── hardware-brands.ts        # Hardware normalization
│   ├── software-slugs.ts         # Software normalization
│   └── category-config.generated.ts  # Auto-generated category counts
├── types/
│   ├── index.ts                  # TypeScript type definitions
│   └── supabase.ts               # Auto-generated Supabase types
├── enriched_venues/              # JSON venue data (~3,000 files)
├── proxy.ts                      # Next.js proxy (auth, redirects)
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript config
├── postcss.config.mjs            # PostCSS config (Tailwind 4)
├── components.json               # shadcn/ui config
└── package.json                  # Dependencies
```

---

## Key Files Reference

### Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js config - image domains, compression, security headers |
| `tsconfig.json` | TypeScript - strict mode, path aliases (`@/*`) |
| `postcss.config.mjs` | Tailwind CSS 4 with @tailwindcss/postcss |
| `components.json` | shadcn/ui - New York style, slate base color |
| `proxy.ts` | Cookie handling, underscore→hyphen 301 redirects |

### Database Schema (Supabase)

**Main Tables:**
- `venues` - Golf simulator venues (60+ fields)
- `users` - User accounts with roles (golfer, business_owner, admin)
- `favorites` - Saved venue associations
- `correction_reports` - User-reported data corrections
- `submissions` - Pending venue submissions
- `claim_requests` - Venue ownership claims
- `featured_listings` - Paid featured placements

**Key Enums:**
- `UserRole`: golfer, business_owner, admin
- `VenueType`: sim_bar, training_studio, private_rental, etc.
- `LaunchMonitorType`: radar, photometric_camera, hybrid, unknown
- `SubmissionStatus`: pending, approved, rejected

**Database Functions:**
- `get_state_venue_counts()` - Returns state + count pairs
- `get_city_venue_counts(limit)` - Returns city + state + count
- `get_cities_in_state(target_state)` - Cities in a state
- `get_distinct_states()` - All unique states
- `get_distinct_cities()` - All unique city/state pairs
- `get_nearby_cities(target_state, exclude_city, limit)` - Nearby cities

### Design System (CSS Variables)

```css
/* Core Colors - Solid only, no gradients */
--deep-black: hsl(0 0% 4%)      /* Primary background */
--charcoal: hsl(220 15% 10%)    /* Card background */
--slate: hsl(220 10% 18%)       /* Secondary surfaces */
--forest: hsl(145 60% 18%)      /* Dark accent */
--masters-green: hsl(145 70% 30%)  /* Primary action */
--sunday-red: hsl(350 85% 45%)  /* Destructive/accent */
--cream: hsl(43 40% 96%)        /* Primary text */
--cool-gray: hsl(220 10% 65%)   /* Muted text */
--muted-gold: hsl(43 60% 55%)   /* Highlights */
```

**Typography:**
- Display: `clamp(3rem, 8vw, 5rem)` - Hero headlines
- h1: `clamp(1.75rem, 3vw, 2.5rem)` - Page titles
- h2: `clamp(1.5rem, 2.5vw, 2rem)` - Section headers
- h3: `clamp(1.25rem, 2vw, 1.5rem)` - Subsection headers
- Body: Space Grotesk, 500 weight, 1.6 line-height
- Monospace: JetBrains Mono - For data/numbers

---

## Build and Development Commands

```bash
# Development
npm run dev              # Start dev server on localhost:3000

# Production
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint

# Database Operations
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:push          # Push schema changes (uses --accept-data-loss)
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed sample data

# Data Import Scripts
npm run db:import:venues -- --data-dir=./enriched_venues --mode=upsert
npm run db:backfill:hardware-brands
npm run db:backfill:software-slugs
npm run categories:analyze
```

---

## Rendering Strategy

The app uses 3 rendering modes for optimal performance:

### 1. Static (`force-static`)
Index-style category pages that don't need live data every request.

### 2. ISR with 24h Revalidation (`revalidate = 86400`)
Heavy listing/detail pages cached for 24 hours:
- `app/venue/us/page.tsx`
- `app/venue/us/[state]/page.tsx`
- `app/venue/us/[state]/[city]/page.tsx`
- `app/venue/us/[state]/[city]/[venueSlug]/page.tsx`
- All category pages under `/best/` and `/venue/.../best/`

### 3. Dynamic (`force-dynamic`)
- `app/search/page.tsx` - Live filtering requires fresh data
- API routes

---

## URL Structure

| Page Type | URL Pattern |
|-----------|-------------|
| Home | `/` |
| Search | `/search` |
| State | `/venue/us/:state` |
| City | `/venue/us/:state/:city` |
| Venue Detail | `/venue/us/:state/:city/:venueSlug` |
| Best By Tag | `/best/:tag` |
| Best By Vibe | `/venue/us/:state/:city/best/vibe/:vibe` |
| Best By Hardware | `/venue/us/:state/:city/best/hardware/:brand` |
| Best By Segment | `/venue/us/:state/:city/best/who-its-for/:segment` |
| Submit Venue | `/submit` |
| Claim Venue | `/claim` |
| Dashboard | `/dashboard` |
| Launch Monitors | `/launch-monitors` |

---

## Code Patterns

### Supabase Queries

```typescript
// Server-side query (with service role)
import { supabase } from "@/lib/supabase";

const { data, error } = await supabase
  .from("venues")
  .select("id, name, city, state")
  .eq("status", "active")
  .order("ratingOverall", { ascending: false, nullsFirst: false })
  .limit(10);

// Client-side with auth
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
```

### Auth Checks

```typescript
import { getUser, requireAuth, requireAdmin } from "@/lib/auth";

// Get current user (or null)
const user = await getUser();

// Require auth (redirects to /login if not authenticated)
const user = await requireAuth();

// Require admin (redirects to / if not admin)
const admin = await requireAdmin();
```

### Path Aliases

All imports use `@/` prefix mapped to project root:
```typescript
import { VenueCard } from "@/components/venue/VenueCard";
import { supabase } from "@/lib/supabase";
import type { Venue } from "@/types";
```

### Venue List Item Selection

For list/card views, use `VENUE_CARD_FIELDS` constant:
```typescript
import { VENUE_CARD_FIELDS } from "@/lib/supabase";

const { data } = await supabase
  .from("venues")
  .select(VENUE_CARD_FIELDS)
  .eq("status", "active");
```

---

## SEO Requirements

Every page must include:

1. **Metadata export**
```typescript
export const metadata: Metadata = {
  title: "Page Title | GolfSimMap",
  description: "Compelling meta description 150-160 chars",
};
```

2. **Canonical URL** (in page component)
```typescript
export default function Page() {
  return (
    <>
      <link rel="canonical" href="https://golfsimmap.com/page-path" />
      {/* ... */}
    </>
  );
}
```

3. **Structured Data** (when applicable)
- Use `VenueSchema` for venue detail pages
- Use `CitySchema` for city pages  
- Use `OrganizationSchema` for homepage
- Use `Breadcrumbs` component for navigation paths

---

## Testing Strategy

**Current State:** No automated test suite is configured.

**Manual Testing Checklist:**
1. Search page responds with live results
2. Venue detail pages load with complete data
3. City/state pages show correct venue counts
4. Category filtering works correctly
5. Auth flows (login, register, logout)
6. Admin operations (approve submissions, review claims)
7. Mobile responsiveness (375px, 768px, 1024px+)

**Type Checking:**
```bash
npx tsc --noEmit
```

---

## Security Considerations

### Authentication
- Supabase Auth with email/password
- Server-side session validation in middleware
- Role-based access control (RBAC) via `public.users.role`
- Service role key only used server-side

### Data Access
- RLS policies enforced on all tables
- Service role bypasses RLS (admin operations only)
- User data isolation via `userId` filters

### Input Validation
- Use TypeScript strict mode
- Sanitize user inputs before database queries
- SQL injection prevention via Prisma/Supabase query builders

### Environment Variables
Required in `.env.local`:
```
DATABASE_URL              # Supabase pooler URL
DIRECT_URL                # Direct connection for migrations
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY # Server-side only
```

### Image Security
- Remote images restricted to known domains:
  - `images.unsplash.com`
  - `lh3.googleusercontent.com`
  - `*.cloudfront.net`
- Next.js Image optimization enabled

---

## Common Tasks

### Adding a New Venue Category

1. Add category to appropriate config in `lib/best-by-config.ts`
2. Add matching function in `lib/best-by.ts` if needed
3. Create page under `app/venue/us/[state]/[city]/best/`
4. Run `npm run categories:analyze` to regenerate counts

### Importing New Venues

1. Add JSON files to `enriched_venues/`
2. Dry run: `npm run db:import:venues -- --mode=upsert --dry-run`
3. Import: `npm run db:import:venues -- --mode=upsert`
4. Backfill hardware: `npm run db:backfill:hardware-brands`
5. Backfill software: `npm run db:backfill:software-slugs`
6. Analyze: `npm run categories:analyze`

### Creating New API Routes

Place in `app/api/` with route.ts:
```typescript
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Implementation
  return NextResponse.json({ data });
}
```

### Adding Database Columns

1. Update Supabase schema via SQL Editor or migrations
2. Regenerate types: `npx supabase gen types --lang=typescript > types/supabase.ts`
3. Update Prisma schema if using Prisma
4. Run `npm run db:generate`

---

## Performance Guidelines

1. **Always use field selection** - Don't `select(*)` on large tables
2. **Use ISR caching** - Set `revalidate = 86400` on browse pages
3. **Paginate large lists** - Default 20 items, max 50
4. **Use database functions** - For aggregations (counts, etc.)
5. **Minimize client JS** - Prefer Server Components
6. **Image optimization** - Use Next.js Image with proper sizing

---

## Troubleshooting

### Database Connection Issues
- Check pooler URL format in `.env.local`
- Verify `connection_limit=1` for free tier
- Use SQL Editor fallback for schema changes if `db:push` fails

### Type Errors
- Run `npx tsc --noEmit` to check all files
- Regenerate Supabase types if schema changed
- Check `skipLibCheck: true` in tsconfig.json

### Build Failures
- Ensure all env vars are set
- Check for client components using server-only imports
- Verify no circular dependencies

---

## File Naming Conventions

- **Pages:** `page.tsx` in route folders
- **Layouts:** `layout.tsx` in route folders
- **API Routes:** `route.ts` in API folders
- **Components:** PascalCase (e.g., `VenueCard.tsx`)
- **Utilities:** camelCase (e.g., `best-by.ts`)
- **Types:** PascalCase with descriptive names

---

## Dependencies to Know

| Package | Purpose |
|---------|---------|
| `@supabase/ssr` | Server-side Supabase with cookie handling |
| `@supabase/supabase-js` | Core Supabase client |
| `framer-motion` | Page transitions and animations |
| `lucide-react` | Consistent icon set |
| `class-variance-authority` | Component variant management |
| `tailwind-merge` + `clsx` | Conditional class merging |
| `stripe` | Payment processing |

---

## Documentation Files

| File | Content |
|------|---------|
| `README.md` | Project overview and quick start |
| `CACHE-SETUP-SUPABASE.md` | Caching strategy and database operations |
| `SEO-CONTENT-PLAN.md` | SEO strategy and content planning |
| `MIGRATION-PLAN.md` | Database migration history |
| `AUDIT-REPORT-2026-02-05.md` | Code audit findings |
| `tasks/prd-golfsim-mvp-directory.md` | Product requirements |

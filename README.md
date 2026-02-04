# Find Golf Simulators - Next.js Directory

A programmatic SEO-driven golf simulator directory built with Next.js 14, Prisma, and Supabase.

## Features

- **SEO-First**: ~12,000 auto-generated pages (cities, states, venues, categories)
- **User Roles**: Golfers (save favorites) | Business Owners (claim listings)
- **Venue Features**: Submit venues, report corrections, save favorites
- **Monetization**: Featured listings, claim verification
- **Schema**: Two-tier data (MVP public + comprehensive for claimed)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- NextAuth.js (email/password)
- Tailwind CSS + shadcn/ui
- Stripe (featured listings)

## Getting Started

### 1. Setup Environment

```bash
# Copy env file
cp .env.local.example .env.local

# Fill in your Supabase credentials
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
NEXTAUTH_SECRET="openssl rand -base64 32"
```

### 2. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
app/
├── (seo)/                     # SEO route group
│   ├── locations/[country]/[state]/[city]/page.tsx  # City pages
│   ├── venue/[slug]/page.tsx   # Venue detail pages
│   └── best/[category]/[city]/page.tsx  # Category pages
├── api/
│   ├── auth/[...nextauth]/     # Authentication
│   └── venues/                  # Venue API routes
├── dashboard/                   # User dashboard
├── login/                       # Login page
├── submit/                      # Submit venue
└── page.tsx                     # Home page

components/
├── venue/                       # Venue components
│   ├── VenueCard.tsx
│   ├── VenueList.tsx
│   └── VenueDetail.tsx
├── seo/                         # SEO components
│   ├── VenueSchema.tsx          # JSON-LD
│   ├── CitySchema.tsx
│   └── Breadcrumbs.tsx
├── navbar.tsx
└── footer.tsx

lib/
├── auth.ts                      # NextAuth config
├── db.ts                        # Prisma client
└── utils.ts

prisma/
└── schema.prisma                # Database schema

scripts/
└── seed.ts                      # Sample data

```

## URL Structure

| Page | URL |
|------|-----|
| Home | `/` |
| Venue Detail | `/venue/:slug` |
| City | `/locations/us/:state/:city` |
| State | `/locations/us/:state` |
| Category | `/best/:category/:city` |
| Submit | `/submit` |
| Claim | `/claim` |
| Dashboard | `/dashboard` |

## SEO Features

- Programmatic page generation for 10k+ venues
- JSON-LD structured data (LocalBusiness, Breadcrumbs)
- Dynamic meta titles/descriptions
- XML sitemap generation
- Canonical URLs

## User Features

| Feature | Golfer | Business Owner |
|---------|--------|----------------|
| Submit Venue | ✅ | ✅ |
| Report Correction | ✅ | ✅ |
| Save Favorites | ✅ | ❌ |
| Claim Listing | ❌ | ✅ |
| Edit Listing | ❌ | ✅ |
| Featured Listing | ❌ | 💰 Paid |

## Database Schema

See `prisma/schema.prisma` for full schema.

Key models:
- `Venue` - Golf simulator venues
- `User` - Golfers & business owners
- `Favorite` - Saved venues
- `CorrectionReport` - User-reported corrections
- `Submission` - Pending venue submissions
- `FeaturedListing` - Paid featured placements

## Next Steps

1. **Connect Supabase**: Update DATABASE_URL in .env.local
2. **Add Stripe keys**: For featured listings payments
3. **Import 10k venues**: Use your enriched data
4. **Deploy to Vercel**: Connect GitHub repo
5. **Submit to Google**: For indexing

## Scripts

```bash
# Database
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:push        # Push schema changes
npm run db:studio      # Open Prisma Studio
npm run db:seed        # Seed sample data

# Development
npm run dev            # Start dev server
npm run build          # Build for production
```

## License

Private - All rights reserved.

# Product Requirements Document: GolfSim Directory MVP - SEO Pages

## Overview

**Project:** GolfSimMap - Golf Simulator Directory  
**Feature:** SEO-First Programmatic Pages MVP  
**Status:** Complete & Ready for Review  

---

## Scope

This MVP delivers a programmatic SEO foundation for the GolfSimMap directory, enabling thousands of auto-generated pages for discoverability across search engines.

### In Scope

1. **Location-Based Pages**
   - `/venue/us` - US states index
   - `/venue/us/:state` - State pages with city listings
   - `/venue/us/:state/:city` - City pages with venue listings

2. **Category/Best-By Pages**
   - `/best/:tag` - Filter by tag (simulator-bar, training, corporate-events, etc.)
   - `/best/vibe/:vibe` - Filter by atmosphere (upscale, casual, family-friendly, etc.)
   - `/best/who-its-for/:segment` - Filter by audience (beginners, corporate-groups, etc.)
   - `/best/hardware/:brand` - Filter by simulator brand (trackman, foresight, etc.)
   - `/best/software/:software` - Filter by software (gspro, tgc2019, e6, etc.)
   - `/best/launch-monitor/:type` - Filter by monitor type (radar, camera, hybrid)
   - `/best/amenities/:amenity` - Filter by amenities (food, alcohol, parking, etc.)

3. **Search & Discovery**
   - `/search` - Search interface page
   - `/api/search` - Search API endpoint with multi-filter support

4. **Venue Detail Enhancements**
   - JSON-LD structured data (VenueSchema)
   - Related venues section
   - Proper breadcrumb navigation

5. **SEO Components**
   - Reusable SEO section components (Overview, Guidance, Methodology, FAQ, CTA)
   - Pagination component
   - Breadcrumb navigation

### Out of Scope (Future Phases)

- XML sitemap generation (automated)
- Complete static generation for all 12,000+ pages
- Featured listings payment integration
- Advanced caching layer
- Real-time availability APIs

---

## Acceptance Criteria

### Location Pages

| Criteria | Status |
|----------|--------|
| State pages display all cities with venue counts | ✅ |
| City pages show paginated venue listings (12 per page) | ✅ |
| Dynamic meta titles include venue counts | ✅ |
| FAQ sections tailored to location | ✅ |
| Nearby cities/states cross-linking | ✅ |

### Category Pages

| Criteria | Status |
|----------|--------|
| Tag-based filtering with flexible matching | ✅ |
| Hardware brand detection from simulator systems | ✅ |
| Vibe matching with semantic mappings | ✅ |
| Audience segment filtering | ✅ |
| Empty states handled gracefully (404) | ✅ |

### Technical Requirements

| Criteria | Status |
|----------|--------|
| ISR with 60s revalidation | ✅ |
| Static params for build-time generation | ✅ |
| Prisma queries optimized with indexes | ✅ |
| TypeScript types throughout | ✅ |
| Mobile-responsive layouts | ✅ |

---

## Routes Reference

### Public Routes

```
/                          # Home (featured venues)
/venue/us                  # US states index
/venue/us/:state           # State page (e.g., /venue/us/illinois)
/venue/us/:state/:city     # City page (e.g., /venue/us/illinois/chicago)
/venue/us/:state/:city/:slug  # Venue detail

/best/:tag                 # By tag (simulator-bar, training, etc.)
/best/vibe/:vibe           # By atmosphere
/best/who-its-for/:segment # By audience
/best/hardware/:brand      # By simulator brand
/best/software/:software   # By software
/best/launch-monitor/:type # By monitor type
/best/amenities/:amenity   # By amenity

/search                    # Search interface
/submit                    # Submit venue
/claim                     # Claim listing
/login                     # Authentication
/register                  # Registration
/dashboard                 # User dashboard
```

### API Routes

```
/api/search                # GET - Search/filter venues
/api/venues                # GET/POST - Venue CRUD
/api/venues/:id/favorite   # POST/DELETE - Favorites
/api/venues/:id/claim      # POST - Claim listing
/api/venues/:id/corrections # POST - Report corrections
/api/auth/[...nextauth]    # NextAuth.js
/api/auth/register         # POST - User registration
```

---

## Key Components

### SEO Section Components (`components/seo/SeoIndexSections.tsx`)

- `OverviewSection` - Location intro with stats and highlights
- `GuidanceSection` - "What to Know Before You Go" tips
- `MethodologySection` - How venues are verified/categorized
- `NearbySection` - Cross-linking to nearby locations
- `RelatedSection` - Related category links
- `FAQSection` - Structured FAQ for rich snippets
- `CTASection` - Owner claim/submit call-to-action
- `Pagination` - Page navigation with ellipsis

### Page Content Component (`components/seo/BestByPageContent.tsx`)

Reusable client component for all category pages with:
- Breadcrumb navigation
- Filter indicator tags
- Venue grid with cards
- Pagination
- SEO sections

### Filtering Library (`lib/best-by.ts`)

Flexible filtering functions:
- `matchesTag()` - Tag matching with venue type fallback
- `matchesVibe()` - Semantic vibe matching
- `matchesWhoItsFor()` - Audience segment detection
- `matchesHardware()` - Brand detection from systems
- `matchesSoftware()` - Software detection
- `matchesLaunchMonitorType()` - Monitor type classification
- `matchesAmenity()` - Amenity boolean checks

---

## QA Checklist

### Functionality

- [x] State pages load with correct city counts
- [x] City pages paginate correctly (12 venues/page)
- [x] Category pages filter venues accurately
- [x] Empty filter results return 404
- [x] Search API returns paginated results
- [x] Venue detail shows related venues
- [x] Breadcrumbs render correctly on all pages

### SEO

- [x] Meta titles include venue counts
- [x] Meta descriptions are unique per page
- [x] JSON-LD structured data on venue pages
- [x] Semantic HTML with proper heading hierarchy
- [x] Canonical URLs ready for implementation

### Performance

- [x] ISR revalidation set to 60s
- [x] Database queries use proper indexes
- [x] Static generation for common paths
- [x] Pagination limits query results

### UX

- [x] Mobile-responsive layouts
- [x] Loading states handled
- [x] Error boundaries in place
- [x] Empty states with helpful CTAs

---

## Files Changed

### Modified (4 files)
- `app/page.tsx` - Updated to show only featured venues
- `app/venue/us/[state]/page.tsx` - Enhanced state page with SEO sections
- `app/venue/us/[state]/[city]/page.tsx` - Enhanced city page with pagination
- `app/venue/us/[state]/[city]/[venueSlug]/page.tsx` - Added schema + related venues

### New (16 files)
- `app/api/search/route.ts` - Search API
- `app/search/page.tsx` - Search page
- `app/best/[tag]/page.tsx` - Tag filter pages
- `app/best/vibe/[vibe]/page.tsx` - Vibe filter pages
- `app/best/who-its-for/[segment]/page.tsx` - Audience filter pages
- `app/best/hardware/[brand]/page.tsx` - Hardware filter pages
- `app/best/software/[software]/page.tsx` - Software filter pages
- `app/best/launch-monitor/[type]/page.tsx` - Monitor type pages
- `app/best/amenities/[amenity]/page.tsx` - Amenity filter pages
- `app/claim/page.tsx` - Claim listing page
- `app/venue/us/[state]/[city]/best/[tag]/page.tsx` - City-scoped tag pages
- `app/venue/us/[state]/[city]/best/hardware/[brand]/page.tsx` - City hardware filter
- `app/venue/us/[state]/[city]/best/vibe/[vibe]/page.tsx` - City vibe filter
- `app/venue/us/[state]/[city]/best/who-its-for/[segment]/page.tsx` - City audience filter
- `components/seo/SeoIndexSections.tsx` - SEO section components
- `components/seo/BestByPageContent.tsx` - Category page template
- `lib/best-by.ts` - Filtering utilities

---

## Next Steps

1. **Data Import** - Import venue dataset into production database
2. **Sitemap Generation** - Build automated sitemap.xml generator
3. **Analytics** - Add Google Analytics + Search Console tracking
4. **Performance Monitoring** - Implement Core Web Vitals tracking
5. **Content Expansion** - Add more static params for broader coverage

---

## Notes

- Static params are configured for initial high-value locations (IL, NY, CA, TX, FL)
- Category pages use in-memory filtering for complex matching
- ISR ensures pages stay fresh without full rebuilds
- All filtering functions include semantic mappings for better matching

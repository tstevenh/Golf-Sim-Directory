# Venue Data Scripts

## Quick Start

All scripts run from the `my-app/` directory.

```bash
cd my-app

# 1. Upload new venues
npx tsx scripts/upload-venues.ts /path/to/venue-json-folder --dry-run   # preview
npx tsx scripts/upload-venues.ts /path/to/venue-json-folder             # insert

# 2. Backfill hardwareBrands & softwareSlugs for any venues missing them
npx tsx scripts/backfill-hardware-software.ts --dry-run                 # preview
npx tsx scripts/backfill-hardware-software.ts                           # apply

# 3. Regenerate category counts (used by /best/* pages)
npx tsx scripts/analyze-categories.ts
```

### After every new venue import, run all 3 in order:

```bash
npx tsx scripts/upload-venues.ts /path/to/new-venues
npx tsx scripts/backfill-hardware-software.ts
npx tsx scripts/analyze-categories.ts
```

## Prerequisites

- Node.js 18+
- `.env.local` in the `my-app/` directory with:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

The script reads `.env.local` automatically — no extra setup needed.

## JSON File Format

Each venue is a single `.json` file. The filename doesn't matter (slugs are generated from the venue name).

```json
{
  "name": "Example Golf Club",
  "address": "123 Main St, Springfield, IL 62701",
  "city": "Springfield",
  "region": "IL",
  "country": "US",
  "latitude": 39.7817,
  "longitude": -89.6501,
  "phone": "+12175551234",
  "email": "info@example.com",
  "website": "https://example.com",
  "hero_image": "https://...",
  "google_maps_url": "https://www.google.com/maps/place/...",
  "google_rating": 4.5,
  "place_id": "ChIJ...",
  "sim_golf_status": "true",
  "venue_type": "sim_bar",
  "about": "Description of the venue...",
  "tags": "beginner_friendly|coaching_available|food_and_drinks",
  "vibe_tags": "sports_bar|casual|welcoming",
  "who_its_for": "beginners|families|corporate_teams",
  "why_golfers_like_it": ["Reason 1", "Reason 2"],
  "kid_friendly": true,
  "food_and_drink": [
    { "type": "food", "available": true, "notes": "Full kitchen" },
    { "type": "alcohol", "available": true, "notes": "Full bar" }
  ],
  "simulator_hardware": [
    { "brand": "Trackman", "model": "iO", "notes": "..." }
  ],
  "simulator_software": ["GSPro", "E6 Connect"],
  "launch_monitor_type": "radar",
  "ball_tracking": true,
  "club_tracking": true,
  "putting_mode": "unknown",
  "lefty_friendly": true,
  "bay_count_total": 6,
  "booking_url": "https://example.com/book",
  "pricing_model": "per_bay_hour",
  "price_range_min_local": 40,
  "price_range_max_local": 75,
  "currency": "USD",
  "walk_ins_allowed": true,
  "coaching_available": true,
  "private_rooms_count": 2,
  "max_group_size_per_bay": 6,
  "amenities_list": "club_rentals|wifi|pro_shop",
  "rating_tech_quality": 4.8,
  "rating_facility_comfort": 4.7,
  "rating_value_for_money": 4.6,
  "rating_overall": 4.7,
  "faq": [
    { "question": "Do I need my own clubs?", "answer": "No, rentals available." }
  ],
  "opening_hours": "{\"Monday\": [\"9AM-9PM\"], \"Tuesday\": [\"9AM-9PM\"]}"
}
```

### Field Notes

| Field | Type | Notes |
|---|---|---|
| `name` | string | **Required.** Used for slug generation. |
| `address` | string | Full address with city, state, zip. Street part is extracted for the DB `address` column; zip is parsed into `zipCode`. |
| `region` | string | State abbreviation (e.g. `"IL"`) or full name (e.g. `"Illinois"`). |
| `venue_type` | enum | One of: `sim_bar`, `training_studio`, `private_rental`, `retail_fitting_center`, `country_club`, `multi_sport_sim`, `hotel_resort`, `indoor_golf_center`, `entertainment_venue`, `golf_performance_center`, `bar`, `other`. Defaults to `other`. |
| `pricing_model` | enum | One of: `per_bay_hour`, `per_person_hour`, `package`, `membership_only`, `mixed`, `unknown`. |
| `launch_monitor_type` | enum | One of: `radar`, `photometric_camera`, `hybrid`, `unknown`. |
| `tags`, `vibe_tags`, `who_its_for`, `amenities_list` | string | Pipe-delimited values (e.g. `"tag1\|tag2\|tag3"`). |
| `simulator_software` | string[] | Raw software names. The script normalizes them to canonical slugs (e.g. `"GS Pro"` → `gspro`, `"E6 Connect"` → `e6`). |
| `simulator_hardware` | object[] | Array of `{ brand, model, notes }`. Brands are normalized (e.g. `"Foresight"` → `foresight`, `"Mevo+"` → `flightscope`). |
| Boolean fields | bool/string | Accepts `true`, `false`, `"true"`, `"false"`, `"yes"`, `"no"`. `"unknown"` becomes `null`. |
| Numeric fields | number/string | `"unknown"` becomes `null`. |

## Slug Generation

Slugs are auto-generated from the venue name:

1. **Unique name** → `slugify(name)` (e.g. "Ace Indoor Golf" → `ace-indoor-golf`)
2. **Duplicate name** → append street token from address, stripping house numbers and zip codes
   - "GolfCave" at "675 Central Ave # 2" → `golfcave-central-ave`
   - "GolfCave" at "93 Knollwood Rd" → `golfcave-knollwood-rd`
3. **Still duplicates** → append counter (`-2`, `-3`, etc.)
   - "GolfCave" at "325 US-22" → `golfcave-us`
   - "GolfCave" at "176 US-202" → `golfcave-us-2`

The first venue with a given name (that doesn't already exist in the DB) gets the plain slug.

## What the Script Does

1. Reads all `.json` files from the specified directory
2. Fetches all existing venue slugs and names from the DB
3. Generates unique slugs using the rules above
4. Maps JSON fields → DB columns, including:
   - `comprehensiveData` JSONB: stores `faq`, `amenitiesList`, `placeId`, `googleRating`, `simGolfStatus`, `simulatorSoftware`
   - `softwareSlugs` array: normalized canonical software slugs for filtering
   - `hardwareBrands` array: normalized hardware brand slugs
5. Inserts in batches of 50; if a batch fails, retries individual rows
6. Skips venues whose generated slug already exists in the DB (no overwrites)

## Dry Run Output

The `--dry-run` flag shows:
- Total venues found and how many would be inserted vs skipped
- All duplicate-name groups with their generated slugs (to verify street token logic)
- First 10 and last 5 venues as a sample

## Updating Existing Venues

The script only **inserts new** venues — it skips any venue whose slug already exists. To update existing venues, use the Supabase dashboard or a separate update script.

## Software & Hardware Normalization

Software names are mapped to canonical slugs defined in `lib/software-slugs.ts`:

| Raw Name | Canonical Slug |
|---|---|
| GSPro, GS Pro, GSP | `gspro` |
| E6, E6 Connect | `e6` |
| TGC, The Golf Club 2019 | `tgc` |
| WGT, World Golf Tour | `wgt` |
| Creative Golf 3D | `creative-golf` |
| Trackman Virtual Golf | `trackman-virtual` |
| FSX, FSX Play | `fsx` |
| Awesome Golf | `awesome-golf` |

Hardware brands are mapped via `lib/hardware-brands.ts`:

| Raw Brand | Canonical Slug |
|---|---|
| Trackman | `trackman` |
| Foresight, GC Quad, GC3, GC2 | `foresight` |
| FlightScope, Mevo | `flightscope` |
| Full Swing | `full-swing` |
| Golfzon | `golfzon` |
| SkyTrak | `skytrak` |
| Uneekor | `uneekor` |

Unrecognized software names are silently dropped from `softwareSlugs` (but preserved in `comprehensiveData.simulatorSoftware` for display). Unrecognized hardware brands are slugified as-is.

---

## backfill-hardware-software.ts

Scans all venues and populates `hardwareBrands` and `softwareSlugs` for any venue that has source data (`simulatorSystems` or `comprehensiveData.simulatorSoftware`) but empty normalized columns.

```bash
npx tsx scripts/backfill-hardware-software.ts --dry-run   # preview changes
npx tsx scripts/backfill-hardware-software.ts              # apply updates
```

### What it does

1. Fetches all venues from the DB (paginated)
2. For each venue with empty `hardwareBrands`: extracts and normalizes brands from `simulatorSystems`
3. For each venue with empty `softwareSlugs`: extracts and normalizes slugs from `comprehensiveData.simulatorSoftware`
4. Updates only venues where normalization produces non-empty results
5. Skips venues where the source data is `"unknown"` or `null` (nothing useful to extract)

### When to run

- After importing new venues via `upload-venues.ts`
- After manually adding venues through the Supabase dashboard
- If you update the alias mappings in `lib/hardware-brands.ts` or `lib/software-slugs.ts` (new aliases would match previously unrecognized names)

---

## analyze-categories.ts

Regenerates `lib/category-config.generated.ts` — a static file containing category counts used by all `/best/*` pages for filtering and display.

```bash
npx tsx scripts/analyze-categories.ts
```

### What it generates

| Export | Source | Used by |
|---|---|---|
| `AVAILABLE_TAGS` | `venues.tags` array | `/best/[tag]` |
| `AVAILABLE_VIBES` | `venues.vibeTags` array | `/best/vibe/[vibe]` |
| `AVAILABLE_SEGMENTS` | `venues.whoItsFor` array | `/best/who-its-for/[segment]` |
| `AVAILABLE_HARDWARE` | `venues.hardwareBrands` array | `/best/hardware/[brand]` |
| `AVAILABLE_SOFTWARE` | `venues.softwareSlugs` array | `/best/software/[software]` |
| `AVAILABLE_AMENITIES` | Computed from boolean fields | `/best/amenities/[amenity]` |
| `AVAILABLE_LAUNCH_MONITORS` | `venues.launchMonitorType` enum | `/best/launch-monitor/[type]` |
| `TOTAL_VENUES` | Count of active venues | Displayed on `/best` page |

Also generates helper functions `getStaticRelatedLinks()` and `hasVenues()` used by category pages.

### When to run

- After any venue import or backfill
- After changing venue status (active/inactive)
- Before deploying if venue data has changed

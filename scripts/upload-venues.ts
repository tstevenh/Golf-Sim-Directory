import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
// Load .env.local manually (no dotenv dependency)
const envPath = path.resolve(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}

// ── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BATCH_SIZE = 50;
const DRY_RUN = process.argv.includes("--dry-run");
const VENUE_DIR = process.argv[2] || "";

if (!VENUE_DIR) {
  console.error("Usage: npx tsx scripts/upload-venues.ts <venue-dir> [--dry-run]");
  process.exit(1);
}

// ── Software slug normalization (mirrors lib/software-slugs.ts) ─────────────
const SOFTWARE_CATEGORIES = [
  { slug: "gspro", aliases: ["gspro", "gsp", "golfsimulatorpro"] },
  { slug: "e6", aliases: ["e6", "e6connect"] },
  { slug: "tgc", aliases: ["tgc", "thegolfclub", "thegolfclub2019"] },
  { slug: "wgt", aliases: ["wgt", "worldgolftour"] },
  { slug: "creative-golf", aliases: ["creativegolf", "creativegolf3d"] },
  { slug: "awesome-golf", aliases: ["awesomegolf"] },
  { slug: "trackman-virtual", aliases: ["trackmanvirtual", "trackmanvirtualgolf"] },
  { slug: "fsx", aliases: ["fsx", "fsxplay"] },
];

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeSoftwareSlug(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const key = normalizeKey(trimmed);
  if (!key || key === "unknown" || key === "na" || key === "n/a" || key === "none") return "";
  for (const sw of SOFTWARE_CATEGORIES) {
    if (sw.aliases.some((alias) => key === alias || key.includes(alias))) return sw.slug;
  }
  return "";
}

function dedupeSoftwareSlugs(values: string[]): string[] {
  const normalized = values.map(normalizeSoftwareSlug).filter(Boolean);
  return Array.from(new Set(normalized)).sort();
}

// ── Hardware brand normalization (mirrors lib/hardware-brands.ts) ────────────
const HW_ALIAS: Record<string, string> = {
  trackman: "trackman", foresight: "foresight", foresightsports: "foresight",
  gcquad: "gc-quad", gc3: "foresight", gc2: "foresight", uneekor: "uneekor",
  fullswing: "full-swing", golfzon: "golfzon", aboutgolf: "aboutgolf",
  skytrak: "skytrak", flightscope: "flightscope", mevo: "flightscope",
  garmin: "garmin", rapsodo: "rapsodo", trugolf: "trugolf", optishot: "optishot",
  toptracer: "toptracer",
};

function slugifyText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function normalizeHardwareBrand(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const key = normalizeKey(trimmed);
  if (!key || key === "unknown" || key === "na" || key === "n/a") return "";
  return HW_ALIAS[key] || slugifyText(trimmed);
}

function extractHardwareBrands(simulatorSystems: unknown): string[] {
  if (!Array.isArray(simulatorSystems)) return [];
  const brands: string[] = [];
  for (const sys of simulatorSystems) {
    if (typeof sys === "string") brands.push(sys);
    else if (sys && typeof sys === "object" && typeof (sys as { brand?: unknown }).brand === "string")
      brands.push((sys as { brand: string }).brand);
  }
  const normalized = brands.map(normalizeHardwareBrand).filter(Boolean);
  return Array.from(new Set(normalized)).sort();
}

// ── Slug generation ─────────────────────────────────────────────────────────
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").substring(0, 50);
}

function extractStreetToken(address: string): string {
  // Take just the street part (before first comma)
  const street = address.split(",")[0].trim();
  // Remove leading house/suite numbers and trailing numbers/zip
  const stripped = street
    .replace(/^\d+\s*/, "")           // leading house number
    .replace(/\s*#\s*\S+/g, "")       // suite/unit like "# 2" or "#17"
    .replace(/\s+\d+$/g, "")          // trailing numbers
    .replace(/\bUnit\s*#?\s*\S+/gi, "") // "Unit# 17" etc.
    .replace(/\bSuite\s*#?\s*\S+/gi, "") // "Suite 2a"
    .replace(/\bSte\s*#?\s*\S+/gi, "")   // "Ste 128"
    .trim();
  return slugify(stripped);
}

// ── Value coercion helpers ──────────────────────────────────────────────────
function toBoolean(val: unknown): boolean | null {
  if (val === true || val === "true" || val === "yes") return true;
  if (val === false || val === "false" || val === "no") return false;
  return null; // "unknown" or anything else
}

function toInt(val: unknown): number | null {
  if (val === null || val === undefined || val === "unknown") return null;
  const n = Number(val);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function toFloat(val: unknown): number | null {
  if (val === null || val === undefined || val === "unknown") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

function toString(val: unknown): string | null {
  if (val === null || val === undefined || val === "unknown") return null;
  const s = String(val).trim();
  return s || null;
}

function splitPipe(val: unknown): string[] {
  if (!val || typeof val !== "string") return [];
  return val.split("|").map((s) => s.trim()).filter(Boolean);
}

const VALID_VENUE_TYPES = new Set([
  "sim_bar", "training_studio", "private_rental", "retail_fitting_center",
  "country_club", "multi_sport_sim", "hotel_resort", "other",
  "indoor_golf_center", "entertainment_venue", "golf_performance_center", "bar",
]);

const VALID_PRICING_MODELS = new Set([
  "per_bay_hour", "per_person_hour", "package", "membership_only", "mixed", "unknown",
]);

const VALID_LAUNCH_MONITOR_TYPES = new Set(["radar", "photometric_camera", "hybrid", "unknown"]);

// ── Map JSON → DB row ───────────────────────────────────────────────────────
function mapVenue(data: Record<string, unknown>, slug: string) {
  const simulatorSystems = Array.isArray(data.simulator_hardware)
    ? data.simulator_hardware.filter((x: unknown) => x !== null)
    : null;

  const softwareRaw = Array.isArray(data.simulator_software)
    ? (data.simulator_software as unknown[]).filter((x) => x !== null).map(String)
    : [];

  const softwareSlugs = dedupeSoftwareSlugs(softwareRaw);
  const hardwareBrands = extractHardwareBrands(simulatorSystems);

  const venueType = VALID_VENUE_TYPES.has(String(data.venue_type)) ? String(data.venue_type) : "other";
  const pricingModel = VALID_PRICING_MODELS.has(String(data.pricing_model)) ? String(data.pricing_model) : "unknown";
  const launchMonitorType = VALID_LAUNCH_MONITOR_TYPES.has(String(data.launch_monitor_type))
    ? String(data.launch_monitor_type) : "unknown";

  // Extract zipCode from address (last 5-digit sequence)
  const addressStr = String(data.address || "");
  const zipMatch = addressStr.match(/\b(\d{5})(?:-\d{4})?\b/);
  const zipCode = zipMatch?.[1] || toString(data.postal_code)?.replace(/\.0$/, "") || null;

  // State from region
  const region = String(data.region || "");

  // comprehensiveData holds extra fields that don't have dedicated columns
  const comprehensiveData: Record<string, unknown> = {};
  if (data.faq) comprehensiveData.faq = data.faq;
  if (data.amenities_list) comprehensiveData.amenitiesList = splitPipe(data.amenities_list);
  if (data.place_id) comprehensiveData.placeId = data.place_id;
  if (data.google_rating != null && data.google_rating !== "unknown")
    comprehensiveData.googleRating = toFloat(data.google_rating);
  if (data.sim_golf_status) comprehensiveData.simGolfStatus = data.sim_golf_status;
  // Store the raw software names (not slugified) for display
  if (softwareRaw.length > 0) comprehensiveData.simulatorSoftware = softwareRaw;

  const bookingUrl = toString(data.booking_url);

  return {
    slug,
    name: String(data.name || "Untitled Venue"),
    venueType,
    address: addressStr.split(",")[0]?.trim() || addressStr,
    city: String(data.city || ""),
    state: region.length === 2 ? region.toUpperCase() : region,
    zipCode,
    country: String(data.country || "US"),
    latitude: toFloat(data.latitude),
    longitude: toFloat(data.longitude),
    phone: toString(data.phone),
    email: toString(data.email),
    website: toString(data.website),
    bookingUrl: bookingUrl === "unknown" ? null : bookingUrl,
    googleMapsUrl: toString(data.google_maps_url),
    heroImage: toString(data.hero_image) || toString(data.cloudinary_image),
    about: toString(data.about),
    tags: splitPipe(data.tags as string),
    vibeTags: splitPipe(data.vibe_tags as string),
    whoItsFor: splitPipe(data.who_its_for as string),
    whyGolfersLikeIt: Array.isArray(data.why_golfers_like_it) ? data.why_golfers_like_it : null,
    simulatorSystems: simulatorSystems && simulatorSystems.length > 0 ? simulatorSystems : null,
    softwareSlugs,
    hardwareBrands,
    launchMonitorType,
    ballTracking: toBoolean(data.ball_tracking),
    clubTracking: toBoolean(data.club_tracking),
    puttingMode: toString(data.putting_mode),
    leftyFriendly: toBoolean(data.lefty_friendly) ?? false,
    bayCount: toInt(data.bay_count_total),
    hasPrivateRooms: toInt(data.private_rooms_count) != null && toInt(data.private_rooms_count)! > 0,
    privateRoomsCount: toInt(data.private_rooms_count),
    maxGroupSizePerBay: toInt(data.max_group_size_per_bay),
    pricingModel,
    priceRangeMin: toInt(data.price_range_min_local),
    priceRangeMax: toInt(data.price_range_max_local),
    currency: String(data.currency || "USD"),
    foodAndDrink: Array.isArray(data.food_and_drink) ? data.food_and_drink : null,
    kidFriendly: toBoolean(data.kid_friendly) ?? false,
    coachingAvailable: toBoolean(data.coaching_available) ?? false,
    walkInsAllowed: toBoolean(data.walk_ins_allowed),
    hours: toString(data.opening_hours),
    ratingTechQuality: toFloat(data.rating_tech_quality),
    ratingFacilityComfort: toFloat(data.rating_facility_comfort),
    ratingValueForMoney: toFloat(data.rating_value_for_money),
    ratingOverall: toFloat(data.rating_overall),
    comprehensiveData: Object.keys(comprehensiveData).length > 0 ? comprehensiveData : null,
    dataSource: "enrichment_script",
    status: "active",
  };
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const dir = path.resolve(VENUE_DIR);
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  console.log(`Found ${files.length} JSON files in ${dir}`);

  // 1. Fetch all existing slugs from DB (paginated — default limit is 1000)
  console.log("Fetching existing slugs from DB...");
  const allRows: { slug: string; name: string }[] = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data: page, error: fetchError } = await supabase
      .from("venues")
      .select("slug, name")
      .range(from, from + PAGE - 1);
    if (fetchError) {
      console.error("Failed to fetch slugs:", fetchError);
      process.exit(1);
    }
    if (!page || page.length === 0) break;
    allRows.push(...page);
    if (page.length < PAGE) break;
    from += PAGE;
  }
  const existingRows = allRows;
  const existingSlugs = new Set(existingRows.map((r) => r.slug));
  // Map of name → count of venues with that name (for duplicate detection)
  const nameCount = new Map<string, number>();
  for (const row of existingRows || []) {
    nameCount.set(row.name, (nameCount.get(row.name) || 0) + 1);
  }
  console.log(`DB has ${existingSlugs.size} existing venues`);

  // 2. Group incoming venues by name to detect duplicates among the batch
  const filesByName = new Map<string, { file: string; data: Record<string, unknown> }[]>();
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const data = JSON.parse(raw);
    const name = String(data.name || "Untitled Venue");
    if (!filesByName.has(name)) filesByName.set(name, []);
    filesByName.get(name)!.push({ file, data });
  }

  // 3. Generate slugs
  const rows: ReturnType<typeof mapVenue>[] = [];
  const newSlugs = new Set(existingSlugs); // track all slugs (existing + new)
  let skipped = 0;

  for (const [name, entries] of filesByName) {
    const baseSlug = slugify(name);
    const nameExistsInDb = (nameCount.get(name) || 0) > 0;
    const hasDuplicates = (nameCount.get(name) || 0) + entries.length > 1;

    for (let i = 0; i < entries.length; i++) {
      const { data } = entries[i];

      let slug: string;
      if (!hasDuplicates && !newSlugs.has(baseSlug)) {
        // Unique name, no conflict at all
        slug = baseSlug;
      } else if (!nameExistsInDb && i === 0 && !newSlugs.has(baseSlug)) {
        // First of a duplicate batch, name not in DB yet → plain slug
        slug = baseSlug;
      } else {
        // Duplicate name → append street token
        const streetToken = extractStreetToken(String(data.address || ""));
        const candidateSlug = streetToken ? `${baseSlug}-${streetToken}` : baseSlug;

        if (!newSlugs.has(candidateSlug)) {
          slug = candidateSlug;
        } else {
          // Street token also conflicts → append counter
          let counter = 2;
          while (newSlugs.has(`${candidateSlug}-${counter}`)) counter++;
          slug = `${candidateSlug}-${counter}`;
        }
      }

      // Skip if this exact slug already in DB (don't overwrite)
      if (existingSlugs.has(slug)) {
        skipped++;
        continue;
      }

      newSlugs.add(slug);
      rows.push(mapVenue(data, slug));
    }
  }

  console.log(`\nReady to upload: ${rows.length} new venues (${skipped} skipped as already in DB)`);

  if (DRY_RUN) {
    // Show duplicate-name venues to verify street token logic
    const dupeNames = new Map<string, typeof rows>();
    for (const row of rows) {
      if (!dupeNames.has(row.name)) dupeNames.set(row.name, []);
      dupeNames.get(row.name)!.push(row);
    }
    const dupes = [...dupeNames.entries()].filter(([, v]) => v.length > 1);
    if (dupes.length > 0) {
      console.log(`\n-- Duplicate name slug examples (${dupes.length} groups) --`);
      for (const [name, venues] of dupes) {
        console.log(`  "${name}":`);
        for (const v of venues) console.log(`    ${v.slug} (${v.address}, ${v.city})`);
      }
    }

    console.log("\n-- DRY RUN: first 10 venues --");
    for (const row of rows.slice(0, 10)) {
      console.log(`  ${row.slug} | ${row.name} | ${row.city}, ${row.state}`);
    }
    console.log(`\n-- DRY RUN: last 5 venues --`);
    for (const row of rows.slice(-5)) {
      console.log(`  ${row.slug} | ${row.name} | ${row.city}, ${row.state}`);
    }
    console.log("\nRun without --dry-run to insert.");
    return;
  }

  // 4. Batch insert
  let inserted = 0;
  let errors = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("venues").insert(batch);
    if (error) {
      console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error.message);
      // Try individual inserts for the failed batch
      for (const row of batch) {
        const { error: rowErr } = await supabase.from("venues").insert(row);
        if (rowErr) {
          console.error(`  FAIL: ${row.slug} — ${rowErr.message}`);
          errors++;
        } else {
          inserted++;
        }
      }
    } else {
      inserted += batch.length;
      process.stdout.write(`  Inserted ${inserted}/${rows.length}\r`);
    }
  }

  console.log(`\nDone! Inserted: ${inserted}, Errors: ${errors}, Skipped: ${skipped}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

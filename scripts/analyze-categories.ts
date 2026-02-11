import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load .env.local
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

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const OUTPUT_PATH = path.resolve(__dirname, "../lib/category-config.generated.ts");

// ── Label formatting ────────────────────────────────────────────────────────
const CUSTOM_LABELS: Record<string, string> = {
  // Hardware
  "trackman": "TrackMan", "foresight": "Foresight", "uneekor": "Uneekor",
  "full-swing": "Full Swing", "skytrak": "SkyTrak", "golfzon": "Golfzon",
  "aboutgolf": "AboutGolf", "flightscope": "FlightScope", "trugolf": "TruGolf",
  "toptracer": "Toptracer", "gc-quad": "GC Quad", "optishot": "OptiShot",
  "garmin": "Garmin", "rapsodo": "Rapsodo", "x-golf": "X-Golf",
  "hd-golf": "HD Golf", "protee": "ProTee", "swing-catalyst": "Swing Catalyst",
  "v1-sports": "V1 Sports",
  // Software
  "gspro": "GSPro", "e6": "E6 Connect", "tgc": "TGC 2019", "wgt": "WGT",
  "creative-golf": "Creative Golf 3D", "awesome-golf": "Awesome Golf",
  "trackman-virtual": "TrackMan Virtual", "fsx": "FSX Play",
  // Launch monitors
  "radar": "Radar", "photometric_camera": "Camera", "hybrid": "Hybrid",
  "unknown": "Unknown",
  // Amenities
  "parking": "Parking", "coaching_available": "Coaching", "private_rooms": "Private Rooms",
};

function toLabel(slug: string): string {
  if (CUSTOM_LABELS[slug]) return CUSTOM_LABELS[slug];
  return slug
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface CategoryItem {
  slug: string;
  label: string;
  count: number;
}

// ── Fetch all venues (paginated) ────────────────────────────────────────────
async function fetchAllVenues() {
  const allVenues: Record<string, unknown>[] = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data: page, error } = await supabase
      .from("venues")
      .select("tags, vibeTags, whoItsFor, hardwareBrands, softwareSlugs, launchMonitorType, coachingAvailable, hasPrivateRooms, comprehensiveData")
      .eq("status", "active")
      .range(from, from + PAGE - 1);
    if (error) { console.error("Fetch error:", error); process.exit(1); }
    if (!page || page.length === 0) break;
    allVenues.push(...page);
    if (page.length < PAGE) break;
    from += PAGE;
  }
  return allVenues;
}

// ── Count array field values ────────────────────────────────────────────────
function countArrayField(venues: Record<string, unknown>[], field: string): CategoryItem[] {
  const counts = new Map<string, number>();
  for (const v of venues) {
    const arr = v[field];
    if (!Array.isArray(arr)) continue;
    for (const item of arr) {
      if (typeof item === "string" && item.trim()) {
        const slug = item.trim();
        counts.set(slug, (counts.get(slug) || 0) + 1);
      }
    }
  }
  return [...counts.entries()]
    .map(([slug, count]) => ({ slug, label: toLabel(slug), count }))
    .sort((a, b) => b.count - a.count);
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Fetching all active venues...");
  const venues = await fetchAllVenues();
  const total = venues.length;
  console.log(`Fetched ${total} active venues`);

  // Tags
  const tags = countArrayField(venues, "tags");
  console.log(`Tags: ${tags.length} categories`);

  // Vibes
  const vibes = countArrayField(venues, "vibeTags");
  console.log(`Vibes: ${vibes.length} categories`);

  // Who it's for (segments)
  const segments = countArrayField(venues, "whoItsFor");
  console.log(`Segments: ${segments.length} categories`);

  // Hardware brands
  const hardware = countArrayField(venues, "hardwareBrands");
  console.log(`Hardware: ${hardware.length} categories`);

  // Software slugs
  const software = countArrayField(venues, "softwareSlugs");
  console.log(`Software: ${software.length} categories`);

  // Launch monitors
  const launchMonitorCounts = new Map<string, number>();
  for (const v of venues) {
    const lm = v.launchMonitorType;
    if (typeof lm === "string" && lm.trim()) {
      launchMonitorCounts.set(lm, (launchMonitorCounts.get(lm) || 0) + 1);
    }
  }
  const launchMonitors: CategoryItem[] = [...launchMonitorCounts.entries()]
    .map(([slug, count]) => ({ slug, label: toLabel(slug), count }))
    .sort((a, b) => b.count - a.count);
  console.log(`Launch Monitors: ${launchMonitors.length} categories`);

  // Amenities (computed from boolean/other fields)
  const amenities: CategoryItem[] = [
    { slug: "parking", label: "Parking", count: total }, // all venues assumed to have some parking info
    {
      slug: "coaching_available", label: "Coaching",
      count: venues.filter((v) => v.coachingAvailable === true).length,
    },
    {
      slug: "private_rooms", label: "Private Rooms",
      count: venues.filter((v) => v.hasPrivateRooms === true).length,
    },
  ].sort((a, b) => b.count - a.count);
  console.log(`Amenities: ${amenities.length} categories`);

  // Generate the file
  const now = new Date().toISOString();
  const formatItems = (items: CategoryItem[]) =>
    items.map((i) => `  ${JSON.stringify(i, null, 2).replace(/\n/g, "\n  ")}`).join(",\n");

  const output = `// AUTO-GENERATED FILE - DO NOT EDIT
// Generated by: npx tsx scripts/analyze-categories.ts
// Generated at: ${now}
// Total venues: ${total}

export interface CategoryItem {
  slug: string;
  label: string;
  count: number;
}

export const GENERATED_AT = "${now}";
export const TOTAL_VENUES = ${total};

// Tags with venues (${tags.length} categories)
export const AVAILABLE_TAGS: CategoryItem[] = [
${formatItems(tags)}
];

// Vibes with venues (${vibes.length} categories)
export const AVAILABLE_VIBES: CategoryItem[] = [
${formatItems(vibes)}
];

// Segments with venues (${segments.length} categories)
export const AVAILABLE_SEGMENTS: CategoryItem[] = [
${formatItems(segments)}
];

// Hardware with venues (${hardware.length} categories)
export const AVAILABLE_HARDWARE: CategoryItem[] = [
${formatItems(hardware)}
];

// Amenities with venues (${amenities.length} categories)
export const AVAILABLE_AMENITIES: CategoryItem[] = [
${formatItems(amenities)}
];

// Software with venues (${software.length} categories)
export const AVAILABLE_SOFTWARE: CategoryItem[] = [
${formatItems(software)}
];

// Launch monitors with venues (${launchMonitors.length} categories)
export const AVAILABLE_LAUNCH_MONITORS: CategoryItem[] = [
${formatItems(launchMonitors)}
];

/** Convert any slug to URL-friendly format (underscores → hyphens) */
function toUrlSlug(slug: string): string {
  return slug.replace(/_/g, "-");
}

// Helper to get related links for a category (static, no DB query)
export function getStaticRelatedLinks(
  currentCategory: string,
  currentSlug: string,
  limit = 6
): Array<{ href: string; label: string; count: number }> {
  const links: Array<{ href: string; label: string; count: number }> = [];

  // Add vibes (if not current category)
  if (currentCategory !== "vibe") {
    for (const vibe of AVAILABLE_VIBES.slice(0, 2)) {
      links.push({ href: \`/best/vibe/\${toUrlSlug(vibe.slug)}\`, label: \`Best \${vibe.label}\`, count: vibe.count });
    }
  } else {
    // Add other vibes excluding current
    for (const vibe of AVAILABLE_VIBES.filter(v => v.slug !== currentSlug).slice(0, 2)) {
      links.push({ href: \`/best/vibe/\${toUrlSlug(vibe.slug)}\`, label: \`Best \${vibe.label}\`, count: vibe.count });
    }
  }

  // Add segments
  if (currentCategory !== "who-its-for") {
    for (const seg of AVAILABLE_SEGMENTS.slice(0, 2)) {
      if (links.length < limit) {
        links.push({ href: \`/best/who-its-for/\${toUrlSlug(seg.slug)}\`, label: \`Best for \${seg.label}\`, count: seg.count });
      }
    }
  } else {
    for (const seg of AVAILABLE_SEGMENTS.filter(s => s.slug !== currentSlug).slice(0, 2)) {
      if (links.length < limit) {
        links.push({ href: \`/best/who-its-for/\${toUrlSlug(seg.slug)}\`, label: \`Best for \${seg.label}\`, count: seg.count });
      }
    }
  }

  // Add hardware
  if (currentCategory !== "hardware") {
    for (const hw of AVAILABLE_HARDWARE.slice(0, 2)) {
      if (links.length < limit) {
        links.push({ href: \`/best/hardware/\${toUrlSlug(hw.slug)}\`, label: \`Best \${hw.label}\`, count: hw.count });
      }
    }
  } else {
    for (const hw of AVAILABLE_HARDWARE.filter(h => h.slug !== currentSlug).slice(0, 2)) {
      if (links.length < limit) {
        links.push({ href: \`/best/hardware/\${toUrlSlug(hw.slug)}\`, label: \`Best \${hw.label}\`, count: hw.count });
      }
    }
  }

  return links.slice(0, limit);
}

// Check if a category slug has venues (matches both underscore and hyphen formats)
export function hasVenues(category: string, slug: string): boolean {
  const variants = [slug, slug.replace(/-/g, "_"), slug.replace(/_/g, "-")];
  switch (category) {
    case "tags": return AVAILABLE_TAGS.some(t => variants.includes(t.slug));
    case "vibe": return AVAILABLE_VIBES.some(v => variants.includes(v.slug));
    case "who-its-for": return AVAILABLE_SEGMENTS.some(s => variants.includes(s.slug));
    case "hardware": return AVAILABLE_HARDWARE.some(h => variants.includes(h.slug));
    case "amenities": return AVAILABLE_AMENITIES.some(a => variants.includes(a.slug));
    case "software": return AVAILABLE_SOFTWARE.some(s => variants.includes(s.slug));
    case "launch-monitor": return AVAILABLE_LAUNCH_MONITORS.some(l => variants.includes(l.slug));
    default: return false;
  }
}
`;

  fs.writeFileSync(OUTPUT_PATH, output);
  console.log(`\nWritten to ${OUTPUT_PATH}`);
  console.log(`Total venues: ${total}`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });

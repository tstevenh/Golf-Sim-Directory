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
const DRY_RUN = process.argv.includes("--dry-run");
const BATCH_SIZE = 50;

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

function extractSoftwareSlugs(comprehensiveData: unknown): string[] {
  if (!comprehensiveData || typeof comprehensiveData !== "object") return [];
  const data = comprehensiveData as Record<string, unknown>;
  const candidates = [data.softwareSlugs, data.simulatorSoftware, data.simulator_software, data.software];
  const rawValues: string[] = [];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        if (typeof item === "string") rawValues.push(item);
      }
    } else if (typeof candidate === "string") {
      rawValues.push(...candidate.split(/[|,;/]/).map(s => s.trim()).filter(Boolean));
    }
  }
  return dedupeSoftwareSlugs(rawValues);
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  // Fetch all venues that need backfill (paginated)
  console.log("Fetching venues that need backfill...");
  const allVenues: { id: string; slug: string; simulatorSystems: unknown; comprehensiveData: unknown; hardwareBrands: string[]; softwareSlugs: string[] }[] = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data: page, error } = await supabase
      .from("venues")
      .select("id, slug, simulatorSystems, comprehensiveData, hardwareBrands, softwareSlugs")
      .range(from, from + PAGE - 1);
    if (error) { console.error("Fetch error:", error); process.exit(1); }
    if (!page || page.length === 0) break;
    allVenues.push(...page);
    if (page.length < PAGE) break;
    from += PAGE;
  }
  console.log(`Fetched ${allVenues.length} total venues`);

  // Find venues needing updates
  const hwUpdates: { id: string; slug: string; hardwareBrands: string[] }[] = [];
  const swUpdates: { id: string; slug: string; softwareSlugs: string[] }[] = [];

  for (const venue of allVenues) {
    // Hardware backfill
    const currentHw = venue.hardwareBrands || [];
    if (currentHw.length === 0 && venue.simulatorSystems) {
      const newHw = extractHardwareBrands(venue.simulatorSystems);
      if (newHw.length > 0) {
        hwUpdates.push({ id: venue.id, slug: venue.slug, hardwareBrands: newHw });
      }
    }

    // Software backfill
    const currentSw = venue.softwareSlugs || [];
    if (currentSw.length === 0 && venue.comprehensiveData) {
      const newSw = extractSoftwareSlugs(venue.comprehensiveData);
      if (newSw.length > 0) {
        swUpdates.push({ id: venue.id, slug: venue.slug, softwareSlugs: newSw });
      }
    }
  }

  console.log(`\nHardware backfill needed: ${hwUpdates.length} venues`);
  console.log(`Software backfill needed: ${swUpdates.length} venues`);

  if (DRY_RUN) {
    console.log("\n-- DRY RUN: Hardware samples --");
    for (const u of hwUpdates.slice(0, 10)) {
      console.log(`  ${u.slug} → [${u.hardwareBrands.join(", ")}]`);
    }
    console.log("\n-- DRY RUN: Software samples --");
    for (const u of swUpdates.slice(0, 10)) {
      console.log(`  ${u.slug} → [${u.softwareSlugs.join(", ")}]`);
    }
    console.log("\nRun without --dry-run to apply.");
    return;
  }

  // Apply hardware updates
  let hwDone = 0;
  let hwErrors = 0;
  for (let i = 0; i < hwUpdates.length; i += BATCH_SIZE) {
    const batch = hwUpdates.slice(i, i + BATCH_SIZE);
    for (const row of batch) {
      const { error } = await supabase.from("venues").update({ hardwareBrands: row.hardwareBrands }).eq("id", row.id);
      if (error) { console.error(`  HW FAIL: ${row.slug} — ${error.message}`); hwErrors++; }
      else hwDone++;
    }
    process.stdout.write(`  Hardware: ${hwDone}/${hwUpdates.length}\r`);
  }
  console.log(`\nHardware done: ${hwDone} updated, ${hwErrors} errors`);

  // Apply software updates
  let swDone = 0;
  let swErrors = 0;
  for (let i = 0; i < swUpdates.length; i += BATCH_SIZE) {
    const batch = swUpdates.slice(i, i + BATCH_SIZE);
    for (const row of batch) {
      const { error } = await supabase.from("venues").update({ softwareSlugs: row.softwareSlugs }).eq("id", row.id);
      if (error) { console.error(`  SW FAIL: ${row.slug} — ${error.message}`); swErrors++; }
      else swDone++;
    }
    process.stdout.write(`  Software: ${swDone}/${swUpdates.length}\r`);
  }
  console.log(`\nSoftware done: ${swDone} updated, ${swErrors} errors`);

  console.log(`\nBackfill complete!`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });

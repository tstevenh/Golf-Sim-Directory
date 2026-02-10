#!/usr/bin/env npx ts-node
/**
 * Category Analysis Script
 * 
 * Run this before deployment to generate static category config.
 * Output: lib/category-config.generated.ts
 * 
 * Usage: npx ts-node scripts/analyze-categories.ts
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { extractSoftwareSlugsFromComprehensiveData } from "../lib/software-slugs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

interface CategoryCount {
  slug: string;
  label: string;
  count: number;
}

interface CategoryConfig {
  generatedAt: string;
  totalVenues: number;
  tags: CategoryCount[];
  vibes: CategoryCount[];
  segments: CategoryCount[];
  hardware: CategoryCount[];
  amenities: CategoryCount[];
  software: CategoryCount[];
  launchMonitors: CategoryCount[];
}

// Category definitions
const TAG_LABELS: Record<string, string> = {
  "sim-bar": "Sim Bar",
  "date-night": "Date Night",
  "corporate-events": "Corporate Events",
  "family-friendly": "Family Friendly",
  "serious-practice": "Serious Practice",
  "party-venue": "Party Venue",
  "premium-experience": "Premium Experience",
  "budget-friendly": "Budget Friendly",
};

const VIBE_LABELS: Record<string, string> = {
  "upscale": "Upscale",
  "casual": "Casual",
  "sports-bar": "Sports Bar",
  "boutique": "Boutique",
  "lounge": "Lounge",
  "entertainment": "Entertainment",
  "family": "Family",
  "tech-lab": "Tech Lab",
  "party-atmosphere": "Party Atmosphere",
};

const SEGMENT_LABELS: Record<string, string> = {
  "beginners": "Beginners",
  "corporate-groups": "Corporate Groups",
  "serious-golfers": "Serious Golfers",
  "date-night": "Date Night",
  "large-groups": "Large Groups",
  "families": "Families",
  "league-players": "League Players",
  "seniors": "Seniors",
};

const HARDWARE_LABELS: Record<string, string> = {
  "trackman": "TrackMan",
  "foresight": "Foresight",
  "uneekor": "Uneekor",
  "full-swing": "Full Swing",
  "golfzon": "Golfzon",
  "aboutgolf": "AboutGolf",
  "skytrak": "SkyTrak",
  "gc-quad": "GC Quad",
  "garmin": "Garmin",
};

const AMENITY_LABELS: Record<string, string> = {
  "private_rooms": "Private Rooms",
  "full_bar": "Full Bar",
  "kitchen_food": "Food Service",
  "coaching_available": "Coaching",
  "club_fitting": "Club Fitting",
  "wifi": "WiFi",
  "parking": "Parking",
  "outdoor_space": "Outdoor Space",
  "events": "Events",
  "leagues": "Leagues",
  "memberships": "Memberships",
};

const SOFTWARE_LABELS: Record<string, string> = {
  "e6": "E6 Connect",
  "gspro": "GSPro",
  "tgc": "TGC 2019",
  "wgt": "WGT",
  "creative-golf": "Creative Golf",
  "awesome-golf": "Awesome Golf",
  "trackman-virtual": "TrackMan Virtual",
};

const LAUNCH_MONITOR_LABELS: Record<string, string> = {
  "radar": "Radar",
  "photometric_camera": "Camera",
  "hybrid": "Hybrid",
};

async function analyzeCategories(): Promise<CategoryConfig> {
  console.log("🔍 Analyzing venue categories...\n");

  const venues = await prisma.venue.findMany({
    where: { status: "active" },
    select: {
      tags: true,
      vibeTags: true,
      whoItsFor: true,
      hardwareBrands: true,
      simulatorSystems: true,
      launchMonitorType: true,
      softwareSlugs: true,
      comprehensiveData: true,
      hasPrivateRooms: true,
      coachingAvailable: true,
      wifi: true,
      parking: true,
      foodAndDrink: true,
    },
  });

  console.log(`📊 Found ${venues.length} active venues\n`);

  // Count tags
  const tagCounts: Record<string, number> = {};
  for (const venue of venues) {
    const tags = venue.tags || [];
    for (const tag of tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  // Count vibes
  const vibeCounts: Record<string, number> = {};
  for (const venue of venues) {
    const vibes = venue.vibeTags || [];
    for (const vibe of vibes) {
      vibeCounts[vibe] = (vibeCounts[vibe] || 0) + 1;
    }
  }

  // Count segments (whoItsFor)
  const segmentCounts: Record<string, number> = {};
  for (const venue of venues) {
    const segments = venue.whoItsFor || [];
    for (const segment of segments) {
      segmentCounts[segment] = (segmentCounts[segment] || 0) + 1;
    }
  }

  // Count hardware
  const hardwareCounts: Record<string, number> = {};
  for (const venue of venues) {
    if (Array.isArray(venue.hardwareBrands) && venue.hardwareBrands.length > 0) {
      for (const brand of venue.hardwareBrands) {
        if (!brand) continue;
        hardwareCounts[brand] = (hardwareCounts[brand] || 0) + 1;
      }
      continue;
    }
    // Fallback for legacy rows without hardwareBrands.
    try {
      const systems = venue.simulatorSystems as { brand?: string }[] | null;
      if (systems) {
        for (const system of systems) {
          if (system.brand) {
            const brand = system.brand.toLowerCase().replace(/\s+/g, "-");
            hardwareCounts[brand] = (hardwareCounts[brand] || 0) + 1;
          }
        }
      }
    } catch {
      // Skip invalid data
    }
  }

  // Count amenities
  const amenityCounts: Record<string, number> = {};
  for (const venue of venues) {
    if (venue.hasPrivateRooms) amenityCounts["private_rooms"] = (amenityCounts["private_rooms"] || 0) + 1;
    if (venue.coachingAvailable) amenityCounts["coaching_available"] = (amenityCounts["coaching_available"] || 0) + 1;
    if (venue.wifi) amenityCounts["wifi"] = (amenityCounts["wifi"] || 0) + 1;
    if (venue.parking) amenityCounts["parking"] = (amenityCounts["parking"] || 0) + 1;
    
    try {
      const food = venue.foodAndDrink as { hasFood?: boolean; hasBar?: boolean } | null;
      if (food?.hasFood) amenityCounts["kitchen_food"] = (amenityCounts["kitchen_food"] || 0) + 1;
      if (food?.hasBar) amenityCounts["full_bar"] = (amenityCounts["full_bar"] || 0) + 1;
    } catch {
      // Skip invalid data
    }

    try {
      const data = venue.comprehensiveData as { clubFitting?: boolean; leagues?: boolean; memberships?: boolean; events?: boolean } | null;
      if (data?.clubFitting) amenityCounts["club_fitting"] = (amenityCounts["club_fitting"] || 0) + 1;
      if (data?.leagues) amenityCounts["leagues"] = (amenityCounts["leagues"] || 0) + 1;
      if (data?.memberships) amenityCounts["memberships"] = (amenityCounts["memberships"] || 0) + 1;
      if (data?.events) amenityCounts["events"] = (amenityCounts["events"] || 0) + 1;
    } catch {
      // Skip invalid data
    }
  }

  // Count software (prefer normalized softwareSlugs, fallback to comprehensiveData)
  const softwareCounts: Record<string, number> = {};
  for (const venue of venues) {
    const slugs =
      Array.isArray(venue.softwareSlugs) && venue.softwareSlugs.length > 0
        ? venue.softwareSlugs
        : extractSoftwareSlugsFromComprehensiveData(venue.comprehensiveData);
    for (const slug of slugs) {
      softwareCounts[slug] = (softwareCounts[slug] || 0) + 1;
    }
  }

  // Count launch monitors
  const launchMonitorCounts: Record<string, number> = {};
  for (const venue of venues) {
    if (venue.launchMonitorType) {
      launchMonitorCounts[venue.launchMonitorType] = (launchMonitorCounts[venue.launchMonitorType] || 0) + 1;
    }
  }

  // Convert to sorted arrays (only include categories with venues)
  const toSortedArray = (counts: Record<string, number>, labels: Record<string, string>): CategoryCount[] => {
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([slug, count]) => ({
        slug,
        label: labels[slug] || slug.replace(/-/g, " ").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        count,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const config: CategoryConfig = {
    generatedAt: new Date().toISOString(),
    totalVenues: venues.length,
    tags: toSortedArray(tagCounts, TAG_LABELS),
    vibes: toSortedArray(vibeCounts, VIBE_LABELS),
    segments: toSortedArray(segmentCounts, SEGMENT_LABELS),
    hardware: toSortedArray(hardwareCounts, HARDWARE_LABELS),
    amenities: toSortedArray(amenityCounts, AMENITY_LABELS),
    software: toSortedArray(softwareCounts, SOFTWARE_LABELS),
    launchMonitors: toSortedArray(launchMonitorCounts, LAUNCH_MONITOR_LABELS),
  };

  return config;
}

function generateTypeScriptFile(config: CategoryConfig): string {
  return `// AUTO-GENERATED FILE - DO NOT EDIT
// Generated by: npx ts-node scripts/analyze-categories.ts
// Generated at: ${config.generatedAt}
// Total venues: ${config.totalVenues}

export interface CategoryItem {
  slug: string;
  label: string;
  count: number;
}

export const GENERATED_AT = "${config.generatedAt}";
export const TOTAL_VENUES = ${config.totalVenues};

// Tags with venues (${config.tags.length} categories)
export const AVAILABLE_TAGS: CategoryItem[] = ${JSON.stringify(config.tags, null, 2)};

// Vibes with venues (${config.vibes.length} categories)
export const AVAILABLE_VIBES: CategoryItem[] = ${JSON.stringify(config.vibes, null, 2)};

// Segments with venues (${config.segments.length} categories)
export const AVAILABLE_SEGMENTS: CategoryItem[] = ${JSON.stringify(config.segments, null, 2)};

// Hardware with venues (${config.hardware.length} categories)
export const AVAILABLE_HARDWARE: CategoryItem[] = ${JSON.stringify(config.hardware, null, 2)};

// Amenities with venues (${config.amenities.length} categories)
export const AVAILABLE_AMENITIES: CategoryItem[] = ${JSON.stringify(config.amenities, null, 2)};

// Software with venues (${config.software.length} categories)
export const AVAILABLE_SOFTWARE: CategoryItem[] = ${JSON.stringify(config.software, null, 2)};

// Launch monitors with venues (${config.launchMonitors.length} categories)
export const AVAILABLE_LAUNCH_MONITORS: CategoryItem[] = ${JSON.stringify(config.launchMonitors, null, 2)};

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
      links.push({ href: \`/best/vibe/\${vibe.slug}\`, label: \`Best \${vibe.label}\`, count: vibe.count });
    }
  } else {
    // Add other vibes excluding current
    for (const vibe of AVAILABLE_VIBES.filter(v => v.slug !== currentSlug).slice(0, 2)) {
      links.push({ href: \`/best/vibe/\${vibe.slug}\`, label: \`Best \${vibe.label}\`, count: vibe.count });
    }
  }

  // Add segments
  if (currentCategory !== "who-its-for") {
    for (const seg of AVAILABLE_SEGMENTS.slice(0, 2)) {
      if (links.length < limit) {
        links.push({ href: \`/best/who-its-for/\${seg.slug}\`, label: \`Best for \${seg.label}\`, count: seg.count });
      }
    }
  } else {
    for (const seg of AVAILABLE_SEGMENTS.filter(s => s.slug !== currentSlug).slice(0, 2)) {
      if (links.length < limit) {
        links.push({ href: \`/best/who-its-for/\${seg.slug}\`, label: \`Best for \${seg.label}\`, count: seg.count });
      }
    }
  }

  // Add hardware
  if (currentCategory !== "hardware") {
    for (const hw of AVAILABLE_HARDWARE.slice(0, 2)) {
      if (links.length < limit) {
        links.push({ href: \`/best/hardware/\${hw.slug}\`, label: \`Best \${hw.label}\`, count: hw.count });
      }
    }
  } else {
    for (const hw of AVAILABLE_HARDWARE.filter(h => h.slug !== currentSlug).slice(0, 2)) {
      if (links.length < limit) {
        links.push({ href: \`/best/hardware/\${hw.slug}\`, label: \`Best \${hw.label}\`, count: hw.count });
      }
    }
  }

  return links.slice(0, limit);
}

// Check if a category slug has venues
export function hasVenues(category: string, slug: string): boolean {
  switch (category) {
    case "tags": return AVAILABLE_TAGS.some(t => t.slug === slug);
    case "vibe": return AVAILABLE_VIBES.some(v => v.slug === slug);
    case "who-its-for": return AVAILABLE_SEGMENTS.some(s => s.slug === slug);
    case "hardware": return AVAILABLE_HARDWARE.some(h => h.slug === slug);
    case "amenities": return AVAILABLE_AMENITIES.some(a => a.slug === slug);
    case "software": return AVAILABLE_SOFTWARE.some(s => s.slug === slug);
    case "launch-monitor": return AVAILABLE_LAUNCH_MONITORS.some(l => l.slug === slug);
    default: return false;
  }
}
`;
}

async function main() {
  try {
    const config = await analyzeCategories();

    // Print summary
    console.log("📈 Category Summary:");
    console.log(`   Tags: ${config.tags.length} (${config.tags.map(t => t.slug).join(", ")})`);
    console.log(`   Vibes: ${config.vibes.length} (${config.vibes.map(v => v.slug).join(", ")})`);
    console.log(`   Segments: ${config.segments.length} (${config.segments.map(s => s.slug).join(", ")})`);
    console.log(`   Hardware: ${config.hardware.length} (${config.hardware.map(h => h.slug).join(", ")})`);
    console.log(`   Amenities: ${config.amenities.length} (${config.amenities.map(a => a.slug).join(", ")})`);
    console.log(`   Software: ${config.software.length} (${config.software.map(s => s.slug).join(", ")})`);
    console.log(`   Launch Monitors: ${config.launchMonitors.length} (${config.launchMonitors.map(l => l.slug).join(", ")})`);

    // Generate TypeScript file
    const tsContent = generateTypeScriptFile(config);
    const outputPath = path.join(__dirname, "../lib/category-config.generated.ts");
    fs.writeFileSync(outputPath, tsContent);

    console.log(`\n✅ Generated: lib/category-config.generated.ts`);
    console.log(`   Run 'npm run build' to use the new static config.\n`);
  } catch (error) {
    console.error("❌ Error analyzing categories:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

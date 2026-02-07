// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Regenerate with: npx ts-node scripts/analyze-categories.ts
// Generated at: 2026-02-07T15:15:00.000Z
// Total venues: 200

export interface CategoryItem {
  slug: string;
  label: string;
  count: number;
}

export const GENERATED_AT = "2026-02-07T15:15:00.000Z";
export const TOTAL_VENUES = 200;

// Tags with venues - UPDATE AFTER RUNNING SCRIPT
export const AVAILABLE_TAGS: CategoryItem[] = [
  { slug: "family-friendly", label: "Family Friendly", count: 0 },
  { slug: "date-night", label: "Date Night", count: 0 },
  { slug: "corporate-events", label: "Corporate Events", count: 0 },
  { slug: "serious-practice", label: "Serious Practice", count: 0 },
  { slug: "sim-bar", label: "Sim Bar", count: 0 },
  { slug: "party-venue", label: "Party Venue", count: 0 },
  { slug: "premium-experience", label: "Premium Experience", count: 0 },
  { slug: "budget-friendly", label: "Budget Friendly", count: 0 },
];

// Vibes with venues - UPDATE AFTER RUNNING SCRIPT
export const AVAILABLE_VIBES: CategoryItem[] = [
  { slug: "upscale", label: "Upscale", count: 0 },
  { slug: "casual", label: "Casual", count: 0 },
  { slug: "sports-bar", label: "Sports Bar", count: 0 },
  { slug: "lounge", label: "Lounge", count: 0 },
  { slug: "entertainment", label: "Entertainment", count: 0 },
  { slug: "family", label: "Family", count: 0 },
  { slug: "tech-lab", label: "Tech Lab", count: 0 },
];

// Segments with venues - UPDATE AFTER RUNNING SCRIPT
export const AVAILABLE_SEGMENTS: CategoryItem[] = [
  { slug: "beginners", label: "Beginners", count: 0 },
  { slug: "serious-golfers", label: "Serious Golfers", count: 0 },
  { slug: "families", label: "Families", count: 0 },
  { slug: "large-groups", label: "Large Groups", count: 0 },
  { slug: "corporate-groups", label: "Corporate Groups", count: 0 },
  { slug: "seniors", label: "Seniors", count: 0 },
];

// Hardware with venues - UPDATE AFTER RUNNING SCRIPT
export const AVAILABLE_HARDWARE: CategoryItem[] = [
  { slug: "trackman", label: "TrackMan", count: 0 },
  { slug: "foresight", label: "Foresight", count: 0 },
  { slug: "uneekor", label: "Uneekor", count: 0 },
  { slug: "full-swing", label: "Full Swing", count: 0 },
  { slug: "golfzon", label: "Golfzon", count: 0 },
  { slug: "skytrak", label: "SkyTrak", count: 0 },
];

// Amenities with venues - UPDATE AFTER RUNNING SCRIPT
export const AVAILABLE_AMENITIES: CategoryItem[] = [
  { slug: "private_rooms", label: "Private Rooms", count: 0 },
  { slug: "full_bar", label: "Full Bar", count: 0 },
  { slug: "kitchen_food", label: "Food Service", count: 0 },
  { slug: "coaching_available", label: "Coaching", count: 0 },
  { slug: "wifi", label: "WiFi", count: 0 },
  { slug: "parking", label: "Parking", count: 0 },
];

// Software with venues - UPDATE AFTER RUNNING SCRIPT
export const AVAILABLE_SOFTWARE: CategoryItem[] = [
  { slug: "e6", label: "E6 Connect", count: 0 },
  { slug: "gspro", label: "GSPro", count: 0 },
  { slug: "tgc", label: "TGC 2019", count: 0 },
];

// Launch monitors with venues - UPDATE AFTER RUNNING SCRIPT
export const AVAILABLE_LAUNCH_MONITORS: CategoryItem[] = [
  { slug: "radar", label: "Radar", count: 0 },
  { slug: "photometric_camera", label: "Camera", count: 0 },
  { slug: "hybrid", label: "Hybrid", count: 0 },
];

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
      links.push({ href: `/best/vibe/${vibe.slug}`, label: `Best ${vibe.label}`, count: vibe.count });
    }
  } else {
    // Add other vibes excluding current
    for (const vibe of AVAILABLE_VIBES.filter(v => v.slug !== currentSlug).slice(0, 2)) {
      links.push({ href: `/best/vibe/${vibe.slug}`, label: `Best ${vibe.label}`, count: vibe.count });
    }
  }

  // Add segments
  if (currentCategory !== "who-its-for") {
    for (const seg of AVAILABLE_SEGMENTS.slice(0, 2)) {
      if (links.length < limit) {
        links.push({ href: `/best/who-its-for/${seg.slug}`, label: `Best for ${seg.label}`, count: seg.count });
      }
    }
  } else {
    for (const seg of AVAILABLE_SEGMENTS.filter(s => s.slug !== currentSlug).slice(0, 2)) {
      if (links.length < limit) {
        links.push({ href: `/best/who-its-for/${seg.slug}`, label: `Best for ${seg.label}`, count: seg.count });
      }
    }
  }

  // Add hardware
  if (currentCategory !== "hardware") {
    for (const hw of AVAILABLE_HARDWARE.slice(0, 2)) {
      if (links.length < limit) {
        links.push({ href: `/best/hardware/${hw.slug}`, label: `Best ${hw.label}`, count: hw.count });
      }
    }
  } else {
    for (const hw of AVAILABLE_HARDWARE.filter(h => h.slug !== currentSlug).slice(0, 2)) {
      if (links.length < limit) {
        links.push({ href: `/best/hardware/${hw.slug}`, label: `Best ${hw.label}`, count: hw.count });
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

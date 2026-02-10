import { VenueListItem } from "@/types";
import { normalizeHardwareBrand } from "@/lib/hardware-brands";
import { extractSoftwareSlugsFromComprehensiveData, normalizeSoftwareSlug } from "@/lib/software-slugs";

export function normalizeSlug(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export function matchesTag(venue: VenueListItem, tag: string) {
  // Handle both hyphen and underscore variants
  const tagVariants = [
    tag,                           // Exact match (e.g., "date-night")
    tag.replace(/_/g, "-"),       // Underscore → Hyphen (e.g., "date_night")
  ];
  return (venue.tags || []).some(t => tagVariants.includes(t));
}

export function matchesVibe(venue: VenueListItem, vibe: string) {
  return (venue.vibeTags || []).includes(vibe);
}

export function matchesWhoItsFor(venue: VenueListItem, segment: string) {
  return (venue.whoItsFor || []).includes(segment);
}

export function matchesHardware(venue: VenueListItem, brand: string) {
  const normalizedBrand = normalizeHardwareBrand(brand);
  if (!normalizedBrand) return false;
  if ((venue.hardwareBrands || []).includes(normalizedBrand)) return true;
  if (!venue.simulatorSystems) return false;
  try {
    const systems = venue.simulatorSystems as { brand?: string; model?: string }[];
    return systems.some((system) => normalizeHardwareBrand(system.brand || "") === normalizedBrand);
  } catch {
    return false;
  }
}

export function matchesSoftware(venue: { softwareSlugs?: string[] | null; comprehensiveData?: unknown }, software: string) {
  const softwareSlug = normalizeSoftwareSlug(software);
  if (!softwareSlug) return false;
  if ((venue.softwareSlugs || []).includes(softwareSlug)) return true;
  return extractSoftwareSlugsFromComprehensiveData(venue.comprehensiveData).includes(softwareSlug);
}

export function matchesAmenity(venue: VenueListItem, amenity: string) {
  switch (amenity) {
    case "wifi":
      return !!venue.wifi;
    case "private_rooms":
      return !!venue.hasPrivateRooms;
    case "free_parking":
      return venue.parking === "free_lot";
    case "valet_parking":
      return venue.parking === "valet";
    case "full_bar":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return Boolean((venue.foodAndDrink as any)?.alcohol);
    case "kitchen_food":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return Boolean((venue.foodAndDrink as any)?.food);
    case "coaching_available":
      return !!venue.coachingAvailable;
    default:
      return false;
  }
}

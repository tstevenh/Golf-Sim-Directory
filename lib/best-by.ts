import { VenueListItem } from "@/types";

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
  if (!venue.simulatorSystems) return false;
  try {
    const systems = venue.simulatorSystems as { brand?: string; model?: string }[];
    return systems.some((system) => system.brand?.toLowerCase() === brand.toLowerCase());
  } catch {
    return false;
  }
}

export function matchesSoftware(venue: { comprehensiveData?: unknown }, software: string) {
  if (!venue.comprehensiveData) return false;
  try {
    const data = venue.comprehensiveData as { simulator_software?: string[] };
    return (data.simulator_software || []).some(
      (item) => item.toLowerCase() === software.toLowerCase()
    );
  } catch {
    return false;
  }
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

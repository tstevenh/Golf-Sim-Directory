import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import { getStateSlug } from "@/lib/states";

function toPathSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface RevalidateVenueInput {
  state: string;
  city: string;
  venueSlug?: string | null;
}

export function revalidateVenuePublicPages(input: RevalidateVenueInput) {
  const stateSlug = getStateSlug(input.state);
  const citySlug = toPathSegment(input.city);
  const venueSlug = input.venueSlug ? toPathSegment(input.venueSlug) : null;

  const cityBase = `/venue/us/${stateSlug}/${citySlug}`;

  // Core public paths
  revalidatePath("/");
  revalidatePath("/venue/us");
  revalidatePath(`/venue/us/${stateSlug}`);
  revalidatePath(cityBase);
  revalidatePath(`${cityBase}/best`);
  revalidatePath("/best");

  if (venueSlug) {
    revalidatePath(`${cityBase}/${venueSlug}`);
  }

  // Dynamic route patterns (invalidate all variants for this route type).
  revalidatePath("/venue/us/[state]/[city]/page/[page]", "page");
  revalidatePath("/venue/us/[state]/[city]/best/[tag]", "page");
  revalidatePath("/venue/us/[state]/[city]/best/vibe/[vibe]", "page");
  revalidatePath("/venue/us/[state]/[city]/best/who-its-for/[segment]", "page");
  revalidatePath("/venue/us/[state]/[city]/best/hardware/[brand]", "page");
  revalidatePath("/venue/us/[state]/[city]/best/launch-monitor/[type]", "page");
  revalidatePath("/venue/us/[state]/[city]/best/software/[software]", "page");
  revalidatePath("/venue/us/[state]/[city]/best/amenities/[amenity]", "page");
  revalidatePath("/best/[tag]", "page");
  revalidatePath("/best/vibe/[vibe]", "page");
  revalidatePath("/best/who-its-for/[segment]", "page");
  revalidatePath("/best/hardware/[brand]", "page");
  revalidatePath("/best/launch-monitor/[type]", "page");
  revalidatePath("/best/software/[software]", "page");
  revalidatePath("/best/amenities/[amenity]", "page");

  // Metadata routes
  revalidatePath("/robots.txt");
  revalidatePath("/sitemap.xml");
  revalidatePath("/sitemaps/city-best/sitemap/0.xml");

  // Cached data tags used across listing/index pages.
  revalidateTag("state-venue-counts", "max");
  revalidateTag("city-venue-counts", "max");
  revalidateTag("cities-in-state", "max");
  revalidateTag("featured-venues", "max");
  revalidateTag("total-active-venue-count", "max");
  revalidateTag("nearby-cities", "max");
  revalidateTag("nearby-venues", "max");
  revalidateTag("category-counts", "max");
}

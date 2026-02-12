import { getStateSlug } from "@/lib/states";

function toCityPath(city: string): string {
  return city
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toVenueSlugPath(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getVenueHref(state: string, city: string, slug: string): string {
  return `/venue/us/${getStateSlug(state)}/${toCityPath(city)}/${toVenueSlugPath(slug)}`;
}

import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { getStateSlug } from "@/lib/states";
import { getAllPosts } from "@/lib/blog";
import {
  AVAILABLE_TAGS,
  AVAILABLE_VIBES,
  AVAILABLE_SEGMENTS,
  AVAILABLE_HARDWARE,
  AVAILABLE_SOFTWARE,
  AVAILABLE_AMENITIES,
  AVAILABLE_LAUNCH_MONITORS,
} from "@/lib/category-config.generated";

const BASE_URL = "https://golfsimmap.com";
const VENUES_PER_SITEMAP = 5000;

// ── Sitemap index ───────────────────────────────────────────────────────────
// ID 0 = static + states + cities
// ID 1 = /best/* category pages
// ID 2+ = venue detail pages (paginated)

export async function generateSitemaps() {
  const { count } = await supabase
    .from("venues")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  const venueCount = count || 0;
  const venueSitemapCount = Math.max(1, Math.ceil(venueCount / VENUES_PER_SITEMAP));

  const ids = [
    { id: 0 }, // static + states + cities
    { id: 1 }, // /best/* category pages
  ];

  for (let i = 0; i < venueSitemapCount; i++) {
    ids.push({ id: 2 + i }); // venue pages
  }

  return ids;
}

// ── Helper: fetch all venues (paginated) ────────────────────────────────────
async function fetchAllVenues<T = Record<string, unknown>>(
  select: string,
  offset = 0,
  limit?: number
): Promise<T[]> {
  const rows: T[] = [];
  let from = offset;
  const pageSize = 1000;
  const max = limit ? offset + limit : Infinity;

  while (from < max) {
    const to = Math.min(from + pageSize - 1, max - 1);
    const { data: page, error } = await supabase
      .from("venues")
      .select(select)
      .eq("status", "active")
      .range(from, to);
    if (error || !page || page.length === 0) break;
    rows.push(...(page as T[]));
    if (page.length < pageSize) break;
    from += pageSize;
  }

  return rows;
}

// ── Sitemap generators ──────────────────────────────────────────────────────
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  if (id === 0) return buildStaticSitemap();
  if (id === 1) return buildBestSitemap();
  return buildVenueSitemap(id - 2);
}

// ── ID 0: Static pages + blog posts + states + cities ──────────────────────
async function buildStaticSitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/venue/us`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/best`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/submit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/claim`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Blog posts
  const posts = getAllPosts();
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Fetch venues for state/city derivation
  const venues = await fetchAllVenues<{ state: string; city: string; country: string }>("state, city, country");
  const usVenues = venues.filter((v) => v.country === "US");

  const stateSet = new Set<string>();
  const citySet = new Set<string>();
  for (const v of usVenues) {
    stateSet.add(v.state);
    citySet.add(`${v.state}|${v.city}`);
  }

  const stateRoutes: MetadataRoute.Sitemap = Array.from(stateSet).map((state) => ({
    url: `${BASE_URL}/venue/us/${getStateSlug(state)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const cityRoutes: MetadataRoute.Sitemap = Array.from(citySet).map((key) => {
    const [state, city] = key.split("|");
    return {
      url: `${BASE_URL}/venue/us/${getStateSlug(state)}/${city.toLowerCase().replace(/\s+/g, "-")}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    };
  });

  return [...staticPages, ...blogRoutes, ...stateRoutes, ...cityRoutes];
}

// ── ID 1: /best/* category pages ────────────────────────────────────────────
function toUrlSlug(slug: string): string {
  return slug.replace(/_/g, "-");
}

function buildBestSitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];
  const now = new Date();

  // /best/[tag]
  for (const tag of AVAILABLE_TAGS.filter((t) => t.count > 0)) {
    routes.push({
      url: `${BASE_URL}/best/${toUrlSlug(tag.slug)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  // /best/vibe/[vibe]
  for (const vibe of AVAILABLE_VIBES.filter((v) => v.count > 0)) {
    routes.push({
      url: `${BASE_URL}/best/vibe/${toUrlSlug(vibe.slug)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  // /best/who-its-for/[segment]
  for (const seg of AVAILABLE_SEGMENTS.filter((s) => s.count > 0)) {
    routes.push({
      url: `${BASE_URL}/best/who-its-for/${toUrlSlug(seg.slug)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  // /best/hardware/[brand]
  for (const hw of AVAILABLE_HARDWARE.filter((h) => h.count > 0)) {
    routes.push({
      url: `${BASE_URL}/best/hardware/${toUrlSlug(hw.slug)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  // /best/software/[software]
  for (const sw of AVAILABLE_SOFTWARE.filter((s) => s.count > 0)) {
    routes.push({
      url: `${BASE_URL}/best/software/${toUrlSlug(sw.slug)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  // /best/amenities/[amenity]
  for (const am of AVAILABLE_AMENITIES.filter((a) => a.count > 0)) {
    routes.push({
      url: `${BASE_URL}/best/amenities/${toUrlSlug(am.slug)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  // /best/launch-monitor/[type]
  for (const lm of AVAILABLE_LAUNCH_MONITORS.filter((l) => l.count > 0)) {
    routes.push({
      url: `${BASE_URL}/best/launch-monitor/${toUrlSlug(lm.slug)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return routes;
}

// ── ID 2+: Venue detail pages (paginated) ───────────────────────────────────
async function buildVenueSitemap(page: number): Promise<MetadataRoute.Sitemap> {
  const offset = page * VENUES_PER_SITEMAP;
  const venues = await fetchAllVenues<{ slug: string; city: string; state: string; updatedAt: string }>(
    "slug, city, state, updatedAt",
    offset,
    VENUES_PER_SITEMAP
  );

  return venues.map((v) => ({
    url: `${BASE_URL}/venue/us/${getStateSlug(v.state)}/${v.city.toLowerCase().replace(/\s+/g, "-")}/${v.slug}`,
    lastModified: v.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
}

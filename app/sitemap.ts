import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { getStateSlug } from "@/lib/states";
import { getAllPosts } from "@/lib/blog";
import { getSnapshotActiveUSVenues } from "@/lib/build-venues-cache";
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
const LAUNCH_MONITOR_SLUGS = ["trackman-4", "gcquad", "uneekor-eyexo"] as const;
const CITY_PAGE_SIZE = 12;
const VENUE_FETCH_BATCH_SIZE = 1000;
export const revalidate = 2592000;

type SitemapVenueRow = {
  slug: string;
  city: string;
  state: string;
  updatedAt: string;
};

function toPathSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getSitemapVenueRowsFromSnapshot(): SitemapVenueRow[] {
  return getSnapshotActiveUSVenues()
    .filter((venue) =>
      typeof venue.slug === "string" &&
      typeof venue.city === "string" &&
      typeof venue.state === "string"
    )
    .map((venue) => ({
      slug: String(venue.slug),
      city: String(venue.city),
      state: String(venue.state),
      updatedAt:
        typeof venue.updatedAt === "string"
          ? venue.updatedAt
          : new Date().toISOString(),
    }));
}

async function getSitemapVenueRowsFromDb(): Promise<SitemapVenueRow[]> {
  const rows: SitemapVenueRow[] = [];
  let from = 0;

  while (true) {
    const to = from + VENUE_FETCH_BATCH_SIZE - 1;
    const { data, error } = await supabase
      .from("venues")
      .select("slug, city, state, updatedAt")
      .eq("status", "active")
      .eq("country", "US")
      .order("id", { ascending: true })
      .range(from, to);

    if (error) {
      throw error;
    }

    const batch = data || [];
    rows.push(
      ...batch
        .filter(
          (venue) =>
            typeof venue.slug === "string" &&
            typeof venue.city === "string" &&
            typeof venue.state === "string"
        )
        .map((venue) => ({
          slug: String(venue.slug),
          city: String(venue.city),
          state: String(venue.state),
          updatedAt:
            typeof venue.updatedAt === "string"
              ? venue.updatedAt
              : new Date().toISOString(),
        }))
    );

    if (batch.length < VENUE_FETCH_BATCH_SIZE) {
      break;
    }
    from += VENUE_FETCH_BATCH_SIZE;
  }

  return rows;
}

async function getSitemapVenueRows(): Promise<SitemapVenueRow[]> {
  const snapshotRows = getSitemapVenueRowsFromSnapshot();
  if (snapshotRows.length > 0) {
    return snapshotRows;
  }
  return getSitemapVenueRowsFromDb();
}

// ── Sitemap generator ───────────────────────────────────────────────────────
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const venueRows = await getSitemapVenueRows();
  const staticRoutes = buildStaticSitemap(venueRows);
  const bestRoutes = buildBestSitemap();
  const venueRoutes = buildVenueSitemap(venueRows);
  return [...staticRoutes, ...bestRoutes, ...venueRoutes];
}

// ── Static pages + blog posts + states + cities ─────────────────────────────
function buildStaticSitemap(venueRows: SitemapVenueRow[]): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/venue/us`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/best`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/best/vibe`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/best/hardware`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/best/who-its-for`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/best/launch-monitor`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/best/amenities`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/best/software`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/launch-monitors`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const launchMonitorRoutes: MetadataRoute.Sitemap = LAUNCH_MONITOR_SLUGS.map((slug) => ({
    url: `${BASE_URL}/launch-monitors/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Blog posts
  const posts = getAllPosts();
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const stateSet = new Set<string>();
  const cityCounts = new Map<string, number>();
  for (const v of venueRows) {
    stateSet.add(v.state);
    const key = `${v.state}|${v.city}`;
    cityCounts.set(key, (cityCounts.get(key) || 0) + 1);
  }

  const stateRoutes: MetadataRoute.Sitemap = Array.from(stateSet).map((state) => ({
    url: `${BASE_URL}/venue/us/${getStateSlug(state)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const cityRoutes: MetadataRoute.Sitemap = Array.from(cityCounts.keys()).map((key) => {
    const [state, city] = key.split("|");
    return {
      url: `${BASE_URL}/venue/us/${getStateSlug(state)}/${toPathSegment(city)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    };
  });

  const cityPaginatedRoutes: MetadataRoute.Sitemap = [];
  for (const [key, count] of cityCounts.entries()) {
    if (count <= CITY_PAGE_SIZE) continue;

    const [state, city] = key.split("|");
    const stateSlug = getStateSlug(state);
    const citySlug = toPathSegment(city);
    const totalPages = Math.ceil(count / CITY_PAGE_SIZE);

    for (let page = 2; page <= totalPages; page++) {
      cityPaginatedRoutes.push({
        url: `${BASE_URL}/venue/us/${stateSlug}/${citySlug}/page/${page}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  }

  return [
    ...staticPages,
    ...launchMonitorRoutes,
    ...blogRoutes,
    ...stateRoutes,
    ...cityRoutes,
    ...cityPaginatedRoutes,
  ];
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

// ── Venue detail pages ───────────────────────────────────────────────────────
function buildVenueSitemap(venueRows: SitemapVenueRow[]): MetadataRoute.Sitemap {
  return venueRows.map((v) => ({
    url: `${BASE_URL}/venue/us/${getStateSlug(v.state)}/${toPathSegment(v.city)}/${toPathSegment(v.slug)}`,
    lastModified: v.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
}

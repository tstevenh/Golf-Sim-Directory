import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getStateSlug } from "@/lib/states";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://golfsimmap.com";

  // Static pages
  const staticPages = [
    { path: "", priority: 1, frequency: "daily" as const },
    { path: "/about", priority: 0.8, frequency: "weekly" as const },
    { path: "/contact", priority: 0.8, frequency: "weekly" as const },
    { path: "/blog", priority: 0.8, frequency: "weekly" as const },
    { path: "/terms", priority: 0.5, frequency: "monthly" as const },
    { path: "/privacy", priority: 0.5, frequency: "monthly" as const },
    { path: "/search", priority: 0.9, frequency: "weekly" as const },
    { path: "/submit", priority: 0.8, frequency: "weekly" as const },
    { path: "/claim", priority: 0.8, frequency: "weekly" as const },
    { path: "/venue/us", priority: 0.9, frequency: "daily" as const },
    { path: "/best", priority: 0.9, frequency: "weekly" as const },
  ];

  // Get all states
  const states = await db.venue.groupBy({
    by: ["state"],
    where: { status: "active", country: "US" },
  });

  // Get all cities
  const cities = await db.venue.groupBy({
    by: ["city", "state"],
    where: { status: "active", country: "US" },
  });

  // Get all venues
  const venues = await db.venue.findMany({
    where: { status: "active" },
    select: { slug: true, city: true, state: true, updatedAt: true },
  });

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.frequency,
    priority: page.priority,
  }));

  // State routes
  const stateRoutes: MetadataRoute.Sitemap = states.map((s) => ({
    url: `${baseUrl}/venue/us/${getStateSlug(s.state)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // City routes
  const cityRoutes: MetadataRoute.Sitemap = cities.map((c) => ({
    url: `${baseUrl}/venue/us/${getStateSlug(c.state)}/${c.city.toLowerCase().replace(/\s+/g, "-")}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Venue routes
  const venueRoutes: MetadataRoute.Sitemap = venues.map((v) => ({
    url: `${baseUrl}/venue/us/${getStateSlug(v.state)}/${v.city.toLowerCase().replace(/\s+/g, "-")}/${v.slug}`,
    lastModified: v.updatedAt,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...stateRoutes, ...cityRoutes, ...venueRoutes];
}

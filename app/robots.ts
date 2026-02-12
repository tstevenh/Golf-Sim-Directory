import type { MetadataRoute } from "next";
import { getCityBestSitemapIds } from "@/lib/city-best-sitemap";

const BASE_URL = "https://golfsimmap.com";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const cityBestSitemapIds = await getCityBestSitemapIds();
  const cityBestSitemaps = cityBestSitemapIds.map(
    (id) => `${BASE_URL}/sitemaps/city-best/sitemap/${id}.xml`
  );

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/dashboard", "/login", "/register"],
    },
    host: BASE_URL,
    sitemap: [`${BASE_URL}/sitemap.xml`, ...cityBestSitemaps],
  };
}

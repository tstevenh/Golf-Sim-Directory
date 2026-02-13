import type { MetadataRoute } from "next";
import { getCityBestSitemapChunks, getCityBestSitemapIds } from "@/lib/city-best-sitemap";

export const revalidate = 15552000;

export async function generateSitemaps() {
  const ids = await getCityBestSitemapIds();
  return ids.map((id) => ({ id }));
}

export default async function sitemap({ id }: { id: Promise<number | string> }): Promise<MetadataRoute.Sitemap> {
  const resolvedId = Number(await id);
  if (!Number.isInteger(resolvedId) || resolvedId < 0) {
    return [];
  }
  const chunks = await getCityBestSitemapChunks();
  return chunks[resolvedId] || [];
}

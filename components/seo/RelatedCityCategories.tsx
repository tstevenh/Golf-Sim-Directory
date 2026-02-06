"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { getCityBestByLinks } from "@/lib/best-by-config";

interface RelatedCityCategoriesProps {
  state: string;
  city: string;
  currentCategory: string; // e.g., "vibe-casual", "hardware-trackman"
}

export function RelatedCityCategories({
  state,
  city,
  currentCategory,
}: RelatedCityCategoriesProps) {
  const allLinks = getCityBestByLinks(state, city, currentCategory);
  
  // Pick a diverse mix: 2 vibes, 2 segments, 2 hardware (or whatever is available)
  const vibeLinks = allLinks.filter((l) => l.category === "vibe").slice(0, 2);
  const segmentLinks = allLinks
    .filter((l) => l.category === "segment")
    .slice(0, 2);
  const hardwareLinks = allLinks
    .filter((l) => l.category === "hardware")
    .slice(0, 2);

  const links = [...vibeLinks, ...segmentLinks, ...hardwareLinks];

  if (links.length === 0) return null;

  return (
    <section className="border border-default bg-charcoal/50 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <MapPin className="w-4 h-4 text-masters-green" />
        <h3 className="text-cream font-medium">Also in {city}</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="
              px-3 py-1.5
              text-sm text-cream-subtle
              border border-default rounded-md
              hover:border-masters-green hover:text-cream hover:bg-masters-green/5
              transition-all duration-200
            "
          >
            {link.label.replace(` in ${city}`, "")}
          </Link>
        ))}
      </div>
    </section>
  );
}

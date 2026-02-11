"use client";

import Link from "next/link";
import { Award } from "lucide-react";
import { getVenueBestByLinks } from "@/lib/best-by-config";

interface VenueBestByLinksProps {
  venue: {
    city: string;
    state: string;
    vibeTags?: string[] | null;
    whoItsFor?: string[] | null;
    simulatorSystems?: unknown;
  };
}

export function VenueBestByLinks({ venue }: VenueBestByLinksProps) {
  const links = getVenueBestByLinks(venue);

  if (links.length === 0) return null;

  return (
    <div className="mt-6 pt-6 border-t border-default">
      <div className="flex items-center gap-2 mb-3">
        <Award className="w-4 h-4 text-masters-green" />
        <span className="text-cream-subtle text-sm">Featured in</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="
              px-3 py-1.5
              text-sm text-cream
              bg-masters-green/10 border border-masters-green/30 rounded-md
              hover:bg-masters-green/20 hover:border-masters-green/50
              transition-all duration-200
            "
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

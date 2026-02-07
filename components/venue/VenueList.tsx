"use client";

import { Venue } from "@/types";
import { VenueCard } from "./VenueCard";
import { MapPin } from "lucide-react";
import { getStateSlug } from "@/lib/states";

interface VenueListProps {
  venues: Venue[];
}

export function VenueList({ venues }: VenueListProps) {
  if (venues.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-default">
        <MapPin className="w-12 h-12 text-muted mx-auto mb-4" />
        <p className="text-muted">No venues found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {venues.map((venue) => {
        const stateSlug = getStateSlug(venue.state);
        const citySlug = venue.city.toLowerCase().replace(/\s+/g, "-");
        
        return (
          <VenueCard
            key={venue.id}
            id={venue.id}
            slug={venue.slug}
            name={venue.name}
            city={venue.city}
            state={venue.state}
            heroImage={venue.heroImage}
            shortDescription={venue.shortDescription}
            venueType={venue.venueType}
            simulatorSystems={venue.simulatorSystems as string[] | null}
            launchMonitorType={venue.launchMonitorType}
            priceRangeMin={venue.priceRangeMin}
            priceRangeMax={venue.priceRangeMax}
            ratingOverall={venue.ratingOverall}
            featured={venue.featured}
            tags={venue.tags}
            href={`/venue/us/${stateSlug}/${citySlug}/${venue.slug}`}
          />
        );
      })}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { ArrowDownAZ, ArrowDown01 } from "lucide-react";
import { StateCard } from "@/components/location/LocationCards";
import { getStateDisplayName } from "@/lib/states";

interface StateData {
  state: string;
  _count: { id: number };
}

interface StatesSortWrapperProps {
  statesWithVenues: StateData[];
}

type SortOption = "venues" | "alphabetical";

export function StatesSortWrapper({ statesWithVenues }: StatesSortWrapperProps) {
  const [sortBy, setSortBy] = useState<SortOption>("venues");

  const sortedStates = useMemo(() => {
    const states = [...statesWithVenues];
    if (sortBy === "alphabetical") {
      return states.sort((a, b) => {
        const nameA = getStateDisplayName(a.state);
        const nameB = getStateDisplayName(b.state);
        return nameA.localeCompare(nameB);
      });
    }
    // Default: sort by venue count (descending)
    return states.sort((a, b) => b._count.id - a._count.id);
  }, [statesWithVenues, sortBy]);

  return (
    <section className="mb-12">
      {/* Header with Sort Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-cream text-xl flex items-center gap-2">
          <span className="w-1 h-6 bg-masters-green rounded-full" />
          Browse All States
        </h2>
        
        {/* Sort Toggle */}
        <div className="flex items-center gap-2 p-1 bg-charcoal border border-default rounded-lg">
          <button
            onClick={() => setSortBy("venues")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-all ${
              sortBy === "venues"
                ? "bg-masters-green text-deep-black font-medium"
                : "text-muted hover:text-cream"
            }`}
          >
            <ArrowDown01 className="w-4 h-4" />
            <span>Most Venues</span>
          </button>
          <button
            onClick={() => setSortBy("alphabetical")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-all ${
              sortBy === "alphabetical"
                ? "bg-masters-green text-deep-black font-medium"
                : "text-muted hover:text-cream"
            }`}
          >
            <ArrowDownAZ className="w-4 h-4" />
            <span>A–Z</span>
          </button>
        </div>
      </div>

      {/* States Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedStates.map((stateData) => {
          const stateCode = stateData.state;
          const stateName = getStateDisplayName(stateCode);
          const stateSlug = stateName.toLowerCase().replace(/\s+/g, "-");
          
          return (
            <StateCard
              key={stateCode}
              stateCode={stateCode}
              stateName={stateName}
              venueCount={stateData._count.id}
              href={`/venue/us/${stateSlug}`}
            />
          );
        })}
      </div>

      {/* Empty state */}
      {statesWithVenues.length === 0 && (
        <div className="text-center py-16 border border-default rounded-lg">
          <p className="text-muted">No venues found. Check back soon!</p>
        </div>
      )}
    </section>
  );
}

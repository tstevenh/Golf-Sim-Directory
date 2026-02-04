import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { TrendingUp } from "lucide-react";
import { StateCard } from "@/components/location/LocationCards";
import { getStateDisplayName } from "@/lib/states";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Golf Simulators by State | GolfSimMap",
  description: "Find indoor golf simulators and screen golf venues across all US states. Browse by state to discover venues near you.",
};

export default async function StatesIndexPage() {
  // Get all states with venue counts
  let statesWithVenues: { state: string; _count: { id: number } }[] = [];
  try {
    const result = await db.venue.groupBy({
      by: ["state"],
      where: { status: "active", country: "US" },
      _count: { id: true },
    });
    // Sort in memory
    statesWithVenues = result.sort((a, b) => b._count.id - a._count.id);
  } catch {
    // Return empty if DB unavailable during build
  }

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
              United States
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-cream mb-2">Browse by State</h1>
              <p className="text-muted max-w-xl">
                Find indoor golf simulators across the United States. Select a state to explore venues in your area.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <TrendingUp className="w-4 h-4 text-masters-green" />
              <span className="text-sm text-muted">
                {statesWithVenues.length} states with venues
              </span>
            </div>
          </div>
        </div>

        {/* States Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {statesWithVenues.map((stateData) => {
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
          <div className="text-center py-16 border border-default">
            <p className="text-muted">No venues found. Check back soon!</p>
          </div>
        )}

        {/* Back to home */}
        <div className="mt-12 text-center">
          <Link href="/" className="text-muted hover:text-cream transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

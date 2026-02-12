import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
import { supabase } from "@/lib/supabase";
import { getCachedNearbyVenues } from "@/lib/cached-queries";
import {
  getStaticVenueParamsFromSnapshot,
  getVenueBySlugFromSnapshot,
} from "@/lib/build-venues-cache";
import { VenueDetail } from "@/components/venue/VenueDetail";
import { VenueSchema } from "@/components/seo/VenueSchema";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getStateDisplayName, getStateAbbrevFromName, getStateSlug } from "@/lib/states";

interface VenuePageProps {
  params: Promise<{
    state: string;
    city: string;
    venueSlug: string;
  }>;
}

export const revalidate = 86400;
const META_DESCRIPTION_MAX = 155;

// Memoize venue fetch to prevent duplicate queries between generateMetadata and page
const getVenueBySlug = cache(async (slug: string) => {
  const snapshotVenue = getVenueBySlugFromSnapshot(slug);
  if (snapshotVenue) return snapshotVenue;

  const { data } = await supabase.from("venues").select("*").eq("slug", slug).single();
  return data || null;
});

function normalizeText(value: string | null | undefined): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

function truncateToSentences(value: string, maxLength = META_DESCRIPTION_MAX): string {
  if (value.length <= maxLength) return value;
  const sentences = value.split(/(?<=[.!?])\s+/);
  let result = "";
  for (const sentence of sentences) {
    const candidate = result ? `${result} ${sentence}` : sentence;
    if (candidate.length > maxLength) break;
    result = candidate;
  }
  if (result) return result;
  const clipped = value.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  const safeCut = lastSpace > 80 ? clipped.slice(0, lastSpace) : clipped.slice(0, maxLength - 1);
  return `${safeCut.replace(/[.,;:!?-]+$/, "").trimEnd()}.`;
}

function getFirstMeaningfulSentence(about: string): string {
  const sentences = normalizeText(about)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const meaningful = sentences.find((s) => s.split(/\s+/).length >= 8) || sentences[0] || "";
  if (!meaningful) return "";
  return /[.!?]$/.test(meaningful) ? meaningful : `${meaningful}.`;
}

function buildFallbackDescription(
  name: string,
  city: string,
  state: string,
  venueTypeLabel: string,
  launchMonitorType: string,
  priceSnippet: string
): string {
  const techLabel =
    launchMonitorType && launchMonitorType !== "unknown"
      ? `${launchMonitorType} launch monitors`
      : "golf simulators";
  return `${name} in ${city}, ${state} - ${venueTypeLabel.toLowerCase()} with ${techLabel}.${priceSnippet} Book online or walk in.`;
}

function buildMetaDescription(venue: {
  name: string;
  city: string;
  state: string;
  about: string | null;
  metaDescription: string | null;
  launchMonitorType: string;
}, venueTypeLabel: string, priceSnippet: string): string {
  const explicitMeta = normalizeText(venue.metaDescription);
  if (explicitMeta) return truncateToSentences(explicitMeta);

  const about = normalizeText(venue.about);
  if (about) {
    const firstSentence = getFirstMeaningfulSentence(about);
    if (firstSentence) return firstSentence;
  }

  return truncateToSentences(
    buildFallbackDescription(
      venue.name,
      venue.city,
      venue.state,
      venueTypeLabel,
      venue.launchMonitorType,
      priceSnippet
    )
  );
}

export async function generateMetadata({ params }: VenuePageProps): Promise<Metadata> {
  try {
    const { venueSlug } = await params;
    // Use cached fetch to avoid duplicate query with page component
    const venue = await getVenueBySlug(venueSlug);

    if (!venue) {
      return { title: "Venue Not Found" };
    }

    const { state, city } = await params;
    const venueTypeLabel = venue.venueType === "sim_bar" ? "Simulator Bar" 
      : venue.venueType === "training_studio" ? "Training Studio"
      : venue.venueType === "entertainment_venue" ? "Entertainment Venue"
      : "Indoor Golf";
    const title =
      venue.metaTitle ||
      `${venue.name} — ${venueTypeLabel} in ${venue.city}, ${venue.state}`;
    const priceSnippet = venue.priceRangeMin && venue.priceRangeMax
      ? ` From $${venue.priceRangeMin}/hr.`
      : venue.priceRangeMin ? ` From $${venue.priceRangeMin}/hr.` : "";
    const description = buildMetaDescription(venue, venueTypeLabel, priceSnippet);
    const canonicalUrl = `https://golfsimmap.com/venue/us/${state}/${city}/${venue.slug}`;

    return {
      title,
      description,
      keywords: [
        "golf simulator",
        venue.city,
        venue.state,
        "indoor golf",
        "screen golf",
        venue.venueType === "sim_bar" ? "golf bar" : "golf facility",
      ],
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        type: "website",
        url: canonicalUrl,
        images: venue.heroImage ? [venue.heroImage] : [],
      },
    };
  } catch {
    return { title: "Venue", description: "Golf simulator venue" };
  }
}

export async function generateStaticParams() {
  const snapshotParams = getStaticVenueParamsFromSnapshot();
  if (snapshotParams.length > 0) {
    return snapshotParams.map((venue) => ({
      state: getStateSlug(venue.state),
      city: venue.city.toLowerCase().replace(/\s+/g, "-"),
      venueSlug: venue.venueSlug,
    }));
  }

  const params: { state: string; city: string; venueSlug: string }[] = [];
  const pageSize = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data } = await supabase
      .from("venues")
      .select("slug, city, state")
      .eq("status", "active")
      .eq("country", "US")
      .range(offset, offset + pageSize - 1);

    if (!data || data.length === 0) {
      break;
    }

    params.push(
      ...data.map((venue) => ({
        state: getStateSlug(venue.state),
        city: venue.city.toLowerCase().replace(/\s+/g, "-"),
        venueSlug: venue.slug,
      }))
    );

    hasMore = data.length === pageSize;
    offset += pageSize;
  }

  return params;
}

export default async function VenuePage({ params }: VenuePageProps) {
  try {
    const { state, city, venueSlug } = await params;
    const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
    const stateName = getStateDisplayName(stateAbbrev);
    const cityFormatted = city
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    // Use cached fetch - already called in generateMetadata, so this won't hit DB again
    const venue = await getVenueBySlug(venueSlug);

    if (!venue || venue.status !== "active") {
      notFound();
    }

    const { venues: nearbyVenues, scope: nearbyScope } = await getCachedNearbyVenues(
      venue.city,
      venue.state,
      String(venue.id)
    );
    const isStateFallback = nearbyScope === "state";

    // Cast nearby venues to match VenueCard props
    const nearbyVenuesFormatted = nearbyVenues.map((v) => ({
      ...v,
      simulatorSystems: v.simulatorSystems as string[] | null,
      tags: v.tags as string[] | null,
    }));

    return (
      <div className="min-h-screen bg-deep-black">
        <VenueSchema venue={venue} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "United States", href: "/venue/us" },
              { label: stateName, href: `/venue/us/${state}` },
              { label: cityFormatted, href: `/venue/us/${state}/${city}` },
              { label: venue.name },
            ]}
          />
        </div>

        <VenueDetail 
          venue={venue} 
          isFavorited={false} 
          user={undefined}
          nearbyVenues={nearbyVenuesFormatted}
          nearbyScope={isStateFallback ? "state" : "city"}
        />
      </div>
    );
  } catch {
    return (
      <div className="min-h-screen bg-deep-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-cream mb-4">Venue Not Found</h1>
          <p className="text-muted mb-6">We couldn&apos;t find this venue.</p>
          <Link href="/venue/us" className="text-masters-green hover:text-cream">
            Browse all venues →
          </Link>
        </div>
      </div>
    );
  }
}

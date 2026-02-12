import { Venue } from "@/types";
import { getVenueHref } from "@/lib/venue-url";

interface VenueSchemaProps {
  venue: Venue;
}

const SCHEMA_DESCRIPTION_MAX = 160;

const VENUE_TYPE_LABELS: Partial<Record<Venue["venueType"], string>> = {
  sim_bar: "Simulator Bar",
  training_studio: "Training Studio",
  private_rental: "Private Rental",
  retail_fitting_center: "Retail Fitting Center",
  country_club: "Country Club",
  multi_sport_sim: "Multi-Sport Venue",
  hotel_resort: "Hotel Resort Venue",
  indoor_golf_center: "Indoor Golf Center",
  entertainment_venue: "Entertainment Venue",
  golf_performance_center: "Golf Performance Center",
  bar: "Golf Bar",
  other: "Indoor Golf Venue",
};

function normalizeText(value: string | null | undefined): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

function truncateAtWord(value: string, maxLength = SCHEMA_DESCRIPTION_MAX): string {
  if (value.length <= maxLength) return value;
  const clipped = value.slice(0, maxLength + 1);
  const lastSpace = clipped.lastIndexOf(" ");
  const safeCut = lastSpace > 100 ? clipped.slice(0, lastSpace) : clipped.slice(0, maxLength);
  return `${safeCut.replace(/[.,;:!?-]+$/, "").trimEnd()}...`;
}

function getFirstMeaningfulSentence(text: string): string {
  const sentences = normalizeText(text)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const meaningful = sentences.find((sentence) => sentence.split(/\s+/).length >= 8) || sentences[0] || "";
  if (!meaningful) return "";
  return /[.!?]$/.test(meaningful) ? meaningful : `${meaningful}.`;
}

function buildFallbackDescription(venue: Venue): string {
  const venueTypeLabel = VENUE_TYPE_LABELS[venue.venueType] || "Indoor Golf Venue";
  const techLabel =
    venue.launchMonitorType && venue.launchMonitorType !== "unknown"
      ? `${venue.launchMonitorType.replace(/_/g, " ")} launch monitors`
      : "golf simulators";
  return `${venue.name} in ${venue.city}, ${venue.state} - ${venueTypeLabel.toLowerCase()} with ${techLabel}. Book online or walk in.`;
}

function buildSchemaDescription(venue: Venue): string {
  const explicitMeta = normalizeText(venue.metaDescription);
  if (explicitMeta) return truncateAtWord(explicitMeta);

  const about = normalizeText(venue.about);
  if (about) {
    let summary = getFirstMeaningfulSentence(about);
    if (summary) {
      const lower = summary.toLowerCase();
      const hasName = lower.includes(venue.name.toLowerCase());
      const hasCity = lower.includes(venue.city.toLowerCase());
      const hasState = lower.includes(venue.state.toLowerCase());
      if (!hasName || (!hasCity && !hasState)) {
        summary = `${venue.name} in ${venue.city}, ${venue.state}. ${summary}`;
      }
      if (summary.length < 120) {
        summary = `${summary} Compare amenities, pricing, and tech on GolfSimMap.`;
      }
      return truncateAtWord(summary);
    }
  }

  return truncateAtWord(buildFallbackDescription(venue));
}

export function VenueSchema({ venue }: VenueSchemaProps) {
  const venueUrl = `https://golfsimmap.com${getVenueHref(venue.state, venue.city, venue.slug)}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": ["SportsActivityLocation", "LocalBusiness"],
    name: venue.name,
    description: buildSchemaDescription(venue),
    url: venueUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.address,
      addressLocality: venue.city,
      addressRegion: venue.state,
      postalCode: venue.zipCode,
      addressCountry: venue.country,
    },
    geo: venue.latitude && venue.longitude ? {
      "@type": "GeoCoordinates",
      latitude: venue.latitude,
      longitude: venue.longitude,
    } : undefined,
    ...(venue.phone && { telephone: venue.phone }),
    ...(venue.email && { email: venue.email }),
    ...(venue.website && { sameAs: venue.website }),
    ...(venue.heroImage && { image: venue.heroImage }),
    // Only include aggregateRating if we have a proper ratingCount
    // Google requires ratingCount or reviewCount for aggregateRating
    ...(venue.ratingOverall && (venue as Record<string, unknown>).ratingCount ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: venue.ratingOverall,
        ratingCount: (venue as Record<string, unknown>).ratingCount,
        bestRating: 5,
        worstRating: 1,
      },
    } : {}),
    ...(venue.hours && {
      openingHoursSpecification: parseHours(venue.hours),
    }),
    ...(venue.priceRangeMin && venue.priceRangeMax && {
      priceRange: `$${venue.priceRangeMin} - $${venue.priceRangeMax}`,
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function parseHours(hoursString: string) {
  const dayMap: Record<string, string> = {
    sun: "Sunday",
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
  };

  return hoursString.split("|").map((day) => {
    const [dayCode, hours] = day.split(":");
    const [opens, closes] = hours.split("-");

    if (opens === "00:00" && closes === "00:00") {
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: dayMap[dayCode],
        closed: true,
      };
    }

    return {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: dayMap[dayCode],
      opens,
      closes,
    };
  });
}

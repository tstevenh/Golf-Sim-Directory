import { Venue } from "@/types";
import { getStateSlug } from "@/lib/states";

interface VenueSchemaProps {
  venue: Venue;
}

export function VenueSchema({ venue }: VenueSchemaProps) {
  const venueUrl = `https://golfsimmap.com/venue/us/${getStateSlug(venue.state)}/${venue.city.toLowerCase().replace(/\s+/g, "-")}/${venue.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": ["SportsActivityLocation", "LocalBusiness"],
    name: venue.name,
    description: venue.shortDescription || venue.about,
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
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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

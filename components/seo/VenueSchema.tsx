import { Venue } from "@/types";
import { getStateSlug } from "@/lib/states";

interface VenueSchemaProps {
  venue: Venue;
}

export function VenueSchema({ venue }: VenueSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: venue.name,
    description: venue.shortDescription || venue.about,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/venue/us/${getStateSlug(venue.state)}/${venue.city.toLowerCase().replace(/\s+/g, "-")}/${venue.slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.address,
      addressLocality: venue.city,
      addressRegion: venue.state,
      postalCode: venue.zipCode,
      addressCountry: venue.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: venue.latitude,
      longitude: venue.longitude,
    },
    ...(venue.phone && { telephone: venue.phone }),
    ...(venue.email && { email: venue.email }),
    ...(venue.website && { url: venue.website }),
    ...(venue.heroImage && { image: venue.heroImage }),
    ...(venue.ratingOverall && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: venue.ratingOverall,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(venue.hours && {
      openingHoursSpecification: parseHours(venue.hours),
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

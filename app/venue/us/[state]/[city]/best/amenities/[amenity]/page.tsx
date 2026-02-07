import { Metadata } from "next";
import { db } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { matchesAmenity } from "@/lib/best-by";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";

interface CityBestAmenityPageProps {
  params: Promise<{ state: string; city: string; amenity: string }>;
}

export const revalidate = 60;

// Amenity-specific content with unique copy
const amenityContent: Record<string, { tagline: string; shortDesc: string; longDesc: string }> = {
  "private_rooms": {
    tagline: "Exclusive Spaces",
    shortDesc: "private simulator rooms for groups and events",
    longDesc: "Privacy transforms the golf simulator experience. Whether you're working on your swing without audience pressure, hosting a business meeting, or celebrating with close friends, a private room adds real value. These spaces typically include dedicated bays, comfortable seating, and often their own food service.",
  },
  "private-rooms": {
    tagline: "Exclusive Spaces",
    shortDesc: "private simulator rooms for groups and events",
    longDesc: "Privacy transforms the golf simulator experience. Whether you're working on your swing without audience pressure, hosting a business meeting, or celebrating with close friends, a private room adds real value. These spaces typically include dedicated bays, comfortable seating, and often their own food service.",
  },
  "full_bar": {
    tagline: "Full Bar Service",
    shortDesc: "craft cocktails, beer, and wine selections",
    longDesc: "Adult beverages and golf simulators pair naturally. Venues with full bars offer cocktails, craft beers, and wine selections that elevate the experience beyond the typical sports bar. Some locations employ mixologists who create golf-themed drinks; others stock premium whiskey collections.",
  },
  "kitchen_food": {
    tagline: "Full Kitchen",
    shortDesc: "real food from a full kitchen",
    longDesc: "Hot food changes the game. Venues with real kitchens serve more than frozen apps—think craft burgers, wood-fired pizzas, and appetizers designed for sharing around a simulator bay. These spots encourage longer sessions and turn golf into a dining experience.",
  },
  "coaching_available": {
    tagline: "Professional Coaching",
    shortDesc: "on-site instruction and lessons",
    longDesc: "Learning from a pro while using simulator data is powerful. Venues with on-site coaching offer lesson packages, swing analysis, and structured improvement programs. Some employ full-time instructors; others partner with local pros who rent teaching time.",
  },
  "wifi": {
    tagline: "Connected Venues",
    shortDesc: "high-speed WiFi access",
    longDesc: "Stay connected while you play. Venues with WiFi let you stream your session, stay on top of work emails, or share your rounds in real-time. Essential for corporate events and remote workers who want to mix business with golf.",
  },
  "free_parking": {
    tagline: "Free Parking",
    shortDesc: "free on-site parking",
    longDesc: "Nothing kills the vibe like circling for parking or paying garage fees. Venues with free parking remove that friction entirely. Look for dedicated lots, especially in urban areas where parking can otherwise cost as much as bay time.",
  },
  "valet_parking": {
    tagline: "Valet Service",
    shortDesc: "convenient valet parking",
    longDesc: "Roll up, hand over the keys, and head straight to your bay. Valet parking signals an upscale experience and makes group arrivals seamless. Expect this at premium venues where the overall experience justifies the extra touch.",
  },
};

export async function generateMetadata({ params }: CityBestAmenityPageProps): Promise<Metadata> {
  const { state, city, amenity } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const amenityLabel = amenity.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const content = amenityContent[amenity.toLowerCase()] || { tagline: "", shortDesc: "this amenity" };

  return {
    title: `Golf Simulators with ${amenityLabel} in ${cityFormatted}, ${stateName} | GolfSimMap`,
    description: `Find golf simulator venues with ${content.shortDesc} in ${cityFormatted}. Compare ratings, hardware, and book your session.`,
    alternates: {
      canonical: `https://golfsimmap.com/venue/us/${state}/${city}/best/amenities/${amenity}`,
    },
    openGraph: {
      title: `Golf Simulators with ${amenityLabel} in ${cityFormatted}`,
      description: `Find venues with ${content.shortDesc} in ${cityFormatted}, ${stateName}.`,
      type: "website",
    },
  };
}

export default async function CityBestAmenityPage({ params }: CityBestAmenityPageProps) {
  const { state, city, amenity } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const amenityLabel = amenity.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const amenityKey = amenity.toLowerCase();

  const content = amenityContent[amenityKey] || {
    tagline: `${amenityLabel} Available`,
    shortDesc: "this amenity",
    longDesc: `Browse venues that offer ${amenityLabel.toLowerCase()}. Use these listings to compare amenities, hardware, and booking options.`,
  };

  const venues = await db.venue.findMany({
    where: {
      city: { equals: cityFormatted, mode: "insensitive" },
      state: stateAbbrev.toUpperCase(),
      country: "US",
      status: "active",
    },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
  });

  const filteredVenues = venues.filter((venue) => matchesAmenity(venue, amenity));

  // Get nearby cities with this amenity
  const nearbyCitiesResult = await db.venue.findMany({
    where: {
      state: stateAbbrev.toUpperCase(),
      country: "US",
      status: "active",
      NOT: { city: { equals: cityFormatted, mode: "insensitive" } },
    },
    select: { city: true },
    distinct: ["city"],
    take: 6,
  });

  const nearbyLinks = nearbyCitiesResult.map((c) => ({
    label: `${amenityLabel} in ${c.city}`,
    href: `/venue/us/${state}/${c.city.toLowerCase().replace(/\s+/g, "-")}/best/amenities/${amenity}`,
  }));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "US", href: "/venue/us" },
    { label: stateName, href: `/venue/us/${state}` },
    { label: cityFormatted, href: `/venue/us/${state}/${city}` },
    { label: `${amenityLabel}` },
  ];

  const faqItems = [
    {
      question: `How many venues with ${amenityLabel.toLowerCase()} are in ${cityFormatted}?`,
      answer: `We found ${filteredVenues.length} venues offering ${content.shortDesc} in ${cityFormatted}, ${stateName}. Availability may vary—always confirm when booking.`,
    },
    {
      question: `What does "${amenityLabel}" include at these venues?`,
      answer: content.longDesc,
    },
    {
      question: `Do ${amenityLabel.toLowerCase()} amenities cost extra?`,
      answer: "It depends on the venue. Some include amenities in bay pricing; others charge separately. Private rooms often have minimum spend requirements. Check venue details or call ahead.",
    },
    {
      question: "How do I confirm amenities before booking?",
      answer: "Check the venue detail page for specifics, or contact the venue directly. Verified venues have confirmed their amenities with us—look for the verified badge.",
    },
  ];

  const relatedLinks = [
    { label: `All venues in ${cityFormatted}`, href: `/venue/us/${state}/${city}` },
    { label: `${amenityLabel} venues (national)`, href: `/best/amenities/${amenity}` },
    { label: `All venues in ${stateName}`, href: `/venue/us/${state}` },
    { label: "Private rooms", href: `/venue/us/${state}/${city}/best/amenities/private_rooms` },
    { label: "Full bar", href: `/venue/us/${state}/${city}/best/amenities/full_bar` },
    { label: "Kitchen food", href: `/venue/us/${state}/${city}/best/amenities/kitchen_food` },
  ].filter(link => !link.href.endsWith(`/amenities/${amenity}`));

  return (
    <BestByPageContent
      title={`Golf Simulators with ${amenityLabel} in ${cityFormatted}`}
      description={`${content.longDesc}\n\nDiscover ${filteredVenues.length} venues in ${cityFormatted}, ${stateName} offering ${content.shortDesc}.`}
      guidancePoints={[
        "Confirm amenity availability when booking—some vary by day or require advance notice.",
        "Check if the amenity is included in bay pricing or charged separately.",
        "Look for verified badges for confirmed amenity information.",
        "Contact venues directly for group bookings or special requirements.",
      ]}
      methodologyDescription={`We identify venues with ${amenityLabel.toLowerCase()} based on their listings and verified claims. Results prioritize featured venues, then sort by rating and data completeness.`}
      faqItems={faqItems}
      nearbyTitle={`${amenityLabel} in nearby ${stateName} cities`}
      nearbyLinks={nearbyLinks}
      relatedLinks={relatedLinks}
      ctaTitle={`Own a venue with ${amenityLabel.toLowerCase()} in ${cityFormatted}?`}
      ctaDescription={`Claim your listing to verify amenities and reach golfers searching for ${content.shortDesc}.`}
      ctaPrimary={{ label: "Claim Your Listing", href: "/claim" }}
      ctaSecondary={{ label: "Submit New Venue", href: "/submit" }}
      venues={filteredVenues}
      categoryType="amenity"
      categoryValue={amenityKey}
      heroSubtitle={`${cityFormatted}, ${stateName}`}
      breadcrumbItems={breadcrumbs}
      showRanking={true}
    />
  );
}

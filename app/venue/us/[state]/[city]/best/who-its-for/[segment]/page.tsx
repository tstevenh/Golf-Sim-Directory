import { Metadata } from "next";
import { supabase, VENUE_CARD_FIELDS } from "@/lib/supabase";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";
import { getStaticRelatedLinks } from "@/lib/category-config.generated";
import { getCachedNearbyCities } from "@/lib/cached-queries";

interface CityBestWhoItsForPageProps {
  params: Promise<{ state: string; city: string; segment: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 15552000;

// Segment-specific descriptions for city pages
const segmentDescriptions: Record<string, { tagline: string; description: string }> = {
  families: {
    tagline: "Fun for All Ages",
    description: "Family-friendly venues welcome kids, offer casual vibes, and usually have food options. Perfect for weekend outings, birthday parties, or just quality family time together where everyone can enjoy the game.",
  },
  beginners: {
    tagline: "Start Your Golf Journey",
    description: "Beginner-friendly spots have patient staff, forgiving setups, and lessons available. No one will judge your swing here — these venues specialize in helping new golfers learn and enjoy the game without pressure or judgment.",
  },
  serious_golfers: {
    tagline: "Train Like a Pro",
    description: "For golfers who want accurate data, quality hardware, and space to actually work on their game. These venues focus on practice and improvement over entertainment — think less bar, more range time, more focused on getting better.",
  },
  serious: {
    tagline: "Train Like a Pro",
    description: "For golfers who want accurate data, quality hardware, and space to actually work on their game. These venues focus on practice and improvement over entertainment — think less bar, more range time, more focused on getting better.",
  },
  groups: {
    tagline: "Party-Ready Venues",
    description: "Group-friendly venues handle parties, corporate events, and bachelor weekends with ease. Multiple bays, food and drink packages, and often private rooms make these perfect for celebrations, team building, or group outings.",
  },
  couples: {
    tagline: "Perfect Date Night",
    description: "Date-night venues have good food, craft drinks, and an atmosphere that works for two. Many offer couples packages or leagues for regulars looking to make it a weekly ritual. Perfect for romantic evenings out or special date nights.",
  },
  corporate: {
    tagline: "Professional Events",
    description: "Corporate-friendly venues handle large bookings, catering, and A/V equipment when needed. Many offer comprehensive event packages for team building, client entertainment, company outings, and business meetings.",
  },
  kids: {
    tagline: "Kid-Approved Fun",
    description: "Venues that welcome children with open arms. Safe, welcoming environments with fun activities and staff who understand that little golfers need extra patience and encouragement.",
  },
  seniors: {
    tagline: "Comfortable & Accessible",
    description: "Venues with accessibility features, comfortable seating, and a pace that works for senior golfers. Focus on enjoyment over intensity with accessible facilities and considerate staff.",
  },
};

export async function generateMetadata({ params }: CityBestWhoItsForPageProps): Promise<Metadata> {
  const { state, city, segment } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const cityFormatted = city.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const segmentLabel = segment.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const segmentDesc = segmentDescriptions[segment.toLowerCase()] || { tagline: "", description: "" };

  return {
    title: `Best Golf Simulators for ${segmentLabel} in ${cityFormatted}, ${stateAbbrev}`,
    description: segmentDesc.description || `Find best golf simulator venues for ${segmentLabel} in ${cityFormatted}. Compare amenities, vibes, and booking options.`,
    alternates: {
      canonical: `https://golfsimmap.com/venue/us/${state}/${city}/best/who-its-for/${segment}`,
    },
    openGraph: {
      title: `Best Golf Simulators for ${segmentLabel} in ${cityFormatted}`,
      description: segmentDesc.description || `Find best golf simulator venues for ${segmentLabel} in ${cityFormatted}.`,
      type: "website",
      url: `https://golfsimmap.com/venue/us/${state}/${city}/best/who-its-for/${segment}`,
    },
  };
}

export default async function CityBestWhoItsForPage({ params, searchParams }: CityBestWhoItsForPageProps) {
  const paramsResolved = (await searchParams) || {};
  const page = Math.max(1, Number(paramsResolved.page || 1));
  const pageSize = 12;
  const { state, city, segment } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const segmentLabel = segment.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const segmentVariants = Array.from(new Set([segment, segment.replace(/-/g, "_"), segment.replace(/_/g, "-")]));
  const skip = (page - 1) * pageSize;
  const segmentDesc = segmentDescriptions[segment.toLowerCase()] || {
    tagline: `Perfect for ${segmentLabel}`,
    description: `Venues ideal for ${segmentLabel.toLowerCase()} in ${cityFormatted}. These spots cater specifically to your needs and preferences.`,
  };

  const [{ count: totalVenuesRaw }, { data: venueRows }, nearbyCitiesRaw] = await Promise.all([
    supabase
      .from("venues")
      .select("id", { count: "exact", head: true })
      .ilike("city", cityFormatted)
      .eq("state", stateAbbrev.toUpperCase())
      .eq("country", "US")
      .eq("status", "active")
      .overlaps("whoItsFor", segmentVariants),
    supabase
      .from("venues")
      .select(VENUE_CARD_FIELDS)
      .ilike("city", cityFormatted)
      .eq("state", stateAbbrev.toUpperCase())
      .eq("country", "US")
      .eq("status", "active")
      .overlaps("whoItsFor", segmentVariants)
      .order("featured", { ascending: false })
      .order("ratingOverall", { ascending: false, nullsFirst: false })
      .order("name", { ascending: true })
      .range(skip, skip + pageSize - 1),
    getCachedNearbyCities(stateAbbrev.toUpperCase(), cityFormatted, 6),
  ]);
  const totalVenues = totalVenuesRaw ?? 0;
  const venues = venueRows || [];
  const nearbyCitiesResult = (nearbyCitiesRaw || []) as { city: string }[];

  const nearbyLinks = nearbyCitiesResult.map((c) => ({
    label: `For ${segmentLabel} in ${c.city}`,
    href: `/venue/us/${state}/${c.city.toLowerCase().replace(/\s+/g, "-")}/best/who-its-for/${segment}`,
  }));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "US", href: "/venue/us" },
    { label: stateName, href: `/venue/us/${state}` },
    { label: cityFormatted, href: `/venue/us/${state}/${city}` },
    { label: `For ${segmentLabel}` },
  ];

  const faqItems = [
    {
      question: `What makes a ${cityFormatted} venue good for ${segmentLabel.toLowerCase()}?`,
      answer: segmentDesc.description,
    },
    {
      question: `How many venues are there?`,
      answer: `We found ${totalVenues} venues in ${cityFormatted} tagged for ${segmentLabel.toLowerCase()}. Browse the full city listing for more options that might also match your needs.`,
    },
    {
      question: `Can I combine this with other filters?`,
      answer: "Yes! Use our search page or browse other best-by pages to combine audience preferences with location, hardware, and amenity filters.",
    },
    {
      question: `Are these venues verified?`,
      answer: "Some venues have verified status (indicated by a badge). Verified venues have confirmed their audience details directly with us. Unverified listings are based on available data and may be outdated.",
    },
  ];

  // Related links - static, no DB query
  const relatedLinks = [
    { label: `All venues in ${cityFormatted}`, href: `/venue/us/${state}/${city}` },
    { label: `For ${segmentLabel} (nationwide)`, href: `/best/who-its-for/${segment}` },
    ...getStaticRelatedLinks("who-its-for", segment, 4),
  ];

  return (
    <BestByPageContent
      title={`Best Golf Simulators for ${segmentLabel} in ${cityFormatted}`}
      description={segmentDesc.description}
      guidancePoints={[
        "Check amenities that matter to your group — food, drinks, private rooms.",
        "Read vibe tags to confirm atmosphere matches your needs.",
        "Consider combining audience filters with location for best results.",
      ]}
      methodologyDescription={`We categorize ${cityFormatted} venues by "who it's for" tags from listing data and infer from amenities. Featured venues appear first, followed by highest-rated options.`}
      faqItems={faqItems}
      nearbyTitle={`For ${segmentLabel} nearby`}
      nearbyLinks={nearbyLinks}
      relatedLinks={relatedLinks}
      ctaTitle={`Own a venue perfect for ${segmentLabel.toLowerCase()}?`}
      ctaDescription="Claim your listing to update your audience tags and attract golfers with matching needs."
      ctaPrimary={{ label: "Claim Your Listing", href: "/claim" }}
      ctaSecondary={{ label: "Submit New Venue", href: "/submit" }}
      venues={venues}
      totalVenues={totalVenues}
      categoryType="segment"
      categoryValue={segment.toLowerCase()}
      heroSubtitle={segmentDesc.tagline}
      breadcrumbItems={breadcrumbs}
      showRanking={true}
      currentPage={page}
      pageSize={pageSize}
      baseUrl={`/venue/us/${state}/${city}/best/who-its-for/${segment}`}
    />
  );
}

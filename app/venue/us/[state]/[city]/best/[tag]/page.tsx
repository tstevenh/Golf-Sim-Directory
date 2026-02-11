import { Metadata } from "next";
import { supabase, VENUE_CARD_FIELDS } from "@/lib/supabase";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";
import { getStaticRelatedLinks } from "@/lib/category-config.generated";

interface CityBestTagPageProps {
  params: Promise<{ state: string; city: string; tag: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 86400;

// Tag-specific descriptions for city pages
const tagDescriptions: Record<string, string> = {
  "sim-bar": "venues with full bar service, great food, and a social atmosphere",
  "date-night": "romantic spots perfect for couples looking for a fun activity",
  "corporate-events": "venues that handle team events, client entertainment, and corporate outings",
  "family-friendly": "welcoming spots where the whole family can enjoy golf together",
  "serious-practice": "facilities focused on improvement with quality hardware and practice features",
  "beginners": "patient, welcoming venues ideal for learning the game",
  "league-play": "venues offering organized competitions and regular league nights",
};

export async function generateMetadata({ params }: CityBestTagPageProps): Promise<Metadata> {
  const { state, city, tag } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const tagLabel = tag.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const tagDesc = tagDescriptions[tag] || `venues tagged for ${tagLabel}`;

  return {
    title: `Best ${tagLabel} Golf Simulators in ${cityFormatted}, ${stateAbbrev}`,
    description: `Discover ${tagDesc} in ${cityFormatted}, ${stateName}. See ratings, pricing, hours, and book your session online.`,
    alternates: {
      canonical: `https://golfsimmap.com/venue/us/${state}/${city}/best/${tag}`,
    },
    openGraph: {
      title: `Best ${tagLabel} Golf Simulators in ${cityFormatted}`,
      description: `Find ${tagDesc} in ${cityFormatted}. Compare and book your session.`,
      type: "website",
      url: `https://golfsimmap.com/venue/us/${state}/${city}/best/${tag}`,
    },
  };
}

export default async function CityBestTagPage({ params, searchParams }: CityBestTagPageProps) {
  const paramsResolved = (await searchParams) || {};
  const page = Math.max(1, Number(paramsResolved.page || 1));
  const pageSize = 12;
  const { state, city, tag } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const tagLabel = tag.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const tagDesc = tagDescriptions[tag] || `venues perfect for ${tagLabel.toLowerCase()}`;
  const tagVariants = Array.from(new Set([tag, tag.replace(/-/g, "_"), tag.replace(/_/g, "-")]));
  const skip = (page - 1) * pageSize;

  const [{ count: totalVenuesRaw }, { data: venueRows }, { data: nearbyCitiesRaw }] = await Promise.all([
    supabase
      .from("venues")
      .select("*", { count: "exact", head: true })
      .ilike("city", cityFormatted)
      .eq("state", stateAbbrev.toUpperCase())
      .eq("country", "US")
      .eq("status", "active")
      .overlaps("tags", tagVariants),
    supabase
      .from("venues")
      .select(VENUE_CARD_FIELDS)
      .ilike("city", cityFormatted)
      .eq("state", stateAbbrev.toUpperCase())
      .eq("country", "US")
      .eq("status", "active")
      .overlaps("tags", tagVariants)
      .order("featured", { ascending: false })
      .order("ratingOverall", { ascending: false, nullsFirst: false })
      .order("name", { ascending: true })
      .range(skip, skip + pageSize - 1),
    supabase.rpc("get_nearby_cities", {
      target_state: stateAbbrev.toUpperCase(),
      exclude_city: cityFormatted,
      limit_count: 6,
    }),
  ]);
  const totalVenues = totalVenuesRaw ?? 0;
  const venues = venueRows || [];
  const nearbyCitiesResult = (nearbyCitiesRaw || []) as { city: string }[];

  const nearbyLinks = nearbyCitiesResult.map((c) => ({
    label: `${tagLabel} in ${c.city}`,
    href: `/venue/us/${state}/${c.city.toLowerCase().replace(/\s+/g, "-")}/best/${tag}`,
  }));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "US", href: "/venue/us" },
    { label: stateName, href: `/venue/us/${state}` },
    { label: cityFormatted, href: `/venue/us/${state}/${city}` },
    { label: `Best ${tagLabel}` },
  ];

  const faqItems = [
    {
      question: `How many ${tagLabel.toLowerCase()} venues are in ${cityFormatted}?`,
      answer: `We found ${totalVenues} venues tagged for ${tagLabel.toLowerCase()} in ${cityFormatted}. Check the full city listing for more options that might match your needs.`,
    },
    {
      question: `What makes a ${cityFormatted} venue good for ${tagLabel.toLowerCase()}?`,
      answer: `We categorize venues based on amenities, atmosphere, and customer feedback. ${tagLabel} venues in ${cityFormatted} typically offer ${tagDesc}.`,
    },
    {
      question: "How do I book at these venues?",
      answer: "Click on any venue card to see details and booking links. Most venues offer online booking, but you can also call ahead for popular time slots.",
    },
    {
      question: "Are there similar options nearby?",
      answer: `Yes! We've listed ${tagLabel.toLowerCase()} options in nearby cities below. You can also check the full ${stateName} page for more options.`,
    },
  ];

  // Related links - static, no DB query
  const relatedLinks = [
    { label: `All venues in ${cityFormatted}`, href: `/venue/us/${state}/${city}` },
    { label: `Best ${tagLabel} (nationwide)`, href: `/best/${tag}` },
    ...getStaticRelatedLinks("tags", tag, 4),
  ];

  return (
    <BestByPageContent
      title={`Best ${tagLabel} Golf Simulators in ${cityFormatted}`}
      description={`Discover ${totalVenues} ${tagDesc} in ${cityFormatted}, ${stateName}. Compare amenities, check prices, and book your session.`}
      guidancePoints={[
        "Check booking links and call ahead for popular time slots.",
        "Compare amenities like food, drinks, and private rooms.",
        "Look at launch monitor types if data accuracy matters to you.",
        "Read reviews from other golfers for honest feedback.",
      ]}
      methodologyDescription={`We filter ${cityFormatted} venues by the ${tagLabel.toLowerCase()} tag. Featured listings appear first, followed by highest-rated options.`}
      faqItems={faqItems}
      nearbyTitle={`${tagLabel} in nearby ${stateName} cities`}
      nearbyLinks={nearbyLinks}
      relatedLinks={relatedLinks}
      ctaTitle={`Own a ${tagLabel.toLowerCase()} venue in ${cityFormatted}?`}
      ctaDescription={`Claim your listing to appear in ${cityFormatted}'s best-by collections and attract local golfers.`}
      ctaPrimary={{ label: "Claim Your Listing", href: "/claim" }}
      ctaSecondary={{ label: "Submit New Venue", href: "/submit" }}
      venues={venues}
      totalVenues={totalVenues}
      categoryType="tag"
      categoryValue={tag}
      heroSubtitle={`${cityFormatted}, ${stateName}`}
      breadcrumbItems={breadcrumbs}
      showRanking={true}
      currentPage={page}
      pageSize={pageSize}
      baseUrl={`/venue/us/${state}/${city}/best/${tag}`}
    />
  );
}

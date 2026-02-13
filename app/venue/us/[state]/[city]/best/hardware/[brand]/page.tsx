import { Metadata } from "next";
import { supabase, VENUE_CARD_FIELDS } from "@/lib/supabase";
import type { VenueListItem } from "@/types";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";
import { getCachedNearbyCities } from "@/lib/cached-queries";
import { getStaticRelatedLinks } from "@/lib/category-config.generated";
import { normalizeHardwareBrand } from "@/lib/hardware-brands";

interface CityBestHardwarePageProps {
  params: Promise<{ state: string; city: string; brand: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 2592000;

// Hardware-specific descriptions
const hardwareDescriptions: Record<string, string> = {
  "trackman": "Tour-level accuracy with dual radar technology",
  "foresight": "Camera-based precision for club and ball data",
  "uneekor": "Overhead camera systems with compact footprint",
  "full-swing": "Immersive entertainment with stunning graphics",
  "golfzon": "Interactive platform with moving floor technology",
  "aboutgolf": "Premium simulation at country clubs",
  "skytrak": "Accessible accuracy for all skill levels",
  "flightscope": "3D Doppler radar technology",
};

export async function generateMetadata({ params }: CityBestHardwarePageProps): Promise<Metadata> {
  const { state, city, brand } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const cityFormatted = city.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const brandLabel = brand.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const brandDesc = hardwareDescriptions[brand.toLowerCase()] || "quality simulator hardware";

  return {
    title: `Best ${brandLabel} Golf Simulators in ${cityFormatted}, ${stateAbbrev}`,
    description: `Find venues using ${brandLabel} simulators in ${cityFormatted}. ${brandDesc}. Compare ratings, amenities, and book your session.`,
    alternates: {
      canonical: `https://golfsimmap.com/venue/us/${state}/${city}/best/hardware/${brand}`,
    },
    openGraph: {
      title: `Best ${brandLabel} Golf Simulators in ${cityFormatted}`,
      description: `Find venues using ${brandLabel} (${brandDesc}) in ${cityFormatted}.`,
      type: "website",
      url: `https://golfsimmap.com/venue/us/${state}/${city}/best/hardware/${brand}`,
    },
  };
}

export default async function CityBestHardwarePage({ params, searchParams }: CityBestHardwarePageProps) {
  const paramsResolved = (await searchParams) || {};
  const page = Math.max(1, Number(paramsResolved.page || 1));
  const pageSize = 12;
  const { state, city, brand } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const brandLabel = brand.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const brandDesc = hardwareDescriptions[brand.toLowerCase()] || "quality simulator hardware";
  const skip = (page - 1) * pageSize;
  const normalizedBrand = normalizeHardwareBrand(brandLabel);

  let totalVenues = 0;
  let venues: VenueListItem[] = [];

  if (normalizedBrand) {
    const [{ count }, { data: venueRows }] = await Promise.all([
      supabase
        .from("venues")
        .select("*", { count: "exact", head: true })
        .ilike("city", cityFormatted)
        .eq("state", stateAbbrev.toUpperCase())
        .eq("country", "US")
        .eq("status", "active")
        .contains("hardwareBrands", [normalizedBrand]),
      supabase
        .from("venues")
        .select(VENUE_CARD_FIELDS)
        .ilike("city", cityFormatted)
        .eq("state", stateAbbrev.toUpperCase())
        .eq("country", "US")
        .eq("status", "active")
        .contains("hardwareBrands", [normalizedBrand])
        .order("featured", { ascending: false })
        .order("ratingOverall", { ascending: false, nullsFirst: false })
        .order("name", { ascending: true })
        .range(skip, skip + pageSize - 1),
    ]);
    totalVenues = count ?? 0;
    venues = venueRows || [];
  }

  const nearbyCitiesResult = await getCachedNearbyCities(stateAbbrev.toUpperCase(), cityFormatted, 6);

  const nearbyLinks = nearbyCitiesResult.map((c) => ({
    label: `${brandLabel} in ${c.city}`,
    href: `/venue/us/${state}/${c.city.toLowerCase().replace(/\s+/g, "-")}/best/hardware/${brand}`,
  }));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "US", href: "/venue/us" },
    { label: stateName, href: `/venue/us/${state}` },
    { label: cityFormatted, href: `/venue/us/${state}/${city}` },
    { label: `Best ${brandLabel}` },
  ];

  const faqItems = [
    {
      question: `Why choose ${brandLabel} simulators?`,
      answer: `${brandLabel} offers ${brandDesc}. Serious golfers often prefer it for practice sessions and data-driven improvement.`,
    },
    {
      question: `How many ${brandLabel} venues are in ${cityFormatted}?`,
      answer: `We found ${totalVenues} venues listing ${brandLabel} hardware in ${cityFormatted}. Hardware details may vary by bay — always confirm when booking.`,
    },
    {
      question: "Do all bays at a venue use the same hardware?",
      answer: "Not always. Some venues mix brands across bays or have premium bays with different equipment. Check the listing notes or call ahead to confirm.",
    },
    {
      question: "Are hardware details verified?",
      answer: "Verified venues have confirmed their hardware with us. Look for the verified badge. Unverified listings rely on available data.",
    },
  ];

  // Related links - static, no DB query
  const relatedLinks = [
    { label: `All venues in ${cityFormatted}`, href: `/venue/us/${state}/${city}` },
    { label: `Best ${brandLabel} (nationwide)`, href: `/best/hardware/${brand}` },
    ...getStaticRelatedLinks("hardware", brand, 4),
  ];

  return (
    <BestByPageContent
      title={`Best ${brandLabel} Golf Simulators in ${cityFormatted}`}
      description={`Discover ${totalVenues} venues in ${cityFormatted}, ${stateName} using ${brandLabel} hardware. ${brandDesc}. Compare and book your session.`}
      guidancePoints={[
        "Confirm the exact model on the venue page — brands have different tiers.",
        "Compare launch monitor type if you care about specific data points.",
        "Book ahead if you want a specific bay or hardware setup.",
        "Check if the venue offers fitting or lesson services with this hardware.",
      ]}
      methodologyDescription={`We identify ${brandLabel} venues from listing data. Featured venues appear first, followed by highest-rated options.`}
      faqItems={faqItems}
      nearbyTitle={`${brandLabel} in nearby ${stateName} cities`}
      nearbyLinks={nearbyLinks}
      relatedLinks={relatedLinks}
      ctaTitle={`Own a ${brandLabel} venue in ${cityFormatted}?`}
      ctaDescription={`Claim your listing to confirm your ${brandLabel} setup and attract local golfers searching for this hardware.`}
      ctaPrimary={{ label: "Claim Your Listing", href: "/claim" }}
      ctaSecondary={{ label: "Submit New Venue", href: "/submit" }}
      venues={venues}
      totalVenues={totalVenues}
      categoryType="hardware"
      categoryValue={brand.toLowerCase()}
      heroSubtitle={`${cityFormatted}, ${stateName}`}
      breadcrumbItems={breadcrumbs}
      showRanking={true}
      currentPage={page}
      pageSize={pageSize}
      baseUrl={`/venue/us/${state}/${city}/best/hardware/${brand}`}
    />
  );
}

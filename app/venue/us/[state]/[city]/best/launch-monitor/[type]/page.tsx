import { Metadata } from "next";
import type { LaunchMonitorType } from "@/lib/supabase";
import type { VenueListItem } from "@/types";
import { supabase, VENUE_CARD_FIELDS } from "@/lib/supabase";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { getCachedNearbyCities } from "@/lib/cached-queries";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";
import { getStaticRelatedLinks } from "@/lib/category-config.generated";

interface CityBestLaunchMonitorPageProps {
  params: Promise<{ state: string; city: string; type: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 86400;

// Launch monitor type-specific content with unique copy
const launchMonitorContent: Record<string, { tagline: string; shortDesc: string; longDesc: string }> = {
  radar: {
    tagline: "Doppler Radar Technology",
    shortDesc: "Doppler radar launch monitors like TrackMan and FlightScope",
    longDesc: "Radar launch monitors use Doppler technology to track the club and ball through impact. TrackMan and FlightScope are the industry leaders—both deliver exceptional accuracy and are trusted on PGA Tour ranges. Radar systems excel at tracking ball flight from launch to landing. Radar venues typically feature higher ceilings to allow proper ball tracking. The technology works well for both indoor and outdoor settings. Accuracy for ball flight data is exceptional, though some systems estimate rather than measure spin directly.",
  },
  photometric_camera: {
    tagline: "High-Speed Camera Systems",
    shortDesc: "camera-based launch monitors like Foresight and Uneekor",
    longDesc: "Camera-based launch monitors photograph the ball at impact to capture spin, speed, and launch angle. Foresight, Uneekor, and SkyTrak lead this category. The advantage: direct measurement of the ball rather than extrapolation. Photometric systems work great in low-ceiling environments and don't require as much ball flight space as radar. Spin accuracy tends to be excellent since cameras actually see the ball rotating. Many venues prefer camera systems for fitting because of their ball data precision.",
  },
  hybrid: {
    tagline: "Best of Both Worlds",
    shortDesc: "hybrid systems combining radar and camera technology",
    longDesc: "Hybrid systems combine the best of radar and camera technology. You get accurate ball flight tracking from radar sensors plus precise club data from high-speed cameras. These setups typically deliver the most complete data picture available. Expect to find hybrid configurations at premium venues focused on serious practice and fitting. The extra investment in dual technology pays off for players who want both ball and club metrics without compromise.",
  },
  overhead_camera: {
    tagline: "Above-The-Action Tracking",
    shortDesc: "overhead camera tracking systems",
    longDesc: "Overhead camera systems mount above the hitting area and track your swing from a bird's-eye view. Common in entertainment venues like TopGolf, these systems balance accuracy with throughput for high-volume facilities. The overhead angle provides consistent tracking regardless of player position. While less precise than dedicated launch monitors for practice, they're excellent for social golf and competitions.",
  },
  floor_camera: {
    tagline: "Ground-Level Precision",
    shortDesc: "floor-mounted camera systems",
    longDesc: "Floor-mounted cameras capture impact from below or at ground level, often paired with other sensors. These systems excel at club data—you'll see exactly where the club strikes the ball and how the face rotates through impact. Popular in fitting centers where understanding the swing is as important as tracking the ball.",
  },
  infrared_optical: {
    tagline: "Light Sensor Technology",
    shortDesc: "infrared optical tracking systems",
    longDesc: "Infrared optical systems use light sensors to track ball and club movement through the hitting zone. These offer good accuracy at a lower price point than radar systems, making them popular for home setups and budget-conscious venues. Systems like SkyTrak have proven that infrared technology can deliver solid data without the premium price tag.",
  },
  unknown: {
    tagline: "Launch Monitor Technology",
    shortDesc: "launch monitor technology",
    longDesc: "Venues with launch monitors where the specific technology type isn't specified. These may use various systems—contact the venue for details about their equipment and what data points they track.",
  },
};

export async function generateMetadata({ params }: CityBestLaunchMonitorPageProps): Promise<Metadata> {
  const { state, city, type } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const typeLabel = type.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const content = launchMonitorContent[type.toLowerCase()] || { shortDesc: "this launch monitor type" };

  return {
    title: `${typeLabel} Launch Monitor Venues in ${cityFormatted}, ${stateAbbrev}`,
    description: `Find golf simulator venues with ${content.shortDesc} in ${cityFormatted}. Compare accuracy, hardware brands, and book your session.`,
    alternates: {
      canonical: `https://golfsimmap.com/venue/us/${state}/${city}/best/launch-monitor/${type}`,
    },
    openGraph: {
      title: `${typeLabel} Launch Monitors in ${cityFormatted}`,
      description: `Find venues with ${content.shortDesc} in ${cityFormatted}, ${stateName}.`,
      type: "website",
    },
  };
}

export default async function CityBestLaunchMonitorPage({ params, searchParams }: CityBestLaunchMonitorPageProps) {
  const paramsResolved = (await searchParams) || {};
  const page = Math.max(1, Number(paramsResolved.page || 1));
  const pageSize = 12;
  const { state, city, type } = await params;
  const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
  const stateName = getStateDisplayName(stateAbbrev);
  const cityFormatted = city.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const typeLabel = type.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const typeKey = type.toLowerCase();
  const skip = (page - 1) * pageSize;
  const validTypes = new Set<LaunchMonitorType>(["radar", "photometric_camera", "hybrid", "unknown"]);
  const isValidType = validTypes.has(type as LaunchMonitorType);

  const content = launchMonitorContent[typeKey] || {
    tagline: `${typeLabel} Technology`,
    shortDesc: "this launch monitor type",
    longDesc: `Venues using ${typeLabel} launch monitor technology. These systems track your shots and provide data to improve your game.`,
  };

  let totalVenues = 0;
  let venues: VenueListItem[] = [];
  let nearbyCitiesResult: { city: string }[] = [];

  if (isValidType) {
    const [{ count: totalVenuesRaw }, { data: venueRows }, nearbyCitiesRaw] = await Promise.all([
      supabase
        .from("venues")
        .select("*", { count: "exact", head: true })
        .ilike("city", cityFormatted)
        .eq("state", stateAbbrev.toUpperCase())
        .eq("country", "US")
        .eq("status", "active")
        .eq("launchMonitorType", type as LaunchMonitorType),
      supabase
        .from("venues")
        .select(VENUE_CARD_FIELDS)
        .ilike("city", cityFormatted)
        .eq("state", stateAbbrev.toUpperCase())
        .eq("country", "US")
        .eq("status", "active")
        .eq("launchMonitorType", type as LaunchMonitorType)
        .order("featured", { ascending: false })
        .order("ratingOverall", { ascending: false, nullsFirst: false })
        .order("name", { ascending: true })
        .range(skip, skip + pageSize - 1),
      getCachedNearbyCities(stateAbbrev.toUpperCase(), cityFormatted, 6),
    ]);
    totalVenues = totalVenuesRaw ?? 0;
    venues = venueRows || [];
    nearbyCitiesResult = nearbyCitiesRaw as { city: string }[];
  }

  const nearbyLinks = nearbyCitiesResult.map((c) => ({
    label: `${typeLabel} in ${c.city}`,
    href: `/venue/us/${state}/${c.city.toLowerCase().replace(/\s+/g, "-")}/best/launch-monitor/${type}`,
  }));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "US", href: "/venue/us" },
    { label: stateName, href: `/venue/us/${state}` },
    { label: cityFormatted, href: `/venue/us/${state}/${city}` },
    { label: `${typeLabel} Launch Monitors` },
  ];

  const faqItems = [
    {
      question: `How many ${typeLabel.toLowerCase()} venues are in ${cityFormatted}?`,
      answer: `We found ${totalVenues} venues using ${content.shortDesc} in ${cityFormatted}, ${stateName}. Hardware may vary by bay—confirm when booking.`,
    },
    {
      question: `What is a ${typeLabel.toLowerCase()} launch monitor?`,
      answer: content.longDesc,
    },
    {
      question: `How accurate are ${typeLabel.toLowerCase()} systems?`,
      answer: `${typeLabel} systems are highly accurate within their measurement domains. Radar excels at ball flight data, while camera systems excel at club data. The best choice depends on what metrics matter most for your practice.`,
    },
    {
      question: "Do all bays use the same launch monitor?",
      answer: "Not always. Some venues mix hardware across bays or have premium bays with different equipment. Always confirm with the venue if launch monitor type is important to you.",
    },
  ];

  const relatedLinks = [
    { label: `All venues in ${cityFormatted}`, href: `/venue/us/${state}/${city}` },
    { label: `${typeLabel} venues (national)`, href: `/best/launch-monitor/${type}` },
    { label: `All venues in ${stateName}`, href: `/venue/us/${state}` },
    ...getStaticRelatedLinks("launch-monitor", type, 4),
  ];

  return (
    <BestByPageContent
      title={`${typeLabel} Launch Monitors in ${cityFormatted}`}
      description={`${content.longDesc}\n\nDiscover ${venues.length} venues in ${cityFormatted}, ${stateName} using ${content.shortDesc}.`}
      guidancePoints={[
        "Confirm all bays use the same launch monitor—some venues mix hardware.",
        "Camera systems shine for club path and face angle; radar wins on ball flight.",
        "Consider what data matters most for your practice goals.",
        "If you're serious about data, ask about software integration before booking.",
      ]}
      methodologyDescription={`We filter venues by launch monitor type based on their equipment listings. Results prioritize featured venues, then sort by rating and data completeness.`}
      faqItems={faqItems}
      nearbyTitle={`${typeLabel} venues in nearby ${stateName} cities`}
      nearbyLinks={nearbyLinks}
      relatedLinks={relatedLinks}
      ctaTitle={`Own a venue with ${typeLabel.toLowerCase()} technology in ${cityFormatted}?`}
      ctaDescription={`Claim your listing to confirm your launch monitor setup and attract golfers searching for ${content.shortDesc}.`}
      ctaPrimary={{ label: "Claim Your Listing", href: "/claim" }}
      ctaSecondary={{ label: "Submit New Venue", href: "/submit" }}
      venues={venues}
      totalVenues={totalVenues}
      categoryType="launch-monitor"
      categoryValue={typeKey}
      heroSubtitle={`${cityFormatted}, ${stateName}`}
      breadcrumbItems={breadcrumbs}
      showRanking={true}
      currentPage={page}
      pageSize={pageSize}
      baseUrl={`/venue/us/${state}/${city}/best/launch-monitor/${type}`}
    />
  );
}

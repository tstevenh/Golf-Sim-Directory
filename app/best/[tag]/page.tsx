import { Metadata } from "next";
import { supabase, VENUE_CARD_FIELDS } from "@/lib/supabase";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { getStaticRelatedLinks } from "@/lib/category-config.generated";

interface BestTagPageProps {
  params: Promise<{ tag: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 15552000;

// Pre-render all tag pages at build time
export async function generateStaticParams() {
  // Return all known tags - pages will be statically generated
  return [
    { tag: "sim-bar" },
    { tag: "date-night" },
    { tag: "corporate-events" },
    { tag: "family-friendly" },
    { tag: "serious-practice" },
    { tag: "party-venue" },
    { tag: "premium-experience" },
    { tag: "budget-friendly" },
  ];
}

// Server-compatible tag content for metadata (no JSX)
const tagMetaContent: Record<string, { tagline: string; description: string }> = {
  "sim-bar": {
    tagline: "Golf + Great Food & Drinks",
    description: "Golf simulator venues with full bar service, craft cocktails, and great food. Perfect for social outings with the complete entertainment experience."
  },
  "date-night": {
    tagline: "Romantic Golf Experiences",
    description: "Top golf simulator spots for date night. Intimate atmospheres, quality food and drinks, and a fun activity you can enjoy together."
  },
  "corporate-events": {
    tagline: "Team Building & Client Entertainment",
    description: "Professional golf simulator venues ideal for corporate events, team outings, and client entertainment. Many offer private rooms and catering services."
  },
  "family-friendly": {
    tagline: "Fun for All Ages",
    description: "Golf simulator venues perfect for the whole family. These spots welcome kids, offer a safe environment, and make golf accessible to beginners of all ages."
  },
  "serious-practice": {
    tagline: "Training & Improvement",
    description: "Venues built for golfers focused on improvement. Expect quality launch monitors, data analysis, and an environment suited for focused practice sessions."
  },
  "party-venue": {
    tagline: "Celebrate & Play",
    description: "Golf simulator venues perfect for parties. Birthdays, bachelor parties, or a fun night out — these spots know how to throw an event."
  },
  "premium-experience": {
    tagline: "Luxury Golf Simulation",
    description: "Top-tier golf simulator venues offering the best equipment, ambiance, and service. Expect premium hardware, upscale amenities, and exceptional experiences."
  },
  "budget-friendly": {
    tagline: "Great Golf, Great Value",
    description: "Quality golf simulator experiences that won't break the bank. Find venues with reasonable rates, hourly deals, and memberships that offer real value."
  },
};

function getTagMetaContent(tag: string) {
  const tagLabel = tag.replace(/-/g, " ");
  return tagMetaContent[tag] || {
    tagline: `Best ${tagLabel} Golf Simulators`,
    description: `Find the best golf simulator venues tagged as "${tagLabel}". Browse ratings, amenities, and book your next session.`
  };
}

export async function generateMetadata({ params }: BestTagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const tagLabel = tag.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const content = getTagMetaContent(tag);

  // Count venues for this tag
  const tagVariants = Array.from(new Set([tag, tag.replace(/-/g, "_"), tag.replace(/_/g, "-")]));
  const { count } = await supabase
    .from("venues")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .overlaps("tags", tagVariants);
  const totalCount = count ?? 0;

  const description = content.description || `Discover the ${totalCount} best ${tagLabel.toLowerCase()} golf simulator venues. Compare ratings, amenities, and pricing to find your perfect spot.`;

  return {
    title: `Best ${tagLabel} Golf Simulators — ${totalCount} Venues Reviewed`,
    description,
    alternates: {
      canonical: `https://golfsimmap.com/best/${tag}`,
    },
    openGraph: {
      title: `Best ${tagLabel} Golf Simulators`,
      description,
      type: "website",
      url: `https://golfsimmap.com/best/${tag}`,
    },
  };
}

export default async function BestTagPage({ params, searchParams }: BestTagPageProps) {
  const { tag } = await params;
  const paramsResolved = (await searchParams) || {};
  const page = Math.max(1, Number(paramsResolved.page || 1));
  const pageSize = 12;
  const tagLabel = tag.replace(/-/g, " ");
  const tagVariants = Array.from(new Set([tag, tag.replace(/-/g, "_"), tag.replace(/_/g, "-")]));
  const skip = (page - 1) * pageSize;

  const [{ count: totalCount }, { data: venueRows }] = await Promise.all([
    supabase
      .from("venues")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .overlaps("tags", tagVariants),
    supabase
      .from("venues")
      .select(VENUE_CARD_FIELDS)
      .eq("status", "active")
      .overlaps("tags", tagVariants)
      .order("featured", { ascending: false })
      .order("ratingOverall", { ascending: false, nullsFirst: false })
      .order("name", { ascending: true })
      .range(skip, skip + pageSize - 1),
  ]);
  const totalVenues = totalCount ?? 0;
  const venues = venueRows || [];

  // Breadcrumb trail
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Best By", href: "/best" },
    { label: tagLabel.replace(/\b\w/g, l => l.toUpperCase()), href: `/best/${tag}`, current: true },
  ];

  const faqItems = [
    {
      question: `What makes a venue good for "${tagLabel}"?`,
      answer: `We evaluate venues for ${tagLabel} based on their amenities, atmosphere, reviews, and services. Venues in this category consistently deliver experiences that match what golfers expect when looking for ${tagLabel}.`,
    },
    {
      question: `How many ${tagLabel} golf simulator venues are there?`,
      answer: `We currently have ${totalVenues} venues tagged for ${tagLabel}. This list is updated regularly as we discover new venues and receive owner submissions.`,
    },
    {
      question: "How do I find these venues near me?",
      answer: "Use our city pages to filter this category by location. You can also use the search feature to find venues by address or zip code.",
    },
    {
      question: "Can I suggest a venue for this category?",
      answer: "Yes! Submit a venue through our submission form and we'll review it for inclusion in our directory and relevant categories.",
    },
  ];

  // Related categories - static, no DB query
  const relatedLinks = [
    { label: "Browse all categories", href: "/best" },
    ...getStaticRelatedLinks("tags", tag, 6),
  ];

  return (
    <div className="min-h-screen bg-deep-black">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BestByPageContent
          breadcrumbItems={breadcrumbs}
          title={`${totalVenues} ${tagLabel.replace(/\b\w/g, l => l.toUpperCase())} Venues`}
          description={`Browse all golf simulator venues perfect for ${tagLabel}. Sort by rating, compare amenities, and find your ideal spot.`}
          guidancePoints={[
            "Top-rated venues appear first — look for the Featured badge for editor picks.",
            "Check amenities and hours before booking to ensure they match your needs.",
            "Use city filters to narrow down to venues near you.",
            "Read reviews from other golfers for honest feedback.",
          ]}
          methodologyDescription={`Our ${tagLabel} rankings consider venue features, customer reviews, equipment quality, and overall experience. Featured venues have been manually verified by our team.`}
          faqItems={faqItems}
          relatedLinks={relatedLinks}
          ctaTitle="Own a golf simulator venue?"
          ctaDescription={`If your venue is great for ${tagLabel}, claim your listing to verify details and get featured in our collections.`}
          ctaPrimary={{ label: "Claim Your Listing", href: "/claim" }}
          ctaSecondary={{ label: "Submit New Venue", href: "/submit" }}
          venues={venues}
          totalVenues={totalVenues}
          currentPage={page}
          pageSize={pageSize}
          baseUrl={`/best/${tag}`}
        />
      </div>
    </div>
  );
}

import { Metadata } from "next";
import { db, venueCardSelect } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { TagPageHero, getTagHeroContent } from "@/components/seo/PageHero";
import { matchesTag } from "@/lib/best-by";
import { VIBE_CATEGORIES, SEGMENT_CATEGORIES, HARDWARE_CATEGORIES } from "@/lib/best-by-config";

interface BestTagPageProps {
  params: Promise<{ tag: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: BestTagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const tagLabel = tag.replace(/-/g, " ");
  const content = getTagHeroContent(tag);
  
  return {
    title: `Best ${tagLabel} Golf Simulators | GolfSimMap`,
    description: content.description,
    alternates: {
      canonical: `https://golfsimmap.com/best/${tag}`,
    },
    openGraph: {
      title: `Best ${tagLabel} Golf Simulators`,
      description: content.description,
      type: "website",
      url: `https://golfsimmap.com/best/${tag}`,
    },
  };
}

export default async function BestTagPage({ params, searchParams }: BestTagPageProps) {
  const { tag } = await params;
  const paramsResolved = (await searchParams) || {};
  const page = Math.max(1, Number(paramsResolved.page || 1));
  const tagLabel = tag.replace(/-/g, " ");

  const venues = await db.venue.findMany({
    where: { status: "active" },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
    select: venueCardSelect,
  });

  const filteredVenues = venues.filter((venue) => matchesTag(venue, tag));

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
      answer: `We currently have ${filteredVenues.length} venues tagged for ${tagLabel}. This list is updated regularly as we discover new venues and receive owner submissions.`,
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

  // Related categories based on the tag
  const relatedLinks = getRelatedLinks(tag);

  return (
    <div className="min-h-screen bg-deep-black">
      {/* Hero Section */}
      <TagPageHero
        tag={tag}
        venueCount={filteredVenues.length}
        breadcrumbs={breadcrumbs}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BestByPageContent
          title={`${filteredVenues.length} ${tagLabel.replace(/\b\w/g, l => l.toUpperCase())} Venues`}
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
          venues={filteredVenues}
          currentPage={page}
          baseUrl={`/best/${tag}`}
        />
      </div>
    </div>
  );
}

// Helper to get related links based on tag using shared config
function getRelatedLinks(tag: string) {
  return [
    // Link to browse all
    { label: "Browse all categories", href: "/best" },
    // Vibe categories
    ...VIBE_CATEGORIES.slice(0, 2).map((v) => ({
      label: `Best ${v.label}`,
      href: `/best/vibe/${v.slug}`,
    })),
    // Segment categories
    ...SEGMENT_CATEGORIES.slice(0, 2).map((s) => ({
      label: `Best for ${s.label}`,
      href: `/best/who-its-for/${s.slug}`,
    })),
    // Hardware categories
    ...HARDWARE_CATEGORIES.slice(0, 2).map((h) => ({
      label: `Best ${h.label}`,
      href: `/best/hardware/${h.slug}`,
    })),
  ];
}

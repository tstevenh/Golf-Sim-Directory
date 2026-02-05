import { Metadata } from "next";
import { db } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { TagPageHero, getTagHeroContent } from "@/components/seo/PageHero";
import { matchesTag } from "@/lib/best-by";

interface BestTagPageProps {
  params: Promise<{ tag: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: BestTagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const tagLabel = tag.replace(/-/g, " ");
  const content = getTagHeroContent(tag);
  
  return {
    title: `Best ${tagLabel} Golf Simulators | GolfSimMap`,
    description: content.description,
    openGraph: {
      title: `Best ${tagLabel} Golf Simulators`,
      description: content.description,
      type: "website",
    },
  };
}

export default async function BestTagPage({ params }: BestTagPageProps) {
  const { tag } = await params;
  const tagLabel = tag.replace(/-/g, " ");

  const venues = await db.venue.findMany({
    where: { status: "active" },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
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
        />
      </div>
    </div>
  );
}

// Helper to get related links based on tag
function getRelatedLinks(tag: string) {
  const tagRelations: Record<string, { label: string; href: string }[]> = {
    "sim-bar": [
      { label: "Date Night Spots", href: "/best/date-night" },
      { label: "Sports Bar Vibes", href: "/best/vibe/sports-bar" },
      { label: "Corporate Events", href: "/best/corporate-events" },
    ],
    "date-night": [
      { label: "Sim Bar Experience", href: "/best/sim-bar" },
      { label: "Upscale Venues", href: "/best/vibe/upscale" },
      { label: "Boutique Spots", href: "/best/vibe/boutique" },
    ],
    "corporate-events": [
      { label: "Team Building", href: "/best/who-its-for/groups" },
      { label: "Upscale Venues", href: "/best/vibe/upscale" },
      { label: "Private Rooms", href: "/best/amenities/private-rooms" },
    ],
    "family-friendly": [
      { label: "Beginner Friendly", href: "/best/beginners" },
      { label: "Casual Vibes", href: "/best/vibe/casual" },
      { label: "Groups Welcome", href: "/best/who-its-for/groups" },
    ],
    "serious-practice": [
      { label: "TrackMan Venues", href: "/best/hardware/trackman" },
      { label: "Foresight GCQuad", href: "/best/hardware/foresight" },
      { label: "Lessons Available", href: "/best/amenities/lessons" },
    ],
    "beginners": [
      { label: "Family Friendly", href: "/best/family-friendly" },
      { label: "Lessons Available", href: "/best/amenities/lessons" },
      { label: "Casual Vibes", href: "/best/vibe/casual" },
    ],
    "league-play": [
      { label: "Serious Practice", href: "/best/serious-practice" },
      { label: "Groups Welcome", href: "/best/who-its-for/groups" },
      { label: "Sports Bar Vibes", href: "/best/vibe/sports-bar" },
    ],
  };

  return tagRelations[tag] || [
    { label: "Sim Bar Experience", href: "/best/sim-bar" },
    { label: "Date Night Spots", href: "/best/date-night" },
    { label: "Family Friendly", href: "/best/family-friendly" },
  ];
}

import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { matchesTag } from "@/lib/best-by";

interface BestTagPageProps {
  params: Promise<{ tag: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: BestTagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const tagLabel = tag.replace(/-/g, " ");
  return {
    title: `Best ${tagLabel} Golf Simulators | GolfSimMap`,
    description: `Browse top golf simulator venues for ${tagLabel}. Compare amenities, hardware, and booking options.`,
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

  const faqItems = [
    {
      question: `What does “${tagLabel}” mean in GolfSimMap listings?`,
      answer: `We use the ${tagLabel} tag when a venue consistently offers that experience or amenity. Listings are based on available data and owner submissions.`,
    },
    {
      question: "How do I find more venues like these?",
      answer: "Use the related best-by pages or run a search with filters for hardware, amenities, and location.",
    },
    {
      question: "Can I submit a venue that fits this category?",
      answer: "Yes. Submit a venue and we will review it before adding it to the directory.",
    },
    {
      question: "Are these venues verified?",
      answer: "Listings are unverified by default and become verified after a manual claim review.",
    },
  ];

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-muted mb-6">
          <Link href="/" className="hover:text-cream transition-colors">Home</Link>
          <span>/</span>
          <span className="text-cream">Best {tagLabel}</span>
        </div>

        <BestByPageContent
          title={`Best ${tagLabel} Golf Simulators`}
          description={`Explore golf simulator venues tagged for ${tagLabel}. Compare amenities, launch monitors, and booking options to find your ideal venue.`}
          guidancePoints={[
            "Look for detailed amenities and booking links before reserving.",
            "Compare launch monitor types if data accuracy matters to you.",
            "Use city pages to refine this category to a specific location.",
          ]}
          methodologyDescription="Results prioritize featured venues, then sort by rating and listing completeness."
          faqItems={faqItems}
          relatedLinks={[
            { label: "Best serious practice venues", href: "/best/serious-practice" },
            { label: "Best family-friendly venues", href: "/best/who-its-for/families" },
            { label: "Best sports-bar vibes", href: "/best/vibe/sports_bar" },
          ]}
          ctaTitle="Own a venue?"
          ctaDescription="Claim your listing to verify details and appear in best-by collections."
          ctaPrimary={{ label: "Claim a listing", href: "/claim" }}
          ctaSecondary={{ label: "Submit a venue", href: "/submit" }}
          venues={filteredVenues}
        />
      </div>
    </div>
  );
}

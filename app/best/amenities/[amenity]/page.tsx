import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { matchesAmenity } from "@/lib/best-by";

interface BestAmenityPageProps {
  params: Promise<{ amenity: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: BestAmenityPageProps): Promise<Metadata> {
  const { amenity } = await params;
  const label = amenity.replace(/_/g, " ");
  return {
    title: `Best Golf Simulators with ${label} | GolfSimMap`,
    description: `Find venues offering ${label} amenities. Compare hardware, booking options, and vibes.`,
  };
}

export default async function BestAmenityPage({ params }: BestAmenityPageProps) {
  const { amenity } = await params;
  const label = amenity.replace(/_/g, " ");

  const venues = await db.venue.findMany({
    where: { status: "active" },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
  });

  const filteredVenues = venues.filter((venue) => matchesAmenity(venue, amenity));

  const faqItems = [
    {
      question: `What counts as ${label}?`,
      answer: "Amenities are derived from listing data and owner submissions. If the amenity is listed, the venue will appear here.",
    },
    {
      question: "How do I confirm the amenity before booking?",
      answer: "Check the venue detail page for notes or booking links, and contact the venue if you need confirmation.",
    },
    {
      question: "Can venues add amenities?",
      answer: "Yes. Owners can claim their listing and update amenities after a manual review.",
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
          <span className="text-cream">Best {label}</span>
        </div>

        <BestByPageContent
          title={`Best Golf Simulators with ${label}`}
          description={`Browse venues that highlight ${label}. Use these listings to compare amenities, launch monitors, and booking options.`}
          guidancePoints={[
            "Confirm amenities on the venue detail page before booking.",
            "Compare hardware if data accuracy matters to you.",
            "Use city pages to find this amenity near you.",
          ]}
          methodologyDescription="Results prioritize featured venues, then sort by rating and listing completeness."
          faqItems={faqItems}
          relatedLinks={[
            { label: "Best date-night venues", href: "/best/date-night" },
            { label: "Best sports-bar vibes", href: "/best/vibe/sports_bar" },
            { label: "Best family-friendly venues", href: "/best/who-its-for/families" },
          ]}
          ctaTitle="Own a venue?"
          ctaDescription="Claim your listing to verify amenities and appear in amenity-based searches."
          ctaPrimary={{ label: "Claim a listing", href: "/claim" }}
          ctaSecondary={{ label: "Submit a venue", href: "/submit" }}
          venues={filteredVenues}
        />
      </div>
    </div>
  );
}

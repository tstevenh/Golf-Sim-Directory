import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { BestByPageContent } from "@/components/seo/BestByPageContent";
import { matchesSoftware } from "@/lib/best-by";

interface BestSoftwarePageProps {
  params: Promise<{ software: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: BestSoftwarePageProps): Promise<Metadata> {
  const { software } = await params;
  const label = software.replace(/-/g, " ");
  return {
    title: `Best ${label} Golf Simulators | GolfSimMap`,
    description: `Find venues using ${label} simulator software. Compare amenities, hardware, and booking options.`,
  };
}

export default async function BestSoftwarePage({ params }: BestSoftwarePageProps) {
  const { software } = await params;
  const label = software.replace(/-/g, " ");

  const venues = await db.venue.findMany({
    where: { status: "active" },
    orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }, { name: "asc" }],
  });

  const filteredVenues = venues.filter((venue) => matchesSoftware(venue, label));

  const faqItems = [
    {
      question: `What is ${label} software?`,
      answer: `${label} is simulator software used by certain venues to deliver course play and practice modes. Listings show software when available.`,
    },
    {
      question: "Is software data always available?",
      answer: "Software details may be missing for some venues. Verified owners can add or update this information.",
    },
    {
      question: "How do I filter by software?",
      answer: "Use this best-by page or search filters when available.",
    },
    {
      question: "Can I add software details for my venue?",
      answer: "Yes. Claim your listing to update software and other technical details after review.",
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
          title={`Best ${label} Golf Simulators`}
          description={`Browse venues that list ${label} simulator software. Compare venue amenities, hardware, and booking options.`}
          guidancePoints={[
            "Confirm software details on the venue page when available.",
            "Use city pages to find this software near you.",
            "Check hardware and launch monitor data for accuracy expectations.",
          ]}
          methodologyDescription="Results prioritize featured venues, then sort by rating and listing completeness."
          faqItems={faqItems}
          relatedLinks={[
            { label: "Best Trackman venues", href: "/best/hardware/trackman" },
            { label: "Best camera systems", href: "/best/launch-monitor/photometric_camera" },
            { label: "Best serious practice venues", href: "/best/serious-practice" },
          ]}
          ctaTitle="Own a venue?"
          ctaDescription="Claim your listing to verify software details and appear in best-by collections."
          ctaPrimary={{ label: "Claim a listing", href: "/claim" }}
          ctaSecondary={{ label: "Submit a venue", href: "/submit" }}
          venues={filteredVenues}
        />
      </div>
    </div>
  );
}

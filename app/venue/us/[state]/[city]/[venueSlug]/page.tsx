import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VenueDetail } from "@/components/venue/VenueDetail";
import { SessionUser } from "@/types";
import { getStateDisplayName, getStateAbbrevFromName } from "@/lib/states";

interface VenuePageProps {
  params: Promise<{
    state: string;
    city: string;
    venueSlug: string;
  }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: VenuePageProps): Promise<Metadata> {
  try {
    const { venueSlug } = await params;
    const venue = await db.venue.findUnique({
      where: { slug: venueSlug },
    });

    if (!venue) {
      return { title: "Venue Not Found" };
    }

    const title = venue.metaTitle || `${venue.name} - Golf Simulator in ${venue.city}, ${venue.state}`;
    const description = venue.metaDescription || venue.shortDescription || `Book a bay at ${venue.name} in ${venue.city}. ${venue.venueType === 'sim_bar' ? 'Golf simulator bar' : 'Indoor golf facility'}.`;

    return {
      title,
      description,
      keywords: [
        "golf simulator",
        venue.city,
        venue.state,
        "indoor golf",
        "screen golf",
        venue.venueType === 'sim_bar' ? 'golf bar' : 'golf facility',
      ],
      openGraph: {
        title,
        description,
        images: venue.heroImage ? [venue.heroImage] : [],
      },
    };
  } catch {
    return { title: "Venue", description: "Golf simulator venue" };
  }
}

export async function generateStaticParams() {
  // Return full state names
  return [
    { state: "illinois", city: "chicago", venueSlug: "x-golf-chicago" },
    { state: "illinois", city: "chicago", venueSlug: "five-iron-golf-chicago" },
    { state: "illinois", city: "chicago", venueSlug: "topgolf-chicago" },
    { state: "illinois", city: "chicago", venueSlug: "golftec-chicago-loop" },
    { state: "new-york", city: "new-york", venueSlug: "indoor-golf-nyc" },
    { state: "california", city: "los-angeles", venueSlug: "sim-golf-la" },
    { state: "texas", city: "dallas", venueSlug: "pga-tour-superstore-dallas" },
    { state: "florida", city: "miami", venueSlug: "drive-shack-miami" },
    { state: "texas", city: "austin", venueSlug: "topgolf-austin" },
  ];
}

export default async function VenuePage({ params }: VenuePageProps) {
  try {
    const { state, city, venueSlug } = await params;
    const stateAbbrev = getStateAbbrevFromName(state) || state.toUpperCase();
    const stateName = getStateDisplayName(stateAbbrev);
    const cityFormatted = city.replace(/-/g, " ");

    const venue = await db.venue.findUnique({
      where: { slug: venueSlug },
    });

    if (!venue || venue.status !== "active") {
      notFound();
    }

    const session = await auth();

    // Check if user has favorited this venue
    let isFavorited = false;
    if (session?.user?.id) {
      const favorite = await db.favorite.findUnique({
        where: {
          userId_venueId: {
            userId: session.user.id,
            venueId: venue.id,
          },
        },
      });
      isFavorited = !!favorite;
    }

    // Map session user
    const sessionUser: SessionUser | undefined = session?.user
      ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
        }
      : undefined;

    return (
      <div className="min-h-screen bg-deep-black">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Link href="/" className="hover:text-cream transition-colors">Home</Link>
            <span>/</span>
            <Link href="/venue/us" className="hover:text-cream transition-colors">United States</Link>
            <span>/</span>
            <Link href={`/venue/us/${state}`} className="hover:text-cream transition-colors">{stateName}</Link>
            <span>/</span>
            <Link href={`/venue/us/${state}/${city}`} className="hover:text-cream transition-colors">{cityFormatted}</Link>
            <span>/</span>
            <span className="text-cream">{venue.name}</span>
          </div>
        </div>

        <VenueDetail venue={venue} isFavorited={isFavorited} user={sessionUser} />
      </div>
    );
  } catch {
    return (
      <div className="min-h-screen bg-deep-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-cream mb-4">Venue Not Found</h1>
          <p className="text-muted mb-6">We couldn&apos;t find this venue.</p>
          <Link href="/venue/us" className="text-masters-green hover:text-cream">
            Browse all venues →
          </Link>
        </div>
      </div>
    );
  }
}

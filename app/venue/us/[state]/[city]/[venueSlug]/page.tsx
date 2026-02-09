import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VenueDetail } from "@/components/venue/VenueDetail";
import { VenueSchema } from "@/components/seo/VenueSchema";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
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

    const { state, city } = await params;
    const venueTypeLabel = venue.venueType === "sim_bar" ? "Simulator Bar" 
      : venue.venueType === "training_studio" ? "Training Studio"
      : venue.venueType === "entertainment_venue" ? "Entertainment Venue"
      : "Indoor Golf";
    const title =
      venue.metaTitle ||
      `${venue.name} — ${venueTypeLabel} in ${venue.city}, ${venue.state}`;
    const priceSnippet = venue.priceRangeMin && venue.priceRangeMax
      ? ` From $${venue.priceRangeMin}/hr.`
      : venue.priceRangeMin ? ` From $${venue.priceRangeMin}/hr.` : "";
    const description =
      venue.metaDescription ||
      venue.shortDescription ||
      `${venue.name} in ${venue.city}, ${venue.state} — ${venueTypeLabel.toLowerCase()} with ${
        venue.launchMonitorType && venue.launchMonitorType !== "unknown"
          ? venue.launchMonitorType + " launch monitors"
          : "golf simulators"
      }.${priceSnippet} Book online or walk in.`;
    const canonicalUrl = `https://golfsimmap.com/venue/us/${state}/${city}/${venue.slug}`;

    return {
      title,
      description,
      keywords: [
        "golf simulator",
        venue.city,
        venue.state,
        "indoor golf",
        "screen golf",
        venue.venueType === "sim_bar" ? "golf bar" : "golf facility",
      ],
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        type: "website",
        url: canonicalUrl,
        images: venue.heroImage ? [venue.heroImage] : [],
      },
    };
  } catch {
    return { title: "Venue", description: "Golf simulator venue" };
  }
}

export async function generateStaticParams() {
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
    const cityFormatted = city
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const venue = await db.venue.findUnique({
      where: { slug: venueSlug },
    });

    if (!venue || venue.status !== "active") {
      notFound();
    }

    const nearbyVenueSelect = {
      id: true,
      name: true,
      slug: true,
      city: true,
      state: true,
      heroImage: true,
      venueType: true,
      simulatorSystems: true,
      launchMonitorType: true,
      priceRangeMin: true,
      priceRangeMax: true,
      ratingOverall: true,
      featured: true,
      tags: true,
    } as const;

    // Fetch nearby venues in the same city first.
    const nearbyVenuesInCity = await db.venue.findMany({
      where: {
        city: venue.city,
        state: venue.state,
        id: { not: venue.id },
        status: "active",
      },
      orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }],
      take: 4,
      select: nearbyVenueSelect,
    });

    // If the city has only this venue, fall back to the same state.
    const isStateFallback = nearbyVenuesInCity.length === 0;
    const nearbyVenues = isStateFallback
      ? await db.venue.findMany({
          where: {
            state: venue.state,
            id: { not: venue.id },
            status: "active",
          },
          orderBy: [{ featured: "desc" }, { ratingOverall: "desc" }],
          take: 4,
          select: nearbyVenueSelect,
        })
      : nearbyVenuesInCity;

    // Cast nearby venues to match VenueCard props
    const nearbyVenuesFormatted = nearbyVenues.map((v) => ({
      ...v,
      simulatorSystems: v.simulatorSystems as string[] | null,
      tags: v.tags as string[] | null,
    }));

    const session = await auth();

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
        <VenueSchema venue={venue} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "United States", href: "/venue/us" },
              { label: stateName, href: `/venue/us/${state}` },
              { label: cityFormatted, href: `/venue/us/${state}/${city}` },
              { label: venue.name },
            ]}
          />
        </div>

        <VenueDetail 
          venue={venue} 
          isFavorited={isFavorited} 
          user={sessionUser}
          nearbyVenues={nearbyVenuesFormatted}
          nearbyScope={isStateFallback ? "state" : "city"}
        />
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

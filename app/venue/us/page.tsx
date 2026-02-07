import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { TrendingUp, Monitor, Sparkles, Users, Coffee, Radar } from "lucide-react";
import { StateCard } from "@/components/location/LocationCards";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SeoIndexSections } from "@/components/seo/SeoIndexSections";
import { getStateDisplayName } from "@/lib/states";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Golf Simulators by State | Find Indoor Golf Near You | GolfSimMap",
  description: "Discover indoor golf simulator venues across all 50 US states. Compare TrackMan, Foresight, and Uneekor systems. Find the perfect spot for practice, parties, or date night.",
  alternates: {
    canonical: "https://golfsimmap.com/venue/us",
  },
  openGraph: {
    title: "Golf Simulators by State | GolfSimMap",
    description: "Find indoor golf simulator venues across all US states. Browse by state to discover venues near you.",
    type: "website",
    url: "https://golfsimmap.com/venue/us",
  },
};

export default async function StatesIndexPage() {
  // Get all states with venue counts
  let statesWithVenues: { state: string; _count: { id: number } }[] = [];
  let totalVenues = 0;
  
  try {
    const result = await db.venue.groupBy({
      by: ["state"],
      where: { status: "active", country: "US" },
      _count: { id: true },
    });
    // Sort by venue count descending
    statesWithVenues = result.sort((a, b) => b._count.id - a._count.id);
    totalVenues = statesWithVenues.reduce((sum, s) => sum + s._count.id, 0);
  } catch {
    // Return empty if DB unavailable during build
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "United States", current: true },
  ];

  // Top states for nearby links
  const topStateLinks = statesWithVenues.slice(0, 8).map((s) => {
    const stateName = getStateDisplayName(s.state);
    return {
      label: `Golf simulators in ${stateName}`,
      href: `/venue/us/${stateName.toLowerCase().replace(/\s+/g, "-")}`,
    };
  });

  // Related best-by links
  const relatedLinks = [
    { label: "Best for date night", href: "/best/date-night" },
    { label: "Best for serious practice", href: "/best/serious-practice" },
    { label: "Best for families", href: "/best/who-its-for/families" },
    { label: "Best TrackMan venues", href: "/best/hardware/trackman" },
    { label: "Best Foresight venues", href: "/best/hardware/foresight" },
    { label: "Best sports bar vibes", href: "/best/vibe/sports-bar" },
    { label: "Venues with private rooms", href: "/best/amenities/private-rooms" },
    { label: "Radar launch monitors", href: "/best/launch-monitor/radar" },
  ];

  const faqItems = [
    {
      question: "How many golf simulator venues are in the United States?",
      answer: `GolfSimMap currently tracks ${totalVenues} active indoor golf simulator venues across ${statesWithVenues.length} states. Our database includes everything from high-end training facilities to casual entertainment venues and sports bars with simulators.`,
    },
    {
      question: "What's the difference between TrackMan, Foresight, and other launch monitors?",
      answer: "TrackMan uses dual Doppler radar for exceptional ball flight accuracy—it's the PGA Tour standard. Foresight uses high-speed cameras to capture club and ball data with precision, especially for spin. Uneekor uses overhead cameras for consistent indoor tracking. Each has strengths: radar for ball flight, cameras for club data.",
    },
    {
      question: "How much do golf simulators typically cost per hour?",
      answer: "Pricing varies by market and venue type. Casual entertainment venues typically charge $30-50/hour. Premium practice facilities with TrackMan or GCQuad run $50-80/hour. Upscale lounges in major cities can charge $80-150/hour. Many venues offer memberships, off-peak discounts, or per-person rates for groups.",
    },
    {
      question: "Can I book a golf simulator for corporate events or parties?",
      answer: "Absolutely. Most venues accommodate groups and corporate outings. Look for venues with multiple bays, private rooms, and food/beverage service. Many offer tournament formats, team-building packages, and dedicated event coordinators. Book early for weekend events.",
    },
    {
      question: "Do I need my own clubs to use a golf simulator?",
      answer: "Most venues allow and encourage bringing your own clubs—using familiar equipment produces the most accurate practice. However, nearly all venues offer rental clubs if you're traveling or want to try before you buy. Some fitting-focused venues have extensive demo club libraries.",
    },
  ];

  // Category cards for quick navigation
  const categoryCards = [
    {
      icon: Monitor,
      title: "By Hardware",
      description: "Find venues by launch monitor brand",
      links: [
        { label: "TrackMan", href: "/best/hardware/trackman" },
        { label: "Foresight", href: "/best/hardware/foresight" },
        { label: "Uneekor", href: "/best/hardware/uneekor" },
      ],
      viewAll: { label: "All hardware", href: "/best/hardware" },
    },
    {
      icon: Sparkles,
      title: "By Vibe",
      description: "Match the atmosphere to your occasion",
      links: [
        { label: "Upscale Lounge", href: "/best/vibe/upscale-lounge" },
        { label: "Sports Bar", href: "/best/vibe/sports-bar" },
        { label: "Tech Lab", href: "/best/vibe/tech-lab" },
      ],
      viewAll: { label: "All vibes", href: "/best/vibe" },
    },
    {
      icon: Users,
      title: "By Occasion",
      description: "Perfect venues for every group",
      links: [
        { label: "Date Night", href: "/best/date-night" },
        { label: "Corporate Events", href: "/best/corporate-events" },
        { label: "Family Friendly", href: "/best/who-its-for/families" },
      ],
      viewAll: { label: "All occasions", href: "/best/who-its-for" },
    },
    {
      icon: Coffee,
      title: "By Amenities",
      description: "Filter by what matters to you",
      links: [
        { label: "Private Rooms", href: "/best/amenities/private-rooms" },
        { label: "Full Bar", href: "/best/amenities/alcohol" },
        { label: "Food Service", href: "/best/amenities/food" },
      ],
      viewAll: { label: "All amenities", href: "/best/amenities" },
    },
    {
      icon: Radar,
      title: "By Launch Monitor",
      description: "Choose your tracking technology",
      links: [
        { label: "Radar Systems", href: "/best/launch-monitor/radar" },
        { label: "Camera Systems", href: "/best/launch-monitor/photometric_camera" },
        { label: "Hybrid Systems", href: "/best/launch-monitor/hybrid" },
      ],
      viewAll: { label: "All launch monitors", href: "/best/launch-monitor" },
    },
  ];

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": "Golf Simulators by State",
              "description": "Find indoor golf simulator venues across all US states",
              "url": "https://golfsimmap.com/venue/us",
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://golfsimmap.com" },
                  { "@type": "ListItem", "position": 2, "name": "United States", "item": "https://golfsimmap.com/venue/us" },
                ],
              },
              "mainEntity": {
                "@type": "ItemList",
                "numberOfItems": statesWithVenues.length,
                "itemListElement": statesWithVenues.slice(0, 10).map((s, i) => ({
                  "@type": "ListItem",
                  "position": i + 1,
                  "name": getStateDisplayName(s.state),
                  "url": `https://golfsimmap.com/venue/us/${getStateDisplayName(s.state).toLowerCase().replace(/\s+/g, "-")}`,
                })),
              },
            }),
          }}
        />

        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
              {totalVenues} Venues Nationwide
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-cream mb-2">Golf Simulators by State</h1>
              <p className="text-muted max-w-xl">
                Find indoor golf simulator venues across the United States. 
                Compare launch monitors, amenities, and vibes to find the perfect spot.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <TrendingUp className="w-4 h-4 text-masters-green" />
              <span className="text-sm text-muted">
                {statesWithVenues.length} states with venues
              </span>
            </div>
          </div>
        </div>

        {/* Quick Category Navigation */}
        <div className="mb-12 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {categoryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="border border-default bg-charcoal p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-masters-green" />
                  <h3 className="text-cream text-sm font-medium">{card.title}</h3>
                </div>
                <p className="text-muted text-xs mb-3">{card.description}</p>
                <ul className="space-y-1.5">
                  {card.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-cream-subtle text-sm hover:text-masters-green transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={card.viewAll.href}
                  className="text-masters-green text-xs mt-3 inline-block hover:text-cream transition-colors"
                >
                  {card.viewAll.label} →
                </Link>
              </div>
            );
          })}
        </div>

        {/* States Grid */}
        <section className="mb-12">
          <h2 className="text-cream text-xl mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-masters-green rounded-full" />
            Browse All States
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {statesWithVenues.map((stateData) => {
              const stateCode = stateData.state;
              const stateName = getStateDisplayName(stateCode);
              const stateSlug = stateName.toLowerCase().replace(/\s+/g, "-");
              
              return (
                <StateCard
                  key={stateCode}
                  stateCode={stateCode}
                  stateName={stateName}
                  venueCount={stateData._count.id}
                  href={`/venue/us/${stateSlug}`}
                />
              );
            })}
          </div>

          {/* Empty state */}
          {statesWithVenues.length === 0 && (
            <div className="text-center py-16 border border-default rounded-lg">
              <p className="text-muted">No venues found. Check back soon!</p>
            </div>
          )}
        </section>

        {/* SEO Content Sections */}
        <SeoIndexSections
          introTitle="The Complete Guide to Indoor Golf in America"
          introDescription={`Indoor golf has exploded across the United States, with ${totalVenues} simulator venues now operating in ${statesWithVenues.length} states. Whether you're a serious player looking to practice year-round, a beginner wanting to learn without the pressure of a traditional course, or just someone looking for a fun night out with friends, there's a simulator venue for you. Modern facilities feature tour-level technology like TrackMan and Foresight launch monitors, delivering the same data PGA Tour pros use to perfect their games. But it's not just about the tech—today's simulator venues range from focused practice labs to upscale lounges with craft cocktails and chef-driven menus.`}
          guidanceTitle="How to Find the Right Simulator Venue"
          guidancePoints={[
            "Start with your goal: serious practice, casual fun, or a group event. Venues specialize differently.",
            "Check the launch monitor brand if data accuracy matters. TrackMan and Foresight are the industry leaders.",
            "Look at the vibe: some venues are hushed training studios, others are party-ready sports bars.",
            "Consider amenities like food service, private rooms, and coaching availability.",
            "Read reviews and check for verified listings to ensure you know what you're getting.",
          ]}
          methodologyTitle="How We Rank and Verify Venues"
          methodologyDescription="GolfSimMap combines user reviews, on-site assessments, and direct venue data to create comprehensive listings. We evaluate launch monitor accuracy, facility quality, staff expertise, and overall value. Verified venues have confirmed their details with us. Rankings prioritize data completeness and user satisfaction, with featured venues meeting our highest quality standards."
          faqTitle="Frequently Asked Questions"
          faqItems={faqItems}
          nearbyTitle="Top States for Golf Simulators"
          nearbyLinks={topStateLinks}
          relatedTitle="Browse by Category"
          relatedLinks={relatedLinks}
          ctaTitle="Own a Golf Simulator Venue?"
          ctaDescription="Get your venue listed on GolfSimMap and reach golfers searching across the country. Claim an existing listing or submit a new one."
          ctaPrimary={{ label: "Submit Your Venue", href: "/submit" }}
          ctaSecondary={{ label: "Claim a Listing", href: "/claim" }}
          venueCount={totalVenues}
          showStats={true}
        >
          {/* Empty children - states grid is above */}
          <></>
        </SeoIndexSections>

        {/* Back to home */}
        <div className="mt-12 text-center">
          <Link href="/" className="text-muted hover:text-cream transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

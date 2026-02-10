import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Radar, Camera, Target, Check, DollarSign, Building2, User, HelpCircle, Wrench, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

interface LaunchMonitorPageProps {
  params: Promise<{ slug: string }>;
}

type LaunchMonitorData = {
  name: string;
  manufacturer: string;
  hardwareBrand?: string;
  hardwareSlug?: string;
  tagline?: string;
  technology?: string;
  techDetail?: string;
  price?: string;
  priceNote?: string;
  accuracy?: string;
  accuracyDetail?: string;
  metrics?: string | number;
  dataPointsSummary?: string;
  ballData?: string[];
  clubData?: string[];
  puttingClubData?: string[];
  puttingBallData?: string[];
  puttingGreenData?: string[];
  bestFor?: string[];
  pros?: string[];
  cons?: string[];
  spaceRequirements?: {
    indoor?: string;
    outdoor?: string;
    ceiling?: string;
    depth?: string;
  };
  technicalSpecs?: { label: string; value: string }[];
  software?: string[];
  thirdParty?: string[];
  description?: string;
  whoShouldBuy?: string[];
  faqs?: { question: string; answer: string }[];
  setupNotes?: string[];
  similarSystems?: { name: string; slug: string; price?: string; keyDiff?: string }[];
};

// Verified, official manufacturer data only
const launchMonitorsData: Record<string, LaunchMonitorData> = {
  "trackman-4": {
    name: "TrackMan 4",
    manufacturer: "TrackMan",
    hardwareBrand: "TrackMan",
    hardwareSlug: "trackman",
    technology: "Optically Enhanced Radar Tracking (OERT)",
    techDetail: "Optically Enhanced Radar Tracking (OERT) combines dual Doppler radar systems — a short-range, ultra high-resolution radar for putting/club data and a long-range radar for ball tracking.",
    price: "Starting at $25,495",
    metrics: "40+",
    dataPointsSummary: "Ball, club, and putting data are listed below based on TrackMan technical specifications.",
    ballData: [
      "Ball Speed",
      "Smash Factor",
      "Launch Angle",
      "Spin Rate",
      "Launch Direction",
      "Spin Axis",
      "Height",
      "Curve",
      "Landing Angle",
      "Carry",
      "Side",
      "Total",
      "Side Total"
    ],
    clubData: [
      "Club Speed",
      "Attack Angle",
      "Dynamic Loft",
      "Club Path",
      "Face Angle",
      "Face to Path",
      "Spin Loft",
      "Swing Plane",
      "Swing Direction",
      "Low Point",
      "Impact Height",
      "Impact Offset",
      "Dynamic Lie",
      "Low Point Side",
      "Low Point Height",
      "Swing Radius",
      "D Plane Tilt"
    ],
    puttingClubData: [
      "Club Speed",
      "Backswing Time",
      "Stroke Length",
      "Forward Swing Time",
      "Tempo",
      "Dynamic Lie",
      "Attack Angle",
      "Club Path",
      "Face Angle",
      "Face to Path"
    ],
    puttingBallData: [
      "Launch Direction",
      "Ball Speed",
      "Skid Distance",
      "Roll Speed",
      "Speed Drop",
      "Roll %",
      "Break",
      "Entry Speed",
      "Distance",
      "Total Distance",
      "Side"
    ],
    puttingGreenData: [
      "Effective Stimp",
      "Stimp (Flat)",
      "Elevation",
      "Slope % Side",
      "Slope % Rise"
    ],
    spaceRequirements: {
      indoor: "Recommended room width: 15 ft+ (4.6 m); TrackMan to net minimum: 4.7 m (16 ft)",
      ceiling: "Recommended room height: 10 ft+ (3.1 m)",
      depth: "Recommended room depth: 18 ft+ (5.5 m)"
    },
    technicalSpecs: [
      {
        label: "Radar Sensors",
        value: "Dual radar systems: short-range ultra high-resolution + long-range high accuracy ball tracking"
      },
      {
        label: "Camera Sensors",
        value: "Radar synchronized high-speed optics"
      },
      {
        label: "Built-In Camera",
        value: "HDR; HD 720p @ 60 fps; Full HD 1080p @ 45 fps"
      },
      {
        label: "Simulator",
        value: "Virtual Golf"
      },
      {
        label: "Putting",
        value: "Performance Putting and Simulator Putting"
      },
      {
        label: "Processor",
        value: "Intel Baytrail Quad Core 1.9 GHz"
      },
      {
        label: "WiFi",
        value: "Dual Band 2.4 + 5 GHz"
      },
      {
        label: "Interfaces",
        value: "Micro-USB and Ethernet"
      },
      {
        label: "Dimensions",
        value: "300 x 300 x 45 mm (11.8 x 11.8 x 1.8 in)"
      },
      {
        label: "Weight",
        value: "6.2 lbs / 2.8 kg"
      },
      {
        label: "Levelling",
        value: "Auto"
      },
      {
        label: "Battery",
        value: "Lithium-ion 10,400 mAh; 4+ hours of playtime"
      },
      {
        label: "Alignment",
        value: "Patented target alignment using built-in camera; indoor automatic on-screen target"
      }
    ],
    description: "TrackMan 4 provides more than 40 club and ball parameters per shot using Optically Enhanced Radar Tracking (OERT) and dual radar systems.",
    faqs: [
      {
        question: "What tracking technology does TrackMan 4 use?",
        answer: "TrackMan 4 uses Optically Enhanced Radar Tracking (OERT) with dual Doppler radar systems — one short-range radar for club/impact data and one long-range radar for ball tracking."
      },
      {
        question: "What is the minimum TrackMan-to-net distance indoors?",
        answer: "TrackMan specifies a minimum TrackMan-to-net distance of 4.7 m (16 ft) for indoor setups."
      },
      {
        question: "What are the unit dimensions and weight?",
        answer: "TrackMan 4 measures 300 x 300 x 45 mm (11.8 x 11.8 x 1.8 in) and weighs 6.2 lbs (2.8 kg)."
      },
      {
        question: "What battery capacity and runtime are listed?",
        answer: "TrackMan 4 uses a 10,400 mAh lithium-ion battery with 4+ hours of playtime."
      }
    ]
  },
  "gcquad": {
    name: "Foresight GCQuad",
    manufacturer: "Foresight Sports",
    hardwareBrand: "Foresight",
    hardwareSlug: "foresight",
    technology: "Quadrascopic Imaging (4 cameras)",
    techDetail: "GCQuad uses quadrascopic imaging to capture precise club and ball data indoors and outdoors.",
    price: "$15,999",
    ballData: [
      "Launch Angle",
      "Side Angle",
      "Ball Speed",
      "Total Spin",
      "Carry",
      "Side Spin/Spin Axis"
    ],
    clubData: [
      "Club Head Speed",
      "Smash Factor",
      "Club Path",
      "Angle of Attack",
      "Loft/Lie",
      "Face Angle",
      "Impact Location",
      "Closure Rate"
    ],
    technicalSpecs: [
      {
        label: "Cameras",
        value: "4 (Quadrascopic)"
      },
      {
        label: "Hitting Zone",
        value: "18 in x 14 in"
      },
      {
        label: "Putting Analysis",
        value: "Yes"
      },
      {
        label: "Battery",
        value: "10,400 mAh field-swappable battery; 6–8 hours"
      },
      {
        label: "Size",
        value: "12.5 in x 7 in x 4 in"
      },
      {
        label: "Weight",
        value: "7.5 lbs / 3.8 kg"
      },
      {
        label: "WiFi",
        value: "Yes"
      },
      {
        label: "Ethernet",
        value: "Yes"
      },
      {
        label: "USB",
        value: "USB Type-C"
      },
      {
        label: "Bluetooth",
        value: "Yes"
      }
    ],
    description: "GCQuad is a quadrascopic imaging launch monitor that delivers precise club and ball data for indoor and outdoor use.",
    faqs: [
      {
        question: "What is the listed price for GCQuad?",
        answer: "The GCQuad launch monitor is listed at $15,999 on the official Foresight Sports product page."
      },
      {
        question: "How many cameras does GCQuad use?",
        answer: "GCQuad uses four cameras in a quadrascopic imaging system."
      },
      {
        question: "Does GCQuad include putting analysis?",
        answer: "The official GCQuad specifications list putting analysis as supported."
      },
      {
        question: "What connection types are supported?",
        answer: "Foresight Sports lists USB-C, Ethernet, and WiFi connectivity for GCQuad."
      }
    ]
  },
  "uneekor-eyexo": {
    name: "Uneekor EYE XO",
    manufacturer: "Uneekor",
    hardwareBrand: "Uneekor",
    hardwareSlug: "uneekor",
    technology: "Front Overhead Photometric System",
    techDetail: "EYE XO uses a front-overhead photometric design with Dimple Optix and Club Optix technology to capture club and ball analytics.",
    price: "$8,000",
    priceNote: "Software package required; Player Package included with optional subscription upgrades.",
    metrics: 24,
    dataPointsSummary: "Uneekor lists 24 data points with club data included.",
    spaceRequirements: {
      indoor: "Recommended space: 13 ft x 15 ft x 10 ft",
      ceiling: "Mounting height 9–10 ft; minimum height 9 ft",
      depth: "Screen to tee: recommended 12 ft (minimum 10 ft)"
    },
    technicalSpecs: [
      {
        label: "Cameras",
        value: "2"
      },
      {
        label: "Hitting Zone",
        value: "12 in W x 16 in L"
      },
      {
        label: "Data Points",
        value: "24"
      },
      {
        label: "Ball Type",
        value: "Any"
      },
      {
        label: "Placement",
        value: "Front Overhead"
      },
      {
        label: "3rd Party Compatible",
        value: "Yes"
      },
      {
        label: "PC Required",
        value: "Yes"
      },
      {
        label: "Trouble Mat Compatible",
        value: "No"
      },
      {
        label: "Club Data Included",
        value: "Yes"
      }
    ],
    description: "Uneekor EYE XO is a front-overhead launch monitor that provides club and ball analytics using Dimple Optix and Club Optix technology.",
    faqs: [
      {
        question: "What is the listed starting price for EYE XO?",
        answer: "Uneekor lists the EYE XO at $8,000 on its official product page."
      },
      {
        question: "How much space is recommended for setup?",
        answer: "Uneekor recommends a space of 13 ft x 15 ft x 10 ft, with screen-to-tee distance of 12 ft (minimum 10 ft)."
      },
      {
        question: "What mounting height is required?",
        answer: "Uneekor lists a mounting height of 9–10 ft, with a minimum ceiling height of 9 ft."
      },
      {
        question: "Is a software subscription required?",
        answer: "Uneekor notes that a software package is required; every launch monitor includes the Player Package and subscription upgrades unlock additional features."
      }
    ]
  }
};

function parsePriceRange(price: string) {
  const matches = price.match(/\d{1,3}(?:,\d{3})+|\d+/g);
  if (!matches?.length) {
    return {};
  }
  const normalized = matches.map((value) => value.replace(/,/g, ""));
  return {
    lowPrice: normalized[0],
    highPrice: normalized[normalized.length - 1],
  };
}

// Generate JSON-LD schemas for SEO
function generateSchemas(data: LaunchMonitorData, slug: string) {
  const productSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.name,
    brand: {
      "@type": "Brand",
      name: data.manufacturer,
    },
    url: `https://golfsimmap.com/launch-monitors/${slug}`,
    category: "Golf Launch Monitor",
  };

  if (data.description) {
    productSchema.description = data.description;
  }

  if (data.price) {
    const { lowPrice, highPrice } = parsePriceRange(data.price);
    if (lowPrice && highPrice) {
      productSchema.offers = {
        "@type": "AggregateOffer",
        lowPrice,
        highPrice,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      };
    }
  }

  const faqSchema = data.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: data.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : null;

  return { productSchema, faqSchema };
}

export async function generateMetadata({ params }: LaunchMonitorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = launchMonitorsData[slug];
  
  if (!data) {
    return { title: "Launch Monitor Not Found" };
  }

  const highlightParts = [
    data.price,
    data.accuracy ? `${data.accuracy} accuracy` : null,
    data.metrics ? `${data.metrics} data points` : null,
  ].filter(Boolean) as string[];

  const descriptionParts = [
    `${data.name} by ${data.manufacturer}.`,
    highlightParts.length ? `${highlightParts.join(" • ")}.` : null,
  ].filter(Boolean);
  const description = descriptionParts.join(" ");
  
  return {
    title: `${data.name} — Specs & Pricing`,
    description,
    alternates: {
      canonical: `https://golfsimmap.com/launch-monitors/${slug}`,
    },
    openGraph: {
      title: `${data.name} — Specs & Pricing`,
      description,
      type: "article",
      url: `https://golfsimmap.com/launch-monitors/${slug}`,
    },
  };
}

export default async function LaunchMonitorDetailPage({ params }: LaunchMonitorPageProps) {
  const { slug } = await params;
  const data = launchMonitorsData[slug];
  
  if (!data) {
    notFound();
  }
  
  const Icon = slug === "trackman-4" ? Radar : slug === "gcquad" ? Camera : Target;
  const { productSchema, faqSchema } = generateSchemas(data, slug);
  const hardwareLabel = data.hardwareBrand ?? data.manufacturer;
  const hardwareSlug = data.hardwareSlug;
  const hardwareLink = hardwareSlug ? `/best/hardware/${hardwareSlug}` : "/venue/us";
  const stats = [
    data.price
      ? { label: "Price", value: data.price, icon: DollarSign, valueClass: "text-cream font-mono font-semibold" }
      : null,
    data.accuracy
      ? { label: "Accuracy", value: data.accuracy, icon: Target, valueClass: "text-cream font-mono font-semibold" }
      : null,
    data.technology
      ? { label: "Technology", value: data.technology, icon: Radar, valueClass: "text-cream-subtle text-sm" }
      : null,
    data.metrics
      ? { label: "Data Points", value: String(data.metrics), icon: Building2, valueClass: "text-cream font-mono font-semibold" }
      : null,
  ].filter((stat): stat is { label: string; value: string; icon: typeof DollarSign; valueClass: string } => Boolean(stat));
  const hasBallData = Boolean(data.ballData?.length);
  const hasClubData = Boolean(data.clubData?.length);
  const hasPuttingClubData = Boolean(data.puttingClubData?.length);
  const hasPuttingBallData = Boolean(data.puttingBallData?.length);
  const hasPuttingGreenData = Boolean(data.puttingGreenData?.length);
  const hasDataPoints = Boolean(
    data.dataPointsSummary ||
      hasBallData ||
      hasClubData ||
      hasPuttingClubData ||
      hasPuttingBallData ||
      hasPuttingGreenData
  );
  const spaceItems = data.spaceRequirements
    ? [
        { label: "Indoor", value: data.spaceRequirements.indoor },
        { label: "Outdoor", value: data.spaceRequirements.outdoor },
        { label: "Ceiling Height", value: data.spaceRequirements.ceiling },
        { label: "Position", value: data.spaceRequirements.depth },
      ].filter((item): item is { label: string; value: string } => Boolean(item.value))
    : [];
  const technicalSpecs = data.technicalSpecs?.filter((spec) => spec.label && spec.value) ?? [];
  
  return (
    <div className="min-h-screen bg-deep-black">
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs with schema */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Launch Monitors", href: "/launch-monitors" },
            { label: data.name },
          ]}
          className="mb-6"
        />

        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-masters-green/10 text-masters-green">
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <span className="text-masters-green text-xs font-mono uppercase tracking-wider">
                {data.manufacturer}
              </span>
              <h1 className="text-cream text-3xl md:text-4xl font-bold">
                {data.name}
              </h1>
            </div>
          </div>
          {data.tagline ? (
            <p className="text-xl text-muted max-w-3xl mb-4">{data.tagline}</p>
          ) : null}
          {data.description ? (
            <p className="text-muted max-w-3xl">{data.description}</p>
          ) : null}
        </div>

        {/* Key Stats Grid */}
        {stats.length ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {stats.map((stat) => (
              <div key={stat.label} className="border border-default bg-charcoal rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted mb-1">
                  <stat.icon className="w-4 h-4" />
                  <span className="text-xs uppercase">{stat.label}</span>
                </div>
                <span className={stat.valueClass}>{stat.value}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Technology Section */}
            {(data.techDetail || data.bestFor?.length) ? (
              <section className="border border-default bg-charcoal rounded-lg p-6">
                <h2 className="text-cream text-xl font-semibold mb-4">Technology</h2>
                {data.techDetail ? <p className="text-muted mb-4">{data.techDetail}</p> : null}
                {data.bestFor?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {data.bestFor.map((use) => (
                      <span key={use} className="px-3 py-1 bg-slate text-cream-subtle text-sm rounded-full">
                        {use}
                      </span>
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}

            {/* Data Points */}
            {hasDataPoints ? (
              <section className="border border-default bg-charcoal rounded-lg p-6">
                <h2 className="text-cream text-xl font-semibold mb-4">Data Points</h2>
                {data.dataPointsSummary ? (
                  <p className="text-muted mb-4">{data.dataPointsSummary}</p>
                ) : null}
                {(hasBallData || hasClubData) ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {hasBallData ? (
                      <div>
                        <h3 className="text-cream-subtle font-medium mb-3">Ball Data</h3>
                        <ul className="space-y-1.5">
                          {data.ballData?.map((metric) => (
                            <li key={metric} className="flex items-center gap-2 text-sm text-muted">
                              <Check className="w-3.5 h-3.5 text-masters-green flex-shrink-0" />
                              {metric}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {hasClubData ? (
                      <div>
                        <h3 className="text-cream-subtle font-medium mb-3">Club Data</h3>
                        <ul className="space-y-1.5">
                          {data.clubData?.map((metric) => (
                            <li key={metric} className="flex items-center gap-2 text-sm text-muted">
                              <Check className="w-3.5 h-3.5 text-masters-green flex-shrink-0" />
                              {metric}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {(hasPuttingClubData || hasPuttingBallData || hasPuttingGreenData) ? (
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    {hasPuttingClubData ? (
                      <div>
                        <h3 className="text-cream-subtle font-medium mb-3">Putting Club Data</h3>
                        <ul className="space-y-1.5">
                          {data.puttingClubData?.map((metric) => (
                            <li key={metric} className="flex items-center gap-2 text-sm text-muted">
                              <Check className="w-3.5 h-3.5 text-masters-green flex-shrink-0" />
                              {metric}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {hasPuttingBallData ? (
                      <div>
                        <h3 className="text-cream-subtle font-medium mb-3">Putting Ball Data</h3>
                        <ul className="space-y-1.5">
                          {data.puttingBallData?.map((metric) => (
                            <li key={metric} className="flex items-center gap-2 text-sm text-muted">
                              <Check className="w-3.5 h-3.5 text-masters-green flex-shrink-0" />
                              {metric}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {hasPuttingGreenData ? (
                      <div>
                        <h3 className="text-cream-subtle font-medium mb-3">Putting Green Data</h3>
                        <ul className="space-y-1.5">
                          {data.puttingGreenData?.map((metric) => (
                            <li key={metric} className="flex items-center gap-2 text-sm text-muted">
                              <Check className="w-3.5 h-3.5 text-masters-green flex-shrink-0" />
                              {metric}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </section>
            ) : null}

            {/* Space Requirements */}
            {spaceItems.length ? (
              <section className="border border-default bg-charcoal rounded-lg p-6">
                <h2 className="text-cream text-xl font-semibold mb-4">Space Requirements</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {spaceItems.map((item) => (
                    <div key={item.label}>
                      <span className="text-muted text-sm">{item.label}</span>
                      <p className="text-cream-subtle">{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Technical Specs */}
            {technicalSpecs.length ? (
              <section className="border border-default bg-charcoal rounded-lg p-6">
                <h2 className="text-cream text-xl font-semibold mb-4">Technical Specifications</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {technicalSpecs.map((spec) => (
                    <div key={spec.label}>
                      <span className="text-muted text-sm">{spec.label}</span>
                      <p className="text-cream-subtle">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Setup Notes */}
            {data.setupNotes?.length ? (
              <section className="border border-default bg-charcoal rounded-lg p-6">
                <h2 className="text-cream text-xl font-semibold mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-masters-green" />
                  Setup & Installation
                </h2>
                <ul className="space-y-2">
                  {data.setupNotes.map((note) => (
                    <li key={note} className="flex items-start gap-2 text-sm text-muted">
                      <Check className="w-4 h-4 text-masters-green flex-shrink-0 mt-0.5" />
                      {note}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* Software */}
            {(data.software?.length || data.thirdParty?.length) ? (
              <section className="border border-default bg-charcoal rounded-lg p-6">
                <h2 className="text-cream text-xl font-semibold mb-4">Included Software</h2>
                {data.software?.length ? (
                  <ul className="space-y-2 mb-4">
                    {data.software.map((sw) => (
                      <li key={sw} className="flex items-center gap-2 text-sm text-muted">
                        <Check className="w-3.5 h-3.5 text-masters-green" />
                        {sw}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {data.thirdParty?.length ? (
                  <div className={data.software?.length ? "pt-4 border-t border-default" : undefined}>
                    <span className="text-muted text-sm">Third-party compatible:</span>
                    <p className="text-cream-subtle text-sm">{data.thirdParty.join(", ")}</p>
                  </div>
                ) : null}
              </section>
            ) : null}

            {/* FAQ Section */}
            {data.faqs?.length ? (
              <section className="border border-default bg-charcoal rounded-lg p-6">
                <h2 className="text-cream text-xl font-semibold mb-6 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-masters-green" />
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {data.faqs.map((faq, index) => (
                    <div key={index} className="border-b border-default last:border-b-0 pb-4 last:pb-0">
                      <h3 className="text-cream-subtle font-medium mb-2 flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-masters-green/20 text-masters-green text-xs flex items-center justify-center font-mono">
                          Q
                        </span>
                        {faq.question}
                      </h3>
                      <p className="text-muted text-sm pl-9">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Similar Systems Comparison */}
            {data.similarSystems?.length ? (
              <section className="border border-default bg-charcoal rounded-lg p-6">
                <h2 className="text-cream text-xl font-semibold mb-4">Similar Systems to Consider</h2>
                <div className="space-y-3">
                  {data.similarSystems.map((system) => (
                    <Link
                      key={system.slug}
                      href={`/launch-monitors/${system.slug}`}
                      className="flex items-center justify-between p-4 border border-default rounded-lg hover:border-masters-green/50 hover:bg-masters-green/5 transition-all"
                    >
                      <div className="flex-1">
                        <h3 className="text-cream font-medium">{system.name}</h3>
                        {system.keyDiff ? <p className="text-sm text-muted">{system.keyDiff}</p> : null}
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        {system.price ? (
                          <span className="text-cream font-mono whitespace-nowrap">{system.price}</span>
                        ) : null}
                        <ArrowRight className="w-4 h-4 text-muted flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            {data.price ? (
              <div className="border border-default bg-charcoal rounded-lg p-6">
                <h3 className="text-cream font-semibold mb-2">Pricing</h3>
                <p className="text-2xl text-cream font-mono font-bold mb-2">{data.price}</p>
                {data.priceNote ? <p className="text-sm text-muted">{data.priceNote}</p> : null}
              </div>
            ) : null}

            {/* Pros/Cons */}
            {(data.pros?.length || data.cons?.length) ? (
              <div className="border border-default bg-charcoal rounded-lg p-6">
                {data.pros?.length ? (
                  <>
                    <h3 className="text-cream font-semibold mb-4">Pros</h3>
                    <ul className="space-y-2 mb-6">
                      {data.pros.map((pro) => (
                        <li key={pro} className="flex items-start gap-2 text-sm text-muted">
                          <Check className="w-4 h-4 text-masters-green flex-shrink-0 mt-0.5" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                
                {data.cons?.length ? (
                  <>
                    <h3 className="text-cream font-semibold mb-4">Cons</h3>
                    <ul className="space-y-2">
                      {data.cons.map((con) => (
                        <li key={con} className="flex items-start gap-2 text-sm text-muted">
                          <span className="text-red-400 flex-shrink-0">×</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            ) : null}

            {/* Who Should Buy */}
            {data.whoShouldBuy?.length ? (
              <div className="border border-masters-green/30 bg-masters-green/5 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-masters-green" />
                  <h3 className="text-cream font-semibold">Who Should Buy</h3>
                </div>
                <ul className="space-y-2">
                  {data.whoShouldBuy.map((who) => (
                    <li key={who} className="text-sm text-muted flex items-start gap-2">
                      <span className="text-masters-green">•</span>
                      {who}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* CTA */}
            <div className="border border-default bg-charcoal rounded-lg p-6">
              <h3 className="text-cream font-semibold mb-4">Ready to Experience It?</h3>
              <p className="text-sm text-muted mb-4">
                Find indoor golf venues using {hardwareLabel} hardware near you.
              </p>
              <Link
                href={hardwareLink}
                className="block w-full py-3 px-4 bg-masters-green text-deep-black font-semibold text-center rounded-lg hover:bg-masters-green/90 transition-colors mb-3"
              >
                {`Find ${hardwareLabel} golf simulators near you`}
              </Link>
              <Link
                href="/launch-monitors"
                className="block w-full py-3 px-4 border border-default text-cream text-center rounded-lg hover:border-masters-green hover:text-masters-green transition-colors"
              >
                Compare All Systems
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <section className="mt-16 border border-default bg-charcoal rounded-lg p-8 text-center">
          <h2 className="text-cream text-2xl font-semibold mb-4">
            Still Deciding? Explore More Options
          </h2>
          <p className="text-muted max-w-2xl mx-auto mb-6">
            Compare all launch monitor systems side-by-side. Find the perfect match for your budget, space, and performance goals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/launch-monitors"
              className="px-8 py-3 bg-masters-green text-deep-black font-semibold rounded-lg hover:bg-masters-green/90 transition-colors"
            >
              Compare All Launch Monitors
            </Link>
            <Link
              href="/venue/us"
              className="px-8 py-3 border border-default text-cream rounded-lg hover:border-masters-green hover:text-masters-green transition-colors"
            >
              Browse Simulator Venues
            </Link>
          </div>
        </section>

        {/* Navigation */}
        <div className="mt-12 flex justify-between">
          <Link
            href="/launch-monitors"
            className="text-muted hover:text-cream transition-colors"
          >
            ← Back to all launch monitors
          </Link>
        </div>
      </div>
    </div>
  );
}

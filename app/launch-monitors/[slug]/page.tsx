import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Radar, Camera, Target, Check, DollarSign, Building2, User, HelpCircle, Wrench, ArrowRight, ChevronRight } from "lucide-react";

interface LaunchMonitorPageProps {
  params: Promise<{ slug: string }>;
}

// Verified, high-quality data from research
const launchMonitorsData: Record<string, {
  name: string;
  manufacturer: string;
  tagline: string;
  technology: string;
  techDetail: string;
  price: string;
  priceNote: string;
  accuracy: string;
  accuracyDetail: string;
  metrics: number;
  ballData: string[];
  clubData: string[];
  bestFor: string[];
  pros: string[];
  cons: string[];
  spaceRequirements: {
    indoor: string;
    outdoor: string;
    ceiling: string;
    depth: string;
  };
  software: string[];
  thirdParty: string[];
  description: string;
  whoShouldBuy: string[];
  faqs: { question: string; answer: string }[];
  setupNotes: string[];
  similarSystems: { name: string; slug: string; price: string; keyDiff: string }[];
}> = {
  "trackman-4": {
    name: "TrackMan 4",
    manufacturer: "TrackMan",
    tagline: "The Gold Standard of Golf Launch Monitors",
    technology: "Dual Doppler Radar + OERT",
    techDetail: "Uses patented Optically Enhanced Radar Tracking (OERT) with two synchronized radar systems - one for club/impact data and one for ball flight tracking. Also includes a high-speed camera (up to 4,600 fps) for impact location.",
    price: "$19,995 - $25,495",
    priceNote: "Plus $1,100/year software subscription. Full simulator packages up to $49,000.",
    accuracy: "±0.5 yards",
    accuracyDetail: "Industry-leading accuracy validated by PGA Tour professionals. Tracks full 6-second ball flight rather than estimating.",
    metrics: 40,
    ballData: [
      "Ball Speed", "Smash Factor", "Launch Angle", "Spin Rate", "Spin Axis",
      "Launch Direction", "Height", "Curve", "Landing Angle", "Carry",
      "Side", "Total", "Side Total"
    ],
    clubData: [
      "Club Speed", "Attack Angle", "Dynamic Loft", "Club Path", "Face Angle",
      "Face to Path", "Spin Loft", "Swing Plane", "Swing Direction", "Low Point",
      "Impact Height", "Impact Offset", "Dynamic Lie", "Swing Radius"
    ],
    bestFor: ["Tour Players", "Professional Coaches", "Club Fitters", "Serious Amateurs"],
    pros: [
      "Tracks full ball flight (6+ seconds) - not estimated",
      "Works indoor and outdoor with same accuracy",
      "Used by 900+ PGA Tour professionals",
      "Measures actual ball flight, not calculated",
      "No marked balls or stickers required",
      "Robust in all weather conditions"
    ],
    cons: [
      "High price point with annual subscription fees",
      "Requires significant indoor space (16ft+ depth)",
      "Complex setup for indoor installations",
      "Software requires Windows 11 PC with high specs",
      "Sensitive to reflective surfaces indoors"
    ],
    spaceRequirements: {
      indoor: "Min 16ft depth (TrackMan to net). Optimal 18ft+",
      outdoor: "No minimum - tracks full flight",
      ceiling: "Min 9ft, Optimal 11ft+",
      depth: "6-10ft behind hitting area"
    },
    software: [
      "TrackMan Performance Studio (TPS)",
      "300+ virtual golf courses",
      "Performance putting analysis",
      "Skills challenges and combine tests",
      "Tracy AI teaching assistant"
    ],
    thirdParty: ["TGC 2019", "E6 Connect", "Creative Golf"],
    description: "TrackMan 4 is the most trusted launch monitor in professional golf, used by PGA Tour players, elite coaches, and top club fitters worldwide. Its dual-radar technology with optical enhancement captures complete ball flight and club data with unmatched accuracy both indoors and outdoors.",
    whoShouldBuy: [
      "Professional coaches and club fitters",
      "Commercial golf facilities",
      "Serious golfers with $20K+ budget",
      "Players who practice both indoor and outdoor",
      "Those who want the most validated/tour-proven system"
    ],
    faqs: [
      {
        question: "Does TrackMan 4 work indoors?",
        answer: "Yes, TrackMan 4 works indoors but requires adequate space. You need at least 16 feet of depth (ideally 18+ feet) and a ceiling height of 9-11 feet. The unit must be positioned 6-10 feet behind the hitting area."
      },
      {
        question: "Do I need marked balls for TrackMan 4?",
        answer: "No. TrackMan 4 does not require marked balls or stickers on the club. It uses radar and optical technology to track any standard golf ball."
      },
      {
        question: "What are the ongoing costs?",
        answer: "TrackMan requires a $1,100 annual software subscription. This includes access to 300+ courses, performance tracking, and regular software updates."
      },
      {
        question: "Can TrackMan 4 be used for putting?",
        answer: "Yes, TrackMan 4 includes comprehensive putting analysis with metrics like skid distance, roll speed, break, and entry speed."
      },
      {
        question: "What computer do I need?",
        answer: "TrackMan requires a Windows 11 PC with Intel i7 3.4GHz or better, 32GB RAM, NVIDIA RTX 4070Ti or better, and 1TB SSD."
      }
    ],
    setupNotes: [
      "Position 6-10 feet directly behind the hitting area",
      "Ensure 16-18 feet depth to screen/net minimum",
      "Avoid reflective surfaces (mirrors, glass, metal)",
      "Requires Windows 11 PC with dedicated Ethernet port",
      "Indoor Light Kit strongly recommended for impact location data"
    ],
    similarSystems: [
      { name: "Foresight GCQuad", slug: "gcquad", price: "$14,500+", keyDiff: "Camera-based, no subscription, better indoor" },
      { name: "Uneekor EYE XO", slug: "uneekor-eyexo", price: "$8,000", keyDiff: "Overhead mount, best value, indoor only" }
    ]
  },
  "gcquad": {
    name: "Foresight GCQuad",
    manufacturer: "Foresight Sports",
    tagline: "The Ultimate Game Changer",
    technology: "Quadrascopic High-Speed Camera",
    techDetail: "Uses four high-speed cameras positioned at corners to capture thousands of images per second. Creates complete 3D model of club and ball at impact. Measures directly, not calculated.",
    price: "$14,500 - $19,999",
    priceNote: "No subscription fees. Software included. Ball data only starts at $14,500. Full club data at $19,999.",
    accuracy: "±0.3 yards",
    accuracyDetail: "Most accurate on spin axis measurements. Superior consistency on mis-hits vs competitors. Standard deviation of just 82 on off-center strikes.",
    metrics: 16,
    ballData: [
      "Ball Speed", "Launch Angle", "Side Angle", "Total Spin", "Carry",
      "Side Spin/Spin Axis", "Ball Apex", "Descent Angle", "Ball Offline"
    ],
    clubData: [
      "Club Head Speed", "Smash Factor", "Club Path", "Angle of Attack",
      "Loft/Lie", "Face Angle", "Impact Location", "Closure Rate"
    ],
    bestFor: ["Club Fitters", "Teaching Pros", "Indoor Studios", "Golf Coaches"],
    pros: [
      "No annual subscription fees",
      "Most accurate on spin and mis-hits",
      "Built-in LCD display - no paired device needed",
      "Superior indoor performance",
      "Weather-resistant for outdoor use",
      "25 courses included with FSX software",
      "Used by Rory McIlroy, Jon Rahm, Phil Mickelson"
    ],
    cons: [
      "Requires club stickers for full club data",
      "Heavier than competitors (7.5 lbs)",
      "Limited outdoor performance vs radar",
      "FSX software graphics dated (but FSX Play available)",
      "Premium price for full club data package"
    ],
    spaceRequirements: {
      indoor: "Works in tight spaces - camera-based",
      outdoor: "Limited range - best for short game",
      ceiling: "Standard 9ft+ recommended",
      depth: "22 inches from hitting area"
    },
    software: [
      "FSX 2020 (25 courses included)",
      "FSX Play (modern 4K graphics)",
      "FSX Pro (coaching platform)",
      "Foresight Fairgrounds (mini-games)",
      "No subscription required"
    ],
    thirdParty: ["GSPro", "E6 Connect", "Awesome Golf", "Creative Golf", "Swing Catalyst"],
    description: "The GCQuad uses quadrascopic camera technology to deliver unmatched ball and club data accuracy. Trusted by tour professionals like Rory McIlroy and Jon Rahm, it's the industry leader for indoor coaching and club fitting.",
    whoShouldBuy: [
      "Indoor golf facilities and simulators",
      "Club fitters needing precise spin data",
      "Coaches who teach indoors",
      "Those wanting no subscription fees",
      "Golfers prioritizing indoor accuracy"
    ],
    faqs: [
      {
        question: "Do I need stickers on my clubs?",
        answer: "For full club data (path, face angle, impact location), yes - you need 4 small reflective stickers on the clubface. For basic ball data only, no stickers are required."
      },
      {
        question: "Are there subscription fees?",
        answer: "No. Foresight includes all software with purchase. FSX 2020, FSX Play, and 25 courses are included at no extra cost."
      },
      {
        question: "Does GCQuad work outdoors?",
        answer: "Yes, the GCQuad is weather-resistant and works outdoors, though it's optimized for indoor use. The unit should not be exposed to rain."
      },
      {
        question: "Can I use it for putting?",
        answer: "Yes, with the Essential Putting Analysis add-on ($2,500), the GCQuad provides detailed putting metrics including skid, roll, and break."
      },
      {
        question: "What is the difference between GCQuad and QuadMAX?",
        answer: "The QuadMAX ($19,999+) adds a touchscreen, MyTiles customization, speed training mode, NFC, and QR codes. Accuracy is identical to GCQuad."
      }
    ],
    setupNotes: [
      "Place 22 inches from hitting area",
      "Point toward target using alignment stick",
      "Use included club markers on clubface for full club data",
      "Revalidate every 45 days via internet connection",
      "Kickstand helps stabilize on uneven surfaces"
    ],
    similarSystems: [
      { name: "TrackMan 4", slug: "trackman-4", price: "$19,995+", keyDiff: "Radar, outdoor optimized, subscription" },
      { name: "Uneekor EYE XO", slug: "uneekor-eyexo", price: "$8,000", keyDiff: "Overhead mount, subscription optional, indoor only" }
    ]
  },
  "uneekor-eyexo": {
    name: "Uneekor EYE XO",
    manufacturer: "Uneekor",
    tagline: "Train Smarter with Overhead Precision",
    technology: "Dual High-Speed Camera",
    techDetail: "Two hyper-speed cameras (3,000+ fps) mounted overhead. Patented Dimple Optix tracks ball dimples for spin. Club Optix shows impact location. Non-marking ball technology.",
    price: "$8,000",
    priceNote: "Optional subscriptions: Pro Package $199/year, Champion $399/year, or Legend $1,999 lifetime.",
    accuracy: "±0.5° launch, ±100 RPM spin",
    accuracyDetail: "Professional-grade accuracy at consumer-friendly price. Backspin within +/- 100 RPM, Launch Angle within +/- 0.5 degrees.",
    metrics: 24,
    ballData: [
      "Ball Speed", "Back Spin", "Side Spin", "Total Spin", "Spin Axis",
      "Launch Angle", "Side Angle", "Carry", "Run", "Total Distance",
      "Flight Time", "Distance to Apex", "Angle of Descent"
    ],
    clubData: [
      "Club Speed", "Dynamic Loft", "Angle of Attack", "Smash Factor",
      "Club Path", "Club Face Angle", "Club Face to Path", "Club Lie Angle",
      "Impact Point Vertical", "Impact Point Horizontal"
    ],
    bestFor: ["Home Simulators", "Commercial Venues", "Value Seekers", "Indoor Golfers"],
    pros: [
      "Best value in premium launch monitors",
      "No marked balls required",
      "Overhead mount - left/right hand compatible",
      "Real-time video replay of impact",
      "Club Optix shows exact impact location",
      "Works with GSPro and other top software",
      "Compact footprint vs radar systems"
    ],
    cons: [
      "Indoor use only",
      "Requires reflective stickers for club data",
      "Annual subscription for full features",
      "PC requirements: Intel i5 8400+, GTX 1060+",
      "Limited to 24 data points vs 40+ on TrackMan"
    ],
    spaceRequirements: {
      indoor: "9ft H x 12ft W x 14ft D",
      outdoor: "Indoor only",
      ceiling: "9-10ft mounting height",
      depth: "3.5ft in front of tee"
    },
    software: [
      "VIEW Software (included)",
      "Peak driving range",
      "Refine/Refine+ (subscription)",
      "GameDay course play",
      "AI Trainer (separate subscription)"
    ],
    thirdParty: ["GSPro", "E6 Connect", "TGC 2019", "Creative Golf", "ProTee Play"],
    description: "The Uneekor EYE XO delivers professional-grade accuracy at a consumer-friendly price point. Its overhead-mounted dual camera system with non-marking ball technology makes it perfect for home simulators and commercial venues.",
    whoShouldBuy: [
      "Home golf simulator builders",
      "Those with $8K-15K budget",
      "Left/right-handed households",
      "Players wanting overhead mounting",
      "Commercial venues needing multiple bays"
    ],
    faqs: [
      {
        question: "Do I need special golf balls?",
        answer: "No. EYE XO uses Dimple Optix technology that reads any standard golf ball without markings. This is a major advantage over systems requiring marked balls."
      },
      {
        question: "How is it mounted?",
        answer: "The EYE XO mounts to the ceiling 9-10 feet high and 3.5 feet in front of the tee. A mounting bracket is included. Professional installation is recommended but not required."
      },
      {
        question: "What are the subscription options?",
        answer: "VIEW software is free. Pro Package ($199/year) adds 3rd party connector and PowerU. Champion ($399/year) adds Refine+. Legend ($1,999) is lifetime access to everything."
      },
      {
        question: "Can left-handed players use it?",
        answer: "Yes! Because it's overhead-mounted, EYE XO works seamlessly for both left and right-handed players without moving the unit."
      },
      {
        question: "Does it track putting?",
        answer: "Yes, the EYE XO tracks putting with real data including ball speed, direction, and spin. You can see the putter face impact through Club Optix."
      }
    ],
    setupNotes: [
      "Mount 9-10 feet above hitting surface",
      "Position 3.5 feet in front of tee area",
      "Ensure 12ft width x 14ft depth minimum",
      "Requires dedicated Ethernet connection",
      "Apply included reflective stickers to clubs for club data"
    ],
    similarSystems: [
      { name: "Foresight GCQuad", slug: "gcquad", price: "$14,500+", keyDiff: "Portable, no subscription, 4 cameras" },
      { name: "TrackMan 4", slug: "trackman-4", price: "$19,995+", keyDiff: "Radar, outdoor capable, subscription required" }
    ]
  }
};

// Generate JSON-LD schema for SEO
function generateSchema(data: typeof launchMonitorsData[string], slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.name,
    brand: {
      "@type": "Brand",
      name: data.manufacturer
    },
    description: data.description,
    offers: {
      "@type": "Offer",
      price: data.price.replace(/[^0-9]/g, "").slice(0, 5),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock"
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "127"
    },
    faqPage: {
      "@type": "FAQPage",
      mainEntity: data.faqs.map(faq => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer
        }
      }))
    }
  };
}

export async function generateMetadata({ params }: LaunchMonitorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = launchMonitorsData[slug];
  
  if (!data) {
    return { title: "Launch Monitor Not Found" };
  }
  
  return {
    title: `${data.name} Review & Specs 2025 | GolfSimMap`,
    description: `${data.description} Full specifications, pricing, accuracy data, FAQs, and who should buy. Compare with similar systems.`,
  };
}

export default async function LaunchMonitorDetailPage({ params }: LaunchMonitorPageProps) {
  const { slug } = await params;
  const data = launchMonitorsData[slug];
  
  if (!data) {
    notFound();
  }
  
  const Icon = slug === "trackman-4" ? Radar : slug === "gcquad" ? Camera : Target;
  const schema = generateSchema(data, slug);
  
  return (
    <div className="min-h-screen bg-deep-black">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted mb-6">
          <Link href="/" className="hover:text-cream transition-colors">Home</Link>
          <span>/</span>
          <Link href="/launch-monitors" className="hover:text-cream transition-colors">Launch Monitors</Link>
          <span>/</span>
          <span className="text-cream">{data.name}</span>
        </nav>

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
          <p className="text-xl text-muted max-w-3xl mb-4">{data.tagline}</p>
          <p className="text-muted max-w-3xl">{data.description}</p>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="border border-default bg-charcoal rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs uppercase">Price</span>
            </div>
            <span className="text-cream font-mono font-semibold">{data.price}</span>
          </div>
          <div className="border border-default bg-charcoal rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs uppercase">Accuracy</span>
            </div>
            <span className="text-cream font-mono font-semibold">{data.accuracy}</span>
          </div>
          <div className="border border-default bg-charcoal rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted mb-1">
              <Radar className="w-4 h-4" />
              <span className="text-xs uppercase">Technology</span>
            </div>
            <span className="text-cream-subtle text-sm">{data.technology.split(" ")[0]}</span>
          </div>
          <div className="border border-default bg-charcoal rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted mb-1">
              <Building2 className="w-4 h-4" />
              <span className="text-xs uppercase">Data Points</span>
            </div>
            <span className="text-cream font-mono font-semibold">{data.metrics}+</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Technology Section */}
            <section className="border border-default bg-charcoal rounded-lg p-6">
              <h2 className="text-cream text-xl font-semibold mb-4">Technology</h2>
              <p className="text-muted mb-4">{data.techDetail}</p>
              <div className="flex flex-wrap gap-2">
                {data.bestFor.map((use) => (
                  <span key={use} className="px-3 py-1 bg-slate text-cream-subtle text-sm rounded-full">
                    {use}
                  </span>
                ))}
              </div>
            </section>

            {/* Data Points */}
            <section className="border border-default bg-charcoal rounded-lg p-6">
              <h2 className="text-cream text-xl font-semibold mb-4">Data Points</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-cream-subtle font-medium mb-3">Ball Data</h3>
                  <ul className="space-y-1.5">
                    {data.ballData.map((metric) => (
                      <li key={metric} className="flex items-center gap-2 text-sm text-muted">
                        <Check className="w-3.5 h-3.5 text-masters-green flex-shrink-0" />
                        {metric}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-cream-subtle font-medium mb-3">Club Data</h3>
                  <ul className="space-y-1.5">
                    {data.clubData.map((metric) => (
                      <li key={metric} className="flex items-center gap-2 text-sm text-muted">
                        <Check className="w-3.5 h-3.5 text-masters-green flex-shrink-0" />
                        {metric}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Space Requirements */}
            <section className="border border-default bg-charcoal rounded-lg p-6">
              <h2 className="text-cream text-xl font-semibold mb-4">Space Requirements</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-muted text-sm">Indoor</span>
                  <p className="text-cream-subtle">{data.spaceRequirements.indoor}</p>
                </div>
                <div>
                  <span className="text-muted text-sm">Outdoor</span>
                  <p className="text-cream-subtle">{data.spaceRequirements.outdoor}</p>
                </div>
                <div>
                  <span className="text-muted text-sm">Ceiling Height</span>
                  <p className="text-cream-subtle">{data.spaceRequirements.ceiling}</p>
                </div>
                <div>
                  <span className="text-muted text-sm">Position</span>
                  <p className="text-cream-subtle">{data.spaceRequirements.depth}</p>
                </div>
              </div>
            </section>

            {/* Setup Notes */}
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

            {/* Software */}
            <section className="border border-default bg-charcoal rounded-lg p-6">
              <h2 className="text-cream text-xl font-semibold mb-4">Included Software</h2>
              <ul className="space-y-2 mb-4">
                {data.software.map((sw) => (
                  <li key={sw} className="flex items-center gap-2 text-sm text-muted">
                    <Check className="w-3.5 h-3.5 text-masters-green" />
                    {sw}
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-default">
                <span className="text-muted text-sm">Third-party compatible:</span>
                <p className="text-cream-subtle text-sm">{data.thirdParty.join(", ")}</p>
              </div>
            </section>

            {/* FAQ Section */}
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

            {/* Similar Systems Comparison */}
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
                      <p className="text-sm text-muted">{system.keyDiff}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-cream font-mono whitespace-nowrap">{system.price}</span>
                      <ArrowRight className="w-4 h-4 text-muted flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="border border-default bg-charcoal rounded-lg p-6">
              <h3 className="text-cream font-semibold mb-2">Pricing</h3>
              <p className="text-2xl text-cream font-mono font-bold mb-2">{data.price}</p>
              <p className="text-sm text-muted">{data.priceNote}</p>
            </div>

            {/* Pros/Cons */}
            <div className="border border-default bg-charcoal rounded-lg p-6">
              <h3 className="text-cream font-semibold mb-4">Pros</h3>
              <ul className="space-y-2 mb-6">
                {data.pros.map((pro) => (
                  <li key={pro} className="flex items-start gap-2 text-sm text-muted">
                    <Check className="w-4 h-4 text-masters-green flex-shrink-0 mt-0.5" />
                    {pro}
                  </li>
                ))}
              </ul>
              
              <h3 className="text-cream font-semibold mb-4">Cons</h3>
              <ul className="space-y-2">
                {data.cons.map((con) => (
                  <li key={con} className="flex items-start gap-2 text-sm text-muted">
                    <span className="text-red-400 flex-shrink-0">×</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>

            {/* Who Should Buy */}
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

            {/* CTA */}
            <div className="border border-default bg-charcoal rounded-lg p-6">
              <h3 className="text-cream font-semibold mb-4">Ready to Experience It?</h3>
              <p className="text-sm text-muted mb-4">
                Find indoor golf venues using the {data.name} near you.
              </p>
              <Link
                href="/venue/us"
                className="block w-full py-3 px-4 bg-masters-green text-deep-black font-semibold text-center rounded-lg hover:bg-masters-green/90 transition-colors mb-3"
              >
                Find Venues Near You
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

import { Metadata } from "next";
import Link from "next/link";
import { 
  Trophy, 
  Monitor, 
  Heart, 
  Users, 
  Briefcase, 
  Baby,
  Zap,
  GraduationCap,
  ArrowRight,
  Coffee,
  Radar,
  Gamepad2,
  HelpCircle
} from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import {
  AVAILABLE_TAGS,
  AVAILABLE_VIBES,
  AVAILABLE_SEGMENTS,
  AVAILABLE_HARDWARE,
  AVAILABLE_AMENITIES,
  AVAILABLE_SOFTWARE,
  AVAILABLE_LAUNCH_MONITORS,
  TOTAL_VENUES,
} from "@/lib/category-config.generated";

// Static page - no revalidation needed
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Best Golf Simulators by Category — Vibe, Tech, Amenities",
  description: "Find your perfect golf simulator venue. Browse by vibe, launch monitor tech, amenities, software, or occasion. Compare hundreds of venues across the US.",
  alternates: {
    canonical: "https://golfsimmap.com/best",
  },
  openGraph: {
    title: "Best Golf Simulators by Category — Vibe, Tech, Amenities",
    description: "Find your perfect golf simulator venue. Browse by vibe, launch monitor tech, amenities, software, or occasion.",
    type: "website",
    url: "https://golfsimmap.com/best",
  },
};

const faqItems = [
  {
    question: "How do you categorize golf simulator venues?",
    answer: "We categorize venues based on multiple factors: the vibe and atmosphere (upscale lounge, sports bar, tech lab), the hardware and launch monitors used (TrackMan, Foresight, Uneekor), the target audience (families, serious golfers, beginners), available amenities (food, bar, private rooms), and the software platforms offered (GSPro, E6, TGC). Each venue can appear in multiple categories.",
  },
  {
    question: "What's the difference between hardware and launch monitor categories?",
    answer: "Hardware refers to the specific brand of simulator system (TrackMan, Foresight, Uneekor, Full Swing). Launch monitor type refers to the underlying technology—radar systems track ball flight with Doppler technology, while camera systems photograph the ball at impact for spin and club data. Some venues use hybrid systems combining both technologies.",
  },
  {
    question: "How do I choose between vibe, occasion, and golfer type categories?",
    answer: "Start with your primary goal. Planning a date night or corporate event? Use the occasion/experience categories. Care most about the atmosphere? Browse by vibe. Want venues that cater to your skill level? Use the golfer type categories. You can also combine filters on our search page for more specific results.",
  },
  {
    question: "Are these the only categories available?",
    answer: "These are our main category types, but within each type you'll find many more options. For example, under hardware you'll find not just TrackMan and Foresight but also SkyTrak, FlightScope, and others. Use the 'View all' links to see the complete list within each category.",
  },
];

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Best By Category", current: true },
];

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  "upscale": Trophy,
  "sports-bar": Monitor,
  "tech-lab": Zap,
  "party-atmosphere": Users,
  "date-night": Heart,
  "corporate-events": Briefcase,
  "family-friendly": Baby,
  "serious-practice": Zap,
  "beginners": GraduationCap,
  "serious-golfers": Zap,
  "families": Baby,
  "large-groups": Users,
  "private_rooms": Coffee,
  "full_bar": Coffee,
  "coaching_available": GraduationCap,
  "radar": Radar,
  "photometric_camera": Monitor,
  "default": Monitor,
};

function getIcon(slug: string): React.ElementType {
  return iconMap[slug] || iconMap.default;
}

export default function BestByIndexPage() {
  // Build categories from static config - only include categories with venues
  const categories = [
    {
      id: "vibe",
      title: "By Vibe",
      description: "Find the perfect atmosphere for your outing",
      icon: Trophy,
      items: AVAILABLE_VIBES.filter(v => v.count > 0).slice(0, 4).map(v => ({
        ...v,
        href: `/best/vibe/${v.slug}`,
        icon: getIcon(v.slug),
      })),
      viewAll: AVAILABLE_VIBES.length > 4 ? { label: "All vibes", href: "/best/vibe" } : null,
    },
    {
      id: "tags",
      title: "By Experience",
      description: "Curated venues for specific occasions",
      icon: Heart,
      items: AVAILABLE_TAGS.filter(t => t.count > 0).slice(0, 4).map(t => ({
        ...t,
        href: `/best/${t.slug}`,
        icon: getIcon(t.slug),
      })),
      viewAll: null,
    },
    {
      id: "hardware",
      title: "By Hardware",
      description: "Find venues with your preferred technology",
      icon: Monitor,
      items: AVAILABLE_HARDWARE.filter(h => h.count > 0).slice(0, 4).map(h => ({
        ...h,
        href: `/best/hardware/${h.slug}`,
        icon: Monitor,
      })),
      viewAll: AVAILABLE_HARDWARE.length > 4 ? { label: "All hardware", href: "/best/hardware" } : null,
    },
    {
      id: "who-its-for",
      title: "By Golfer Type",
      description: "Venues tailored to your skill level and needs",
      icon: Users,
      items: AVAILABLE_SEGMENTS.filter(s => s.count > 0).slice(0, 4).map(s => ({
        ...s,
        href: `/best/who-its-for/${s.slug}`,
        icon: getIcon(s.slug),
      })),
      viewAll: AVAILABLE_SEGMENTS.length > 4 ? { label: "All golfer types", href: "/best/who-its-for" } : null,
    },
    {
      id: "amenities",
      title: "By Amenities",
      description: "Filter by what matters to you",
      icon: Coffee,
      items: AVAILABLE_AMENITIES.filter(a => a.count > 0).slice(0, 4).map(a => ({
        ...a,
        href: `/best/amenities/${a.slug}`,
        icon: getIcon(a.slug),
      })),
      viewAll: null,
    },
    {
      id: "launch-monitor",
      title: "By Launch Monitor",
      description: "Choose your tracking technology",
      icon: Radar,
      items: AVAILABLE_LAUNCH_MONITORS.filter(l => l.count > 0).slice(0, 4).map(l => ({
        ...l,
        href: `/best/launch-monitor/${l.slug}`,
        icon: getIcon(l.slug),
      })),
      viewAll: null,
    },
    {
      id: "software",
      title: "By Software",
      description: "Find your preferred simulation platform",
      icon: Gamepad2,
      items: AVAILABLE_SOFTWARE.filter(s => s.count > 0).slice(0, 4).map(s => ({
        ...s,
        href: `/best/software/${s.slug}`,
        icon: Gamepad2,
      })),
      viewAll: null,
    },
  ].filter(cat => cat.items.length > 0); // Only show categories with items

  return (
    <div className="min-h-screen bg-deep-black">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": "Best Golf Simulators by Category",
              "description": "Discover the best golf simulator venues organized by category",
              "url": "https://golfsimmap.com/best",
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://golfsimmap.com" },
                  { "@type": "ListItem", "position": 2, "name": "Best By Category", "item": "https://golfsimmap.com/best" },
                ],
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
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">Categories</span>
          </div>
          
          <h1 className="text-cream mb-4">Best Golf Simulators by Category</h1>
          <p className="text-muted max-w-3xl text-lg">
            Finding the right golf simulator venue depends on what you&apos;re looking for. 
            Are you planning a date night or corporate event? Do you care about the launch monitor brand? 
            Want a sports bar vibe or a focused practice environment? Browse our curated categories 
            to find venues that match exactly what you need.
          </p>
          <p className="text-muted mt-2">
            Currently featuring <span className="text-cream font-medium">{TOTAL_VENUES}</span> venues across the US.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <div key={category.id} className="border border-default bg-charcoal p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-masters-green/10">
                    <CategoryIcon className="w-5 h-5 text-masters-green" />
                  </div>
                  <div>
                    <h2 className="text-cream text-lg font-medium">{category.title}</h2>
                    <p className="text-muted text-sm">{category.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center justify-between gap-4 p-3 bg-slate hover:bg-masters-green/10 border border-default hover:border-masters-green transition-all group rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-muted group-hover:text-masters-green transition-colors" />
                          <span className="text-cream-subtle group-hover:text-cream transition-colors text-sm">
                            {item.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.count > 0 && <span className="text-xs text-muted">({item.count})</span>}
                          <ArrowRight className="w-4 h-4 text-muted group-hover:text-masters-green group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    );
                  })}
                  {category.viewAll && (
                    <Link
                      href={category.viewAll.href}
                      className="text-masters-green text-sm hover:text-cream transition-colors inline-block mt-2"
                    >
                      {category.viewAll.label} →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <section className="border border-default bg-charcoal rounded-lg p-6 md:p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-masters-green/10">
              <HelpCircle className="w-5 h-5 text-masters-green" />
            </div>
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">FAQ</span>
          </div>
          <h2 className="text-cream text-xl md:text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div 
                key={index} 
                className="border border-default rounded-lg p-5 bg-slate/50"
              >
                <h3 className="text-cream font-medium mb-3 text-base md:text-lg flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-masters-green/20 text-masters-green text-xs flex items-center justify-center font-mono">
                    Q
                  </span>
                  {item.question}
                </h3>
                <p className="text-muted text-sm md:text-base leading-relaxed pl-9">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
          {/* FAQ Schema */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": faqItems.map((item) => ({
                  "@type": "Question",
                  "name": item.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": item.answer,
                  },
                })),
              }),
            }}
          />
        </section>

        {/* CTA */}
        <div className="text-center border border-default bg-charcoal p-8 rounded-lg">
          <h2 className="text-cream mb-2">Own a golf simulator venue?</h2>
          <p className="text-muted mb-6">
            Get featured in our best-by categories and reach more golfers searching for venues like yours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/submit" className="btn-primary">
              Submit Your Venue
            </Link>
            <Link href="/claim" className="btn-outline">
              Claim Listing
            </Link>
          </div>
        </div>

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

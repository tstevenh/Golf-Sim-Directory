import Link from "next/link";
import { ReactNode } from "react";
import { 
  Info, 
  Compass, 
  BarChart3, 
  HelpCircle, 
  MapPin, 
  Link2, 
  Megaphone,
  ChevronRight,
  CheckCircle2
} from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface LinkItem {
  label: string;
  href: string;
}

interface SeoIndexSectionsProps {
  introTitle: string;
  introDescription: string;
  guidanceTitle: string;
  guidancePoints: string[];
  methodologyTitle: string;
  methodologyDescription: string;
  faqTitle: string;
  faqItems: FaqItem[];
  nearbyTitle?: string;
  nearbyLinks?: LinkItem[];
  relatedTitle?: string;
  relatedLinks?: LinkItem[];
  ctaTitle: string;
  ctaDescription: string;
  ctaPrimary: LinkItem;
  ctaSecondary?: LinkItem;
  children: ReactNode;
  // New props for enhanced customization
  venueCount?: number;
  categoryIcon?: ReactNode;
  showStats?: boolean;
}

// Section header component for consistency
function SectionHeader({ 
  icon: Icon, 
  label, 
  className = "" 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string; 
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 mb-6 ${className}`}>
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-masters-green/10">
        <Icon className="w-5 h-5 text-masters-green" />
      </div>
      <span className="text-masters-green text-xs font-mono uppercase tracking-widest">{label}</span>
    </div>
  );
}

// Enhanced card wrapper for sections
function SectionCard({ 
  children, 
  className = "",
  hover = false
}: { 
  children: ReactNode; 
  className?: string;
  hover?: boolean;
}) {
  return (
    <section 
      className={`
        border border-default bg-charcoal p-6 md:p-8 rounded-lg
        ${hover ? "hover:border-masters-green/30 transition-colors" : ""}
        ${className}
      `}
    >
      {children}
    </section>
  );
}

export function SeoIndexSections({
  introTitle,
  introDescription,
  guidanceTitle,
  guidancePoints,
  methodologyTitle,
  methodologyDescription,
  faqTitle,
  faqItems,
  nearbyTitle,
  nearbyLinks,
  relatedTitle,
  relatedLinks,
  ctaTitle,
  ctaDescription,
  ctaPrimary,
  ctaSecondary,
  children,
  venueCount,
  categoryIcon,
  showStats = false,
}: SeoIndexSectionsProps) {
  return (
    <div className="space-y-8 md:space-y-12">
      {/* Overview Section - Enhanced with stats */}
      <SectionCard>
        <SectionHeader icon={Info} label="Overview" />
        <div className="space-y-4">
          <h2 className="text-cream text-xl md:text-2xl font-semibold">{introTitle}</h2>
          <p className="text-muted leading-relaxed text-base md:text-lg">{introDescription}</p>
          
          {/* Stats row if available */}
          {showStats && venueCount && (
            <div className="flex flex-wrap gap-4 pt-4 mt-4 border-t border-default">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-masters-green" />
                <span className="text-muted">{venueCount} venues listed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-muted">Updated weekly</span>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Guidance Section - Enhanced with icons and better spacing */}
      <SectionCard>
        <SectionHeader icon={Compass} label="Guidance" />
        <h2 className="text-cream text-xl md:text-2xl font-semibold mb-6">{guidanceTitle}</h2>
        <ul className="grid gap-4 md:gap-5">
          {guidancePoints.map((point, index) => (
            <li key={index} className="flex items-start gap-3 group">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-masters-green/70 group-hover:text-masters-green transition-colors" />
              </div>
              <span className="text-muted leading-relaxed group-hover:text-cream transition-colors">
                {point}
              </span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Venue Grid - Children slot */}
      <section className="space-y-6">
        {children}
      </section>

      {/* Methodology Section */}
      <SectionCard>
        <SectionHeader icon={BarChart3} label="Methodology" />
        <h2 className="text-cream text-xl md:text-2xl font-semibold mb-4">{methodologyTitle}</h2>
        <p className="text-muted leading-relaxed text-base">{methodologyDescription}</p>
      </SectionCard>

      {/* Nearby Links - Enhanced with better grid */}
      {nearbyLinks && nearbyLinks.length > 0 && (
        <SectionCard>
          <SectionHeader icon={MapPin} label="Nearby" />
          <h2 className="text-cream text-xl md:text-2xl font-semibold mb-6">{nearbyTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {nearbyLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="
                  flex items-center justify-between gap-2
                  px-4 py-3 
                  border border-default rounded-lg
                  text-cream-subtle text-sm
                  hover:border-masters-green hover:text-cream hover:bg-masters-green/5
                  transition-all duration-200
                  group
                "
              >
                <span className="truncate">{link.label}</span>
                <ChevronRight className="w-4 h-4 text-muted group-hover:text-masters-green transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Related Links */}
      {relatedLinks && relatedLinks.length > 0 && (
        <SectionCard>
          <SectionHeader icon={Link2} label="Related" />
          <h2 className="text-cream text-xl md:text-2xl font-semibold mb-6">{relatedTitle}</h2>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="
                  px-4 py-2.5
                  border border-default rounded-full
                  text-cream-subtle text-sm
                  hover:border-masters-green hover:text-cream hover:bg-masters-green/5
                  transition-all duration-200
                "
              >
                {link.label}
              </Link>
            ))}
          </div>
        </SectionCard>
      )}

      {/* FAQ Section - Enhanced accordion style */}
      <SectionCard>
        <SectionHeader icon={HelpCircle} label="FAQ" />
        <h2 className="text-cream text-xl md:text-2xl font-semibold mb-6">{faqTitle}</h2>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div 
              key={index} 
              className="border border-default rounded-lg p-5 bg-slate/50 hover:border-masters-green/30 transition-colors"
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
      </SectionCard>

      {/* CTA Section - Enhanced with better visual hierarchy */}
      <SectionCard className="bg-gradient-to-br from-charcoal to-slate border-masters-green/30">
        <SectionHeader icon={Megaphone} label="Get Listed" />
        <h2 className="text-cream text-xl md:text-2xl font-semibold mb-3">{ctaTitle}</h2>
        <p className="text-muted mb-8 text-base md:text-lg max-w-2xl">{ctaDescription}</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href={ctaPrimary.href} 
            className="
              inline-flex items-center justify-center gap-2
              px-6 py-3.5
              bg-masters-green text-deep-black
              font-semibold text-sm uppercase tracking-wider
              rounded-lg
              hover:bg-masters-green/90
              transition-colors
              min-h-[48px]
            "
          >
            {ctaPrimary.label}
            <ChevronRight className="w-4 h-4" />
          </Link>
          {ctaSecondary && (
            <Link 
              href={ctaSecondary.href} 
              className="
                inline-flex items-center justify-center gap-2
                px-6 py-3.5
                border border-default text-cream
                font-semibold text-sm uppercase tracking-wider
                rounded-lg
                hover:border-masters-green hover:text-masters-green
                transition-colors
                min-h-[48px]
              "
            >
              {ctaSecondary.label}
            </Link>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

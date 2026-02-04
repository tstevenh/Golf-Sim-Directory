import Link from "next/link";
import { ReactNode } from "react";

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
}: SeoIndexSectionsProps) {
  return (
    <div className="space-y-16">
      <section className="border border-default bg-charcoal p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px bg-masters-green" />
          <span className="text-masters-green text-xs font-mono uppercase tracking-widest">Overview</span>
        </div>
        <h2 className="text-cream mb-3">{introTitle}</h2>
        <p className="text-muted leading-relaxed">{introDescription}</p>
      </section>

      <section className="border border-default bg-charcoal p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px bg-masters-green" />
          <span className="text-masters-green text-xs font-mono uppercase tracking-widest">Guidance</span>
        </div>
        <h2 className="text-cream mb-4">{guidanceTitle}</h2>
        <ul className="grid gap-3 text-muted">
          {guidancePoints.map((point) => (
            <li key={point} className="flex items-start gap-2">
              <span className="text-masters-green">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        {children}
      </section>

      <section className="border border-default bg-charcoal p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px bg-masters-green" />
          <span className="text-masters-green text-xs font-mono uppercase tracking-widest">Methodology</span>
        </div>
        <h2 className="text-cream mb-3">{methodologyTitle}</h2>
        <p className="text-muted leading-relaxed">{methodologyDescription}</p>
      </section>

      {nearbyLinks && nearbyLinks.length > 0 && (
        <section className="border border-default bg-charcoal p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">Nearby</span>
          </div>
          <h2 className="text-cream mb-4">{nearbyTitle}</h2>
          <div className="flex flex-wrap gap-2">
            {nearbyLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 border border-default text-cream-subtle hover:border-masters-green hover:text-cream transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedLinks && relatedLinks.length > 0 && (
        <section className="border border-default bg-charcoal p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">Related</span>
          </div>
          <h2 className="text-cream mb-4">{relatedTitle}</h2>
          <div className="flex flex-wrap gap-2">
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 border border-default text-cream-subtle hover:border-masters-green hover:text-cream transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="border border-default bg-charcoal p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px bg-masters-green" />
          <span className="text-masters-green text-xs font-mono uppercase tracking-widest">FAQ</span>
        </div>
        <h2 className="text-cream mb-4">{faqTitle}</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <div key={item.question} className="border border-default p-4 bg-slate">
              <h3 className="text-cream mb-2 text-base">{item.question}</h3>
              <p className="text-muted text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-default bg-charcoal p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px bg-masters-green" />
          <span className="text-masters-green text-xs font-mono uppercase tracking-widest">Get Listed</span>
        </div>
        <h2 className="text-cream mb-3">{ctaTitle}</h2>
        <p className="text-muted mb-6">{ctaDescription}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={ctaPrimary.href} className="btn-primary">
            {ctaPrimary.label}
          </Link>
          {ctaSecondary && (
            <Link href={ctaSecondary.href} className="btn-outline">
              {ctaSecondary.label}
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

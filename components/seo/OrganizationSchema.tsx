"use client";

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GolfSimMap",
    url: "https://golfsimmap.com",
    logo: "https://golfsimmap.com/logo.png",
    description: "The definitive directory for indoor golf simulator venues across the USA.",
    sameAs: [
      "https://facebook.com/golfsimmap",
      "https://twitter.com/golfsimmap",
      "https://instagram.com/golfsimmap",
      "https://youtube.com/golfsimmap",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@golfsimmap.com",
      contactType: "customer support",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GolfSimMap",
    url: "https://golfsimmap.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://golfsimmap.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

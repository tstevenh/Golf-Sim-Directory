interface CitySchemaProps {
  city: string;
  state: string;
  stateSlug: string;
  venueCount?: number;
}

export function CitySchema({ city, state, stateSlug, venueCount }: CitySchemaProps) {
  const citySlug = city.toLowerCase().replace(/\s+/g, "-");
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Golf Simulators in ${city}, ${state}`,
    description:
      typeof venueCount === "number"
        ? `Find ${venueCount} indoor golf simulators and screen golf venues in ${city}, ${state}.`
        : `Find indoor golf simulators and screen golf venues in ${city}, ${state}.`,
    url: `https://golfsimmap.com/venue/us/${stateSlug}/${citySlug}`,
    mainEntity: {
      "@type": "ItemList",
      ...(typeof venueCount === "number" ? { numberOfItems: venueCount } : {}),
      itemListElement: {
        "@type": "ListItem",
        position: 1,
        name: `${city}, ${state}`,
      },
    },
  };
  const schemaJson = JSON.stringify(schema).replace(/</g, "\\u003c");

  return (
    <script
      suppressHydrationWarning
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: schemaJson }}
    />
  );
}

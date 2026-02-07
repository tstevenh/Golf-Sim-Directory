interface CitySchemaProps {
  city: string;
  state: string;
  stateSlug: string;
  venueCount: number;
}

export function CitySchema({ city, state, stateSlug, venueCount }: CitySchemaProps) {
  const citySlug = city.toLowerCase().replace(/\s+/g, "-");
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Golf Simulators in ${city}, ${state}`,
    description: `Find ${venueCount} indoor golf simulators and screen golf venues in ${city}, ${state}.`,
    url: `https://golfsimmap.com/venue/us/${stateSlug}/${citySlug}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: venueCount,
      itemListElement: {
        "@type": "ListItem",
        position: 1,
        name: `${city}, ${state}`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

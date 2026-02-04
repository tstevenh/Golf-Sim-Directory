interface CitySchemaProps {
  city: string;
  state: string;
  venueCount: number;
}

export function CitySchema({ city, state, venueCount }: CitySchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Golf Simulators in ${city}, ${state}`,
    description: `Find ${venueCount} indoor golf simulators and screen golf venues in ${city}, ${state}.`,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/venue/us/${state.toLowerCase().replace(/\s+/g, "-")}/${city.toLowerCase().replace(/\s+/g, "-")}`,
    mainEntity: {
      "@type": "ItemList",
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

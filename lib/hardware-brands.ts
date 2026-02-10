const ALIAS_MAP: Record<string, string> = {
  trackman: "trackman",
  foresight: "foresight",
  foresightsports: "foresight",
  gcquad: "gc-quad",
  gc3: "foresight",
  gc2: "foresight",
  uneekor: "uneekor",
  fullswing: "full-swing",
  golfzon: "golfzon",
  aboutgolf: "aboutgolf",
  skytrak: "skytrak",
  flightscope: "flightscope",
  mevo: "flightscope",
  garmin: "garmin",
  rapsodo: "rapsodo",
  trugolf: "trugolf",
  optishot: "optishot",
  toptracer: "toptracer",
};

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeHardwareBrand(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const key = normalizeKey(trimmed);
  if (!key || key === "unknown" || key === "na" || key === "n/a") return "";
  return ALIAS_MAP[key] || slugify(trimmed);
}

export function dedupeHardwareBrands(values: string[]): string[] {
  const normalized = values
    .map((value) => normalizeHardwareBrand(value))
    .filter((value): value is string => Boolean(value));
  return Array.from(new Set(normalized)).sort();
}

export function extractHardwareBrandsFromSimulatorSystems(simulatorSystems: unknown): string[] {
  if (!Array.isArray(simulatorSystems)) return [];
  const brands: string[] = [];
  for (const system of simulatorSystems) {
    if (typeof system === "string") {
      brands.push(system);
      continue;
    }
    if (system && typeof system === "object") {
      const brand = (system as { brand?: unknown }).brand;
      if (typeof brand === "string") brands.push(brand);
    }
  }
  return dedupeHardwareBrands(brands);
}

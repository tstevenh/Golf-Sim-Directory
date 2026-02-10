const SOFTWARE_CATEGORIES: Array<{ slug: string; aliases: string[] }> = [
  { slug: "gspro", aliases: ["gspro", "gsp", "golfsimulatorpro"] },
  { slug: "e6", aliases: ["e6", "e6connect"] },
  { slug: "tgc", aliases: ["tgc", "thegolfclub", "thegolfclub2019"] },
  { slug: "wgt", aliases: ["wgt", "worldgolftour"] },
  { slug: "creative-golf", aliases: ["creativegolf", "creativegolf3d"] },
  { slug: "awesome-golf", aliases: ["awesomegolf"] },
  { slug: "trackman-virtual", aliases: ["trackmanvirtual", "trackmanvirtualgolf"] },
  { slug: "fsx", aliases: ["fsx", "fsxplay"] },
];

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function coerceToStringArray(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    const items: string[] = [];
    for (const item of value) {
      if (typeof item === "string") {
        items.push(item);
        continue;
      }
      if (item && typeof item === "object") {
        const name = (item as { name?: unknown; title?: unknown }).name ?? (item as { title?: unknown }).title;
        if (typeof name === "string") items.push(name);
      }
    }
    return items;
  }

  if (typeof value === "string") {
    return value
      .split(/[|,;/]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function normalizeSoftwareSlug(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const key = normalizeKey(trimmed);
  if (!key || key === "unknown" || key === "na" || key === "n/a" || key === "none") return "";

  for (const software of SOFTWARE_CATEGORIES) {
    if (software.aliases.some((alias) => key === alias || key.includes(alias))) {
      return software.slug;
    }
  }

  // Ignore unknown software labels so DB only stores canonical slugs.
  return "";
}

export function dedupeSoftwareSlugs(values: string[]): string[] {
  const normalized = values
    .map((value) => normalizeSoftwareSlug(value))
    .filter((value): value is string => Boolean(value));
  return Array.from(new Set(normalized)).sort();
}

export function extractSoftwareSlugsFromComprehensiveData(comprehensiveData: unknown): string[] {
  if (!comprehensiveData || typeof comprehensiveData !== "object") return [];

  const data = comprehensiveData as Record<string, unknown>;
  const candidates = [
    data.softwareSlugs,
    data.simulatorSoftware,
    data.simulator_software,
    data.simulator_so,
    data.software,
  ];

  const rawValues: string[] = [];
  for (const candidate of candidates) {
    rawValues.push(...coerceToStringArray(candidate));
  }

  return dedupeSoftwareSlugs(rawValues);
}

export function extractSoftwareSlugsFromSubmissionData(data: Record<string, unknown>): string[] {
  const rawValues: string[] = [];
  rawValues.push(...coerceToStringArray(data.simulatorSoftware));
  rawValues.push(...coerceToStringArray(data.simulator_software));
  rawValues.push(...coerceToStringArray(data.software));
  return dedupeSoftwareSlugs(rawValues);
}

import type { SupabaseClient } from "@supabase/supabase-js";

export type DuplicateCandidate = {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  status: string;
  /** Why this venue looks like the same place. */
  reasons: string[];
};

type NewVenue = {
  name?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  website?: string | null;
};

const normText = (s?: string | null) =>
  (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const phoneDigits = (s?: string | null) => {
  const d = (s || "").replace(/\D/g, "");
  return d.length >= 10 ? d.slice(-10) : "";
};

export function websiteDomain(url?: string | null): string {
  if (!url) return "";
  try {
    const withProto = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return new URL(withProto).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

// "1101 16th St NW Suite 100" -> "1101 16th" : street number + first street word.
const streetKey = (s?: string | null) => {
  const m = (s || "").toLowerCase().match(/^\s*(\d+[a-z]?)\s+([a-z0-9]+)/);
  return m ? `${m[1]} ${m[2]}` : "";
};

/**
 * Find existing venues that are probably the same place as a new submission.
 * Matches on phone, street address, website domain or name. Chains share a website,
 * so a domain match only counts in the same city.
 */
export async function findDuplicateVenues(
  db: SupabaseClient,
  venue: NewVenue
): Promise<DuplicateCandidate[]> {
  const state = (venue.state || "").trim();
  const city = normText(venue.city);
  const name = normText(venue.name);
  const phone = phoneDigits(venue.phone);
  const domain = websiteDomain(venue.website);
  const street = streetKey(venue.address);

  const columns = "id, name, slug, address, city, state, status, phone, website";
  const queries = [];
  if (state) queries.push(db.from("venues").select(columns).eq("state", state).limit(5000));
  if (domain) queries.push(db.from("venues").select(columns).ilike("website", `%${domain}%`).limit(200));

  const results = await Promise.all(queries);
  const seen = new Map<string, DuplicateCandidate>();

  for (const { data, error } of results) {
    if (error) throw error;
    for (const v of data || []) {
      if (seen.has(v.id)) continue;
      const sameCity = !!city && normText(v.city) === city;
      const reasons: string[] = [];

      if (phone && phoneDigits(v.phone) === phone) reasons.push("same phone");
      if (sameCity && street && streetKey(v.address) === street) reasons.push("same street address");
      if (sameCity && domain && websiteDomain(v.website) === domain) reasons.push("same website");
      if (name && normText(v.name) === name && (sameCity || v.state === state)) reasons.push("same name");

      if (reasons.length > 0) {
        seen.set(v.id, {
          id: v.id,
          name: v.name,
          slug: v.slug,
          address: v.address,
          city: v.city,
          state: v.state,
          status: v.status,
          reasons,
        });
      }
    }
  }

  return [...seen.values()];
}

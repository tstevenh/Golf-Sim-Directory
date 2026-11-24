import { NextResponse } from "next/server";
import { revalidateVenuePublicPages } from "@/lib/revalidate-venue";

// POST /api/revalidate-venue - Refresh cached public pages for venues changed outside the app
// (e.g. bulk edits made directly in the database). Same secret as /api/revalidate-blog.
// Body: { venues: [{ state: "IA", city: "Coralville", slug: "x-golf-coralville" }, ...] }

interface VenuePathInput {
  state?: unknown;
  city?: unknown;
  slug?: unknown;
}

function isAuthorized(request: Request): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) return false;

  const headerSecret = request.headers.get("x-revalidate-secret");
  const authHeader = request.headers.get("authorization");
  const bearerSecret = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  return headerSecret === expected || bearerSecret === expected;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let venues: VenuePathInput[] = [];
  try {
    const body = (await request.json()) as { venues?: VenuePathInput[] };
    venues = Array.isArray(body.venues) ? body.venues.slice(0, 200) : [];
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const revalidated: string[] = [];
  for (const v of venues) {
    if (typeof v.state !== "string" || typeof v.city !== "string") continue;
    const slug = typeof v.slug === "string" ? v.slug : null;
    revalidateVenuePublicPages({ state: v.state, city: v.city, venueSlug: slug });
    revalidated.push(`${v.state}/${v.city}${slug ? `/${slug}` : ""}`);
  }

  return NextResponse.json({ ok: true, count: revalidated.length, revalidated });
}

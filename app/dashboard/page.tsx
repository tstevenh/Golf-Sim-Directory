import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, Building2, Mail, User, ArrowRight, MapPin, FileText } from "lucide-react";
import { Venue, Favorite, UserRole, Submission } from "@prisma/client";

interface FavoriteWithVenue extends Favorite {
  venue: {
    id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    heroImage: string | null;
    address: string;
  };
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // Get user's favorites
  const favorites = await db.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      venue: {
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          state: true,
          heroImage: true,
          address: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  }) as FavoriteWithVenue[];

  // Get claimed venues for business owners
  const userRole = session.user.role as UserRole;
  const claimedVenues: Venue[] = userRole === "business_owner" || userRole === "admin"
    ? await db.venue.findMany({
        where: { claimedById: session.user.id },
        orderBy: { claimedAt: "desc" },
      })
    : [];

  // Get user's submissions
  const submissions = await db.submission.findMany({
    where: { submittedById: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-deep-black py-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">Dashboard</span>
          </div>
          <h1 className="text-cream">Welcome Back</h1>
          <p className="text-muted">
            {session.user.name || session.user.email}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submissions */}
          <div className="border border-default bg-charcoal p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 border border-masters-green flex items-center justify-center">
                <FileText className="w-5 h-5 text-masters-green" />
              </div>
              <div>
                <h2 className="text-cream">My Submissions</h2>
                <p className="text-sm text-muted">{submissions.length} submitted</p>
              </div>
            </div>

            {submissions.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-default">
                <p className="text-muted mb-4">You haven&apos;t submitted any venues yet.</p>
                <Link
                  href="/submit"
                  className="text-masters-green hover:text-cream transition-colors text-sm"
                >
                  Submit a venue →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub: Submission) => {
                  const data = sub.data as Record<string, unknown>;
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-4 border border-default"
                    >
                      <div>
                        <h3 className="font-medium text-cream">{data.name as string}</h3>
                        <p className="text-sm text-muted">
                          {data.city as string}, {data.state as string}
                        </p>
                        <p className="text-xs text-muted mt-1">
                          Submitted {new Date(sub.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs uppercase tracking-wider ${
                        sub.status === "approved" 
                          ? "bg-masters-green/20 text-masters-green" 
                          : sub.status === "rejected"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Favorites */}
          <div className="border border-default bg-charcoal p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 border border-masters-green flex items-center justify-center">
                <Heart className="w-5 h-5 text-masters-green" />
              </div>
              <div>
                <h2 className="text-cream">Saved Venues</h2>
                <p className="text-sm text-muted">{favorites.length} saved</p>
              </div>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-default">
                <p className="text-muted mb-4">You haven&apos;t saved any venues yet.</p>
                <Link
                  href="/"
                  className="text-masters-green hover:text-cream transition-colors text-sm"
                >
                  Browse venues →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map((fav: FavoriteWithVenue) => (
                  <Link
                    key={fav.id}
                    href={`/venue/${fav.venue.slug}`}
                    className="flex items-center gap-4 p-4 border border-default hover:border-masters-green transition-colors group"
                  >
                    <div className="w-16 h-16 bg-slate flex-shrink-0 overflow-hidden">
                      {fav.venue.heroImage ? (
                        <img
                          src={fav.venue.heroImage}
                          alt={fav.venue.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted">
                          <MapPin className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-cream truncate group-hover:text-masters-green transition-colors">
                        {fav.venue.name}
                      </h3>
                      <p className="text-sm text-muted">
                        {fav.venue.city}, {fav.venue.state}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted group-hover:text-masters-green transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Claimed Venues (for business owners) */}
          {(userRole === "business_owner" || userRole === "admin") && (
            <div className="border border-default bg-charcoal p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 border border-masters-green flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-masters-green" />
                </div>
                <div>
                  <h2 className="text-cream">Your Listings</h2>
                  <p className="text-sm text-muted">{claimedVenues.length} claimed</p>
                </div>
              </div>

              {claimedVenues.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-default">
                  <p className="text-muted mb-4">You haven&apos;t claimed any listings yet.</p>
                  <Link
                    href="#business"
                    className="text-masters-green hover:text-cream transition-colors text-sm"
                  >
                    Claim a listing →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {claimedVenues.map((venue: Venue) => (
                    <div
                      key={venue.id}
                      className="flex items-center justify-between p-4 border border-default"
                    >
                      <div>
                        <h3 className="font-medium text-cream">{venue.name}</h3>
                        <p className="text-sm text-muted">
                          {venue.city}, {venue.state}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Link
                          href={`/venue/${venue.slug}`}
                          className="text-sm text-muted hover:text-masters-green transition-colors"
                        >
                          View
                        </Link>
                        <span className="text-default">|</span>
                        <Link
                          href={`/dashboard/business/${venue.id}/edit`}
                          className="text-sm text-muted hover:text-masters-green transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin Links */}
        {userRole === "admin" && (
          <div className="mt-6 border border-default bg-charcoal p-6">
            <h2 className="text-cream mb-4 flex items-center gap-3">
              <div className="w-10 h-10 border border-masters-green flex items-center justify-center">
                <Building2 className="w-5 h-5 text-masters-green" />
              </div>
              Admin
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/submissions"
                className="px-4 py-2 bg-masters-green text-deep-black font-medium text-sm hover:bg-masters-green/90 transition-colors"
              >
                Review Submissions →
              </Link>
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="mt-6 border border-default bg-charcoal p-6">
          <h2 className="text-cream mb-6 flex items-center gap-3">
            <div className="w-10 h-10 border border-masters-green flex items-center justify-center">
              <User className="w-5 h-5 text-masters-green" />
            </div>
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted" />
              <div>
                <span className="text-xs text-muted uppercase tracking-wider block">Email</span>
                <span className="text-cream">{session.user.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-muted" />
              <div>
                <span className="text-xs text-muted uppercase tracking-wider block">Role</span>
                <span className="text-cream capitalize">{userRole.replace(/_/g, " ")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

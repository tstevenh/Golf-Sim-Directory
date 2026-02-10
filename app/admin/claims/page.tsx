import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReviewClaimButton } from "./ReviewClaimButton";
import { getStateSlug } from "@/lib/states";

export const metadata = {
  title: "Review Claim Requests - Admin",
};

export default async function AdminClaimsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const claimRequests = await db.claimRequest.findMany({
    where: { status: "pending" },
    include: {
      venue: true,
      requestedBy: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
              Admin
            </span>
          </div>
          <h1 className="text-cream mb-2">Review Claim Requests</h1>
          <p className="text-muted">
            {claimRequests.length} pending claim request{claimRequests.length !== 1 && "s"}
          </p>
        </div>

        {claimRequests.length === 0 ? (
          <div className="border border-default bg-charcoal p-12 text-center">
            <p className="text-muted">No pending claim requests</p>
          </div>
        ) : (
          <div className="space-y-6">
            {claimRequests.map((request) => (
              <div
                key={request.id}
                className="border border-default bg-charcoal p-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-cream mb-4">{request.venue.name}</h2>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted">Location:</span>{" "}
                        <span className="text-cream">
                          {request.venue.city}, {request.venue.state}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted">Address:</span>{" "}
                        <span className="text-cream">{request.venue.address}</span>
                      </div>
                      {request.venue.website && (
                        <div>
                          <span className="text-muted">Website:</span>{" "}
                          <a
                            href={request.venue.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-masters-green hover:text-cream transition-colors"
                          >
                            {request.venue.website}
                          </a>
                        </div>
                      )}
                      <div className="pt-2">
                        <Link
                          href={`/venue/us/${getStateSlug(request.venue.state)}/${request.venue.city
                            .toLowerCase()
                            .replace(/\s+/g, "-")}/${request.venue.slug}`}
                          target="_blank"
                          className="text-masters-green hover:text-cream transition-colors text-sm"
                        >
                          View venue page →
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-cream mb-4">Claim Request Details</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-muted">Requested by:</span>{" "}
                        <span className="text-cream">
                          {request.requestedBy.email}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted">Business Email:</span>{" "}
                        <span className="text-cream">{request.businessEmail}</span>
                      </div>
                      <div>
                        <span className="text-muted">Proof of Ownership:</span>
                        <p className="text-cream mt-1 p-3 bg-deep-black border border-default">
                          {request.proofText}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted">Submitted:</span>{" "}
                        <span className="text-cream">
                          {new Date(request.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <ReviewClaimButton
                    claimRequestId={request.id}
                    action="approve"
                  />
                  <ReviewClaimButton
                    claimRequestId={request.id}
                    action="reject"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

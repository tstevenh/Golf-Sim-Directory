import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ReviewCorrectionButton } from "./ReviewCorrectionButton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Review Corrections - Admin",
};

export default async function AdminCorrectionsPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "admin") {
    redirect("/");
  }

  const corrections = await db.correctionReport.findMany({
    where: { status: "pending" },
    include: {
      venue: {
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
          slug: true,
        },
      },
      reportedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-muted hover:text-masters-green transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
              Admin Panel
            </span>
          </div>
          <h1 className="text-cream mb-2">Review Correction Reports</h1>
          <p className="text-muted">
            Review and approve or reject user-submitted corrections.
          </p>
        </div>

        {corrections.length === 0 ? (
          <div className="border border-default bg-charcoal p-12 text-center">
            <p className="text-muted">No pending correction reports.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {corrections.map((correction) => (
              <div
                key={correction.id}
                className="border border-default bg-charcoal p-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column - Venue & Field Info */}
                  <div>
                    <h3 className="text-cream font-semibold mb-4">
                      {correction.venue.name}
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-muted">Location:</span>
                        <p className="text-cream">
                          {correction.venue.city}, {correction.venue.state}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted">Field to Correct:</span>
                        <p className="text-cream font-mono">{correction.field}</p>
                      </div>
                      <div>
                        <span className="text-muted">Reported By:</span>
                        <p className="text-cream">
                          {correction.reportedBy
                            ? `${correction.reportedBy.name || "Unknown"} (${correction.reportedBy.email})`
                            : "Anonymous"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted">Submitted:</span>
                        <p className="text-cream">
                          {new Date(correction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Values & Notes */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-muted uppercase tracking-wide">
                        Current Value
                      </span>
                      <div className="mt-1 px-3 py-2 bg-deep-black border border-default text-muted">
                        {correction.currentValue || "(not set)"}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-masters-green uppercase tracking-wide">
                        Suggested Value
                      </span>
                      <div className="mt-1 px-3 py-2 bg-deep-black border border-masters-green text-cream">
                        {correction.suggestedValue}
                      </div>
                    </div>
                    {correction.notes && (
                      <div>
                        <span className="text-xs text-muted uppercase tracking-wide">
                          Notes
                        </span>
                        <div className="mt-1 px-3 py-2 bg-deep-black border border-default text-muted text-sm">
                          {correction.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-default">
                  <ReviewCorrectionButton
                    correctionId={correction.id}
                    venueId={correction.venue.id}
                    field={correction.field}
                    suggestedValue={correction.suggestedValue}
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

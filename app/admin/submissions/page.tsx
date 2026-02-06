import { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ApproveButton } from "./ApproveButton";

export const metadata: Metadata = {
  title: "Admin - Submissions | GolfSimMap",
};

export default async function AdminSubmissionsPage() {
  const session = await auth();
  
  // Check if user is admin
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  // Fetch pending submissions
  const submissions = await db.submission.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    include: {
      submittedBy: {
        select: { email: true, name: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-cream mb-2">Pending Submissions</h1>
          <p className="text-muted">
            Review and approve venue submissions
          </p>
        </div>

        {submissions.length === 0 ? (
          <div className="border border-default bg-charcoal p-8 text-center">
            <p className="text-muted">No pending submissions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => {
              const data = submission.data as Record<string, unknown>;
              return (
                <div
                  key={submission.id}
                  className="border border-default bg-charcoal p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-cream text-lg font-medium">
                        {data.name as string}
                      </h3>
                      <p className="text-muted text-sm">
                        {data.city as string}, {data.state as string}
                      </p>
                      <p className="text-muted text-sm mt-1">
                        Submitted by: {submission.submittedBy?.email || "Anonymous"}
                      </p>
                      <p className="text-muted text-xs mt-1">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ApproveButton submissionId={submission.id} />
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-default">
                    <details>
                      <summary className="text-sm text-muted cursor-pointer">
                        View full data
                      </summary>
                      <pre className="mt-2 text-xs text-muted overflow-auto max-h-96 bg-deep-black p-4">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8">
          <Link href="/" className="text-muted hover:text-cream transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

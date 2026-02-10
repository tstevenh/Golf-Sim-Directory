import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { VenueEditForm } from "./VenueEditFormFull";

export const metadata = {
  title: "Edit Venue - Dashboard",
};

export default async function VenueEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const venue = await db.venue.findUnique({
    where: { id },
  });

  if (!venue) {
    notFound();
  }

  // Check if user owns this venue
  if (venue.claimedById !== session.user.id && session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
              Edit Venue
            </span>
          </div>
          <h1 className="text-cream mb-2">{venue.name}</h1>
          <p className="text-muted">
            Update your venue information. Changes are published immediately.
          </p>
        </div>

        <VenueEditForm venue={venue} />
      </div>
    </div>
  );
}

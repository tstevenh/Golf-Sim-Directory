import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { ReportCorrectionForm } from "./ReportCorrectionForm";

export const metadata = {
  title: "Report Correction",
};

export default async function ReportCorrectionPage({
  params,
}: {
  params: Promise<{ venueSlug: string }>;
}) {
  const { venueSlug } = await params;

  const { data: venue } = await supabase
    .from("venues")
    .select("*")
    .eq("slug", venueSlug)
    .single();

  if (!venue) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-deep-black py-12">
      <div className="absolute inset-0 scorecard-grid opacity-20" />
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-masters-green" />
            <span className="text-masters-green text-xs font-mono uppercase tracking-widest">
              Report Correction
            </span>
          </div>
          <h1 className="text-cream mb-2">Help us improve this listing</h1>
          <p className="text-muted">
            Found incorrect information about <span className="text-cream">{venue.name}</span>?
            Let us know and we'll review your suggestion.
          </p>
        </div>

        <ReportCorrectionForm venue={venue} />
      </div>
    </div>
  );
}

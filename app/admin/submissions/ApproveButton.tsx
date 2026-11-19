"use client";

import { useState } from "react";
import type { DuplicateCandidate } from "@/lib/venue-duplicates";

export function ApproveButton({ submissionId }: { submissionId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const approve = (force: boolean) =>
    fetch("/api/admin/approve-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, force }),
    });

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this submission?")) return;

    setIsLoading(true);
    try {
      let res = await approve(false);

      if (res.status === 409) {
        const { duplicates = [] } = (await res.json()) as {
          duplicates?: DuplicateCandidate[];
        };
        const list = duplicates
          .map(
            (d) =>
              `• ${d.name} (${d.address}, ${d.city}, ${d.state}) [${d.status}]\n  /${d.slug}: ${d.reasons.join(", ")}`
          )
          .join("\n");
        const goAhead = confirm(
          `This venue may already be listed:\n\n${list}\n\nIf it's the same place, cancel and give the submitter ownership of the existing listing instead.\n\nCreate a new listing anyway?`
        );
        if (!goAhead) return;
        res = await approve(true);
      }

      if (res.ok) {
        const data = await res.json();
        const mapNote =
          data.geocode === "city"
            ? "\n\nMap pin is approximate (city centre). The address couldn't be geocoded."
            : data.geocode
              ? ""
              : "\n\nWarning: the address couldn't be geocoded, so the venue has no map position.";
        alert(`Venue created successfully! Slug: ${data.slug}${mapNote}`);
        window.location.reload();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch {
      alert("Failed to approve submission");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleApprove}
      disabled={isLoading}
      className="px-4 py-2 bg-masters-green text-deep-black font-medium text-sm hover:bg-masters-green/90 transition-colors disabled:opacity-50"
    >
      {isLoading ? "Approving..." : "Approve"}
    </button>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

interface ReviewClaimButtonProps {
  claimRequestId: string;
  action: "approve" | "reject";
}

export function ReviewClaimButton({
  claimRequestId,
  action,
}: ReviewClaimButtonProps) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [showNotesInput, setShowNotesInput] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    if (!showNotesInput && action === "reject") {
      setShowNotesInput(true);
      return;
    }

    if (action === "approve") {
      const confirmed = confirm(
        "Are you sure you want to approve this claim request?"
      );
      if (!confirmed) return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/review-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimRequestId,
          action,
          reviewNotes: notes || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to review claim");
        setLoading(false);
        return;
      }

      alert(data.message);
      router.refresh();
    } catch (error) {
      console.error("Error reviewing claim:", error);
      alert("Failed to review claim");
      setLoading(false);
    }
  };

  if (showNotesInput && action === "reject") {
    return (
      <div className="flex-1">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Reason for rejection (optional)"
          className="w-full p-3 bg-deep-black border border-default text-cream mb-2"
          rows={2}
        />
        <div className="flex gap-2">
          <button
            onClick={handleClick}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Rejecting..." : "Confirm Reject"}
          </button>
          <button
            onClick={() => {
              setShowNotesInput(false);
              setNotes("");
            }}
            className="px-4 py-2 border border-default text-cream hover:border-masters-green transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (action === "approve") {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-6 py-2 bg-masters-green text-deep-black font-medium hover:bg-masters-green/90 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        <Check className="w-4 h-4" />
        {loading ? "Approving..." : "Approve"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-6 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2"
    >
      <X className="w-4 h-4" />
      Reject
    </button>
  );
}

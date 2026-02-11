"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

interface ReviewCorrectionButtonProps {
  correctionId: string;
  field: string;
  suggestedValue: string;
}

export function ReviewCorrectionButton({
  correctionId,
  field,
  suggestedValue,
}: ReviewCorrectionButtonProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [showRejectNotes, setShowRejectNotes] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");

  const handleApprove = async () => {
    if (
      !confirm(
        `Are you sure you want to approve this correction?\n\nField: ${field}\nNew Value: ${suggestedValue}\n\nThis will update the venue immediately.`
      )
    ) {
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const res = await fetch("/api/admin/review-correction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correctionId,
          action: "approve",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.refresh();
      } else {
        setError(data.error || "Failed to approve correction");
      }
    } catch (err) {
      console.error("Error approving correction:", err);
      setError("Failed to approve correction. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!showRejectNotes) {
      setShowRejectNotes(true);
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const res = await fetch("/api/admin/review-correction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correctionId,
          action: "reject",
          reviewNotes: rejectNotes.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.refresh();
      } else {
        setError(data.error || "Failed to reject correction");
      }
    } catch (err) {
      console.error("Error rejecting correction:", err);
      setError("Failed to reject correction. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-400 text-sm">
          {error}
        </div>
      )}

      {showRejectNotes ? (
        <div className="space-y-3">
          <div>
            <label
              htmlFor="rejectNotes"
              className="block text-cream text-sm font-medium mb-2"
            >
              Rejection Notes (Optional)
            </label>
            <textarea
              id="rejectNotes"
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows={3}
              placeholder="Why is this correction being rejected?"
              className="w-full px-3 py-2 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none resize-none text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              <X className="w-4 h-4" />
              {isProcessing ? "Rejecting..." : "Confirm Rejection"}
            </button>
            <button
              onClick={() => setShowRejectNotes(false)}
              disabled={isProcessing}
              className="px-4 py-2 border border-default text-cream hover:border-masters-green transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="px-4 py-2 bg-masters-green text-deep-black font-medium hover:bg-masters-green/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {isProcessing ? "Processing..." : "Approve & Apply"}
          </button>
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="px-4 py-2 border border-red-500 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

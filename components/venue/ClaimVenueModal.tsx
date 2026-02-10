"use client";

import { useState } from "react";
import { X, Building2, Mail, FileText } from "lucide-react";

interface ClaimVenueModalProps {
  venueId: string;
  venueName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ClaimVenueModal({
  venueId,
  venueName,
  isOpen,
  onClose,
  onSuccess,
}: ClaimVenueModalProps) {
  const [businessEmail, setBusinessEmail] = useState("");
  const [proofText, setProofText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!businessEmail.trim() || !proofText.trim()) {
      setError("All fields are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/venues/${venueId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessEmail: businessEmail.trim(),
          proofText: proofText.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        onSuccess();
        // Auto-close after 2 seconds
        setTimeout(() => {
          onClose();
          // Reset form
          setBusinessEmail("");
          setProofText("");
          setSuccess(false);
        }, 2000);
      } else {
        setError(data.error || "Failed to submit claim request");
      }
    } catch (error) {
      console.error("Error claiming venue:", error);
      setError("Failed to submit claim request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-charcoal border border-default w-full max-w-md rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-default">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-masters-green" />
            <h2 className="text-xl font-bold text-cream">Claim Venue</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-cream transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-masters-green/20 border-2 border-masters-green rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-masters-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-cream mb-2">Request Submitted!</h3>
              <p className="text-muted text-sm">
                Your claim request has been submitted successfully. An admin will review it within 24-48 hours.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <p className="text-muted text-sm mb-4">
                Claiming <span className="text-cream font-medium">{venueName}</span>
              </p>
              <p className="text-muted text-xs mb-4">
                Your claim will be reviewed by an admin within 24-48 hours. You must be the owner or authorized representative.
              </p>
            </div>

          {/* Business Email */}
          <div>
            <label htmlFor="businessEmail" className="block text-cream text-sm font-medium mb-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Business Email
              </div>
            </label>
            <input
              type="email"
              id="businessEmail"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              placeholder="owner@venue.com"
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream placeholder:text-muted focus:border-masters-green focus:outline-none"
              required
            />
            <p className="text-xs text-muted mt-1">
              Enter the official business email for this venue
            </p>
          </div>

          {/* Proof of Ownership */}
          <div>
            <label htmlFor="proofText" className="block text-cream text-sm font-medium mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Proof of Ownership
              </div>
            </label>
            <textarea
              id="proofText"
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              placeholder="I am the owner of this venue and can be reached at..."
              rows={3}
              className="w-full px-4 py-2 bg-deep-black border border-default text-cream placeholder:text-muted focus:border-masters-green focus:outline-none resize-none"
              required
            />
            <p className="text-xs text-muted mt-1">
              Briefly explain why you're authorized to claim this venue (1-2 sentences)
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
              {error}
            </div>
          )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-default text-cream hover:border-masters-green transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-masters-green text-deep-black font-medium hover:bg-masters-green/90 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Venue } from "@/lib/supabase";
import { Flag, Check, X, ArrowLeft } from "lucide-react";

interface ReportCorrectionFormProps {
  venue: Venue;
}

// Field options for the dropdown
const FIELD_OPTIONS = [
  { value: "name", label: "Venue Name" },
  { value: "address", label: "Address" },
  { value: "city", label: "City" },
  { value: "state", label: "State" },
  { value: "zipCode", label: "ZIP Code" },
  { value: "phone", label: "Phone Number" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
  { value: "bookingUrl", label: "Booking URL" },
  { value: "hours", label: "Hours of Operation" },
  { value: "bayCount", label: "Number of Bays" },
  { value: "priceRangeMin", label: "Minimum Price" },
  { value: "priceRangeMax", label: "Maximum Price" },
  { value: "launchMonitorType", label: "Launch Monitor Type" },
  { value: "venueType", label: "Venue Type" },
  { value: "about", label: "Description/About" },
  { value: "parking", label: "Parking Information" },
  { value: "other", label: "Other" },
];

export function ReportCorrectionForm({ venue }: ReportCorrectionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [selectedField, setSelectedField] = useState("");
  const [suggestedValue, setSuggestedValue] = useState("");
  const [notes, setNotes] = useState("");

  // Get current value for the selected field
  const getCurrentValue = (field: string): string => {
    if (field === "other") return "";
    const value = venue[field as keyof Venue];
    if (value === null || value === undefined) return "(not set)";
    return String(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!selectedField) {
      setError("Please select a field to correct");
      return;
    }

    if (!suggestedValue.trim()) {
      setError("Please provide a suggested value");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/venues/${venue.id}/corrections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field: selectedField,
          currentValue: getCurrentValue(selectedField),
          suggestedValue: suggestedValue.trim(),
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // Clear form
        setSelectedField("");
        setSuggestedValue("");
        setNotes("");
        // Redirect after 3 seconds
        setTimeout(() => {
          router.back();
        }, 3000);
      } else {
        setError(data.error || "Failed to submit correction");
      }
    } catch (err) {
      console.error("Error submitting correction:", err);
      setError("Failed to submit correction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="border border-masters-green bg-masters-green/10 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-masters-green/20 flex items-center justify-center">
            <Check className="w-8 h-8 text-masters-green" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-cream mb-2">Thank You!</h2>
        <p className="text-muted mb-4">
          Your correction has been submitted and will be reviewed by our team.
        </p>
        <p className="text-xs text-muted">Redirecting you back...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500 text-red-400">
          {error}
        </div>
      )}

      <div className="border border-default bg-charcoal p-6">
        <h2 className="text-cream mb-6 text-lg font-semibold">
          What needs to be corrected?
        </h2>

        <div className="space-y-6">
          {/* Field Selection */}
          <div>
            <label htmlFor="field" className="block text-cream text-sm font-medium mb-2">
              Field to Correct *
            </label>
            <select
              id="field"
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              required
              className="w-full px-4 py-3 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            >
              <option value="">Select a field...</option>
              {FIELD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Current Value Display */}
          {selectedField && selectedField !== "other" && (
            <div>
              <label className="block text-cream text-sm font-medium mb-2">
                Current Value
              </label>
              <div className="px-4 py-3 bg-deep-black border border-default text-muted">
                {getCurrentValue(selectedField)}
              </div>
            </div>
          )}

          {/* Suggested Value */}
          <div>
            <label htmlFor="suggestedValue" className="block text-cream text-sm font-medium mb-2">
              Suggested Correction *
            </label>
            <input
              type="text"
              id="suggestedValue"
              value={suggestedValue}
              onChange={(e) => setSuggestedValue(e.target.value)}
              required
              placeholder="Enter the correct information"
              className="w-full px-4 py-3 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-cream text-sm font-medium mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Why is this correction needed? Any additional context?"
              className="w-full px-4 py-3 bg-deep-black border border-default text-cream focus:border-masters-green focus:outline-none resize-none"
            />
            <p className="text-xs text-muted mt-1">
              Help us understand why this needs to be corrected
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-masters-green text-deep-black font-medium hover:bg-masters-green/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Flag className="w-4 h-4" />
          {isSubmitting ? "Submitting..." : "Submit Correction"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-default text-cream hover:border-masters-green transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </button>
      </div>

      <p className="text-xs text-muted">
        * Required fields. Your submission will be reviewed by our team.
      </p>
    </form>
  );
}

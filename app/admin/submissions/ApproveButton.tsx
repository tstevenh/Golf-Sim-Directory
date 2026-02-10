"use client";

import { useState } from "react";

export function ApproveButton({ submissionId }: { submissionId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this submission?")) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/approve-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      
      if (res.ok) {
        const data = await res.json();
        alert(`Venue created successfully! Slug: ${data.slug}`);
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

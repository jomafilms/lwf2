"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle } from "lucide-react";

interface SubmitPlanButtonProps {
  planId: string;
  planName: string;
}

export function SubmitPlanButton({ planId, planName }: SubmitPlanButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (isSubmitting || isSubmitted) return;

    const confirmed = window.confirm(
      `Are you sure you want to submit "${planName}" to the city for approval?\n\nOnce submitted, the plan cannot be edited until reviewed.`
    );

    if (!confirmed) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/landscaper/plans/${planId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit plan");
      }

      const result = await response.json();
      setIsSubmitted(true);
      
      // Show success message
      alert("Plan submitted successfully! You'll receive updates on the review status.");
      
      // Refresh the page to update the UI
      router.refresh();
    } catch (error) {
      console.error("Error submitting plan:", error);
      alert(`Failed to submit plan: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <span className="flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-800">
        <CheckCircle className="h-3 w-3" />
        Submitted
      </span>
    );
  }

  return (
    <button
      onClick={handleSubmit}
      disabled={isSubmitting}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
        isSubmitting
          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
          : "bg-green-500 text-white hover:bg-green-600"
      }`}
    >
      <Send className="h-3 w-3" />
      {isSubmitting ? "Submitting..." : "Submit"}
    </button>
  );
}
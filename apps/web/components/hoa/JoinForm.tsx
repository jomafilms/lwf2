"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, AlertCircle } from "lucide-react";

interface JoinFormProps {
  orgId: string;
  inviteCode: string;
  userName: string;
}

export function JoinForm({ orgId, inviteCode, userName }: JoinFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/hoa/${orgId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inviteCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect to HOA dashboard after a brief delay
        setTimeout(() => {
          router.push("/dashboard/hoa");
        }, 2000);
      } else {
        setError(data.error || "Failed to join community");
      }
    } catch (error) {
      console.error("Error joining community:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          Welcome to the Community!
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          You&apos;ve successfully joined. Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="mb-6 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            value={userName}
            disabled
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invite Code
          </label>
          <input
            type="text"
            value={inviteCode}
            disabled
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-mono text-gray-900"
          />
        </div>
      </div>

      <button
        onClick={handleJoin}
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Joining...
          </>
        ) : (
          "Join Community"
        )}
      </button>

      <p className="mt-4 text-xs text-gray-500 text-center">
        By joining, you agree to participate in community fire safety initiatives
        and share progress with other members.
      </p>
    </div>
  );
}
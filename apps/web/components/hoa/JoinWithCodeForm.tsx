"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

export function JoinWithCodeForm() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      setError("Please enter an invite code");
      return;
    }

    const code = inviteCode.trim().toLowerCase();
    
    // Redirect to the invite-specific page
    router.push(`/hoa/join/${code}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div>
        <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
          Invite Code
        </label>
        <input
          type="text"
          id="inviteCode"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="Enter 8-character invite code"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-center tracking-wider focus:border-blue-500 focus:ring-blue-500"
          maxLength={8}
          style={{ textTransform: "lowercase" }}
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter the code your community administrator shared with you
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !inviteCode.trim()}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Your community administrator will have provided you with an 8-character invite code.
          This code allows you to join their HOA, neighborhood, or Firewise community tracking.
        </p>
      </div>
    </form>
  );
}
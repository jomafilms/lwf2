"use client";

import { useState } from "react";
import { Copy, Plus, Check, ExternalLink } from "lucide-react";

interface InviteSectionProps {
  orgId: string;
}

interface Invite {
  id: string;
  code: string;
  inviteUrl: string;
  expiresAt: string;
  createdAt: string;
}

export function InviteSection({ orgId }: InviteSectionProps) {
  const [invite, setInvite] = useState<Invite | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateInvite = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hoa/${orgId}/invite`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setInvite(data.invite);
      }
    } catch (error) {
      console.error("Error generating invite:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteUrl = async () => {
    if (!invite) return;

    try {
      await navigator.clipboard.writeText(invite.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-gray-900">Invite Members</h3>

      {!invite ? (
        <div className="text-center">
          <p className="mb-4 text-sm text-gray-600">
            Generate an invite link to add new members to your community.
          </p>
          <button
            onClick={generateInvite}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Generating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Generate Invite
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invite Code
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded border bg-gray-50 px-3 py-2 text-sm font-mono">
                {invite.code}
              </code>
              <button
                onClick={copyInviteUrl}
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            <p>Expires: {new Date(invite.expiresAt).toLocaleDateString()}</p>
            <p>Share this link with new members:</p>
            <div className="mt-1 break-all">
              <a
                href={invite.inviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                {invite.inviteUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <button
            onClick={() => setInvite(null)}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
          >
            Generate New Invite
          </button>
        </div>
      )}
    </div>
  );
}
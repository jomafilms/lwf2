import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db, orgInvites, orgs } from "@lwf/database";
import { eq, and, isNull } from "drizzle-orm";
import Link from "next/link";
import { Users, Calendar, MapPin } from "lucide-react";
import { JoinForm } from "@/components/hoa/JoinForm";

interface JoinPageProps {
  params: { code: string };
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { code } = params;
  const user = await getCurrentUser();

  // Find the invite
  const [inviteResult] = await db
    .select({
      invite: orgInvites,
      org: orgs,
    })
    .from(orgInvites)
    .innerJoin(orgs, eq(orgs.id, orgInvites.orgId))
    .where(and(eq(orgInvites.code, code), isNull(orgInvites.usedBy)))
    .limit(1);

  if (!inviteResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <span className="text-red-600 text-xl">✗</span>
          </div>
          <h1 className="mt-4 text-xl font-bold text-gray-900">
            Invalid Invite Code
          </h1>
          <p className="mt-2 text-gray-600">
            This invite code is invalid or has already been used.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const { invite, org } = inviteResult;

  // Check if invite is expired
  const isExpired = invite.expiresAt && new Date() > invite.expiresAt;

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <Calendar className="h-6 w-6 text-yellow-600" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-gray-900">
            Expired Invite
          </h1>
          <p className="mt-2 text-gray-600">
            This invite code has expired. Please request a new one from your community administrator.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // If user is not logged in, redirect to sign-in with return URL
  if (!user) {
    const returnUrl = `/hoa/join/${code}`;
    return redirect(`/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-gray-900">
            Join Community
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            You&apos;ve been invited to join:
          </p>
        </div>

        {/* Organization Info */}
        <div className="mb-8 rounded-lg border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900">{org.name}</h2>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
            <span className="capitalize">{org.type}</span>
            {org.zipCode && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {org.zipCode}
              </div>
            )}
          </div>
          {org.description && (
            <p className="mt-2 text-sm text-gray-700">{org.description}</p>
          )}
        </div>

        {/* Join Form */}
        <JoinForm 
          orgId={org.id} 
          inviteCode={code} 
          userName={user.name || ""}
        />

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Not interested? Go back to LWF2
          </Link>
        </div>
      </div>
    </div>
  );
}
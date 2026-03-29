import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { Users, ArrowLeft } from "lucide-react";
import { CreateOrgForm } from "@/components/hoa/CreateOrgForm";

export default async function CreateHOAPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return redirect("/sign-in?returnUrl=/hoa/create");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <Link href="/dashboard/hoa" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Create Community Organization
          </h1>
          <p className="mt-2 text-gray-600">
            Start tracking fire safety compliance for your HOA, neighborhood, or Firewise community.
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-sm">
          <CreateOrgForm />
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Already have an invite code?{" "}
            <Link href="/hoa/join" className="text-blue-600 hover:text-blue-700">
              Join existing community
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
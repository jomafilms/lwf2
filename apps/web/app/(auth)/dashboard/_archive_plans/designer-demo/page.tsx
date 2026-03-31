import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PlanDesignerDemo } from "@/components/_archive_canvas/PlanDesignerDemo";

export default async function PlanDesignerDemoPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Landscape Plan Designer Demo</h1>
          <p className="text-neutral-600">
            Professional canvas for landscape plan creation with plant placement and spacing guides
          </p>
        </div>
      </div>

      <PlanDesignerDemo />
    </div>
  );
}
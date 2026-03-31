import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClimateAdaptationDemo } from "@/components/climate/ClimateAdaptationDemo";

export default async function ClimateAdaptationDemoPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Climate Adaptation Planning</h1>
        <p className="text-neutral-600">
          Assess plant resilience to changing climate conditions and plan for future landscapes
        </p>
        <p className="text-sm text-neutral-500 mt-1">
          Pacific Northwest projections • Moderate scenario (IPCC Representative Concentration Pathway 4.5)
        </p>
      </div>

      <ClimateAdaptationDemo />
    </div>
  );
}
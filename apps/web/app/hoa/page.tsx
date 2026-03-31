"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Shield, 
  Users, 
  FileText, 
  CheckCircle, 
  Calendar,
  Download,
  ArrowLeft,
  MapPin
} from "lucide-react";
import { HOALandingSection } from "@/components/hoa/HOALandingSection";
import { CommunityOverviewDashboard } from "@/components/hoa/CommunityOverviewDashboard";
import { CCRPlantListGenerator } from "@/components/hoa/CCRPlantListGenerator";
import { CommunityActionPlan } from "@/components/hoa/CommunityActionPlan";

type ActiveSection = "landing" | "dashboard" | "plant-list" | "action-plan";

export default function HOAPage() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("landing");

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to LWF
              </Link>
              <div className="h-6 border-l border-gray-300" />
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  HOA Community Tools
                </h1>
              </div>
            </div>
            
            {/* Navigation Pills */}
            {activeSection !== "landing" && (
              <nav className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setActiveSection("dashboard")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === "dashboard"
                      ? "bg-green-100 text-green-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveSection("plant-list")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === "plant-list"
                      ? "bg-green-100 text-green-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Plant Lists
                </button>
                <button
                  onClick={() => setActiveSection("action-plan")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === "action-plan"
                      ? "bg-green-100 text-green-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Action Plan
                </button>
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeSection === "landing" && (
          <HOALandingSection onGetStarted={() => setActiveSection("dashboard")} />
        )}
        
        {activeSection === "dashboard" && (
          <CommunityOverviewDashboard />
        )}
        
        {activeSection === "plant-list" && (
          <CCRPlantListGenerator />
        )}
        
        {activeSection === "action-plan" && (
          <CommunityActionPlan />
        )}
      </div>

      {/* Mobile Navigation */}
      {activeSection !== "landing" && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4 md:hidden">
          <div className="flex justify-around gap-2">
            <button
              onClick={() => setActiveSection("dashboard")}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg ${
                activeSection === "dashboard"
                  ? "bg-green-100 text-green-800"
                  : "text-gray-600"
              }`}
            >
              <Users className="h-5 w-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveSection("plant-list")}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg ${
                activeSection === "plant-list"
                  ? "bg-green-100 text-green-800"
                  : "text-gray-600"
              }`}
            >
              <FileText className="h-5 w-5" />
              Plant Lists
            </button>
            <button
              onClick={() => setActiveSection("action-plan")}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg ${
                activeSection === "action-plan"
                  ? "bg-green-100 text-green-800"
                  : "text-gray-600"
              }`}
            >
              <Calendar className="h-5 w-5" />
              Action Plan
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
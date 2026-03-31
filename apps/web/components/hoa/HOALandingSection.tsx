"use client";

import { Shield, TrendingUp, Home, Users, CheckCircle, ArrowRight } from "lucide-react";

interface HOALandingSectionProps {
  onGetStarted: () => void;
}

export function HOALandingSection({ onGetStarted }: HOALandingSectionProps) {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex justify-center">
            <div className="rounded-2xl bg-green-100 p-4">
              <Shield className="h-12 w-12 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Protect Your Community
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
            Help your HOA implement fire-reluctant landscaping standards, reduce liability, 
            and increase property values with evidence-based plant recommendations and 
            actionable CC&R updates.
          </p>
          
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-8 py-4 text-lg font-semibold text-white hover:bg-green-700 transition-colors"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </button>
            
            <a
              href="/map"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-600 px-8 py-4 text-lg font-semibold text-green-600 hover:bg-green-50 transition-colors"
            >
              View Fire Zones Map
            </a>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="grid gap-8 md:grid-cols-3">
        <ValuePropCard
          icon={<Shield className="h-8 w-8 text-red-600" />}
          title="Reduce Fire Risk & Liability"
          description="Implement science-backed landscaping standards that protect properties and reduce your HOA's liability exposure."
          stats="Up to 60% reduction in fire spread risk"
        />
        
        <ValuePropCard
          icon={<TrendingUp className="h-8 w-8 text-green-600" />}
          title="Increase Property Values"
          description="Fire-safe landscaping is increasingly valued by insurance companies and homebuyers in fire-prone areas."
          stats="3-7% average property value increase"
        />
        
        <ValuePropCard
          icon={<Users className="h-8 w-8 text-blue-600" />}
          title="Community Compliance"
          description="Provide clear guidance to residents with printable plant lists and step-by-step implementation plans."
          stats="85% resident participation rate"
        />
      </section>

      {/* HOA-Specific Benefits */}
      <section className="rounded-2xl bg-white border border-gray-200 p-8 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Built Specifically for HOA Boards
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              We understand the unique challenges HOAs face in implementing community-wide 
              fire safety measures. Our tools are designed to make the process transparent, 
              defensible, and achievable.
            </p>
            
            <div className="mt-8 space-y-4">
              <BenefitItem
                title="CC&R Amendment Ready"
                description="Generate formatted plant lists that can be directly incorporated into community standards"
              />
              <BenefitItem
                title="Progress Tracking"
                description="Monitor community-wide adoption and compliance with visual dashboards"
              />
              <BenefitItem
                title="Resident Education"
                description="Provide clear, actionable guidance that residents can actually follow"
              />
              <BenefitItem
                title="Insurance & Legal Support"
                description="Evidence-based recommendations that support defensible community standards"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="rounded-xl bg-gradient-to-br from-green-50 to-blue-50 p-8">
              <div className="space-y-6 text-center">
                <div className="text-4xl font-bold text-gray-900">20-30</div>
                <p className="text-lg font-medium text-gray-700">HOAs in Ashland</p>
                <p className="text-sm text-gray-600">
                  Join the community of forward-thinking HOAs implementing fire-safe standards
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Get */}
      <section>
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
          Everything You Need to Implement Fire-Safe Landscaping
        </h2>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard
            title="Community Dashboard"
            description="Track assessment progress and compliance across your entire community"
            features={[
              "Property assessment tracking",
              "Aggregate compliance scores", 
              "Visual progress indicators",
              "Zone-based recommendations"
            ]}
          />
          
          <ToolCard
            title="CC&R Plant Lists"
            description="Generate professionally formatted plant lists for community standards"
            features={[
              "Fire-reluctant plant database",
              "Print-ready formatting",
              "Native & adapted species",
              "Water requirement details"
            ]}
          />
          
          <ToolCard
            title="Implementation Guide"
            description="Step-by-step action plan with timeline templates for board adoption"
            features={[
              "30/60/90 day timeline",
              "Board presentation templates",
              "Resident communication guides",
              "Contractor recommendations"
            ]}
          />
        </div>
      </section>
    </div>
  );
}

function ValuePropCard({ 
  icon, 
  title, 
  description, 
  stats 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  stats: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-3 text-gray-600 leading-relaxed">{description}</p>
      <div className="mt-4 text-sm font-medium text-gray-500">{stats}</div>
    </div>
  );
}

function BenefitItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0">
        <CheckCircle className="h-6 w-6 text-green-600" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function ToolCard({ 
  title, 
  description, 
  features 
}: { 
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-3 text-gray-600 leading-relaxed">{description}</p>
      
      <ul className="mt-4 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
/**
 * Certification Tracker Page
 * 
 * Track progress toward Wildfire Prepared Home certification and insurance eligibility.
 * Shows requirements checklist, progress, costs, and insurance impact.
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../../../lib/auth';
import { db, properties } from '@lwf/database';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  DollarSign,
  FileText,
  Printer,
  ExternalLink,
  Home,
  Wrench
} from 'lucide-react';
import { CertificationRequirementsList } from './components/CertificationRequirementsList';
import { InsuranceInfo } from './components/InsuranceInfo';

interface PageProps {
  params: Promise<{}>;
  searchParams: Promise<{ property?: string }>;
}

export default async function CertificationPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const resolvedSearchParams = await searchParams;
  const propertyId = resolvedSearchParams.property;

  // If no property selected, show property selection
  if (!propertyId) {
    const userProperties = await db
      .select()
      .from(properties)
      .where(eq(properties.ownerId, user.id));

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="border-b bg-white">
          <div className="mx-auto max-w-4xl px-4 py-3">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="inline h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </div>
        </nav>

        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="text-center">
            <Shield className="mx-auto h-16 w-16 text-orange-500" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Insurance & Certification Tracker
            </h1>
            <p className="mt-2 text-gray-600">
              Track your progress toward Wildfire Prepared Home certification
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Select a Property
            </h2>

            {userProperties.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-white p-8 text-center">
                <Home className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm font-medium text-gray-600">
                  No properties found
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Add a property first to track certification progress.
                </p>
                <Link
                  href="/map"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                >
                  Add Property
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {userProperties.map((property) => (
                  <Link
                    key={property.id}
                    href={`/dashboard/certification?property=${property.id}`}
                    className="group rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <Home className="h-5 w-5 text-orange-500" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900 group-hover:text-orange-600">
                          {property.address}
                        </p>
                        <p className="text-sm text-gray-500">
                          {property.fireZones ? 'Fire zones mapped' : 'Setup needed'}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Verify user owns the selected property
  const property = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);

  if (property.length === 0 || property[0].ownerId !== user.id) {
    redirect('/dashboard/certification');
  }

  const selectedProperty = property[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="inline h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            <Printer className="h-4 w-4" />
            Print for Insurance
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="h-8 w-8 text-orange-500" />
                Insurance & Certification Tracker
              </h1>
              <p className="mt-2 text-gray-600">{selectedProperty.address}</p>
            </div>
            <Link
              href={`/map?property=${propertyId}`}
              className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              <Wrench className="h-4 w-4" />
              Edit Property Plan
            </Link>
          </div>

          <div className="mt-6 rounded-lg bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Insurance Impact</p>
                <p className="mt-1 text-sm text-blue-800">
                  Completing these requirements may qualify you for insurance discounts. 
                  State Farm and others are moving toward Wildfire Prepared Home certification discounts.
                </p>
                <p className="mt-2 text-xs text-blue-700">
                  <strong>Key insight:</strong> Properties with proper Zone 0 clearance (0-5 feet) 
                  are far more likely to be insurable in high-risk areas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Requirements List - Takes up 2/3 */}
          <div className="lg:col-span-2">
            <CertificationRequirementsList propertyId={propertyId} />
          </div>

          {/* Sidebar - Takes up 1/3 */}
          <div className="space-y-6">
            <InsuranceInfo />
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/map?property=${propertyId}`}
                  className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-sm hover:bg-gray-100 transition-colors"
                >
                  <Home className="h-4 w-4 text-gray-600" />
                  <span>Edit Property & Zones</span>
                </Link>
                
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-sm hover:bg-gray-100 transition-colors w-full"
                >
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span>Generate Report</span>
                </button>
                
                <Link
                  href="/dashboard/hoa"
                  className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-sm hover:bg-gray-100 transition-colors"
                >
                  <Shield className="h-4 w-4 text-gray-600" />
                  <span>Community Progress</span>
                </Link>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
              <div className="space-y-2 text-sm">
                <a
                  href="https://www.ibhs.org/risk-research/wildfire/wildfire-prepared-home/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4" />
                  IBHS Wildfire Prepared Home
                </a>
                <a
                  href="https://www.nfpa.org/Public-Education/Fire-causes-and-risks/Wildfire/Firewise-USA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4" />
                  Firewise USA Guidelines
                </a>
                <a
                  href="https://www.oregon.gov/odf/fire/pages/prevention.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4" />
                  Oregon Defensible Space
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          nav { display: none !important; }
          .no-print { display: none !important; }
          .print\\:block { display: block !important; }
          .bg-gray-50 { background: white !important; }
          .shadow-sm, .shadow-md { box-shadow: none !important; }
          .border { border: 1px solid #e5e7eb !important; }
        }
      `}</style>
    </div>
  );
}
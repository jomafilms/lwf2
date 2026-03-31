/**
 * Property Compliance Report Page
 * 
 * Visual compliance report with download and CC&R generation features.
 */

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { ComplianceReport } from "@/lib/compliance/generate-report";

const statusStyles: Record<string, { color: string; label: string }> = {
  'compliant': { color: 'bg-green-100 text-green-800', label: 'Compliant' },
  'needs-work': { color: 'bg-yellow-100 text-yellow-800', label: 'Needs Work' },
  'non-compliant': { color: 'bg-red-100 text-red-800', label: 'Non-Compliant' },
};

function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || statusStyles['needs-work'];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${style.color}`}>
      {style.label}
    </span>
  );
}

function ScoreDisplay({ label, score }: { label: string; score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="text-center">
      <div className="text-2xl font-bold mb-1">
        <span className={getScoreColor(score)}>{score}</span>
        <span className="text-gray-400">/100</span>
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

export default function ComplianceReportPage() {
  const params = useParams();
  const propertyId = params.propertyId as string;
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCCRTemplate, setShowCCRTemplate] = useState(false);
  const [ccrTemplate, setCCRTemplate] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await fetch(`/api/compliance/${propertyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch compliance report');
        }
        const data = await response.json();
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (propertyId) {
      fetchReport();
    }
  }, [propertyId]);

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleGenerateCCR = async () => {
    try {
      const response = await fetch('/api/compliance/ccr-template?format=text');
      if (!response.ok) {
        throw new Error('Failed to generate CC&R template');
      }
      const template = await response.text();
      setCCRTemplate(template);
      setShowCCRTemplate(true);
    } catch (err) {
      console.error('Error generating CC&R template:', err);
    }
  };

  const handleDownloadCCR = () => {
    if (ccrTemplate) {
      const blob = new Blob([ccrTemplate], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CCR_Landscaping_Rules.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Generating compliance report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-red-600 text-xl font-semibold mb-4">Error</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600">No compliance report available.</p>
          </div>
        </div>
      </div>
    );
  }

  if (showCCRTemplate) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">CC&R Landscaping Rules Template</h1>
            <div className="space-x-4">
              <button
                onClick={() => setShowCCRTemplate(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Back to Report
              </button>
              <button
                onClick={handleDownloadCCR}
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                Download Template
              </button>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
              {ccrTemplate}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { font-size: 12pt; }
          .page-break { page-break-before: always; }
        }
        .print-only { display: none; }
      `}</style>

      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Fire Safety Compliance Report
            </h1>
            <p className="text-lg text-gray-600">{report.propertyAddress}</p>
            <p className="text-sm text-gray-500">Assessment Date: {report.assessmentDate}</p>
          </div>
          <div className="text-right no-print">
            <StatusBadge status={report.overallCompliance} />
            <div className="mt-4 space-x-2">
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Download PDF
              </button>
              <button
                onClick={handleGenerateCCR}
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                Generate CC&R Rules
              </button>
            </div>
          </div>
        </div>

        {/* Overall Status - Print Header */}
        <div className="print-only mb-8">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Overall Compliance Status</h2>
            <div className="text-2xl font-bold">
              {statusStyles[report.overallCompliance].label}
            </div>
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
          <ScoreDisplay label="Fire Safety" score={report.scores.fire} />
          <ScoreDisplay label="Pollinator Support" score={report.scores.pollinator} />
          <ScoreDisplay label="Water Efficiency" score={report.scores.water} />
          <ScoreDisplay label="Deer Resistance" score={report.scores.deer} />
        </div>

        {/* Zone Reports */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Zone-by-Zone Analysis</h2>
          <div className="space-y-6">
            {report.zones.map((zone, index) => (
              <div key={index} className="border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">{zone.zone}</h3>
                  <StatusBadge status={zone.status} />
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Plants in this zone:</h4>
                  <div className="space-y-2">
                    {zone.plants.map((plant, plantIndex) => (
                      <div key={plantIndex} className="flex items-center justify-between text-sm">
                        <span className={plant.appropriate ? 'text-green-700' : 'text-red-700'}>
                          {plant.name}
                        </span>
                        <span className="text-gray-600 text-xs max-w-md text-right">
                          {plant.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {zone.spacingIssues.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Spacing Considerations:</h4>
                    <ul className="text-sm text-gray-700 list-disc pl-5">
                      {zone.spacingIssues.map((issue, issueIndex) => (
                        <li key={issueIndex}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {zone.maintenanceNotes.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Maintenance Notes:</h4>
                    <ul className="text-sm text-gray-700 list-disc pl-5">
                      {zone.maintenanceNotes.map((note, noteIndex) => (
                        <li key={noteIndex}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="page-break"></div>

        {/* Recommendations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommendations</h2>
          <div className="space-y-3">
            {report.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <p className="text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Certification Progress */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Firewise Certification Progress</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-green-700 mb-3">Requirements Met</h3>
              <ul className="space-y-2">
                {report.certificationProgress.met.map((item, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm">
                    <span className="text-green-600">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-red-700 mb-3">Requirements Not Yet Met</h3>
              <ul className="space-y-2">
                {report.certificationProgress.unmet.map((item, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm">
                    <span className="text-red-600">○</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sources */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Data Sources</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            {report.sources.map((source, index) => (
              <li key={index}>• {source}</li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
          <p>This report was generated by the Living With Fire platform.</p>
          <p>For questions about compliance requirements, consult your local fire authority or HOA board.</p>
        </div>
      </div>
    </div>
  );
}
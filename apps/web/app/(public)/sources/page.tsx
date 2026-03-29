/**
 * Sources Page
 * 
 * List all data sources used in the LWF database with credibility information.
 */

import Link from 'next/link';
import { getSources } from '@/lib/api/lwf';
import type { Source } from '@lwf/types';

// Group sources by region for better organization
function groupSourcesByRegion(sources: Source[]) {
  const groups: Record<string, Source[]> = {};
  
  for (const source of sources) {
    const region = source.region || 'Other';
    if (!groups[region]) groups[region] = [];
    groups[region].push(source);
  }
  
  // Sort regions, putting major ones first
  const sortedRegions = Object.keys(groups).sort((a, b) => {
    const priority: Record<string, number> = {
      'California': 1,
      'Oregon': 2,
      'United States': 3,
      'Other': 999,
    };
    
    return (priority[a] || 100) - (priority[b] || 100);
  });
  
  return sortedRegions.map(region => ({
    region,
    sources: groups[region].sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

export async function generateMetadata() {
  return {
    title: 'Data Sources — FireScape',
    description: 'All data sources used in the LWF plant database. Researched, sourced, and vetted by Charisse Sydoriak.',
  };
}

export default async function SourcesPage() {
  // Fetch all sources
  const sourcesResponse = await getSources({ limit: 1000 });
  const allSources = sourcesResponse.data;
  const groupedSources = groupSourcesByRegion(allSources);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/plants"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Browse
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Data Sources
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Research sources behind the LWF plant database
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Credibility Statement */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-orange-900 mb-2">
                Data Credibility & Provenance
              </h2>
              <p className="text-orange-800 leading-relaxed">
                All plant data in this database has been <strong>researched, sourced, and vetted by Charisse Sydoriak</strong>, 
                a fire safety expert and landscape professional. Every data point traces back to peer-reviewed research, 
                government agencies, fire departments, or verified nursery professionals.
              </p>
              <p className="text-orange-700 mt-3 text-sm italic">
                "Informed choice is the actual power" — Benjamin
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-gray-900">{allSources.length}</div>
            <div className="text-sm text-gray-600">Total Sources</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-gray-900">{groupedSources.length}</div>
            <div className="text-sm text-gray-600">Regions Covered</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {allSources.filter(s => s.url).length}
            </div>
            <div className="text-sm text-gray-600">Linked Sources</div>
          </div>
        </div>

        {/* Sources by Region */}
        <div className="space-y-8">
          {groupedSources.map(({ region, sources }) => (
            <div key={region} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {region}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({sources.length} sources)
                  </span>
                </h3>
              </div>
              
              <div className="divide-y divide-gray-100">
                {sources.map((source) => (
                  <div key={source.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-medium text-gray-900 mb-1">
                          {source.name}
                        </h4>
                        
                        {source.description && (
                          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                            {source.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          {source.region && source.region !== region && (
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {source.region}
                            </span>
                          )}
                          
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            ID: {source.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                      
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium"
                        >
                          View Source
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 bg-gray-100 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-600">
            Missing a source or found an error?{' '}
            <Link href="/contact" className="text-orange-600 hover:text-orange-700 font-medium">
              Contact us
            </Link>{' '}
            to help improve the database.
          </p>
        </div>
      </div>
    </div>
  );
}
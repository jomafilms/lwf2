import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getPlant,
  getPlantValues,
  getPlantImages,
  getSources,
  LwfApiError,
} from '@/lib/api/lwf';
import type { PlantImage, Source } from '@lwf/types';
import { presentPlant } from '@/lib/plants/present';
import { NurseryAvailability } from '@/components/plants/NurseryAvailability';
import { ImageGallery } from '@/components/plants/ImageGallery';

// ─── Zone badge colors ──────────────────────────────────────────────────────

const ZONE_COLORS: Record<string, string> = {
  '0-5': 'bg-red-100 text-red-800 border-red-200',
  '5-10': 'bg-orange-100 text-orange-800 border-orange-200',
  '10-30': 'bg-amber-100 text-amber-800 border-amber-200',
  '30-100': 'bg-green-100 text-green-800 border-green-200',
  '50-100': 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

// ─── Character score badge colors ────────────────────────────────────────────

const CHARACTER_SCORE_COLORS = {
  low: 'bg-green-100 text-green-800 border-green-200',
  moderate: 'bg-amber-100 text-amber-800 border-amber-200',
  high: 'bg-red-100 text-red-800 border-red-200',
};

// ─── List choice badge colors ────────────────────────────────────────────────

const LIST_CHOICE_COLORS: Record<string, string> = {
  'Approved': 'bg-green-100 text-green-800 border-green-200',
  'Consider': 'bg-amber-100 text-amber-800 border-amber-200',
  'Avoid': 'bg-red-100 text-red-800 border-red-200',
};

// ─── Page ────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const plant = await getPlant(id);
    return {
      title: `${plant.commonName} — FireScape`,
      description: `${plant.commonName} (${plant.genus} ${plant.species}) — fire-reluctant plant details, zone compatibility, and nursery availability.`,
    };
  } catch {
    return { title: 'Plant Not Found — FireScape' };
  }
}

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let plant;
  try {
    plant = await getPlant(id);
  } catch (err) {
    if (err instanceof LwfApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  // Fetch everything in parallel
  const [values, imagesResponse, sourcesResponse] = await Promise.all([
    getPlantValues(id).catch(() => []),
    getPlantImages(id).catch(() => ({ plantId: id, images: [] as PlantImage[] })),
    getSources({ limit: 1000 }).catch(() => ({ data: [] as Source[], meta: { pagination: { total: 0, limit: 1000, offset: 0, hasMore: false } } })),
  ]);

  // Use presentation layer to transform raw data
  const presented = presentPlant(values);
  const allSources = sourcesResponse.data;

  const images = imagesResponse.images || [];
  const allImages = plant.primaryImage
    ? [plant.primaryImage, ...images.filter((img) => img.url !== plant.primaryImage?.url)]
    : images;

  const botanicalName = [plant.genus, plant.species]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <Link
            href="/plants"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Browse
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section: Image gallery (left) + Plant info (right) */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Images */}
          <div>
            <ImageGallery images={allImages} plantName={plant.commonName} />
          </div>

          {/* Plant info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {plant.commonName}
            </h1>
            <p className="text-lg text-gray-500 italic mt-1">
              {botanicalName}
              {plant.subspeciesVarieties && (
                <span className="text-gray-400">
                  {' '}
                  {plant.subspeciesVarieties}
                </span>
              )}
            </p>

            {/* Zone badges */}
            {presented.zones.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Fire Zone Compatibility
                </h3>
                <div className="flex flex-wrap gap-2">
                  {presented.zones.map((zone) => (
                    <span
                      key={zone.zone}
                      className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full border ${
                        ZONE_COLORS[zone.zone] ||
                        'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                      title={zone.description}
                    >
                      {zone.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Character Score */}
            {presented.characterScore && (
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full border ${
                      CHARACTER_SCORE_COLORS[presented.characterScore.level]
                    }`}
                  >
                    {presented.characterScore.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    Score: {presented.characterScore.value}
                  </span>
                </div>
              </div>
            )}

            {/* List Choice Badge */}
            {presented.listChoice && (
              <div className="mt-4">
                <span
                  className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full border ${
                    LIST_CHOICE_COLORS[presented.listChoice] ||
                    'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {presented.listChoice}
                </span>
              </div>
            )}

            {/* External links */}
            {plant.urls && plant.urls.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Learn More
                </h3>
                <div className="flex flex-wrap gap-2">
                  {plant.urls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 underline"
                    >
                      {new URL(url).hostname.replace('www.', '')}
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fire Info Section (PROMINENT - moved up) */}
        {(presented.flammabilityNotes || presented.riskMitigationNotes || presented.characterScore) && (
          <div className="mt-10 bg-orange-50 border border-orange-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-orange-900 mb-4">
              Risk Mitigation
            </h2>
            
            {presented.flammabilityNotes && (
              <div className="mb-4">
                <h3 className="font-medium text-orange-800 mb-2">Flammability Notes</h3>
                <p className="text-sm text-orange-800 leading-relaxed">
                  {presented.flammabilityNotes}
                </p>
              </div>
            )}

            {presented.riskMitigationNotes && (
              <div className="mb-4">
                <h3 className="font-medium text-orange-800 mb-2">Risk Mitigation Best Practices</h3>
                <p className="text-sm text-orange-800 leading-relaxed">
                  {presented.riskMitigationNotes}
                </p>
              </div>
            )}

            {presented.characterScore && (
              <div className="mt-4 pt-3 border-t border-orange-200">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-orange-900 hover:text-orange-700 flex items-center gap-1">
                    Why this rating?
                    <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-2 text-xs text-orange-700 leading-relaxed">
                    <p className="mb-2">
                      The character score ({presented.characterScore.value}) is calculated based on multiple plant attributes 
                      that affect fire behavior: leaf moisture, volatile compounds, dead material retention, 
                      and overall flammability characteristics.
                    </p>
                    <p>
                      <strong>Scale:</strong> 1-3 = Low flammability, 4-6 = Moderate, 7-10 = High flammability. 
                      Lower scores indicate better fire safety performance.
                    </p>
                  </div>
                </details>
              </div>
            )}
          </div>
        )}

        {/* Quick Facts (badges row) */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Facts</h2>
          <div className="flex flex-wrap gap-2">
            {presented.nativeStatus && (
              <span className="inline-flex items-center gap-1 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">
                🌿 {presented.nativeStatus}
              </span>
            )}
            {presented.waterNeeds && (
              <span className="inline-flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                💧 Water: {presented.waterNeeds}
              </span>
            )}
            {presented.deerResistance && (
              <span className="inline-flex items-center gap-1 text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
                🦌 Deer resistance
              </span>
            )}
            {presented.lightNeeds && (
              <span className="inline-flex items-center gap-1 text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full border border-yellow-200">
                ☀️ {presented.lightNeeds}
              </span>
            )}
            {presented.height && (
              <span className="inline-flex items-center gap-1 text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                📏 {presented.height}
              </span>
            )}
            {presented.flowerColor && (
              <span className="inline-flex items-center gap-1 text-sm bg-pink-100 text-pink-700 px-3 py-1 rounded-full border border-pink-200">
                🌸 {presented.flowerColor}
              </span>
            )}
            {presented.plantStructure && (
              <span className="inline-flex items-center gap-1 text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                🏡 {presented.plantStructure}
              </span>
            )}
            {presented.droughtTolerant && (
              <span className="inline-flex items-center gap-1 text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full border border-orange-200">
                🏜️ Drought tolerant
              </span>
            )}
            {presented.evergreen && (
              <span className="inline-flex items-center gap-1 text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                🌲 Evergreen
              </span>
            )}
          </div>
        </div>

        {/* Benefits */}
        {presented.benefits.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Benefits</h2>
            <div className="flex flex-wrap gap-2">
              {presented.benefits.map((benefit, i) => (
                <span
                  key={i}
                  className="inline-flex items-center text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cautions */}
        {(presented.invasive || presented.restrictions) && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-red-900 mb-4">⚠️ Cautions</h2>
            <div className="space-y-2">
              {presented.invasive && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    <strong>Invasive Warning:</strong> {presented.invasive}
                  </p>
                </div>
              )}
              {presented.restrictions && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    <strong>Restrictions:</strong> {presented.restrictions}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nursery Availability */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Nursery Availability</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <NurseryAvailability lwfPlantId={id} variant="full" />
          </div>
        </div>

        {/* All Attributes (collapsed by default) */}
        {presented.allDisplayValues.length > 0 && (
          <div className="mt-10 bg-white rounded-xl border border-gray-200 p-6">
            <details className="group">
              <summary className="cursor-pointer text-lg font-bold text-gray-900 hover:text-gray-700 flex items-center gap-2">
                Show all data
                <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4">
                  Advanced view showing all human-readable attributes. Technical data and calculation intermediaries are excluded.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {presented.allDisplayValues.map((attr, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm text-gray-600 font-medium">{attr.label}:</span>
                      <span className="text-sm text-gray-900">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          </div>
        )}

        {/* Notes */}
        {plant.notes && (
          <div className="mt-8 bg-gray-50 rounded-xl border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {plant.notes}
            </p>
          </div>
        )}

        {/* Credibility Statement */}
        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Data Credibility
          </h3>
          
          <div className="text-blue-800 leading-relaxed">
            <p className="mb-3">
              Plant data curated by <strong>Charisse Sydoriak, Wildfire Risk Reduction Specialist</strong>. 
              Sources cited where available. This is an evolving field — data reflects current research 
              and may be updated as new findings emerge.
            </p>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-700">
                <p>
                  <strong>Sources for this plant:</strong> {(() => {
                    const sourcedValues = values.filter(val => val.sourceId);
                    const uniqueSources = Array.from(new Set(sourcedValues.map(val => val.sourceId))).length;
                    return uniqueSources;
                  })()} verified references
                </p>
              </div>
              
              <Link
                href="/sources"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                View All Data Sources
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

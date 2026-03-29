import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getPlant,
  getPlantValues,
  getPlantImages,
  getPlantRiskReduction,
  LwfApiError,
} from '@/lib/api/lwf';
import type { ResolvedValue, RiskReduction, PlantImage } from '@lwf/types';
import { NurseryAvailability } from '@/components/plants/NurseryAvailability';

// ─── Attribute grouping ──────────────────────────────────────────────────────

interface AttributeGroup {
  label: string;
  values: ResolvedValue[];
}

function groupValues(values: ResolvedValue[]): AttributeGroup[] {
  const groups: Record<string, ResolvedValue[]> = {};

  for (const value of values) {
    const name = value.attributeName || 'Other';
    if (!groups[name]) groups[name] = [];
    groups[name].push(value);
  }

  return Object.entries(groups).map(([label, vals]) => ({
    label,
    values: vals,
  }));
}

// ─── Zone badge colors ──────────────────────────────────────────────────────

const ZONE_COLORS: Record<string, string> = {
  '0-5': 'bg-red-100 text-red-800 border-red-200',
  '5-10': 'bg-orange-100 text-orange-800 border-orange-200',
  '10-30': 'bg-amber-100 text-amber-800 border-amber-200',
  '30-100': 'bg-green-100 text-green-800 border-green-200',
  '50-100': 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const HIZ_ATTR_ID = 'b908b170-70c9-454d-a2ed-d86f98cb3de1';

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
  const [values, imagesResponse, riskReduction] = await Promise.all([
    getPlantValues(id).catch(() => [] as ResolvedValue[]),
    getPlantImages(id).catch(() => ({ plantId: id, images: [] as PlantImage[] })),
    getPlantRiskReduction(id).catch(() => null as RiskReduction | null),
  ]);

  const images = imagesResponse.images || [];
  const allImages = plant.primaryImage
    ? [plant.primaryImage, ...images.filter((img) => img.url !== plant.primaryImage?.url)]
    : images;

  const hizValues = values.filter((v) => v.attributeId === HIZ_ATTR_ID);
  const otherValues = values.filter((v) => v.attributeId !== HIZ_ATTR_ID);
  const groups = groupValues(otherValues);

  const zones = hizValues
    .map((v) => v.resolved?.value)
    .filter(Boolean) as string[];

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
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Images */}
          <div>
            {allImages.length > 0 ? (
              <div className="space-y-3">
                {/* Primary image */}
                <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
                  <img
                    src={allImages[0].url}
                    alt={plant.commonName}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Thumbnail grid */}
                {allImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {allImages.slice(1, 5).map((img, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                      >
                        <img
                          src={img.url}
                          alt={`${plant.commonName} ${img.type || ''}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[4/3] bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-20 h-20 text-green-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </div>
            )}
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
            {zones.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Fire Zone Compatibility
                </h3>
                <div className="flex flex-wrap gap-2">
                  {zones.map((zone) => (
                    <span
                      key={zone}
                      className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full border ${
                        ZONE_COLORS[zone] ||
                        'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {zone} ft
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Reduction */}
            {riskReduction && (
              <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-orange-900">
                    Risk Assessment
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-orange-700">
                      Character Score
                    </span>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-600 text-white font-bold text-sm">
                      {riskReduction.characterScore}
                    </span>
                  </div>
                </div>
                {riskReduction.placement && (
                  <p className="text-sm text-orange-800 mb-2">
                    <strong>Placement:</strong>{' '}
                    {riskReduction.placement.meaning}
                  </p>
                )}
                <p className="text-sm text-orange-800 leading-relaxed">
                  {riskReduction.riskReductionText}
                </p>
                {riskReduction.triggeredRules &&
                  riskReduction.triggeredRules.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {riskReduction.triggeredRules.map((rule, i) => (
                        <span
                          key={i}
                          className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full"
                        >
                          {rule}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            )}

            {/* External links */}
            {plant.urls && plant.urls.length > 0 && (
              <div className="mt-4">
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

        {/* Attribute sections */}
        {groups.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Plant Attributes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <div
                  key={group.label}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <h3 className="font-medium text-gray-900 mb-2">
                    {group.label}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {group.values.map((val) => (
                      <span
                        key={val.id}
                        className="inline-flex items-center text-sm bg-gray-50 text-gray-700 px-2.5 py-1 rounded-lg border border-gray-100"
                        title={val.resolved?.description || undefined}
                      >
                        {val.resolved?.value || val.rawValue}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nursery Availability */}
        <div className="mt-10 bg-white rounded-xl border border-gray-200 p-6">
          <NurseryAvailability lwfPlantId={id} variant="full" />
        </div>

        {/* Notes */}
        {plant.notes && (
          <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {plant.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Mapbox utilities — geocoding and token access.
 * Mapbox GL JS is imported dynamically in components (client-only).
 */

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export function getMapboxToken(): string {
  return MAPBOX_TOKEN;
}

export function isMapboxConfigured(): boolean {
  return Boolean(MAPBOX_TOKEN);
}

export interface GeocodingResult {
  address: string;
  lat: number;
  lng: number;
}

export async function geocodeAddress(
  query: string
): Promise<GeocodingResult[]> {
  if (!MAPBOX_TOKEN) return [];

  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&types=address,place&limit=5`
  );

  if (!res.ok) return [];

  const data = await res.json();
  return data.features.map(
    (f: { place_name: string; center: [number, number] }) => ({
      address: f.place_name,
      lng: f.center[0],
      lat: f.center[1],
    })
  );
}

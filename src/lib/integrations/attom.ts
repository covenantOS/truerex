/**
 * ATTOM Property Data API client
 * Fetches property and owner data around a job site for neighborhood targeting.
 */

const ATTOM_API_BASE = "https://api.gateway.attomdata.com/propertyapi/v1.0.0";

interface PropertyResult {
  address: string;
  city: string;
  state: string;
  zip: string;
  ownerName: string | null;
  lat: number;
  lng: number;
  distanceMiles: number;
}

async function attomFetch(path: string): Promise<Response> {
  const res = await fetch(`${ATTOM_API_BASE}${path}`, {
    headers: {
      Accept: "application/json",
      apikey: process.env.ATTOM_API_KEY!,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ATTOM API error ${res.status}: ${err}`);
  }

  return res;
}

/**
 * Find properties near a job site within a given radius
 */
export async function findNearbyProperties(
  lat: number,
  lng: number,
  radiusMiles: number = 0.5,
  limit: number = 50
): Promise<PropertyResult[]> {
  // ATTOM uses radius in miles with lat/lng
  const res = await attomFetch(
    `/property/snapshot?latitude=${lat}&longitude=${lng}&radius=${radiusMiles}&pagesize=${limit}`
  );

  const data = await res.json();

  if (!data.property) return [];

  return data.property.map((p: Record<string, unknown>) => {
    const addr = p.address as Record<string, unknown> || {};
    const loc = p.location as Record<string, unknown> || {};
    const owner = p.assessment as Record<string, unknown> || {};

    return {
      address: addr.oneLine || addr.line1 || "",
      city: addr.locality || "",
      state: addr.countrySubd || "",
      zip: addr.postal1 || "",
      ownerName: (owner as Record<string, unknown>).owner1?.toString() || null,
      lat: (loc.latitude as number) || lat,
      lng: (loc.longitude as number) || lng,
      distanceMiles: calculateDistance(
        lat,
        lng,
        (loc.latitude as number) || lat,
        (loc.longitude as number) || lng
      ),
    };
  });
}

/**
 * Get detailed property info for a specific address
 */
export async function getPropertyDetail(address: string, zip: string) {
  const encoded = encodeURIComponent(address);
  const res = await attomFetch(
    `/property/detail?address1=${encoded}&address2=${zip}`
  );

  return res.json();
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

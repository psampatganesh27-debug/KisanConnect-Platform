export interface VillageCoordinates {
  name: string;
  x: number; // in kilometers
  y: number; // in kilometers
}

// Map sample villages to basic (X, Y) coordinates (1 unit = 1 kilometer)
export const SAMPLE_VILLAGES: Record<string, { x: number; y: number }> = {
  'Rampur': { x: 10, y: 15 },
  'Kishanpur': { x: 18, y: 22 },       // ~11 km from Rampur
  'Bhimavaram': { x: 15, y: 20 },      // ~7 km from Rampur
  'Vijayawada': { x: 30, y: 40 },      // ~32 km from Rampur
  'Sonpur': { x: 40, y: 35 },          // ~36 km from Rampur
  'Guntur': { x: 38, y: 48 },          // ~43 km from Rampur
  'Gopalpur': { x: 55, y: 50 },        // ~63 km from Rampur
  'Kothapalli': { x: 60, y: 40 },      // ~56 km from Rampur
  'Chandanpura': { x: 70, y: 65 },     // ~81 km from Rampur
  'Sundargarh': { x: 95, y: 90 },      // ~113 km from Rampur (> 100 km: Undeliverable)
  'Devgarh': { x: 130, y: 120 },       // ~156 km from Rampur (> 100 km: Undeliverable)
  'Ananthapur': { x: 110, y: 100 },    // ~131 km from Rampur (> 100 km: Undeliverable)
  'Nandigama': { x: 125, y: 140 },     // ~170 km from Rampur (> 100 km: Undeliverable)
};

export const VILLAGE_NAMES = Object.keys(SAMPLE_VILLAGES);

/**
 * Fallback coordinate generator for user-entered village names
 * Uses string hashing to deterministically generate consistent (X, Y) coordinates.
 */
function getFallbackCoordinates(villageName: string): { x: number; y: number } {
  let hash = 0;
  for (let i = 0; i < villageName.length; i++) {
    hash = (hash << 5) - hash + villageName.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.abs(hash % 120) + 5;
  const y = Math.abs((hash >> 2) % 120) + 5;
  return { x, y };
}

/**
 * Retrieve coordinates for any village name
 */
export function getVillageCoordinates(villageName: string): { x: number; y: number } {
  if (!villageName) return { x: 10, y: 15 };
  
  const normalized = villageName.trim();
  const matchKey = VILLAGE_NAMES.find(
    k => k.toLowerCase() === normalized.toLowerCase()
  );

  if (matchKey) {
    return SAMPLE_VILLAGES[matchKey];
  }

  return getFallbackCoordinates(normalized);
}

/**
 * Calculates straight-line distance between two villages using the Pythagorean theorem:
 * Distance = sqrt((X2 - X1)^2 + (Y2 - Y1)^2)
 */
export function calculateDistanceKm(villageA: string, villageB: string): number {
  if (!villageA || !villageB) return 0;
  if (villageA.trim().toLowerCase() === villageB.trim().toLowerCase()) return 0;

  const posA = getVillageCoordinates(villageA);
  const posB = getVillageCoordinates(villageB);

  const dx = posA.x - posB.x;
  const dy = posA.y - posB.y;

  // Pythagorean theorem calculation
  const distance = Math.sqrt(dx * dx + dy * dy);
  return Math.round(distance);
}

export interface DistanceBadgeInfo {
  distanceKm: number;
  status: 'nearby' | 'moderate' | 'undeliverable';
  badgeText: string;
  badgeBg: string;
  badgeTextColor: string;
  badgeBorder: string;
  icon: string;
  isDeliverable: boolean;
}

/**
 * Utility function to determine distance badge status:
 * - <= 50 km: green 'Available Nearby' badge
 * - 51-100 km: amber 'Moderate Distance' badge
 * - > 100 km: red 'Undeliverable' banner & action buttons disabled
 */
export function getDistanceBadgeInfo(userVillage: string, targetVillage: string): DistanceBadgeInfo {
  const distanceKm = calculateDistanceKm(userVillage, targetVillage);

  if (distanceKm === 0) {
    return {
      distanceKm: 0,
      status: 'nearby',
      badgeText: 'Same Village (0 km)',
      badgeBg: 'bg-emerald-100',
      badgeTextColor: 'text-emerald-900',
      badgeBorder: 'border-emerald-300',
      icon: '📍',
      isDeliverable: true,
    };
  }

  if (distanceKm <= 50) {
    return {
      distanceKm,
      status: 'nearby',
      badgeText: `Available Nearby (${distanceKm} km)`,
      badgeBg: 'bg-emerald-100',
      badgeTextColor: 'text-emerald-900',
      badgeBorder: 'border-emerald-300',
      icon: '🟢',
      isDeliverable: true,
    };
  }

  if (distanceKm <= 100) {
    return {
      distanceKm,
      status: 'moderate',
      badgeText: `Moderate Distance (${distanceKm} km)`,
      badgeBg: 'bg-amber-100',
      badgeTextColor: 'text-amber-900',
      badgeBorder: 'border-amber-300',
      icon: '🟡',
      isDeliverable: true,
    };
  }

  return {
    distanceKm,
    status: 'undeliverable',
    badgeText: `Undeliverable (${distanceKm} km)`,
    badgeBg: 'bg-rose-100',
    badgeTextColor: 'text-rose-900',
    badgeBorder: 'border-rose-300',
    icon: '🔴',
    isDeliverable: false,
  };
}

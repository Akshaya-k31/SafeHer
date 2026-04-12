// mockData.ts
// Types and static data kept for interface compatibility.
// Live data now comes from the Flask API via src/api/safeherApi.ts

export interface StreetSegment {
  id: number;
  latitude: number;
  longitude: number;
  crime_score: number;
  lighting_score: number;
  traffic_score: number;
  police_distance: number;
}

export interface BusStop {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  lighting_score: number;
  crowd_density: number;
  safety_score: number;
}

export interface SafetyReport {
  id: number;
  latitude: number;
  longitude: number;
  report_type: string;
  description: string;
  timestamp: string;
}

export interface RouteOption {
  id: number;
  name: string;
  type: 'safest' | 'balanced' | 'fastest';
  safetyScore: number;
  distance: string;
  duration: string;
  color: string;
  path: [number, number][];
}

export const CHENNAI_CENTER: [number, number] = [13.0827, 80.2707];

// Static fallback data (used only if API is unreachable)
export const streetSegments: StreetSegment[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  latitude: 13.0 + Math.random() * 0.15,
  longitude: 80.2 + Math.random() * 0.15,
  crime_score: Math.random(),
  lighting_score: Math.random(),
  traffic_score: Math.random(),
  police_distance: 0.5 + Math.random() * 5,
}));

export const busStops: BusStop[] = [
  { id: 1,  name: "T. Nagar Bus Stand",      latitude: 13.0418, longitude: 80.2341, lighting_score: 0.9,  crowd_density: 0.8,  safety_score: 88 },
  { id: 2,  name: "Anna Nagar Depot",         latitude: 13.0850, longitude: 80.2101, lighting_score: 0.85, crowd_density: 0.7,  safety_score: 82 },
  { id: 3,  name: "Adyar Bus Stop",           latitude: 13.0063, longitude: 80.2574, lighting_score: 0.7,  crowd_density: 0.5,  safety_score: 72 },
  { id: 4,  name: "Egmore Station",           latitude: 13.0732, longitude: 80.2609, lighting_score: 0.95, crowd_density: 0.9,  safety_score: 91 },
  { id: 5,  name: "Guindy Bus Stop",          latitude: 13.0067, longitude: 80.2206, lighting_score: 0.6,  crowd_density: 0.4,  safety_score: 58 },
  { id: 6,  name: "Tambaram Bus Stand",       latitude: 12.9249, longitude: 80.1000, lighting_score: 0.5,  crowd_density: 0.3,  safety_score: 45 },
  { id: 7,  name: "Velachery Bus Stop",       latitude: 12.9815, longitude: 80.2180, lighting_score: 0.75, crowd_density: 0.6,  safety_score: 70 },
  { id: 8,  name: "Koyambedu Terminal",       latitude: 13.0694, longitude: 80.1948, lighting_score: 0.8,  crowd_density: 0.85, safety_score: 85 },
  { id: 9,  name: "Mylapore Bus Stop",        latitude: 13.0339, longitude: 80.2676, lighting_score: 0.88, crowd_density: 0.7,  safety_score: 83 },
  { id: 10, name: "Nungambakkam Stop",        latitude: 13.0569, longitude: 80.2425, lighting_score: 0.82, crowd_density: 0.65, safety_score: 78 },
  { id: 11, name: "Chromepet Bus Stop",       latitude: 12.9516, longitude: 80.1462, lighting_score: 0.55, crowd_density: 0.35, safety_score: 50 },
  { id: 12, name: "Porur Junction Stop",      latitude: 13.0382, longitude: 80.1564, lighting_score: 0.45, crowd_density: 0.3,  safety_score: 42 },
  { id: 13, name: "Thiruvanmiyur Stop",       latitude: 12.9830, longitude: 80.2594, lighting_score: 0.78, crowd_density: 0.55, safety_score: 74 },
  { id: 14, name: "Royapettah Bus Stop",      latitude: 13.0520, longitude: 80.2650, lighting_score: 0.85, crowd_density: 0.72, safety_score: 80 },
  { id: 15, name: "Saidapet Bus Stop",        latitude: 13.0212, longitude: 80.2235, lighting_score: 0.65, crowd_density: 0.5,  safety_score: 62 },
  { id: 16, name: "Ashok Nagar Stop",         latitude: 13.0386, longitude: 80.2121, lighting_score: 0.72, crowd_density: 0.58, safety_score: 68 },
  { id: 17, name: "Perambur Bus Stop",        latitude: 13.1150, longitude: 80.2340, lighting_score: 0.5,  crowd_density: 0.4,  safety_score: 48 },
  { id: 18, name: "Vadapalani Bus Stop",      latitude: 13.0500, longitude: 80.2120, lighting_score: 0.77, crowd_density: 0.63, safety_score: 73 },
  { id: 19, name: "Kodambakkam Stop",         latitude: 13.0520, longitude: 80.2250, lighting_score: 0.7,  crowd_density: 0.55, safety_score: 66 },
  { id: 20, name: "Broadway Bus Stand",       latitude: 13.0900, longitude: 80.2800, lighting_score: 0.6,  crowd_density: 0.9,  safety_score: 75 },
];

export const safetyReports: SafetyReport[] = [
  { id: 1,  latitude: 13.0500, longitude: 80.2300, report_type: "Poor lighting",       description: "Street lights not working near the park area",      timestamp: "2024-03-15T18:30:00" },
  { id: 2,  latitude: 13.0350, longitude: 80.2450, report_type: "Harassment",          description: "Catcalling reported near bus stop in evening hours", timestamp: "2024-03-14T20:15:00" },
  { id: 3,  latitude: 13.0700, longitude: 80.2200, report_type: "Isolated street",     description: "Very few people after 9 PM, feels unsafe",           timestamp: "2024-03-13T21:00:00" },
  { id: 4,  latitude: 13.0100, longitude: 80.2500, report_type: "Suspicious activity", description: "Group of people loitering near the alley",           timestamp: "2024-03-12T22:30:00" },
  { id: 5,  latitude: 13.0600, longitude: 80.2600, report_type: "Poor lighting",       description: "Entire stretch is dark after sunset",                timestamp: "2024-03-11T19:00:00" },
];

export function calculateSafetyScore(lat: number, lng: number) {
  const seed = (lat * 1000 + lng * 1000) % 100;
  const score = Math.max(20, Math.min(95, 50 + seed * 0.5 + (Math.sin(lat * 100) * 20)));
  return {
    score: Math.round(score),
    crimeRisk: score > 75 ? "Low" : score > 50 ? "Moderate" : "High",
    lighting: score > 70 ? "Good" : score > 45 ? "Moderate" : "Poor",
    traffic: score > 60 ? "Good" : score > 35 ? "Moderate" : "Low",
    policeProximity: score > 65 ? "Nearby" : score > 40 ? "Moderate" : "Far",
  };
}

// generateRoutes kept for reference but NavigationDashboard now uses the API
export function generateRoutes(start: [number, number], end: [number, number]) {
  const midLat = (start[0] + end[0]) / 2;
  const midLng = (start[1] + end[1]) / 2;
  const dist = Math.sqrt((end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2);
  const offset1 = dist * 0.15;
  const offset2 = dist * 0.1;
  return [
    { id: 1, name: "Safest Route",   type: "safest"   as const, safetyScore: 87, distance: `${(dist * 111 * 1.3).toFixed(1)} km`,  duration: `${Math.round(dist * 111 * 1.3 * 3)} min`,   color: "#22c55e", path: [start, [start[0] + (midLat - start[0]) * 0.5 + offset1, start[1] + (midLng - start[1]) * 0.3], [midLat + offset1, midLng - offset1 * 0.5], end] as [number, number][] },
    { id: 2, name: "Balanced Route", type: "balanced" as const, safetyScore: 68, distance: `${(dist * 111 * 1.15).toFixed(1)} km`, duration: `${Math.round(dist * 111 * 1.15 * 2.5)} min`, color: "#f97316", path: [start, [start[0] + (midLat - start[0]) * 0.4 - offset2, start[1] + (midLng - start[1]) * 0.5], [midLat - offset2 * 0.3, midLng + offset2], end] as [number, number][] },
    { id: 3, name: "Fastest Route",  type: "fastest"  as const, safetyScore: 42, distance: `${(dist * 111).toFixed(1)} km`,        duration: `${Math.round(dist * 111 * 2)} min`,          color: "#ef4444", path: [start, [midLat, midLng], end] as [number, number][] },
  ];
}

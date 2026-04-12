// src/api/safeherApi.ts
// Drop-in replacement for src/data/mockData.ts
// Connect your React components to the SafeHer Flask backend.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Auth helpers ────────────────────────────────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem("safeher_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RouteOption {
  route_id: string;
  route_type: "safest" | "balanced" | "fastest";
  label: string;
  color: string;
  polyline_coordinates: [number, number][];
  distance_km: number;
  estimated_time_minutes: number;
  safety_score: number;
}

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  risk_score: number;
}

export interface BusStop {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  lighting_score: number;
  crowd_level: string;
  distance_from_user: number;
  police_proximity: number;
  safety_score: number;
}

export interface SafetyReport {
  id: number;
  latitude: number;
  longitude: number;
  report_type: string;
  description: string;
  timestamp: string;
  user_id: number | null;
}

export interface LocationSafety {
  latitude: number;
  longitude: number;
  safety_score: number;
  risk_score: number;
  label: string;
  color: string;
  breakdown: {
    crime_factor: number;
    lighting_factor: number;
    traffic_factor: number;
    police_proximity: number;
    recent_reports: number;
    is_night: boolean;
  };
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function register(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  localStorage.setItem("safeher_token", data.token);
  return data;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  localStorage.setItem("safeher_token", data.token);
  return data;
}

export function logout() {
  localStorage.removeItem("safeher_token");
}

// ─── Routes ──────────────────────────────────────────────────────────────────

export async function fetchRoutes(
  srcLat: number,
  srcLng: number,
  dstLat: number,
  dstLng: number
): Promise<RouteOption[]> {
  const res = await fetch(`${BASE_URL}/routes`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      src_lat: srcLat,
      src_lng: srcLng,
      dst_lat: dstLat,
      dst_lng: dstLng,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch routes");
  return data.routes as RouteOption[];
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────

export async function fetchHeatmap(): Promise<HeatmapPoint[]> {
  const res = await fetch(`${BASE_URL}/heatmap`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch heatmap");
  return data.heatmap as HeatmapPoint[];
}

// ─── Bus Stops ───────────────────────────────────────────────────────────────

export async function fetchBusStops(
  lat: number,
  lng: number,
  radiusKm = 3.0
): Promise<BusStop[]> {
  const res = await fetch(
    `${BASE_URL}/busstops?lat=${lat}&lng=${lng}&radius=${radiusKm}`,
    { headers: authHeaders() }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch bus stops");
  return data.bus_stops as BusStop[];
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export async function submitReport(report: {
  latitude: number;
  longitude: number;
  report_type: string;
  description?: string;
}): Promise<SafetyReport> {
  const res = await fetch(`${BASE_URL}/reports`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(report),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to submit report");
  return data.report as SafetyReport;
}

export async function fetchReports(
  lat?: number,
  lng?: number,
  radiusKm = 2.0
): Promise<SafetyReport[]> {
  let url = `${BASE_URL}/reports`;
  if (lat !== undefined && lng !== undefined) {
    url += `?lat=${lat}&lng=${lng}&radius=${radiusKm}`;
  }
  const res = await fetch(url, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch reports");
  return data.reports as SafetyReport[];
}

// ─── Location Safety ─────────────────────────────────────────────────────────

export async function fetchLocationSafety(
  lat: number,
  lng: number
): Promise<LocationSafety> {
  const res = await fetch(
    `${BASE_URL}/location-safety?lat=${lat}&lng=${lng}`,
    { headers: authHeaders() }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch safety data");
  return data as LocationSafety;
}

// ─── Leaflet Heatmap helper ──────────────────────────────────────────────────
// Convert heatmap API response to the format Leaflet.heat expects:
// [[lat, lng, intensity], ...]

export function toLeafletHeatLayer(
  points: HeatmapPoint[]
): [number, number, number][] {
  return points.map((p) => [
    p.latitude,
    p.longitude,
    p.risk_score / 10, // normalize 0–10 → 0–1
  ]);
}

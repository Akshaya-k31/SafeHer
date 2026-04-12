// SafeHer API client
// All API calls to the Flask backend at http://localhost:5000/api

export const BASE_URL = "http://127.0.0.1:5000/api";

function getToken(): string | null {
  return localStorage.getItem("safeher_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function registerUser(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.token) localStorage.setItem("safeher_token", data.token);
  return data;
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.token) localStorage.setItem("safeher_token", data.token);
  return data;
}

// ── Routes ────────────────────────────────────────────────────────────────────

export async function fetchRoutes(
  srcLat: number, srcLng: number,
  dstLat: number, dstLng: number
) {
  const res = await fetch(`${BASE_URL}/routes`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ src_lat: srcLat, src_lng: srcLng, dst_lat: dstLat, dst_lng: dstLng }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch routes");
  // Backend returns {routes: [...]} where each route already matches RouteOption interface
  return data.routes;
}

// ── Heatmap ───────────────────────────────────────────────────────────────────

export async function fetchHeatmap() {
  const res = await fetch(`${BASE_URL}/heatmap`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch heatmap");
  return data.heatmap as Array<{ latitude: number; longitude: number; risk_score: number }>;
}

/** Convert heatmap points to Leaflet.heat format [[lat, lng, intensity]] */
export function toLeafletHeatLayer(
  points: Array<{ latitude: number; longitude: number; risk_score: number }>
): [number, number, number][] {
  return points.map((p) => [p.latitude, p.longitude, p.risk_score / 10]);
}

// ── Bus Stops ─────────────────────────────────────────────────────────────────

export async function fetchBusStops(lat: number, lng: number, radiusKm = 50.0) {
  const res = await fetch(
    `${BASE_URL}/busstops?lat=${lat}&lng=${lng}&radius=${radiusKm}`,
    { headers: authHeaders() }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch bus stops");
  return data.bus_stops;
}

// ── Reports ───────────────────────────────────────────────────────────────────

export async function submitReport(report: {
  latitude: number;
  longitude: number;
  report_type: string;
  description?: string;
}) {
  const res = await fetch(`${BASE_URL}/reports`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(report),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to submit report");
  return data.report;
}

export async function fetchReports(lat?: number, lng?: number, radiusKm = 2.0) {
  let url = `${BASE_URL}/reports`;
  if (lat !== undefined && lng !== undefined) {
    url += `?lat=${lat}&lng=${lng}&radius=${radiusKm}`;
  }
  const res = await fetch(url, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch reports");
  return data.reports;
}

// ── Location Safety ───────────────────────────────────────────────────────────

export async function fetchLocationSafety(lat: number, lng: number) {
  const res = await fetch(`${BASE_URL}/location-safety?lat=${lat}&lng=${lng}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch safety data");
  return data;
}

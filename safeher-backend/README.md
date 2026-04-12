# SafeHer – Backend Setup Guide

Flask + MySQL backend for the SafeHer women-safety navigation platform.

---

## Project Structure

```
safeher-backend/
├── backend/
│   ├── app.py                    ← Flask entry point
│   ├── config.py                 ← App configuration
│   ├── seed.py                   ← Database seed script
│   ├── models/
│   │   ├── __init__.py           ← SQLAlchemy db instance
│   │   ├── user.py
│   │   ├── location.py
│   │   ├── crime.py
│   │   ├── lighting.py
│   │   ├── traffic.py
│   │   ├── police.py
│   │   ├── busstop.py
│   │   ├── reports.py
│   │   └── route_safety.py
│   ├── routes/
│   │   ├── auth_routes.py        ← POST /api/auth/register, /login
│   │   ├── route_routes.py       ← POST /api/routes
│   │   ├── heatmap_routes.py     ← GET  /api/heatmap
│   │   ├── report_routes.py      ← GET/POST /api/reports
│   │   ├── busstop_routes.py     ← GET  /api/busstops
│   │   └── safety_routes.py      ← GET  /api/location-safety
│   ├── services/
│   │   ├── safety_score_service.py   ← Core risk calculation engine
│   │   ├── heatmap_service.py        ← Heatmap data generator
│   │   └── route_service.py          ← Route generation
│   └── utils/
│       ├── jwt_utils.py
│       └── distance_utils.py
├── frontend-integration/
│   └── safeherApi.ts             ← Drop-in API client for React
├── schema.sql                    ← MySQL schema
├── requirements.txt
└── .env.example
```

---

## Step 1 – MySQL Setup

```sql
-- In MySQL shell or MySQL Workbench:
CREATE DATABASE safeher_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'safeher_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON safeher_db.* TO 'safeher_user'@'localhost';
FLUSH PRIVILEGES;
```

Or simply run the schema file:
```bash
mysql -u root -p < schema.sql
```

---

## Step 2 – Python Environment

```bash
cd safeher-backend/backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt
```

---

## Step 3 – Environment Variables

```bash
cp ../.env.example .env
```

Edit `.env`:
```env
SECRET_KEY=your-very-secret-key-here
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost/safeher_db
```

---

## Step 4 – Create Tables & Seed Data

```bash
# Make sure you're in backend/ with venv active
python seed.py
```

This will:
- Create all database tables automatically
- Insert 20 Coimbatore-area locations with crime/lighting/traffic data
- Insert 8 police stations
- Insert 15 bus stops with safety scores
- Insert 6 sample safety reports

---

## Step 5 – Run the Backend

```bash
python app.py
```

Server starts at: `http://localhost:5000`

---

## API Endpoints Reference

### Auth
```
POST /api/auth/register
Body: { "email": "user@example.com", "password": "secret123" }

POST /api/auth/login
Body: { "email": "user@example.com", "password": "secret123" }
```

### Routes (Navigation)
```
POST /api/routes
Body: {
  "src_lat": 11.0168,
  "src_lng": 76.9558,
  "dst_lat": 11.0285,
  "dst_lng": 77.0229
}

Response:
{
  "routes": [
    {
      "route_id": "uuid",
      "route_type": "safest",
      "label": "Safest Route",
      "color": "green",
      "polyline_coordinates": [[11.016, 76.955], ...],
      "distance_km": 8.4,
      "estimated_time_minutes": 25.2,
      "safety_score": 78.5
    },
    { "route_type": "balanced", "color": "orange", ... },
    { "route_type": "fastest",  "color": "red",    ... }
  ]
}
```

### Heatmap
```
GET /api/heatmap

Response:
{
  "heatmap": [
    { "latitude": 11.0021, "longitude": 76.9715, "risk_score": 7.8 },
    ...
  ],
  "count": 26
}
```

### Bus Stops
```
GET /api/busstops?lat=11.0168&lng=76.9558&radius=3

Response:
{
  "bus_stops": [
    {
      "id": 1,
      "name": "RS Puram Bus Stop",
      "latitude": 11.0168,
      "longitude": 76.9558,
      "lighting_score": 8.5,
      "crowd_level": "high",
      "distance_from_user": 0.0,
      "police_proximity": 9.2,
      "safety_score": 85.0
    },
    ...
  ]
}
```

### Reports
```
POST /api/reports
Body: {
  "latitude": 11.0021,
  "longitude": 76.9715,
  "report_type": "poor_lighting",
  "description": "No street lights after 9 PM"
}

Valid report_types:
  poor_lighting | harassment | suspicious_activity
  isolated_street | unsafe_area | other

GET /api/reports?lat=11.0021&lng=76.9715&radius=2
```

### Location Safety
```
GET /api/location-safety?lat=11.0021&lng=76.9715

Response:
{
  "latitude": 11.0021,
  "longitude": 76.9715,
  "safety_score": 42.5,
  "risk_score": 6.8,
  "label": "High Risk",
  "color": "red",
  "breakdown": {
    "crime_factor": 7.0,
    "lighting_factor": 3.5,
    "traffic_factor": 5.0,
    "police_proximity": 9.0,
    "recent_reports": 1,
    "is_night": false
  }
}
```

---

## Step 6 – Connect React Frontend

### 1. Copy the API client
```bash
cp frontend-integration/safeherApi.ts YOUR_FRONTEND/src/api/safeherApi.ts
```

### 2. Add environment variable to your frontend
In `YOUR_FRONTEND/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Replace mockData imports

**Before (mockData):**
```ts
import { mockRoutes, mockBusStops, mockHeatmap } from '../data/mockData';
```

**After (real API):**
```ts
import { fetchRoutes, fetchBusStops, fetchHeatmap, toLeafletHeatLayer } from '../api/safeherApi';
```

### 4. Example usage in components

**MapView / RoutePanel:**
```ts
const routes = await fetchRoutes(srcLat, srcLng, dstLat, dstLng);
// routes[0] = safest (green), routes[1] = balanced (orange), routes[2] = fastest (red)
// routes[i].polyline_coordinates is ready for Leaflet Polyline
```

**Heatmap layer:**
```ts
const heatPoints = await fetchHeatmap();
const leafletData = toLeafletHeatLayer(heatPoints);
// Pass leafletData directly to L.heatLayer(leafletData, options)
```

**BusStopPanel:**
```ts
const stops = await fetchBusStops(userLat, userLng, 3.0);
// Already sorted by safety_score descending
```

**ReportModal:**
```ts
await submitReport({
  latitude: clickedLat,
  longitude: clickedLng,
  report_type: selectedType,
  description: userText
});
```

**Click-to-inspect safety:**
```ts
const safety = await fetchLocationSafety(clickedLat, clickedLng);
// safety.label = "Safe" | "Moderate Risk" | "High Risk"
// safety.color = "green" | "orange" | "red"
```

---

## Safety Scoring Formula

```
Risk Score = 
  0.40 × crime_factor       (higher crime = higher risk)
+ 0.25 × (10 - lighting)    (poor lighting = higher risk)
+ 0.15 × (10 - traffic)     (isolated = higher risk)
+ 0.10 × (10 - police_prox) (far from police = higher risk)
+ 0.10 × (10 - report_safety)

AI Contextual Adjustments:
  Night (10 PM – 5 AM):  risk_score × 1.25
  Multiple reports (24h): risk_score += report_count × 3

Safety Score (0–100) = inverse of risk, normalized
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `ModuleNotFoundError` | Make sure venv is activated and `pip install -r requirements.txt` ran |
| `Access denied for MySQL` | Check DATABASE_URL in .env matches your MySQL user/password |
| CORS error in browser | Confirm Flask is running on port 5000 and `VITE_API_URL` is set |
| Empty heatmap | Run `python seed.py` to populate locations |
| `jwt` import error | Run `pip install PyJWT` |

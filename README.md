# SafeHer – Fully Integrated

Frontend (React + Vite) and Backend (Flask + MySQL) are now wired together.

---

## Quick Start

### 1. MySQL – Create Database

```sql
CREATE DATABASE safeher_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or run the schema file:
```bash
mysql -u root -p < safeher-backend/schema.sql
```

---

### 2. Backend Setup

```bash
cd safeher-backend/backend

# Create virtual environment
python -m venv venv

# Activate
# Windows:   venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt

# Seed the database (Chennai data)
python seed.py

# Start Flask server
python app.py
```

Flask runs at: **http://localhost:5000**

> The `.env` file is already configured with:
> `DATABASE_URL=mysql+pymysql://root:Akshaya2006@localhost/safeher_db`
> Change the password if needed.

---

### 3. Frontend Setup

```bash
cd safeher-navigate

npm install

npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## What Changed (Integration Only – No UI Changes)

### Frontend
| File | Change |
|------|--------|
| `src/api/safeherApi.ts` | New API client (routes, heatmap, bus stops, reports, safety score) |
| `src/components/NavigationDashboard.tsx` | `findRoute` now calls `POST /api/routes`; bus stops loaded from `GET /api/busstops` |
| `src/components/MapView.tsx` | Heatmap loaded from `GET /api/heatmap`; map click fetches live safety score from `GET /api/location-safety` |
| `src/components/ReportModal.tsx` | Submit calls `POST /api/reports` |
| `src/data/mockData.ts` | Types/interfaces kept intact; static fallback data preserved |
| `vite.config.ts` | Proxy `/api` → `http://127.0.0.1:5000` |

### Backend
| File | Change |
|------|--------|
| `services/route_service.py` | Returns `id, name, type, safetyScore, distance, duration, color, path` — exact match to frontend `RouteOption` interface |
| `routes/busstop_routes.py` | Returns `lighting_score` (0–1 scale) and `crowd_density` (float) — exact match to frontend `BusStop` interface |
| `routes/report_routes.py` | Accepts both display strings ("Poor lighting") and snake_case ("poor_lighting") |
| `seed.py` | Uses Chennai area data matching frontend's location list |
| `.env` | Pre-configured with your DB credentials |

---

## API Reference

| Method | Endpoint | Used by |
|--------|----------|---------|
| POST | `/api/routes` | Route search |
| GET | `/api/heatmap` | Heatmap toggle |
| GET | `/api/busstops?lat=&lng=&radius=` | Bus stop panel |
| POST | `/api/reports` | Report modal |
| GET | `/api/location-safety?lat=&lng=` | Map click popup |
| POST | `/api/auth/register` | Auth |
| POST | `/api/auth/login` | Auth |


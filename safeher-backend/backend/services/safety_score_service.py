from datetime import datetime, timedelta
from utils.distance_utils import haversine_distance
from models.crime import CrimeData
from models.lighting import LightingData
from models.traffic import TrafficData
from models.police import PoliceStation
from models.reports import SafetyReport
from models.location import Location
from models import db


CRIME_WEIGHT = 0.40
LIGHTING_WEIGHT = 0.25
TRAFFIC_WEIGHT = 0.15
POLICE_WEIGHT = 0.10
REPORT_WEIGHT = 0.10

NIGHT_HOURS_START = 22   # 10 PM
NIGHT_HOURS_END = 5      # 5 AM
NIGHT_MULTIPLIER = 1.25
RECENT_REPORT_RISK_BONUS = 3.0  # per report in last 24h
PROXIMITY_RADIUS_KM = 0.5       # 500m radius for matching location data


def _normalize(value, min_val, max_val):
    """Normalize value to 0–10 scale."""
    return max(0.0, min(10.0, (value - min_val) / (max_val - min_val) * 10))


def _get_nearest_location(lat, lng):
    """Find the nearest location record within PROXIMITY_RADIUS_KM."""
    locations = Location.query.all()
    nearest = None
    nearest_dist = float("inf")
    for loc in locations:
        dist = haversine_distance(lat, lng, loc.latitude, loc.longitude)
        if dist < nearest_dist:
            nearest_dist = dist
            nearest = loc
    if nearest_dist <= PROXIMITY_RADIUS_KM:
        return nearest
    return None


def _get_crime_factor(location):
    """Return crime risk factor (0–10). Higher = more dangerous."""
    if location and location.crime_data:
        return float(location.crime_data.crime_index)
    return 5.0  # default moderate


def _get_lighting_factor(location):
    """Return lighting safety factor (0–10). Higher = safer (better lit)."""
    if location and location.lighting_data:
        return float(location.lighting_data.lighting_score)
    return 5.0


def _get_traffic_factor(location):
    """Return traffic activity factor (0–10). Higher = more people = safer."""
    if location and location.traffic_data:
        return float(location.traffic_data.traffic_activity_score)
    return 5.0


def _get_police_proximity_factor(lat, lng):
    """
    Return police proximity factor (0–10).
    Closer police station = higher score = safer.
    """
    stations = PoliceStation.query.all()
    if not stations:
        return 5.0
    min_dist = min(
        haversine_distance(lat, lng, s.latitude, s.longitude)
        for s in stations
    )
    # Within 0.5km = 10, beyond 5km = 0
    score = max(0.0, 10.0 - (min_dist / 0.5))
    return min(10.0, score)


def _get_recent_report_count(lat, lng):
    """Count safety reports within 500m in last 24 hours."""
    since = datetime.utcnow() - timedelta(hours=24)
    reports = SafetyReport.query.filter(SafetyReport.timestamp >= since).all()
    count = sum(
        1 for r in reports
        if haversine_distance(lat, lng, r.latitude, r.longitude) <= PROXIMITY_RADIUS_KM
    )
    return count


def _is_night_time(dt=None):
    if dt is None:
        dt = datetime.utcnow()
    hour = dt.hour
    return hour >= NIGHT_HOURS_START or hour < NIGHT_HOURS_END


def compute_safety_score(lat, lng, dt=None):
    """
    Compute a composite safety score for a coordinate.

    Returns a dict:
      - safety_score: float 0–100 (100 = perfectly safe)
      - risk_score: float (raw risk, lower = safer)
      - breakdown: dict of individual factors
    """
    location = _get_nearest_location(lat, lng)

    crime_factor = _get_crime_factor(location)
    lighting_factor = _get_lighting_factor(location)
    traffic_factor = _get_traffic_factor(location)
    police_factor = _get_police_proximity_factor(lat, lng)
    report_count = _get_recent_report_count(lat, lng)

    # For safety score: invert crime (high crime = low safety)
    # Lighting, traffic, police are positive safety indicators
    crime_risk = (10.0 - crime_factor)   # invert: high crime index → high risk component
    lighting_safety = lighting_factor
    traffic_safety = traffic_factor
    police_safety = police_factor
    report_safety = max(0.0, 10.0 - report_count * 2)

    # Weighted safety score (0–10 raw)
    raw_score = (
        CRIME_WEIGHT * crime_risk +
        LIGHTING_WEIGHT * lighting_safety +
        TRAFFIC_WEIGHT * traffic_safety +
        POLICE_WEIGHT * police_safety +
        REPORT_WEIGHT * report_safety
    )

    # Risk score for heatmap (0–10, higher = more dangerous)
    risk_score = (
        CRIME_WEIGHT * crime_factor +
        LIGHTING_WEIGHT * (10.0 - lighting_factor) +
        TRAFFIC_WEIGHT * (10.0 - traffic_factor) +
        POLICE_WEIGHT * (10.0 - police_factor) +
        REPORT_WEIGHT * (10.0 - report_safety)
    )

    # AI-inspired contextual adjustments
    if _is_night_time(dt):
        risk_score *= NIGHT_MULTIPLIER

    if report_count > 1:
        risk_score += report_count * RECENT_REPORT_RISK_BONUS

    risk_score = min(10.0, risk_score)

    # Normalize to 0–100 scale
    safety_score = max(0.0, min(100.0, raw_score * 10.0))
    # Apply night penalty to safety score too
    if _is_night_time(dt):
        safety_score *= (1.0 / NIGHT_MULTIPLIER)

    return {
        "safety_score": round(safety_score, 1),
        "risk_score": round(risk_score, 2),
        "breakdown": {
            "crime_factor": round(crime_factor, 1),
            "lighting_factor": round(lighting_factor, 1),
            "traffic_factor": round(traffic_factor, 1),
            "police_proximity": round(police_factor, 1),
            "recent_reports": report_count,
            "is_night": _is_night_time(dt)
        }
    }

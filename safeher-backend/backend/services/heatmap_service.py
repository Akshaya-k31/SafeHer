from models.location import Location
from models.reports import SafetyReport
from services.safety_score_service import compute_safety_score
from datetime import datetime, timedelta


def generate_heatmap_data():
    """
    Generate heatmap risk points from known locations + recent reports.
    Returns list of {latitude, longitude, risk_score}
    """
    points = []
    seen = set()

    locations = Location.query.all()
    for loc in locations:
        key = (round(loc.latitude, 4), round(loc.longitude, 4))
        if key in seen:
            continue
        seen.add(key)
        result = compute_safety_score(loc.latitude, loc.longitude)
        points.append({
            "latitude": loc.latitude,
            "longitude": loc.longitude,
            "risk_score": result["risk_score"]
        })

    since = datetime.utcnow() - timedelta(days=7)
    reports = SafetyReport.query.filter(SafetyReport.timestamp >= since).all()
    for report in reports:
        key = (round(report.latitude, 4), round(report.longitude, 4))
        if key in seen:
            # Boost risk score for reported locations
            for p in points:
                if (round(p["latitude"], 4), round(p["longitude"], 4)) == key:
                    p["risk_score"] = min(10.0, p["risk_score"] + 1.5)
            continue
        seen.add(key)
        result = compute_safety_score(report.latitude, report.longitude)
        points.append({
            "latitude": report.latitude,
            "longitude": report.longitude,
            "risk_score": min(10.0, result["risk_score"] + 1.5)
        })

    return points

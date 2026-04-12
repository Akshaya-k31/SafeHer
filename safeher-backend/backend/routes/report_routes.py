from flask import Blueprint, request, jsonify
from models import db
from models.reports import SafetyReport
from utils.jwt_utils import optional_token
from datetime import datetime

report_bp = Blueprint("reports", __name__)

# Accept both the frontend's display strings and snake_case variants
VALID_REPORT_TYPES = [
    "Poor lighting", "poor_lighting",
    "Harassment", "harassment",
    "Isolated street", "isolated_street",
    "Suspicious activity", "suspicious_activity",
    "Other", "other",
    "unsafe_area",
]


@report_bp.route("/reports", methods=["POST"])
@optional_token
def submit_report():
    data = request.get_json()

    required = ["latitude", "longitude", "report_type"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    report_type = data["report_type"]
    if report_type not in VALID_REPORT_TYPES:
        return jsonify({
            "error": f"Invalid report_type. Got: {report_type}"
        }), 400

    try:
        lat = float(data["latitude"])
        lng = float(data["longitude"])
    except (ValueError, TypeError):
        return jsonify({"error": "Coordinates must be valid numbers"}), 400

    report = SafetyReport(
        latitude=lat,
        longitude=lng,
        report_type=report_type,
        description=data.get("description", ""),
        timestamp=datetime.utcnow(),
        user_id=request.user_id
    )
    db.session.add(report)
    db.session.commit()

    return jsonify({
        "message": "Report submitted successfully",
        "report": report.to_dict()
    }), 201


@report_bp.route("/reports", methods=["GET"])
def get_reports():
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)
    radius_km = request.args.get("radius", default=2.0, type=float)
    limit = request.args.get("limit", default=50, type=int)

    reports = SafetyReport.query.order_by(SafetyReport.timestamp.desc()).all()

    if lat is not None and lng is not None:
        from utils.distance_utils import haversine_distance
        reports = [
            r for r in reports
            if haversine_distance(lat, lng, r.latitude, r.longitude) <= radius_km
        ]

    reports = reports[:limit]
    return jsonify({"reports": [r.to_dict() for r in reports], "count": len(reports)}), 200

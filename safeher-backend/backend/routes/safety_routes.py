from flask import Blueprint, request, jsonify
from services.safety_score_service import compute_safety_score

safety_bp = Blueprint("safety", __name__)


@safety_bp.route("/location-safety", methods=["GET"])
def location_safety():
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)

    if lat is None or lng is None:
        return jsonify({"error": "lat and lng query parameters are required"}), 400

    result = compute_safety_score(lat, lng)

    # Safety label
    score = result["safety_score"]
    if score >= 75:
        label = "Safe"
        color = "green"
    elif score >= 50:
        label = "Moderate Risk"
        color = "orange"
    else:
        label = "High Risk"
        color = "red"

    return jsonify({
        "latitude": lat,
        "longitude": lng,
        "safety_score": result["safety_score"],
        "risk_score": result["risk_score"],
        "label": label,
        "color": color,
        "breakdown": result["breakdown"]
    }), 200

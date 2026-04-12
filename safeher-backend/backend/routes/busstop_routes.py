from flask import Blueprint, request, jsonify
from models.busstop import BusStop
from models.police import PoliceStation
from services.safety_score_service import compute_safety_score
from utils.distance_utils import haversine_distance

busstop_bp = Blueprint("busstops", __name__)


@busstop_bp.route("/busstops", methods=["GET"])
def get_busstops():
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)
    radius_km = request.args.get("radius", default=50.0, type=float)  # wide radius for Chennai

    if lat is None or lng is None:
        return jsonify({"error": "lat and lng query parameters are required"}), 400

    stops = BusStop.query.all()
    results = []

    for stop in stops:
        dist = haversine_distance(lat, lng, stop.latitude, stop.longitude)
        if dist > radius_km:
            continue

        safety_result = compute_safety_score(stop.latitude, stop.longitude)

        stations = PoliceStation.query.all()
        police_prox = 0.0
        if stations:
            min_dist = min(
                haversine_distance(stop.latitude, stop.longitude, s.latitude, s.longitude)
                for s in stations
            )
            police_prox = round(max(0.0, 10.0 - (min_dist / 0.5)), 1)

        # crowd_density as float 0-1 (matching frontend BusStop interface)
        crowd_map = {"low": 0.3, "moderate": 0.6, "high": 0.85}
        crowd_density = crowd_map.get(stop.crowd_level, 0.5)

        results.append({
            "id": stop.id,
            "name": stop.name,
            "latitude": stop.latitude,
            "longitude": stop.longitude,
            "lighting_score": round(stop.lighting_score / 10.0, 2),  # 0-1 scale
            "crowd_density": crowd_density,
            "distance_from_user": round(dist, 3),
            "police_proximity": police_prox,
            "safety_score": safety_result["safety_score"],
        })

    results.sort(key=lambda x: x["safety_score"], reverse=True)

    return jsonify({
        "bus_stops": results,
        "count": len(results)
    }), 200

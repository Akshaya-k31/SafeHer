from flask import Blueprint, request, jsonify
from services.route_service import generate_routes

route_bp = Blueprint("routes", __name__)


@route_bp.route("/routes", methods=["POST"])
def get_routes():
    data = request.get_json()

    required = ["src_lat", "src_lng", "dst_lat", "dst_lng"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    try:
        src_lat = float(data["src_lat"])
        src_lng = float(data["src_lng"])
        dst_lat = float(data["dst_lat"])
        dst_lng = float(data["dst_lng"])
    except (ValueError, TypeError):
        return jsonify({"error": "Coordinates must be valid numbers"}), 400

    routes = generate_routes(src_lat, src_lng, dst_lat, dst_lng)

    return jsonify({
        "routes": routes,
        "source": {"lat": src_lat, "lng": src_lng},
        "destination": {"lat": dst_lat, "lng": dst_lng}
    }), 200

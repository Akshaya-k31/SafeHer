from flask import Blueprint, jsonify
from services.heatmap_service import generate_heatmap_data

heatmap_bp = Blueprint("heatmap", __name__)


@heatmap_bp.route("/heatmap", methods=["GET"])
def get_heatmap():
    points = generate_heatmap_data()

    return jsonify({
        "heatmap": points,
        "count": len(points)
    }), 200

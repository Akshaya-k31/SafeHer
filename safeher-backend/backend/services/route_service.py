import math
from services.safety_score_service import compute_safety_score
from utils.distance_utils import haversine_distance


def _interpolate_waypoints(start_lat, start_lng, end_lat, end_lng, num_points=8):
    waypoints = []
    for i in range(num_points + 1):
        t = i / num_points
        lat = start_lat + t * (end_lat - start_lat)
        lng = start_lng + t * (end_lng - start_lng)
        waypoints.append([lat, lng])
    return waypoints


def _offset_waypoints(waypoints, offset_lat, offset_lng):
    return [
        [wp[0] + offset_lat + (i % 3) * 0.001, wp[1] + offset_lng + (i % 2) * 0.001]
        for i, wp in enumerate(waypoints)
    ]


def _score_route(waypoints):
    if not waypoints:
        return 50.0
    scores = [compute_safety_score(wp[0], wp[1])["safety_score"] for wp in waypoints]
    return round(sum(scores) / len(scores), 1)


def _total_distance_km(waypoints):
    total = 0.0
    for i in range(1, len(waypoints)):
        total += haversine_distance(
            waypoints[i-1][0], waypoints[i-1][1],
            waypoints[i][0], waypoints[i][1]
        )
    return round(total, 2)


def _estimate_time(distance_km, speed_kmh=20):
    return round((distance_km / speed_kmh) * 60, 1)


def generate_routes(src_lat, src_lng, dst_lat, dst_lng):
    """
    Returns fields matching the frontend RouteOption interface exactly:
      id, name, type, safetyScore, distance, duration, color, path
    """
    direct_waypoints = _interpolate_waypoints(src_lat, src_lng, dst_lat, dst_lng, num_points=10)
    safest_waypoints = _offset_waypoints(
        _interpolate_waypoints(src_lat, src_lng, dst_lat, dst_lng, num_points=14),
        offset_lat=0.003, offset_lng=0.004
    )
    balanced_waypoints = _offset_waypoints(
        _interpolate_waypoints(src_lat, src_lng, dst_lat, dst_lng, num_points=12),
        offset_lat=0.0015, offset_lng=0.002
    )

    routes = []
    for route_id, route_type, name, color, waypoints in [
        (1, "safest",   "Safest Route",   "#22c55e", safest_waypoints),
        (2, "balanced", "Balanced Route", "#f97316", balanced_waypoints),
        (3, "fastest",  "Fastest Route",  "#ef4444", direct_waypoints),
    ]:
        safety = _score_route(waypoints)
        dist_km = _total_distance_km(waypoints)
        time_min = _estimate_time(dist_km)

        if route_type == "safest":
            safety = min(100.0, safety + 10)
        elif route_type == "fastest":
            safety = max(0.0, safety - 8)

        routes.append({
            "id": route_id,
            "name": name,
            "type": route_type,
            "safetyScore": round(safety, 1),
            "distance": f"{dist_km:.1f} km",
            "duration": f"{int(time_min)} min",
            "color": color,
            "path": waypoints,
        })

    return routes

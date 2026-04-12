from models import db

class RouteSafety(db.Model):
    __tablename__ = "route_safety"

    id = db.Column(db.Integer, primary_key=True)
    route_id = db.Column(db.String(100), nullable=False)
    safety_score = db.Column(db.Float)
    distance_km = db.Column(db.Float)
    time_minutes = db.Column(db.Float)

    def to_dict(self):
        return {
            "id": self.id,
            "route_id": self.route_id,
            "safety_score": self.safety_score,
            "distance_km": self.distance_km,
            "time_minutes": self.time_minutes
        }

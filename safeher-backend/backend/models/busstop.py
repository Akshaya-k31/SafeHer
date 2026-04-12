from models import db

class BusStop(db.Model):
    __tablename__ = "bus_stops"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    lighting_score = db.Column(db.Float, default=5.0)   # 0–10
    crowd_level = db.Column(db.String(50), default="moderate")  # low / moderate / high

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "lighting_score": self.lighting_score,
            "crowd_level": self.crowd_level
        }

from models import db

class TrafficData(db.Model):
    __tablename__ = "traffic_data"

    id = db.Column(db.Integer, primary_key=True)
    location_id = db.Column(db.Integer, db.ForeignKey("locations.id"), nullable=False)
    traffic_activity_score = db.Column(db.Float, nullable=False)  # 0.0 (empty) to 10.0 (busy)

    def to_dict(self):
        return {
            "id": self.id,
            "location_id": self.location_id,
            "traffic_activity_score": self.traffic_activity_score
        }

from models import db

class LightingData(db.Model):
    __tablename__ = "lighting_data"

    id = db.Column(db.Integer, primary_key=True)
    location_id = db.Column(db.Integer, db.ForeignKey("locations.id"), nullable=False)
    lighting_score = db.Column(db.Float, nullable=False)  # 0.0 (dark) to 10.0 (well lit)

    def to_dict(self):
        return {
            "id": self.id,
            "location_id": self.location_id,
            "lighting_score": self.lighting_score
        }

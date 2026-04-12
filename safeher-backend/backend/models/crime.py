from models import db
from datetime import datetime

class CrimeData(db.Model):
    __tablename__ = "crime_data"

    id = db.Column(db.Integer, primary_key=True)
    location_id = db.Column(db.Integer, db.ForeignKey("locations.id"), nullable=False)
    crime_index = db.Column(db.Float, nullable=False)  # 0.0 (safe) to 10.0 (very dangerous)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "location_id": self.location_id,
            "crime_index": self.crime_index,
            "last_updated": self.last_updated.isoformat()
        }

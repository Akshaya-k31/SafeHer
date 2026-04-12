from models import db
from datetime import datetime

class SafetyReport(db.Model):
    __tablename__ = "safety_reports"

    id = db.Column(db.Integer, primary_key=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    report_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "report_type": self.report_type,
            "description": self.description,
            "timestamp": self.timestamp.isoformat(),
            "user_id": self.user_id
        }

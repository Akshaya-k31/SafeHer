from models import db

class Location(db.Model):
    __tablename__ = "locations"

    id = db.Column(db.Integer, primary_key=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    area_name = db.Column(db.String(255))

    crime_data = db.relationship("CrimeData", backref="location", uselist=False)
    lighting_data = db.relationship("LightingData", backref="location", uselist=False)
    traffic_data = db.relationship("TrafficData", backref="location", uselist=False)

    def to_dict(self):
        return {
            "id": self.id,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "area_name": self.area_name
        }

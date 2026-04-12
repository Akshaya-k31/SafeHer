"""
seed.py - Populate SafeHer database with Chennai-area data matching the frontend.
Run: python seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db
from models.location import Location
from models.crime import CrimeData
from models.lighting import LightingData
from models.traffic import TrafficData
from models.police import PoliceStation
from models.busstop import BusStop
from models.reports import SafetyReport
from datetime import datetime, timedelta
import random

app = create_app()

# Chennai-area locations matching the frontend's LOCATIONS map
LOCATIONS = [
    {"area_name": "T. Nagar",         "lat": 13.0418, "lng": 80.2341, "crime": 2.5, "light": 9.0, "traffic": 8.0},
    {"area_name": "Anna Nagar",       "lat": 13.0850, "lng": 80.2101, "crime": 3.0, "light": 8.5, "traffic": 7.0},
    {"area_name": "Adyar",            "lat": 13.0063, "lng": 80.2574, "crime": 3.5, "light": 7.0, "traffic": 5.0},
    {"area_name": "Egmore",           "lat": 13.0732, "lng": 80.2609, "crime": 2.0, "light": 9.5, "traffic": 9.0},
    {"area_name": "Guindy",           "lat": 13.0067, "lng": 80.2206, "crime": 5.5, "light": 6.0, "traffic": 4.0},
    {"area_name": "Tambaram",         "lat": 12.9249, "lng": 80.1000, "crime": 6.5, "light": 5.0, "traffic": 3.0},
    {"area_name": "Velachery",        "lat": 12.9815, "lng": 80.2180, "crime": 4.0, "light": 7.5, "traffic": 6.0},
    {"area_name": "Koyambedu",        "lat": 13.0694, "lng": 80.1948, "crime": 3.5, "light": 8.0, "traffic": 8.5},
    {"area_name": "Mylapore",         "lat": 13.0339, "lng": 80.2676, "crime": 2.5, "light": 8.8, "traffic": 7.0},
    {"area_name": "Nungambakkam",     "lat": 13.0569, "lng": 80.2425, "crime": 3.0, "light": 8.2, "traffic": 6.5},
    {"area_name": "Chromepet",        "lat": 12.9516, "lng": 80.1462, "crime": 6.0, "light": 5.5, "traffic": 3.5},
    {"area_name": "Porur",            "lat": 13.0382, "lng": 80.1564, "crime": 6.5, "light": 4.5, "traffic": 3.0},
    {"area_name": "Thiruvanmiyur",    "lat": 12.9830, "lng": 80.2594, "crime": 3.5, "light": 7.8, "traffic": 5.5},
    {"area_name": "Broadway",         "lat": 13.0900, "lng": 80.2800, "crime": 5.0, "light": 6.0, "traffic": 9.0},
    {"area_name": "Saidapet",         "lat": 13.0212, "lng": 80.2235, "crime": 4.5, "light": 6.5, "traffic": 5.0},
    {"area_name": "Royapettah",       "lat": 13.0520, "lng": 80.2650, "crime": 3.0, "light": 8.5, "traffic": 7.2},
    {"area_name": "Perambur",         "lat": 13.1150, "lng": 80.2340, "crime": 6.0, "light": 5.0, "traffic": 4.0},
    {"area_name": "Vadapalani",       "lat": 13.0500, "lng": 80.2120, "crime": 3.5, "light": 7.7, "traffic": 6.3},
    {"area_name": "Kodambakkam",      "lat": 13.0520, "lng": 80.2250, "crime": 4.0, "light": 7.0, "traffic": 5.5},
    {"area_name": "Ashok Nagar",      "lat": 13.0386, "lng": 80.2121, "crime": 3.8, "light": 7.2, "traffic": 5.8},
]

POLICE_STATIONS = [
    {"name": "T. Nagar Police Station",       "lat": 13.0410, "lng": 80.2330},
    {"name": "Anna Nagar Police Station",     "lat": 13.0855, "lng": 80.2110},
    {"name": "Adyar Police Station",          "lat": 13.0060, "lng": 80.2560},
    {"name": "Egmore Police Station",         "lat": 13.0730, "lng": 80.2600},
    {"name": "Guindy Police Station",         "lat": 13.0070, "lng": 80.2200},
    {"name": "Tambaram Police Station",       "lat": 12.9250, "lng": 80.1010},
    {"name": "Koyambedu Police Station",      "lat": 13.0690, "lng": 80.1940},
    {"name": "Mylapore Police Station",       "lat": 13.0340, "lng": 80.2680},
    {"name": "Broadway Police Station",       "lat": 13.0905, "lng": 80.2810},
    {"name": "Chromepet Police Station",      "lat": 12.9520, "lng": 80.1470},
]

# Matching the frontend's busStops mock data exactly (same names & coords)
BUS_STOPS = [
    {"name": "T. Nagar Bus Stand",      "lat": 13.0418, "lng": 80.2341, "light": 9.0, "crowd": "high"},
    {"name": "Anna Nagar Depot",        "lat": 13.0850, "lng": 80.2101, "light": 8.5, "crowd": "high"},
    {"name": "Adyar Bus Stop",          "lat": 13.0063, "lng": 80.2574, "light": 7.0, "crowd": "moderate"},
    {"name": "Egmore Station",          "lat": 13.0732, "lng": 80.2609, "light": 9.5, "crowd": "high"},
    {"name": "Guindy Bus Stop",         "lat": 13.0067, "lng": 80.2206, "light": 6.0, "crowd": "moderate"},
    {"name": "Tambaram Bus Stand",      "lat": 12.9249, "lng": 80.1000, "light": 5.0, "crowd": "low"},
    {"name": "Velachery Bus Stop",      "lat": 12.9815, "lng": 80.2180, "light": 7.5, "crowd": "moderate"},
    {"name": "Koyambedu Terminal",      "lat": 13.0694, "lng": 80.1948, "light": 8.0, "crowd": "high"},
    {"name": "Mylapore Bus Stop",       "lat": 13.0339, "lng": 80.2676, "light": 8.8, "crowd": "high"},
    {"name": "Nungambakkam Stop",       "lat": 13.0569, "lng": 80.2425, "light": 8.2, "crowd": "moderate"},
    {"name": "Chromepet Bus Stop",      "lat": 12.9516, "lng": 80.1462, "light": 5.5, "crowd": "low"},
    {"name": "Porur Junction Stop",     "lat": 13.0382, "lng": 80.1564, "light": 4.5, "crowd": "low"},
    {"name": "Thiruvanmiyur Stop",      "lat": 12.9830, "lng": 80.2594, "light": 7.8, "crowd": "moderate"},
    {"name": "Royapettah Bus Stop",     "lat": 13.0520, "lng": 80.2650, "light": 8.5, "crowd": "moderate"},
    {"name": "Saidapet Bus Stop",       "lat": 13.0212, "lng": 80.2235, "light": 6.5, "crowd": "moderate"},
    {"name": "Ashok Nagar Stop",        "lat": 13.0386, "lng": 80.2121, "light": 7.2, "crowd": "moderate"},
    {"name": "Perambur Bus Stop",       "lat": 13.1150, "lng": 80.2340, "light": 5.0, "crowd": "low"},
    {"name": "Vadapalani Bus Stop",     "lat": 13.0500, "lng": 80.2120, "light": 7.7, "crowd": "moderate"},
    {"name": "Kodambakkam Stop",        "lat": 13.0520, "lng": 80.2250, "light": 7.0, "crowd": "moderate"},
    {"name": "Broadway Bus Stand",      "lat": 13.0900, "lng": 80.2800, "light": 6.0, "crowd": "high"},
]

SAMPLE_REPORTS = [
    {"lat": 13.0500, "lng": 80.2300, "type": "Poor lighting",       "desc": "Street lights not working near the park area"},
    {"lat": 13.0350, "lng": 80.2450, "type": "Harassment",          "desc": "Catcalling reported near bus stop in evening hours"},
    {"lat": 13.0700, "lng": 80.2200, "type": "Isolated street",     "desc": "Very few people after 9 PM, feels unsafe"},
    {"lat": 13.0100, "lng": 80.2500, "type": "Suspicious activity", "desc": "Group of people loitering near the alley"},
    {"lat": 13.0600, "lng": 80.2600, "type": "Poor lighting",       "desc": "Entire stretch is dark after sunset"},
    {"lat": 13.0900, "lng": 80.2100, "type": "Isolated street",     "desc": "No shops or houses on this stretch"},
    {"lat": 13.0200, "lng": 80.2700, "type": "Harassment",          "desc": "Eve teasing reported multiple times"},
    {"lat": 13.0450, "lng": 80.2150, "type": "Other",               "desc": "Stray dog menace making area unsafe at night"},
    {"lat": 13.0750, "lng": 80.2400, "type": "Poor lighting",       "desc": "Broken street lights not repaired for weeks"},
    {"lat": 13.0300, "lng": 80.2350, "type": "Suspicious activity", "desc": "Unauthorized construction blocking pathway"},
]


def seed():
    with app.app_context():
        print("🌱 Seeding SafeHer database with Chennai data...")

        SafetyReport.query.delete()
        BusStop.query.delete()
        PoliceStation.query.delete()
        CrimeData.query.delete()
        LightingData.query.delete()
        TrafficData.query.delete()
        Location.query.delete()
        db.session.commit()

        for loc_data in LOCATIONS:
            location = Location(
                latitude=loc_data["lat"],
                longitude=loc_data["lng"],
                area_name=loc_data["area_name"]
            )
            db.session.add(location)
            db.session.flush()
            db.session.add(CrimeData(location_id=location.id, crime_index=loc_data["crime"]))
            db.session.add(LightingData(location_id=location.id, lighting_score=loc_data["light"]))
            db.session.add(TrafficData(location_id=location.id, traffic_activity_score=loc_data["traffic"]))

        print(f"  ✅ {len(LOCATIONS)} Chennai locations seeded")

        for ps in POLICE_STATIONS:
            db.session.add(PoliceStation(name=ps["name"], latitude=ps["lat"], longitude=ps["lng"]))
        print(f"  ✅ {len(POLICE_STATIONS)} police stations seeded")

        for bs in BUS_STOPS:
            db.session.add(BusStop(
                name=bs["name"], latitude=bs["lat"], longitude=bs["lng"],
                lighting_score=bs["light"], crowd_level=bs["crowd"]
            ))
        print(f"  ✅ {len(BUS_STOPS)} bus stops seeded")

        for rep in SAMPLE_REPORTS:
            offset_hours = random.randint(0, 47)
            db.session.add(SafetyReport(
                latitude=rep["lat"], longitude=rep["lng"],
                report_type=rep["type"], description=rep["desc"],
                timestamp=datetime.utcnow() - timedelta(hours=offset_hours),
                user_id=None
            ))
        print(f"  ✅ {len(SAMPLE_REPORTS)} safety reports seeded")

        db.session.commit()
        print("\n🎉 Database seeded! Run: python app.py")


if __name__ == "__main__":
    seed()

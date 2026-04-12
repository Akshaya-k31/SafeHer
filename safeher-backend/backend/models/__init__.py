from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from models.user import User
from models.location import Location
from models.crime import CrimeData
from models.lighting import LightingData
from models.traffic import TrafficData
from models.police import PoliceStation
from models.busstop import BusStop
from models.reports import SafetyReport
from models.route_safety import RouteSafety

from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes.auth_routes import auth_bp
from routes.route_routes import route_bp
from routes.heatmap_routes import heatmap_bp
from routes.report_routes import report_bp
from routes.busstop_routes import busstop_bp
from routes.safety_routes import safety_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=["http://localhost:5173", "http://localhost:3000"], supports_credentials=True)

    db.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(route_bp, url_prefix="/api")
    app.register_blueprint(heatmap_bp, url_prefix="/api")
    app.register_blueprint(report_bp, url_prefix="/api")
    app.register_blueprint(busstop_bp, url_prefix="/api")
    app.register_blueprint(safety_bp, url_prefix="/api")

    with app.app_context():
        db.create_all()

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)

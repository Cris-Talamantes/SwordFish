import json
import os
from functools import wraps

import firebase_admin
from dotenv import load_dotenv
from firebase_admin import auth, credentials, firestore, storage
from flask import Flask, g, jsonify, request
from flask_cors import CORS


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))


def initialize_firebase():
    if firebase_admin._apps:
        return firebase_admin.get_app()

    options = {}
    storage_bucket = os.getenv("FIREBASE_STORAGE_BUCKET")
    if storage_bucket:
        options["storageBucket"] = storage_bucket

    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if service_account_json:
        cred = credentials.Certificate(json.loads(service_account_json))
        return firebase_admin.initialize_app(cred, options)

    credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if credentials_path:
        if not os.path.isabs(credentials_path):
            credentials_path = os.path.join(BASE_DIR, credentials_path)
        cred = credentials.Certificate(credentials_path)
        return firebase_admin.initialize_app(cred, options)

    # Works in Google-hosted environments with application default credentials.
    return firebase_admin.initialize_app(options=options)


def require_firebase_auth(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        scheme, _, token = auth_header.partition(" ")

        if scheme.lower() != "bearer" or not token:
            return jsonify({"error": "Missing Firebase ID token"}), 401

        try:
            decoded_token = auth.verify_id_token(token)
        except Exception:
            return jsonify({"error": "Invalid or expired Firebase ID token"}), 401

        g.firebase_user = decoded_token
        return view(*args, **kwargs)

    return wrapped


def serialize_profile(snapshot):
    profile = snapshot.to_dict() or {}

    for field in ("createdAt", "updatedAt"):
        value = profile.get(field)
        if hasattr(value, "isoformat"):
            profile[field] = value.isoformat()

    return profile


def create_app():
    app = Flask(__name__)

    allowed_origins = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ]
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

    initialize_firebase()
    app.config["FIRESTORE_DB"] = firestore.client()
    app.config["FIREBASE_STORAGE_BUCKET"] = storage.bucket() if os.getenv("FIREBASE_STORAGE_BUCKET") else None

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "swordfish-api"})

    @app.get("/api/auth/session")
    @require_firebase_auth
    def session():
        user = g.firebase_user
        return jsonify(
            {
                "uid": user.get("uid"),
                "email": user.get("email"),
                "emailVerified": user.get("email_verified", False),
            }
        )

    @app.get("/api/profile")
    @require_firebase_auth
    def get_profile():
        uid = g.firebase_user["uid"]
        snapshot = app.config["FIRESTORE_DB"].collection("users").document(uid).get()

        if not snapshot.exists:
            return jsonify({"error": "Profile not found"}), 404

        return jsonify(serialize_profile(snapshot))

    @app.put("/api/profile")
    @require_firebase_auth
    def update_profile():
        uid = g.firebase_user["uid"]
        payload = request.get_json(silent=True) or {}
        allowed_fields = {"fullName", "generalLocation", "profilePhotos"}
        updates = {key: payload[key] for key in allowed_fields if key in payload}

        if "profilePhotos" in updates and not isinstance(updates["profilePhotos"], list):
            return jsonify({"error": "profilePhotos must be an array of URLs"}), 400

        updates["updatedAt"] = firestore.SERVER_TIMESTAMP
        app.config["FIRESTORE_DB"].collection("users").document(uid).set(updates, merge=True)

        return jsonify({"status": "ok"})

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
    )

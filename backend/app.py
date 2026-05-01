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


PUBLIC_PROFILE_FIELDS = {
    "uid",
    "firstName",
    "age",
    "generalLocation",
    "relationshipRole",
    "storyContext",
}


def public_profile(profile):
    public_data = {field: profile.get(field, "") for field in PUBLIC_PROFILE_FIELDS}
    if not public_data.get("firstName") and profile.get("fullName"):
        public_data["firstName"] = str(profile.get("fullName")).split(" ")[0]
    return public_data


def text_matches(value, search_term):
    if not search_term:
        return True
    return search_term.lower() in str(value or "").lower()


def profile_matches(profile, filters):
    if not text_matches(profile.get("firstName"), filters.get("firstName")):
        return False
    if not text_matches(profile.get("generalLocation"), filters.get("generalLocation")):
        return False
    if not text_matches(profile.get("storyContext"), filters.get("storyContext")):
        return False

    relationship_role = filters.get("relationshipRole")
    if relationship_role and profile.get("relationshipRole") != relationship_role:
        return False

    try:
        age = int(profile.get("age")) if profile.get("age") not in (None, "") else None
        search_age = int(filters["age"]) if filters.get("age") else None
    except ValueError:
        return False

    if search_age is not None and (age is None or abs(age - search_age) > 3):
        return False

    return True


def serialize_match_request(snapshot, current_uid, db):
    request_data = snapshot.to_dict() or {}
    request_data["id"] = snapshot.id
    request_data["direction"] = "incoming" if request_data.get("toUid") == current_uid else "outgoing"

    from_uid = request_data.get("fromUid")
    to_uid = request_data.get("toUid")
    other_uid = from_uid if to_uid == current_uid else to_uid
    if from_uid:
        from_snapshot = db.collection("users").document(from_uid).get()
        request_data["fromProfile"] = public_profile(from_snapshot.to_dict() or {}) if from_snapshot.exists else None
    if other_uid:
        other_snapshot = db.collection("users").document(other_uid).get()
        request_data["otherProfile"] = public_profile(other_snapshot.to_dict() or {}) if other_snapshot.exists else None

    verification = request_data.get("verification") or {}
    current_step = verification.get(current_uid) or {}
    other_step = verification.get(other_uid) or {}
    request_data["myVerification"] = current_step
    request_data["otherVerification"] = {
        "question": other_step.get("question", ""),
        "answer": other_step.get("answer", ""),
        "hasAnswered": bool(other_step.get("answer")),
        "confirmed": bool(other_step.get("confirmed")),
    }

    for field in ("createdAt", "updatedAt"):
        value = request_data.get(field)
        if hasattr(value, "isoformat"):
            request_data[field] = value.isoformat()

    return request_data


def get_match_for_user(db, request_id, uid):
    request_ref = db.collection("matchRequests").document(request_id)
    snapshot = request_ref.get()

    if not snapshot.exists:
        return None, None, (jsonify({"error": "Match request not found"}), 404)

    request_data = snapshot.to_dict() or {}
    if uid not in {request_data.get("fromUid"), request_data.get("toUid")}:
        return None, None, (jsonify({"error": "You are not part of this match request"}), 403)

    return request_ref, request_data, None


def other_match_uid(request_data, uid):
    return request_data.get("toUid") if request_data.get("fromUid") == uid else request_data.get("fromUid")


def maybe_unlock_chat(request_ref, request_data):
    verification = request_data.get("verification") or {}
    from_confirmed = bool((verification.get(request_data.get("fromUid")) or {}).get("confirmed"))
    to_confirmed = bool((verification.get(request_data.get("toUid")) or {}).get("confirmed"))

    if from_confirmed and to_confirmed:
        request_ref.update({"status": "chat", "updatedAt": firestore.SERVER_TIMESTAMP})
        return "chat"

    return request_data.get("status")


def delete_collection_documents(collection_ref, batch_size=100):
    deleted = 0
    docs = list(collection_ref.limit(batch_size).stream())

    while docs:
        for doc_snapshot in docs:
            doc_snapshot.reference.delete()
            deleted += 1
        docs = list(collection_ref.limit(batch_size).stream())

    return deleted


def create_app():
    app = Flask(__name__)

    allowed_origins = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ]
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

    @app.after_request
    def add_api_cors_headers(response):
        origin = request.headers.get("Origin")
        if request.path.startswith("/api/") and origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Vary"] = "Origin"
            response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        return response

    initialize_firebase()
    app.config["FIRESTORE_DB"] = firestore.client()
    app.config["FIREBASE_STORAGE_BUCKET"] = storage.bucket() if os.getenv("FIREBASE_STORAGE_BUCKET") else None

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "misma-luna-api"})

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
        allowed_fields = {
            "fullName",
            "firstName",
            "age",
            "generalLocation",
            "relationshipRole",
            "storyContext",
        }
        updates = {key: payload[key] for key in allowed_fields if key in payload}

        updates["updatedAt"] = firestore.SERVER_TIMESTAMP
        app.config["FIRESTORE_DB"].collection("users").document(uid).set(updates, merge=True)

        return jsonify({"status": "ok"})

    @app.get("/api/users/search")
    @require_firebase_auth
    def search_users():
        uid = g.firebase_user["uid"]
        filters = {
            key: request.args.get(key, "").strip()
            for key in (
                "firstName",
                "generalLocation",
                "age",
                "relationshipRole",
                "storyContext",
            )
        }

        db = app.config["FIRESTORE_DB"]
        matches = []

        for snapshot in db.collection("users").limit(100).stream():
            profile = snapshot.to_dict() or {}
            if profile.get("uid") == uid:
                continue
            if profile_matches(profile, filters):
                matches.append(public_profile(profile))

        return jsonify({"users": matches})

    @app.post("/api/match-requests")
    @require_firebase_auth
    def create_match_request():
        uid = g.firebase_user["uid"]
        payload = request.get_json(silent=True) or {}
        to_uid = payload.get("toUid")
        message = str(payload.get("message", "")).strip()

        if not to_uid or to_uid == uid:
            return jsonify({"error": "Choose another user to request a match with"}), 400

        db = app.config["FIRESTORE_DB"]
        recipient = db.collection("users").document(to_uid).get()
        if not recipient.exists:
            return jsonify({"error": "User not found"}), 404

        existing = (
            db.collection("matchRequests")
            .where("fromUid", "==", uid)
            .where("toUid", "==", to_uid)
            .where("status", "==", "pending")
            .limit(1)
            .stream()
        )
        if any(existing):
            return jsonify({"error": "A pending request already exists"}), 409

        request_ref = db.collection("matchRequests").document()
        request_ref.set(
            {
                "fromUid": uid,
                "toUid": to_uid,
                "message": message,
                "status": "pending",
                "verification": {
                    uid: {"question": "", "answer": "", "confirmed": False},
                    to_uid: {"question": "", "answer": "", "confirmed": False},
                },
                "createdAt": firestore.SERVER_TIMESTAMP,
                "updatedAt": firestore.SERVER_TIMESTAMP,
            }
        )

        return jsonify({"id": request_ref.id, "status": "pending"}), 201

    @app.get("/api/match-requests")
    @require_firebase_auth
    def list_match_requests():
        uid = g.firebase_user["uid"]
        db = app.config["FIRESTORE_DB"]
        requests_by_id = {}

        for snapshot in db.collection("matchRequests").where("toUid", "==", uid).stream():
            requests_by_id[snapshot.id] = serialize_match_request(snapshot, uid, db)

        for snapshot in db.collection("matchRequests").where("fromUid", "==", uid).stream():
            requests_by_id[snapshot.id] = serialize_match_request(snapshot, uid, db)

        requests = sorted(
            requests_by_id.values(),
            key=lambda item: item.get("createdAt", ""),
            reverse=True,
        )
        return jsonify({"requests": requests})

    @app.patch("/api/match-requests/<request_id>")
    @require_firebase_auth
    def respond_to_match_request(request_id):
        uid = g.firebase_user["uid"]
        payload = request.get_json(silent=True) or {}
        status = payload.get("status")

        if status not in {"accepted", "rejected"}:
            return jsonify({"error": "Status must be accepted or rejected"}), 400

        db = app.config["FIRESTORE_DB"]
        request_ref = db.collection("matchRequests").document(request_id)
        snapshot = request_ref.get()

        if not snapshot.exists:
            return jsonify({"error": "Match request not found"}), 404

        request_data = snapshot.to_dict() or {}
        if request_data.get("toUid") != uid:
            return jsonify({"error": "Only the recipient can respond to this request"}), 403

        next_status = "verification" if status == "accepted" else "rejected"
        request_ref.update({"status": next_status, "updatedAt": firestore.SERVER_TIMESTAMP})
        return jsonify({"status": next_status})

    @app.post("/api/match-requests/<request_id>/question")
    @require_firebase_auth
    def submit_verification_question(request_id):
        uid = g.firebase_user["uid"]
        payload = request.get_json(silent=True) or {}
        question = str(payload.get("question", "")).strip()

        if not question:
            return jsonify({"error": "Question is required"}), 400

        db = app.config["FIRESTORE_DB"]
        request_ref, request_data, error = get_match_for_user(db, request_id, uid)
        if error:
            return error
        if request_data.get("status") != "verification":
            return jsonify({"error": "Questions can only be added during verification"}), 400

        request_ref.update(
            {
                f"verification.{uid}.question": question,
                f"verification.{uid}.confirmed": False,
                "updatedAt": firestore.SERVER_TIMESTAMP,
            }
        )
        return jsonify({"status": "ok"})

    @app.post("/api/match-requests/<request_id>/answer")
    @require_firebase_auth
    def submit_verification_answer(request_id):
        uid = g.firebase_user["uid"]
        payload = request.get_json(silent=True) or {}
        answer = str(payload.get("answer", "")).strip()

        if not answer:
            return jsonify({"error": "Answer is required"}), 400

        db = app.config["FIRESTORE_DB"]
        request_ref, request_data, error = get_match_for_user(db, request_id, uid)
        if error:
            return error
        if request_data.get("status") != "verification":
            return jsonify({"error": "Answers can only be added during verification"}), 400

        other_uid = other_match_uid(request_data, uid)
        other_question = ((request_data.get("verification") or {}).get(other_uid) or {}).get("question")
        if not other_question:
            return jsonify({"error": "The other person has not asked their question yet"}), 400

        request_ref.update(
            {
                f"verification.{uid}.answer": answer,
                f"verification.{uid}.confirmed": False,
                "updatedAt": firestore.SERVER_TIMESTAMP,
            }
        )
        return jsonify({"status": "ok"})

    @app.post("/api/match-requests/<request_id>/confirm")
    @require_firebase_auth
    def confirm_verification_match(request_id):
        uid = g.firebase_user["uid"]
        db = app.config["FIRESTORE_DB"]
        request_ref, request_data, error = get_match_for_user(db, request_id, uid)
        if error:
            return error
        if request_data.get("status") != "verification":
            return jsonify({"error": "This match is not in verification"}), 400

        verification = request_data.get("verification") or {}
        my_step = verification.get(uid) or {}
        other_uid = other_match_uid(request_data, uid)
        other_step = verification.get(other_uid) or {}

        if not my_step.get("question"):
            return jsonify({"error": "Ask your verification question first"}), 400
        if not my_step.get("answer"):
            return jsonify({"error": "Answer the other person's question first"}), 400
        if not other_step.get("answer"):
            return jsonify({"error": "Wait for the other person to answer your question"}), 400

        request_ref.update(
            {
                f"verification.{uid}.confirmed": True,
                "updatedAt": firestore.SERVER_TIMESTAMP,
            }
        )

        request_data.setdefault("verification", {}).setdefault(uid, {})["confirmed"] = True
        next_status = maybe_unlock_chat(request_ref, request_data)
        return jsonify({"status": next_status})

    @app.get("/api/chats")
    @require_firebase_auth
    def list_chats():
        uid = g.firebase_user["uid"]
        db = app.config["FIRESTORE_DB"]
        chats = []

        for field in ("fromUid", "toUid"):
            for snapshot in (
                db.collection("matchRequests")
                .where(field, "==", uid)
                .where("status", "==", "chat")
                .stream()
            ):
                chat_data = snapshot.to_dict() or {}
                if not (chat_data.get("leftBy") or {}).get(uid):
                    chats.append(serialize_match_request(snapshot, uid, db))

        unique_chats = {chat["id"]: chat for chat in chats}
        return jsonify({"chats": list(unique_chats.values())})

    @app.get("/api/chats/<request_id>/messages")
    @require_firebase_auth
    def list_chat_messages(request_id):
        uid = g.firebase_user["uid"]
        db = app.config["FIRESTORE_DB"]
        _, request_data, error = get_match_for_user(db, request_id, uid)
        if error:
            return error
        if request_data.get("status") != "chat":
            return jsonify({"error": "Chat is locked until both people confirm the match"}), 403

        messages = []
        for snapshot in (
            db.collection("matchRequests")
            .document(request_id)
            .collection("messages")
            .order_by("createdAt")
            .limit(100)
            .stream()
        ):
            message = snapshot.to_dict() or {}
            message["id"] = snapshot.id
            created_at = message.get("createdAt")
            if hasattr(created_at, "isoformat"):
                message["createdAt"] = created_at.isoformat()
            messages.append(message)

        return jsonify({"messages": messages})

    @app.post("/api/chats/<request_id>/messages")
    @require_firebase_auth
    def create_chat_message(request_id):
        uid = g.firebase_user["uid"]
        payload = request.get_json(silent=True) or {}
        text = str(payload.get("text", "")).strip()

        if not text:
            return jsonify({"error": "Message is required"}), 400

        db = app.config["FIRESTORE_DB"]
        _, request_data, error = get_match_for_user(db, request_id, uid)
        if error:
            return error
        if request_data.get("status") != "chat":
            return jsonify({"error": "Chat is locked until both people confirm the match"}), 403

        message_ref = db.collection("matchRequests").document(request_id).collection("messages").document()
        message_ref.set(
            {
                "senderUid": uid,
                "text": text,
                "createdAt": firestore.SERVER_TIMESTAMP,
            }
        )
        return jsonify({"id": message_ref.id, "status": "sent"}), 201

    @app.post("/api/chats/<request_id>/block")
    @require_firebase_auth
    def block_chat_account(request_id):
        uid = g.firebase_user["uid"]
        db = app.config["FIRESTORE_DB"]
        request_ref, request_data, error = get_match_for_user(db, request_id, uid)
        if error:
            return error

        request_ref.update(
            {
                f"blockedBy.{uid}": other_match_uid(request_data, uid),
                f"leftBy.{uid}": True,
                "updatedAt": firestore.SERVER_TIMESTAMP,
            }
        )
        return jsonify({"status": "blocked"})

    @app.post("/api/chats/<request_id>/leave")
    @require_firebase_auth
    def leave_chat(request_id):
        uid = g.firebase_user["uid"]
        db = app.config["FIRESTORE_DB"]
        request_ref, _, error = get_match_for_user(db, request_id, uid)
        if error:
            return error

        request_ref.update(
            {
                f"leftBy.{uid}": True,
                "updatedAt": firestore.SERVER_TIMESTAMP,
            }
        )
        return jsonify({"status": "left"})

    @app.delete("/api/account")
    @require_firebase_auth
    def delete_account():
        uid = g.firebase_user["uid"]
        db = app.config["FIRESTORE_DB"]
        deleted_match_requests = set()

        for field in ("fromUid", "toUid"):
            for snapshot in db.collection("matchRequests").where(field, "==", uid).stream():
                if snapshot.id in deleted_match_requests:
                    continue
                delete_collection_documents(snapshot.reference.collection("messages"))
                snapshot.reference.delete()
                deleted_match_requests.add(snapshot.id)

        db.collection("users").document(uid).delete()

        auth_deleted = True
        auth_delete_error = ""
        try:
            auth.delete_user(uid)
        except Exception as error:
            auth_deleted = False
            auth_delete_error = str(error)

        return jsonify(
            {
                "status": "deleted",
                "deletedMatchRequests": len(deleted_match_requests),
                "authDeleted": auth_deleted,
                "authDeleteError": auth_delete_error,
            }
        )

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
    )

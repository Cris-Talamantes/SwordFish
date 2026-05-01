# Misma Luna

Misma Luna is a missing-relative finder foundation for reconnecting families. It is not a dating app.

## Stack

- Frontend: React, Vite, React Router, Firebase client SDK, Axios
- Backend: Flask, Firebase Admin SDK
- Auth: Firebase Auth
- Database: Firebase Firestore
- Storage: Firebase Storage

## Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Fill in the `VITE_FIREBASE_*` values from your Firebase web app settings.

Local API calls use the Vite dev proxy: requests to `/api/*` forward to `http://localhost:5000`. You usually do **not** need `VITE_API_URL` unless you point the UI at a remote API.

## Backend setup

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # Windows
pip install -r requirements.txt
copy .env.example .env
python app.py
```

Set either `GOOGLE_APPLICATION_CREDENTIALS` to a Firebase service account JSON file path or `FIREBASE_SERVICE_ACCOUNT_JSON` to the raw service account JSON string.

## Deploy on Vercel (frontend + Flask API)

1. Push this repo to GitHub (or connect your Git provider).
2. In [Vercel](https://vercel.com), **Import** the repository. Keep the **project root** at the repo root (where `vercel.json` lives).
3. Use the default **Other** / **Vite** framework preset, or **Other** with build settings taken from `vercel.json`. Do **not** require the **Services** preset for this repo.
4. `vercel.json` builds the Vite app from `frontend/`, serves `frontend/dist`, and routes `/api` to the Python serverless entry `api/index.py` (Flask app from `backend/`). Root `requirements.txt` mirrors `backend/requirements.txt` for the serverless runtime. The browser calls same-origin `/api/...` (leave `VITE_API_URL` unset on Vercel).

### Environment variables (Vercel → Project → Settings → Environment Variables)

**Python / Flask (Production + Preview as needed)**

| Name | Required | Notes |
|------|----------|--------|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Yes | Full JSON object as a **single-line** string (paste minified JSON). Do not commit this file to git. |
| `FIREBASE_STORAGE_BUCKET` | Recommended | e.g. `your-project-id.appspot.com` |
| `CORS_ORIGINS` | Yes | Comma-separated origins, e.g. `https://your-app.vercel.app,http://localhost:5173` |

**Frontend (build-time — prefix `VITE_`)**

| Name | Required | Notes |
|------|----------|--------|
| `VITE_FIREBASE_API_KEY` | Yes | From Firebase console web app config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | |
| `VITE_FIREBASE_PROJECT_ID` | Yes | |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | |
| `VITE_FIREBASE_APP_ID` | Yes | |
| `VITE_FIREBASE_MEASUREMENT_ID` | No | Optional Analytics |
| `VITE_API_URL` | No | Leave **unset** on Vercel so the browser uses same-origin `/api` (rewritten to the Flask function). Set only if the API is hosted on another origin. |

After the first deploy, add your real production URL to `CORS_ORIGINS` and redeploy.

### Hybrid fallback

If the Python function fails to build or route on Vercel, deploy the **frontend only** on Vercel (build `frontend`, output `frontend/dist`) and run the Flask API on Railway, Render, Fly.io, or Cloud Run. Then set `VITE_API_URL` to that API’s public origin and include it in `CORS_ORIGINS`.

## Current foundation

- Public pages: landing, login, signup, privacy policy, terms of use
- Protected pages: dashboard, profile, people search, match requests, notifications, chat
- React protected routing
- Firebase Auth client setup
- Firestore user profiles under `users/{uid}` with public discovery fields (client writes profile; match data via API only)
- Axios client that sends Firebase ID tokens to Flask (same-origin `/api` on Vercel)
- Flask protected API routes that verify Firebase ID tokens
- Backend profile search that returns public profile fields only
- Match request create / list / accept / reject, verification flow, chat after mutual confirm

## Firebase rules

Starter rules are included in `firestore.rules` and `storage.rules`. Match request documents are **not** writable from the client SDK (API-only). Apply updated rules in Firebase Console or with the Firebase CLI before testing.

## Legal / safety copy

In-product disclaimers and stub **Privacy** and **Terms** pages are meant for hackathon demos. Have qualified counsel review anything intended for real users.

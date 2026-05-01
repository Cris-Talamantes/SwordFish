# Misma Luna

Misma Luna is a missing-relative finder foundation for reconnecting families. It is not a dating app.

## Stack

- Frontend: React, Vite, React Router, Firebase client SDK, Axios
- Backend: Flask, Firebase Admin SDK for local API development
- Auth: Firebase Auth
- Database: Firebase Firestore
- Storage: Firebase Storage
- Hosting: Firebase Hosting

## Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Fill in the `VITE_FIREBASE_*` values from your Firebase web app settings.

Local API calls use the Vite dev proxy: requests to `/api/*` forward to the local Flask API. You usually do not need `VITE_API_URL` unless you point the UI at a separate API origin.

## Backend Setup

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
python app.py
```

Set either `FIREBASE_SERVICE_ACCOUNT_PATH` to a Firebase service account JSON file path or `FIREBASE_SERVICE_ACCOUNT_JSON` to the raw service account JSON string.

## Deploy To Firebase Hosting

Python functions deployment requires a local Python 3.12 install and a virtualenv at `functions_deploy/venv`.

```bash
cd functions_deploy
python -m venv venv
.\venv\Scripts\activate
python -m pip install -r requirements.txt
cd ..
```

Build the frontend first:

```bash
cd frontend
npm install
npm run build
```

Then deploy from the repo root:

```bash
cd ..
firebase deploy --only "functions,hosting"
```

Firebase Hosting serves `frontend/dist` according to `firebase.json`. The current hosting config rewrites all routes to `/index.html` so React Router works on refresh.

## Current Foundation

- Public pages: landing, login, signup, privacy policy, terms of use
- Protected pages: dashboard, profile, people search, match requests, notifications, chat
- React protected routing
- Firebase Auth client setup
- Firestore user profiles under `users/{uid}` with public discovery fields
- Axios client that sends Firebase ID tokens to the Flask API during local development
- Flask protected API routes that verify Firebase ID tokens
- Backend profile search that returns public profile fields only
- Match request create / list / accept / reject, verification flow, chat after mutual confirm

## Firebase Rules

Starter rules are included in `firestore.rules` and `storage.rules`. Apply updated rules in Firebase Console or with the Firebase CLI before testing.

## Legal / Safety Copy

In-product disclaimers and stub Privacy and Terms pages are meant for hackathon demos. Have qualified counsel review anything intended for real users.

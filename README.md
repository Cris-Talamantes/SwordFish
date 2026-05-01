# SwordFish

SwordFish is a missing-relative finder foundation for reconnecting families. It is not a dating app.

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

## Backend setup

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
python app.py
```

Set either `GOOGLE_APPLICATION_CREDENTIALS` to a Firebase service account JSON file path or `FIREBASE_SERVICE_ACCOUNT_JSON` to the raw service account JSON.

## Current foundation

- Public pages: landing, login, signup
- Protected placeholders: dashboard, profile, create report, search reports, match requests, notifications, chat
- React protected routing
- Firebase Auth client setup
- Firestore user profiles under `users/{uid}`
- Firebase Storage profile photo uploads under `users/{uid}/profilePhotos`
- Axios client that sends Firebase ID tokens to Flask
- Flask protected API routes that verify Firebase ID tokens

## Firebase rules

Starter rules are included in `firestore.rules` and `storage.rules`. Apply them in Firebase Console or with the Firebase CLI before testing profile creation and photo uploads.

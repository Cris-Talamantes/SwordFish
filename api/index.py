"""
Vercel serverless entry: exposes the Flask WSGI app from backend/app.py.
Environment variables are injected by Vercel (FIREBASE_SERVICE_ACCOUNT_JSON, etc.).
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

_backend = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(_backend))
os.chdir(str(_backend))

try:
    from dotenv import load_dotenv

    load_dotenv(_backend / ".env")
except ImportError:
    pass

from app import app  # noqa: E402

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchSession } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function DashboardPage() {
  const { profile, profileLoading } = useAuth();
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSession()
      .then(setSession)
      .catch(() => setError("We could not reach the API. If you are running locally, start the Flask backend on port 5000."));
  }, []);

  const displayName = profile?.firstName || profile?.fullName || "Welcome";

  return (
    <section className="dashboard-page">
      <div className="page-heading">
        <p className="eyebrow">Home</p>
        <h1>{profileLoading ? "Loading…" : `${displayName}`}</h1>
        <p>
          Your dashboard is a calm starting point. Search when you feel ready, review requests privately, and chat only
          after both sides confirm.
        </p>
      </div>

      <div className="dashboard-grid">
        <Link className="dash-card motion-surface motion-card" to="/search">
          <h2>Search</h2>
          <p>Look for someone using general details — no street-level precision required.</p>
          <span className="dash-card-cta">Open search →</span>
        </Link>
        <Link className="dash-card motion-surface motion-card" to="/match-requests">
          <h2>Match requests</h2>
          <p>Accept or decline incoming requests; complete verification when you feel safe.</p>
          <span className="dash-card-cta">Review requests →</span>
        </Link>
        <Link className="dash-card motion-surface motion-card" to="/chat">
          <h2>Chat</h2>
          <p>Appears here only after mutual acceptance and verification steps.</p>
          <span className="dash-card-cta">Open chat →</span>
        </Link>
        <Link className="dash-card motion-surface motion-card" to="/profile">
          <h2>Profile</h2>
          <p>Update what others can use to recognize you — keep sensitive details offline.</p>
          <span className="dash-card-cta">Edit profile →</span>
        </Link>
      </div>

      <div className={`status-panel motion-surface ${session ? "status-panel-ok" : ""}`}>
        {session ? (
          <span>
            Connected to the API as <strong>{session.email ?? session.uid}</strong>. Firebase tokens are verified on the
            server before data changes.
          </span>
        ) : (
          <span>{error || "Checking API connection…"}</span>
        )}
      </div>

      <aside className="safety-callout safety-callout-muted motion-surface" role="note">
        <h2 className="safety-callout-title">A gentle reminder</h2>
        <p>
          SwordFish cannot promise someone is who they say they are. Share personal information slowly. If anyone pressures
          you for money or documents, pause and seek trusted offline help.
        </p>
      </aside>
    </section>
  );
}

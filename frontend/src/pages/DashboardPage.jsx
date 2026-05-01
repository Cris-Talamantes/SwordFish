import { useEffect, useState } from "react";

import { fetchSession } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import PlaceholderPage from "./PlaceholderPage.jsx";

export default function DashboardPage() {
  const { profile, profileLoading } = useAuth();
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSession()
      .then(setSession)
      .catch(() => setError("Unable to verify your backend session yet."));
  }, []);

  return (
    <PlaceholderPage
      title="Dashboard"
      description="Your future family search workspace will live here."
    >
      <div className="profile-summary">
        <h2>{profile?.firstName || profile?.fullName || "Welcome"}</h2>
        <p>{profileLoading ? "Loading profile..." : profile?.email}</p>
      </div>
      <div className="status-panel">
        {session ? (
          <span>Backend token verification is connected for {session.email ?? session.uid}.</span>
        ) : (
          <span>{error || "Checking backend token verification..."}</span>
        )}
      </div>
    </PlaceholderPage>
  );
}

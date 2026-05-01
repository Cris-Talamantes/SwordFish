import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext.jsx";
import { updateUserProfile, uploadProfilePhotos } from "../services/profileService.js";

export default function ProfilePage() {
  const { currentUser, profile, profileLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [generalLocation, setGeneralLocation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? "");
      setGeneralLocation(profile.generalLocation ?? "");
    }
  }, [profile]);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    try {
      await updateUserProfile(currentUser.uid, {
        fullName: fullName.trim(),
        generalLocation: generalLocation.trim(),
      });
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(event) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setMessage("");
    setError("");
    setUploading(true);

    try {
      await uploadProfilePhotos(currentUser.uid, files);
      setMessage("Profile photos uploaded.");
      event.target.value = "";
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  if (profileLoading) {
    return <div className="status-panel">Loading profile...</div>;
  }

  return (
    <section className="profile-page">
      <div className="page-heading">
        <p className="eyebrow">User profile</p>
        <h1>Profile</h1>
        <p>Manage the identity details and photos attached to your family search account.</p>
      </div>

      <form className="profile-form" onSubmit={handleProfileSubmit}>
        <label>
          Full name
          <input
            onChange={(event) => setFullName(event.target.value)}
            required
            type="text"
            value={fullName}
          />
        </label>
        <label>
          Email
          <input disabled type="email" value={profile?.email ?? currentUser.email ?? ""} />
        </label>
        <label>
          General location
          <input
            onChange={(event) => setGeneralLocation(event.target.value)}
            placeholder="City, state, or region"
            type="text"
            value={generalLocation}
          />
        </label>
        <button className="button primary" disabled={saving} type="submit">
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>

      <section className="photo-section">
        <h2>Profile photos</h2>
        <label className="file-control">
          Upload photos
          <input accept="image/*" multiple onChange={handlePhotoUpload} type="file" />
        </label>
        {uploading && <p>Uploading photos...</p>}
        {message && <p className="form-success">{message}</p>}
        {error && <p className="form-error">{error}</p>}

        <div className="photo-grid">
          {(profile?.profilePhotos ?? []).map((photoUrl) => (
            <img key={photoUrl} src={photoUrl} alt="Profile upload" />
          ))}
        </div>
      </section>
    </section>
  );
}

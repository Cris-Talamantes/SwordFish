import { useEffect, useState } from "react";

import { deleteAccountAndData } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { updateUserProfile } from "../services/profileService.js";

export default function ProfilePage() {
  const { currentUser, logout, profile, profileLoading } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [age, setAge] = useState("");
  const [generalLocation, setGeneralLocation] = useState("");
  const [relationshipRole, setRelationshipRole] = useState("");
  const [storyContext, setStoryContext] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? profile.fullName?.split(" ")[0] ?? "");
      setAge(profile.age ?? "");
      setGeneralLocation(profile.generalLocation ?? "");
      setRelationshipRole(profile.relationshipRole ?? "");
      setStoryContext(profile.storyContext ?? profile.bio ?? "");
    }
  }, [profile]);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    try {
      await updateUserProfile(currentUser.uid, {
        firstName: firstName.trim(),
        age: age === "" ? "" : Number(age),
        generalLocation: generalLocation.trim(),
        relationshipRole,
        storyContext: storyContext.trim(),
      });
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Delete your account and profile data? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await deleteAccountAndData();
      try {
        await logout();
      } catch {
        // The backend may have already removed the Firebase Auth user.
      }
      window.location.assign("/");
    } catch (err) {
      setError(err.response?.data?.error ?? err.message);
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
        <p>Manage the details people can use to recognize you in search.</p>
      </div>

      <form className="profile-form" onSubmit={handleProfileSubmit}>
        <div className="form-section-heading">
          <h2>Public matchable info</h2>
          <p>These soft details help people recognize you without exposing too much.</p>
        </div>
        <label>
          First name or nickname
          <input
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="First name only"
            type="text"
            value={firstName}
          />
        </label>
        <label>
          Email
          <input disabled type="email" value={profile?.email ?? currentUser.email ?? ""} />
        </label>
        <label>
          Approximate age
          <input
            min="0"
            onChange={(event) => setAge(event.target.value)}
            type="number"
            value={age}
          />
        </label>
        <label>
          Who are you in the family?
          <select onChange={(event) => setRelationshipRole(event.target.value)} value={relationshipRole}>
            <option value="">Choose one</option>
            <option value="sister">Sister</option>
            <option value="brother">Brother</option>
            <option value="mother">Mother</option>
            <option value="father">Father</option>
            <option value="daughter">Daughter</option>
            <option value="son">Son</option>
            <option value="aunt">Aunt</option>
            <option value="uncle">Uncle</option>
            <option value="cousin">Cousin</option>
            <option value="grandparent">Grandparent</option>
            <option value="other">Other relative</option>
          </select>
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
        <label>
          General story or context
          <textarea
            onChange={(event) => setStoryContext(event.target.value)}
            placeholder="Separated in 2005 in El Paso, worked at X place together, etc."
            rows="4"
            value={storyContext}
          />
        </label>

        <button className="button primary" disabled={saving} type="submit">
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>

      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error">{error}</p>}

      <section className="danger-zone">
        <h2>Delete account and data</h2>
        <p>Remove your account, profile, match requests, and chat data from Misma Luna.</p>
        <button className="button danger" onClick={handleDeleteAccount} type="button">
          Delete my account
        </button>
      </section>
    </section>
  );
}

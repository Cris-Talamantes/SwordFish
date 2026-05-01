import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { getFirebaseAuthMessage } from "../utils/firebaseErrors.js";

export default function SignupPage() {
  const { currentUser, signup } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [generalLocation, setGeneralLocation] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signup(email, password, fullName, generalLocation);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getFirebaseAuthMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        <label>
          Full name
          <input
            autoComplete="name"
            onChange={(event) => setFullName(event.target.value)}
            type="text"
            value={fullName}
          />
        </label>
        <label>
          Email
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label>
          General location
          <input
            autoComplete="address-level2"
            onChange={(event) => setGeneralLocation(event.target.value)}
            placeholder="City, state, or region"
            type="text"
            value={generalLocation}
          />
        </label>
        <label>
          Password
          <input
            autoComplete="new-password"
            minLength="6"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="button primary" disabled={submitting} type="submit">
          {submitting ? "Creating..." : "Sign up"}
        </button>
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </section>
  );
}

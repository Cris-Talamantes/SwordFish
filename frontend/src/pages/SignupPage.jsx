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
  const [agreeAge, setAgreeAge] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!agreeAge || !agreeTerms) {
      setError("Please confirm you are 18 or older and accept the Terms and Privacy Policy.");
      return;
    }

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
      <form className="auth-form motion-surface" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        <p className="auth-lead">
          SwordFish is for people searching for relatives or responding to a search. Take your time — you stay in control of
          who you connect with.
        </p>
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
            placeholder="City, state, or region — avoid exact addresses"
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

        <fieldset className="consent-fieldset">
          <legend className="sr-only">Consent</legend>
          <label className="consent-row">
            <input checked={agreeAge} onChange={(event) => setAgreeAge(event.target.checked)} type="checkbox" />
            <span>I am 18 or older.</span>
          </label>
          <label className="consent-row">
            <input checked={agreeTerms} onChange={(event) => setAgreeTerms(event.target.checked)} type="checkbox" />
            <span>
              I agree to the{" "}
              <Link className="inline-link" to="/terms">
                Terms
              </Link>{" "}
              and{" "}
              <Link className="inline-link" to="/privacy">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        </fieldset>

        {error && <p className="form-error">{error}</p>}
        <button className="button primary motion-button" disabled={submitting} type="submit">
          {submitting ? "Creating..." : "Sign up"}
        </button>
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </section>
  );
}

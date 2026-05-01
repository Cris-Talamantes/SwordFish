import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { getFirebaseAuthMessage } from "../utils/firebaseErrors.js";

export default function LoginPage() {
  const { currentUser, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const destination = location.state?.from?.pathname ?? "/dashboard";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(destination, { replace: true });
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
        <h1>Log in</h1>
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
          Password
          <input
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="button primary" disabled={submitting} type="submit">
          {submitting ? "Logging in..." : "Log in"}
        </button>
        <p>
          Need an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </section>
  );
}

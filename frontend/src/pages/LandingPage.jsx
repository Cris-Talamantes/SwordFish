import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <section className="landing-layout">
      <div className="landing-copy">
        <p className="eyebrow">Missing-relative finder</p>
        <h1>Reconnect families with care, consent, and clarity.</h1>
        <p>
          SwordFish helps people organize trusted reports and begin the process of
          finding missing family members, lost relatives, or disconnected relatives.
        </p>
        <div className="action-row">
          <Link className="button primary" to="/signup">
            Create account
          </Link>
          <Link className="button secondary" to="/login">
            Log in
          </Link>
        </div>
      </div>
      <div className="mission-panel" aria-label="Mission statement">
        <h2>Family search only</h2>
        <p>
          This foundation is intentionally built for family reconnection workflows.
          It is not a dating app, social feed, or casual discovery product.
        </p>
      </div>
    </section>
  );
}

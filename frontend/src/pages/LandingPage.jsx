import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="landing-stack">
      <section className="landing-layout">
        <div className="landing-copy">
          <p className="eyebrow">Missing-relative finder · Borderland impact</p>
          <h1 className="motion-text">Reconnect with care, consent, and patience.</h1>
          <p>
            Misma Luna supports people who may have been separated by deportation, migration, or displacement — and loved
            ones searching for them. Nothing moves forward unless <strong>both sides choose to engage</strong>.
          </p>
          <p className="landing-soft">
            We don&apos;t verify identities or legal status. We offer a gentle space to explore whether someone might be the
            relative you remember — at your pace.
          </p>
          <div className="action-row">
            <Link className="button primary motion-button" to="/signup">
              Create account
            </Link>
            <Link className="button secondary motion-button" to="/login">
              Log in
            </Link>
          </div>
        </div>
        <aside className="mission-panel motion-surface" aria-label="How it works">
          <h2>How matching works</h2>
          <ol className="mission-steps">
            <li>Create a profile with general details others might recognize.</li>
            <li>Someone sends a connection request — you accept or decline.</li>
            <li>If you accept, you both answer careful prompts before chat unlocks.</li>
          </ol>
          <p className="mission-note">
            Family search only — not a dating app or open social feed. If you are in immediate danger, contact local
            emergency services, not this website.
          </p>
        </aside>
      </section>

      <aside className="safety-callout motion-surface" role="note">
        <h2 className="safety-callout-title">Safety first</h2>
        <p>
          Never send money, passwords, or copies of official IDs to someone you have not independently verified. Avoid
          sharing street addresses or detailed travel plans in early messages. Use{" "}
          <strong>Leave chat</strong> or <strong>Block</strong> if something feels wrong — organizers can only offer limited
          moderation during demos.
        </p>
        <p className="safety-callout-links">
          <Link className="inline-link" to="/terms">
            Terms
          </Link>
          {" · "}
          <Link className="inline-link" to="/privacy">
            Privacy
          </Link>
        </p>
      </aside>
    </div>
  );
}

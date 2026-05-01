import { Link } from "react-router-dom";

const DISCORD_URL = "https://discord.com/invite/SPr9g86a4F";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <span className="site-footer-title">Misma Luna</span>
          <p className="site-footer-tagline">Family reconnection with consent — not a dating service.</p>
        </div>
        <nav className="site-footer-nav" aria-label="Footer">
          <Link className="site-footer-link" to="/privacy">
            Privacy
          </Link>
          <Link className="site-footer-link" to="/terms">
            Terms
          </Link>
          <a className="site-footer-link" href={DISCORD_URL} rel="noreferrer" target="_blank">
            Community (Discord)
          </a>
        </nav>
      </div>
      <p className="site-footer-disclaimer">
        Misma Luna does not verify identity or family relationships, provide legal advice, or offer emergency services.
      </p>
    </footer>
  );
}

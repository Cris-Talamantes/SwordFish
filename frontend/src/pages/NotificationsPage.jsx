import { Link } from "react-router-dom";

export default function NotificationsPage() {
  return (
    <section className="notifications-page">
      <div className="page-heading">
        <p className="eyebrow">Notifications</p>
        <h1>Updates &amp; reminders</h1>
        <p>
          Push-style alerts are not wired in this build. Use the links below for real activity — connection requests and chat
          always need your intentional choice.
        </p>
      </div>

      <ul className="notification-tips motion-surface">
        <li>
          <strong>Pending requests</strong> — check{" "}
          <Link className="inline-link" to="/match-requests">
            Match requests
          </Link>{" "}
          when someone reaches out.
        </li>
        <li>
          <strong>Open conversations</strong> — visit{" "}
          <Link className="inline-link" to="/chat">
            Chat
          </Link>{" "}
          after verification completes.
        </li>
        <li>
          <strong>Profile visibility</strong> — review{" "}
          <Link className="inline-link" to="/profile">
            Profile
          </Link>{" "}
          so search reflects only what you are comfortable sharing.
        </li>
      </ul>

      <p className="form-success notifications-foot">
        Manual moderation may be limited during demos — thank you for treating others with patience and respect.
      </p>
    </section>
  );
}

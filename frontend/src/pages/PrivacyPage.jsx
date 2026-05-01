import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <article className="legal-doc">
      <p className="eyebrow">Privacy</p>
      <h1>Privacy policy</h1>
      <p className="legal-updated">BorderHack / student project stub — review with counsel before any production use.</p>

      <section className="legal-section">
        <h2>What Misma Luna is</h2>
        <p>
          Misma Luna is a consent-based tool meant to help people explore whether they may be connected to someone they are
          searching for. It does <strong>not</strong> verify who anyone is, and it is <strong>not</strong> affiliated with
          governments, immigration authorities, or NGOs unless explicitly stated elsewhere by the organizers of your event.
        </p>
      </section>

      <section className="legal-section">
        <h2>Data we collect</h2>
        <ul>
          <li>
            <strong>Account:</strong> email address and authentication identifiers from Firebase Auth.
          </li>
          <li>
            <strong>Profile:</strong> fields you choose to add (for example first name or nickname, approximate age,
            general location, relationship role, and a short story or context). Assume profile fields used in search may be
            visible to other signed-in users in a limited way through the application&apos;s workflows.
          </li>
          <li>
            <strong>Connection requests &amp; verification:</strong> messages you send with a request, verification
            questions and answers you exchange after accepting a request, and related timestamps.
          </li>
          <li>
            <strong>Chat:</strong> messages you send after both sides complete verification and confirm, plus chat control
            actions you take (for example leave or block flags recorded by the service).
          </li>
          <li>
            <strong>Technical:</strong> standard server, hosting, and Firebase operational data (for example logs or
            security telemetry) as configured by Firebase, Vercel, and related infrastructure providers.
          </li>
          <li>
            <strong>Optional uploads:</strong> if you use profile photo upload features and Storage rules allow it, images
            you upload to your storage path.
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>Why we use data</h2>
        <p>To operate sign-in, profiles, match requests, optional verification prompts, chat, safety controls, and abuse prevention basics.</p>
      </section>

      <section className="legal-section">
        <h2>Retention</h2>
        <p>
          Data is kept while your account exists and as needed for security or legal compliance. You may request deletion
          through account deletion features where available; residual backups or logs may persist for a limited time
          according to provider defaults.
        </p>
      </section>

      <section className="legal-section">
        <h2>Sharing</h2>
        <p>
          We do not sell your personal information. Data is processed through service providers you configure (for example
          Google Firebase and Vercel). Judges, mentors, or demo viewers may see synthetic or real demo data only in the
          ways you choose to present your project.
        </p>
      </section>

      <section className="legal-section">
        <h2>Your responsibilities</h2>
        <p>
          Do not misuse the platform to harass, stalk, defraud, dox, or impersonate others. Be cautious about sharing
          sensitive identifiers (exact addresses, ID numbers, detailed immigration narratives, financial information, or
          intimate details) with people you have not independently validated.
        </p>
      </section>

      <section className="legal-section">
        <h2>Children</h2>
        <p>Misma Luna is intended for users age <strong>18+</strong>. Do not use the service if you are under 18.</p>
      </section>

      <section className="legal-section">
        <h2>Changes</h2>
        <p>Features and policies may change during the hackathon or pilot. Material updates should be reflected here when feasible.</p>
      </section>

      <section className="legal-section">
        <h2>Contact</h2>
        <p>
          For event-related questions, use your organizer channels (for example Discord). This stub does not replace a
          designated data controller contact for production deployments.
        </p>
      </section>

      <p className="legal-back">
        <Link className="button secondary" to="/">
          Back home
        </Link>
      </p>
    </article>
  );
}

import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <article className="legal-doc">
      <p className="eyebrow">Terms</p>
      <h1>Terms of use &amp; acceptable use</h1>
      <p className="legal-updated">BorderHack / student project stub — not legal advice.</p>

      <section className="legal-section">
        <h2>Agreement</h2>
        <p>
          By creating an account or using Misma Luna, you agree to these terms. If you do not agree, do not use the
          service.
        </p>
      </section>

      <section className="legal-section">
        <h2>No guarantees</h2>
        <p>Misma Luna is provided &quot;as is&quot; for learning and demonstration. We do not guarantee:</p>
        <ul>
          <li>Accuracy of any profile, message, or claimed relationship.</li>
          <li>That you will find or safely reconnect with anyone.</li>
          <li>Uninterrupted or error-free operation.</li>
          <li>Specific moderation response times — manual review may be limited.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>Not legal advice; not emergency services</h2>
        <p>
          Misma Luna does not provide legal guidance or immigration advice. If you or someone else faces immediate danger,
          contact local emergency services or trusted crisis resources appropriate to your situation.
        </p>
      </section>

      <section className="legal-section">
        <h2>Safety</h2>
        <p>You are responsible for your choices about communicating or meeting people from the internet. We encourage you to:</p>
        <ul>
          <li>Avoid sharing exact addresses, precise schedules, or financial details with strangers.</li>
          <li>Be skeptical of urgent requests for money, documents, or passwords.</li>
          <li>Consider verifying details through independent channels you trust — Misma Luna does not replace that care.</li>
          <li>Meet only in safe, public places if you choose to meet, and tell someone you trust where you are.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>Acceptable use</h2>
        <p>You may not use Misma Luna to:</p>
        <ul>
          <li>Harass, threaten, coerce, or harm anyone.</li>
          <li>Impersonate another person or misrepresent your identity or relationship.</li>
          <li>Scrape, exploit, or attempt to bypass security or privacy controls.</li>
          <li>Upload malware or abusive media.</li>
          <li>Violate applicable laws or third-party rights.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>AI and external tools</h2>
        <p>
          Teams may build with AI-assisted coding or third-party libraries. You remain responsible for understanding what
          your deployment does, honoring licenses, and answering technical questions honestly during review or judging.
        </p>
      </section>

      <section className="legal-section">
        <h2>Intellectual property</h2>
        <p>
          You retain ownership of content you create, subject to licenses you grant to infrastructure providers needed to
          run the app. Respect copyrights, trademarks, and open-source licenses when reusing materials.
        </p>
      </section>

      <section className="legal-section">
        <h2>Age</h2>
        <p>You must be at least <strong>18 years old</strong> to use Misma Luna.</p>
      </section>

      <section className="legal-section">
        <h2>Termination</h2>
        <p>
          Organizers or operators may suspend access for violations or operational reasons. You may delete your account
          using in-product controls where available.
        </p>
      </section>

      <section className="legal-section">
        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, Misma Luna and its contributors are not liable for indirect or
          consequential damages arising from use of the service, including interactions between users.
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

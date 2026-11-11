import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <section className="message-page">
      <p className="message-page-code" aria-hidden="true">404</p>
      <h1>Stran ne obstaja</h1>
      <p className="muted">Morda je povezava zastarela ali pa se je v naslov prikradla tipkarska napaka.</p>
      <Link to="/" className="button">Nazaj na recepte</Link>
    </section>
  );
}

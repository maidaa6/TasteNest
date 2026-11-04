import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <section>
      <h1>Stran ne obstaja</h1>
      <p><Link to="/">Nazaj na recepte</Link></p>
    </section>
  );
}

import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * UX guard only – the API enforces the same rules. Unauthenticated visitors are
 * sent to the login page and returned afterwards.
 */
export default function RequireAuth({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/prijava" replace state={{ from: location.pathname }} />;

  if (roles && !roles.includes(user.role)) {
    return (
      <section className="message-page">
        <h1>Dostop ni dovoljen</h1>
        <p className="muted">Vaš račun nima pravic za to stran.</p>
      </section>
    );
  }

  return children;
}

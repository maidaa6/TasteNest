import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="container header-inner">
          <NavLink to="/" className="brand">TasteNest</NavLink>
          <nav className="nav">
            <NavLink to="/" end>Recepti</NavLink>
            {user ? (
              <>
                <span className="muted">{user.name}</span>
                <button type="button" className="link-button" onClick={onLogout}>Odjava</button>
              </>
            ) : (
              <>
                <NavLink to="/prijava">Prijava</NavLink>
                <NavLink to="/registracija">Registracija</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="container main">
        <Outlet />
      </main>
    </div>
  );
}

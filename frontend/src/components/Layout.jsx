import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from './Icon.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app">
      <a className="skip-link" href="#vsebina">Preskoči na vsebino</a>
      <header className="app-header">
        <div className="container header-inner">
          <NavLink to="/" className="brand">
            <span className="brand-mark"><Icon name="nest" size={22} /></span>
            TasteNest
          </NavLink>
          <nav className="nav" aria-label="Glavna navigacija">
            <NavLink to="/" end>Recepti</NavLink>
            {user?.role === 'AUTHOR' && <NavLink to="/moji-recepti">Moji recepti</NavLink>}
            {user ? (
              <div className="nav-user">
                <span className="avatar" aria-hidden="true">{user.name.trim().charAt(0).toUpperCase()}</span>
                <span className="nav-user-name">{user.name}</span>
                <button type="button" className="icon-button" onClick={onLogout}>
                  <Icon name="logout" size={18} />
                  Odjava
                </button>
              </div>
            ) : (
              <>
                <NavLink to="/prijava">Prijava</NavLink>
                <NavLink to="/registracija" className="nav-cta">Registracija</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main id="vsebina" className="container main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <div className="container footer-inner">
          <span className="footer-brand"><Icon name="nest" size={18} /> TasteNest</span>
          <span>Recepti, tedenski načrti in nakupovalni seznami na enem mestu.</span>
        </div>
      </footer>
    </div>
  );
}

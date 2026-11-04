import { NavLink, Outlet } from 'react-router';

export default function Layout() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="container header-inner">
          <NavLink to="/" className="brand">TasteNest</NavLink>
          <nav className="nav">
            <NavLink to="/" end>Recepti</NavLink>
          </nav>
        </div>
      </header>
      <main className="container main">
        <Outlet />
      </main>
    </div>
  );
}

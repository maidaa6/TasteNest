import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import Layout from '../components/Layout.jsx';
import LoginPage from './LoginPage.jsx';
import RequireAuth from '../components/RequireAuth.jsx';
import { mockApi, renderApp, renderWithProviders } from '../test/utils.jsx';

const USER = { id: 'u1', name: 'Maja Novak', email: 'maja@example.com', role: 'USER' };

function mockLogin() {
  return mockApi({
    'POST /auth/login': ({ body }) => (body.password === 'pravilno123'
      ? { body: { token: 'jwt-token', user: USER } }
      : { status: 401, body: { error: { message: 'Napačen e-naslov ali geslo.' } } }),
  });
}

async function logIn(password = 'pravilno123') {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('E-naslov'), USER.email);
  await user.type(screen.getByLabelText('Geslo'), password);
  await user.click(screen.getByRole('button', { name: 'Prijava' }));
  return user;
}

describe('LoginPage (US-02)', () => {
  afterEach(() => vi.unstubAllGlobals());

  // AC2
  it('shows the server message when login fails', async () => {
    mockLogin();
    renderApp('/prijava');

    await logIn('napacno');

    expect(await screen.findByRole('alert')).toHaveTextContent('Napačen e-naslov ali geslo.');
    expect(screen.queryByRole('button', { name: 'Odjava' })).not.toBeInTheDocument();
  });

  it('requires both fields before sending a request', async () => {
    const fetchMock = mockLogin();
    renderApp('/prijava');

    await userEvent.setup().click(screen.getByRole('button', { name: 'Prijava' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Vnesite e-naslov in geslo.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  // AC1
  it('logs in, shows the user in the navigation and allows logout', async () => {
    mockLogin();
    renderApp('/prijava');

    const user = await logIn();

    expect(await screen.findByText(USER.name)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recepti' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Odjava' }));
    expect(screen.getByRole('link', { name: 'Prijava' })).toBeInTheDocument();
  });

  // AC5
  it('keeps the token out of browser storage, so a reload requires a new login', async () => {
    mockLogin();
    const { unmount } = renderApp('/prijava');
    await logIn();
    await screen.findByText(USER.name);

    expect({ ...localStorage }).toEqual({});
    expect({ ...sessionStorage }).toEqual({});

    unmount();
    renderApp('/');
    expect(screen.getByRole('link', { name: 'Prijava' })).toBeInTheDocument();
  });
});

describe('RequireAuth', () => {
  afterEach(() => vi.unstubAllGlobals());

  const routes = (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<h1>Recepti</h1>} />
        <Route path="prijava" element={<LoginPage />} />
        <Route path="zasebno" element={<RequireAuth><h1>Zasebna stran</h1></RequireAuth>} />
        <Route path="admin" element={<RequireAuth roles={['ADMIN']}><h1>Admin</h1></RequireAuth>} />
      </Route>
    </Routes>
  );

  it('redirects guests to login and returns them after a successful login', async () => {
    mockLogin();
    renderWithProviders(routes, { route: '/zasebno' });

    expect(screen.getByRole('heading', { name: 'Prijava' })).toBeInTheDocument();
    await logIn();

    expect(await screen.findByRole('heading', { name: 'Zasebna stran' })).toBeInTheDocument();
  });

  it('blocks users without the required role', async () => {
    mockLogin();
    renderWithProviders(routes, { route: '/admin' });
    await logIn();

    expect(await screen.findByRole('heading', { name: 'Dostop ni dovoljen' })).toBeInTheDocument();
  });
});

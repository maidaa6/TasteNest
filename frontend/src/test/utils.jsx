import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from '../context/AuthContext.jsx';
import App from '../App.jsx';

export const AUTHOR = { id: 'author-1', name: 'Ana Avtorica', email: 'avtor@example.com', role: 'AUTHOR' };

/** `user` starts the tree with an active session for that user. */
export function renderWithProviders(ui, { route = '/', user } = {}) {
  const session = user ? { token: 'test-token', user } : null;
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider initialSession={session}>{ui}</AuthProvider>
    </MemoryRouter>,
  );
}

export const renderApp = (route = '/', options = {}) => renderWithProviders(<App />, { route, ...options });

/**
 * Stubs fetch with route handlers keyed by "METHOD /path" (path relative to /api).
 * A handler returns `{ status, body }` or a function of the parsed request.
 */
export function mockApi(routes) {
  const fetchMock = vi.fn(async (url, init = {}) => {
    const method = init.method ?? 'GET';
    const path = new URL(url).pathname.replace(/^\/api/, '') + new URL(url).search;
    const handler = routes[`${method} ${path}`] ?? routes[`${method} ${path.split('?')[0]}`];
    if (!handler) throw new Error(`Unhandled request: ${method} ${path}`);

    const request = { headers: init.headers ?? {}, body: init.body ? JSON.parse(init.body) : undefined };
    const { status = 200, body } = typeof handler === 'function' ? handler(request) : handler;
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    };
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

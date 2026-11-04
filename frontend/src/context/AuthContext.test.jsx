import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import { mockApi } from '../test/utils.jsx';

const USER = { id: 'u1', name: 'Maja', role: 'USER' };
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

async function loggedIn() {
  const hook = renderHook(() => useAuth(), { wrapper });
  await act(() => hook.result.current.login({ email: 'maja@example.com', password: 'x' }));
  return hook;
}

describe('AuthContext', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sends the bearer token on authenticated requests', async () => {
    const fetchMock = mockApi({
      'POST /auth/login': { body: { token: 'jwt-token', user: USER } },
      'GET /auth/me': { body: { user: USER } },
    });
    const { result } = await loggedIn();

    await act(() => result.current.request('/auth/me'));

    expect(fetchMock.mock.lastCall[1].headers.Authorization).toBe('Bearer jwt-token');
  });

  // US-02 AC3 from the client side: an expired or revoked token ends the session.
  it('clears the session when the API rejects the token', async () => {
    mockApi({
      'POST /auth/login': { body: { token: 'expired', user: USER } },
      'GET /auth/me': { status: 401, body: { error: { message: 'Prijava je obvezna.' } } },
    });
    const { result } = await loggedIn();
    expect(result.current.isAuthenticated).toBe(true);

    await act(() => expect(result.current.request('/auth/me')).rejects.toMatchObject({ status: 401 }));

    expect(result.current.user).toBeNull();
  });

  it('keeps the session on non-auth errors', async () => {
    mockApi({
      'POST /auth/login': { body: { token: 'jwt-token', user: USER } },
      'GET /auth/me': { status: 403, body: { error: { message: 'Nimate pravic.' } } },
    });
    const { result } = await loggedIn();

    await act(() => expect(result.current.request('/auth/me')).rejects.toMatchObject({ status: 403 }));

    expect(result.current.user).toEqual(USER);
  });
});

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { login as loginRequest } from '../services/auth.js';

const AuthContext = createContext(null);

/**
 * Holds the JWT in React state only (never in localStorage/sessionStorage), so a
 * page reload ends the session – an explicit MVP decision, see ADR-0005.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);

  const login = useCallback(async (credentials) => {
    const { token, user } = await loginRequest(credentials);
    setSession({ token, user });
    return user;
  }, []);

  const logout = useCallback(() => setSession(null), []);

  // Authenticated API call; an expired or revoked token ends the session.
  const request = useCallback(async (path, options = {}) => {
    try {
      return await api(path, { ...options, token: session?.token });
    } catch (err) {
      if (err.status === 401 && session) setSession(null);
      throw err;
    }
  }, [session]);

  const value = useMemo(
    () => ({ user: session?.user ?? null, isAuthenticated: Boolean(session), login, logout, request }),
    [session, login, logout, request],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

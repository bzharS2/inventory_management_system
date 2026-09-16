import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    role: user.role,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState('');

  async function fetchCsrfToken() {
    const response = await fetch('http://localhost:5000/auth/csrf-token', {
      credentials: 'include',
    });

    if (!response.ok) {
      return '';
    }

    const data = await response.json();
    setCsrfToken(data.csrfToken || '');
    return data.csrfToken || '';
  }

  async function checkAuth() {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/auth/me', {
        credentials: 'include',
      });

      if (!response.ok) {
        setUser(null);
        return false;
      }

      const data = await response.json();
      setUser(normalizeUser(data.user));
      return Boolean(data.authenticated);
    } catch (error) {
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function login(username, password) {
    const token = await fetchCsrfToken();
    const response = await fetch('http://localhost:5000/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-CSRF-Token': token } : {}),
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setUser(normalizeUser(data.user));
    return data;
  }

  async function logout() {
    const token = await fetchCsrfToken();
    const response = await fetch('http://localhost:5000/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-CSRF-Token': token } : {}),
      },
    });

    setUser(null);
    return response.ok;
  }

  useEffect(() => {
    checkAuth();
  }, []);

  const value = useMemo(
    () => ({ user, loading, csrfToken, login, logout, checkAuth, setUser }),
    [user, loading, csrfToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

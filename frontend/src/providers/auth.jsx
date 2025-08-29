import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '@/api/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const signIn = async (email, password) => {
    const data = await api.login(email, password);
    setToken(data.access_token);
    localStorage.setItem('auth_token', data.access_token);
    if (data.user) {
      setCurrentUser(data.user);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    }
  };

  const signUp = async (email, password) => {
    await api.register(email, password);
  };

  const signOut = async () => {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const restore = async () => {
    const t = localStorage.getItem('auth_token');
    if (t) {
      setToken(t);
      try {
        const u = await api.getMe();
        setCurrentUser(u);
        localStorage.setItem('auth_user', JSON.stringify(u));
      } catch {
        localStorage.removeItem('auth_token');
      }
    }
  };

  useEffect(() => {
    restore();
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, currentUser, signIn, signOut, signUp }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

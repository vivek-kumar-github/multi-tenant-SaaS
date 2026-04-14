import { createContext, useContext, useEffect, useState } from 'react';
import { getStoredSession, storeSession, clearSession, parseToken } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    const stored = getStoredSession();
    if (!stored?.token) return null;
    return {
      token: stored.token,
      user: stored.user || parseToken(stored.token)
    };
  });

  useEffect(() => {
    if (session) {
      storeSession(session);
    } else {
      clearSession();
    }
  }, [session]);

  const login = (sessionData) => {
    const parsedUser = sessionData.user || parseToken(sessionData.token);
    if (!parsedUser) return;
    setSession({ token: sessionData.token, user: parsedUser });
  };

  const logout = () => {
    clearSession();
    setSession(null);
  };

  const value = {
    user: session?.user ?? null,
    token: session?.token ?? null,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

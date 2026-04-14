const SESSION_KEY = 'saas_session';

const safeJsonDecode = (payload) => {
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const getStoredSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
};

export const storeSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const parseToken = (token) => {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const payload = safeJsonDecode(parts[1]);
  if (!payload) return null;
  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    tenantId: payload.tenantId || null
  };
};

export const getToken = () => getStoredSession()?.token || null;

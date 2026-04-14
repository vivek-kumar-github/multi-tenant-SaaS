const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

const request = async (path, { method = 'GET', body, token } = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

export const loginApi = (credentials) => request('/auth/login', { method: 'POST', body: credentials });
export const signupApi = (credentials) => request('/auth/signup', { method: 'POST', body: credentials });
export const getTenantConfig = (token, tenantId) => request(`/tenant/config${tenantId ? `?tenantId=${tenantId}` : ''}`, { token });
export const updateTenantConfig = (token, settings) => request('/tenant/config', { method: 'POST', body: settings, token });
export const createTenant = (token, payload) => request('/admin/tenant', { method: 'POST', body: payload, token });
export const listTenants = (token) => request('/admin/tenants', { token });
export const getAuditLogs = (token) => request('/admin/audit', { token });

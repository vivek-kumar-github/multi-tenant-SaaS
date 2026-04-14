import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createTenant, listTenants, getTenantConfig, getAuditLogs } from '../services/api';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [newTenantId, setNewTenantId] = useState('');
  const [newSettings, setNewSettings] = useState({ theme_color: '#3b82f6', api_access: true, max_users: 10 });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [recentAudit, setRecentAudit] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const loadTenants = async () => {
    setLoading(true);
    setStatus('');

    try {
      const data = await listTenants(token);
      setTenants(data.tenants || []);
    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
    loadRecentAudit();
  }, [token]);

  const loadRecentAudit = async () => {
    setAuditLoading(true);
    try {
      const data = await getAuditLogs(token);
      setRecentAudit((data.logs || []).slice(0, 5));
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreating(true);
    setStatus('');

    try {
      await createTenant(token, { tenantId: newTenantId, settings: newSettings });
      setNewTenantId('');
      setStatus('Tenant created successfully. Refreshing list...');
      loadTenants();
    } catch (err) {
      setStatus(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleFetchConfig = async () => {
    setStatus('');
    if (!selectedTenant) {
      setStatus('Please select a tenant to view configuration.');
      return;
    }

    try {
      const data = await getTenantConfig(token, selectedTenant);
      setSelectedConfig(data.settings || {});
    } catch (err) {
      setSelectedConfig(null);
      setStatus(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Admin Dashboard</h2>
        <p className="mt-2 text-slate-600">Provision tenants and inspect tenant configuration.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Create tenant</h3>
          <form className="mt-4 space-y-4" onSubmit={handleCreate}>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Tenant ID</span>
              <input
                type="text"
                value={newTenantId}
                onChange={(e) => setNewTenantId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Theme color</span>
              <input
                type="text"
                value={newSettings.theme_color}
                onChange={(e) => setNewSettings({ ...newSettings, theme_color: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">API access</span>
              <select
                value={newSettings.api_access ? 'true' : 'false'}
                onChange={(e) => setNewSettings({ ...newSettings, api_access: e.target.value === 'true' })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-900"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Max users</span>
              <input
                type="number"
                min="1"
                value={newSettings.max_users}
                onChange={(e) => setNewSettings({ ...newSettings, max_users: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
              />
            </label>
            {status ? <p className="text-sm text-slate-700">{status}</p> : null}
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? 'Creating...' : 'Create tenant'}
            </button>
          </form>
        </section>

        <aside className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Tenant list</h3>
          {loading ? (
            <p className="mt-4 text-slate-600">Loading tenants...</p>
          ) : (
            <ul className="mt-4 space-y-3 text-slate-700">
              {tenants.length === 0 ? (
                <p>No tenants found yet.</p>
              ) : (
                tenants.map((tenant) => (
                  <li key={tenant.tenantId} className="rounded-xl border border-slate-200 p-3">
                    <p className="font-medium text-slate-900">{tenant.tenantId}</p>
                    <p className="text-sm text-slate-500">Updated: {new Date(tenant.lastUpdated).toLocaleString()}</p>
                  </li>
                ))
              )}
            </ul>
          )}
        </aside>
      </div>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Inspect tenant configuration</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3">
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-900"
            >
              <option value="">Select tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.tenantId} value={tenant.tenantId}>{tenant.tenantId}</option>
              ))}
            </select>
            <button
              onClick={handleFetchConfig}
              className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
            >
              Load config
            </button>
          </div>

          <div>
            {selectedConfig ? (
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Tenant configuration:</p>
                <pre className="mt-3 overflow-x-auto rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                  {JSON.stringify(selectedConfig, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Select a tenant and click Load config to inspect settings.</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Recent audit activity</h3>
          <Link to="/admin/audit" className="text-sm text-slate-900 underline">View all</Link>
        </div>
        {auditLoading ? (
          <p className="text-slate-600">Loading...</p>
        ) : recentAudit.length === 0 ? (
          <p className="text-slate-600">No audit records found yet.</p>
        ) : (
          <ul className="space-y-3">
            {recentAudit.map((entry, idx) => (
              <li key={idx} className="rounded-lg border border-slate-200 p-3">
                <p className="font-medium text-slate-900">{entry.message}</p>
                <p className="text-sm text-slate-500">Author: {entry.author}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;

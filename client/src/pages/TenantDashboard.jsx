import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTenantConfig, updateTenantConfig } from '../services/api';

const TenantDashboard = () => {
  const { token, user } = useAuth();
  const [settings, setSettings] = useState({});
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadConfig = async () => {
    setLoading(true);
    setStatus('');
    try {
      const data = await getTenantConfig(token);
      setSettings(data.settings || {});
    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus('');

    try {
      await updateTenantConfig(token, settings);
      setStatus('Tenant configuration updated successfully.');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Tenant Dashboard</h2>
        <p className="mt-2 text-slate-600">Manage settings for tenant <strong>{user?.tenantId}</strong>.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Configuration</h3>
          {loading ? (
            <p className="mt-4 text-slate-600">Loading configuration...</p>
          ) : (
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Theme color</span>
                <input
                  type="text"
                  value={settings.theme_color || ''}
                  onChange={(e) => setSettings({ ...settings, theme_color: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">API access</span>
                <select
                  value={settings.api_access ? 'true' : 'false'}
                  onChange={(e) => setSettings({ ...settings, api_access: e.target.value === 'true' })}
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
                  value={settings.max_users ?? 0}
                  onChange={(e) => setSettings({ ...settings, max_users: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                />
              </label>

              {status ? <p className="text-sm text-slate-700">{status}</p> : null}

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          )}
        </section>

        <aside className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Tenant details</h3>
          <div className="mt-4 space-y-2 text-slate-600">
            <p><strong>Tenant ID:</strong> {user?.tenantId}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TenantDashboard;

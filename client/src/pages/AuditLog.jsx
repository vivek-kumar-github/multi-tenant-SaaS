import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAuditLogs } from '../services/api';

const AuditLog = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await getAuditLogs(token);
      setLogs(data.logs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Audit Log</h2>
            <p className="mt-2 text-slate-600">Review recent configuration audit events for tenant files.</p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-slate-600">Loading audit records...</p>
        ) : error ? (
          <p className="rounded-lg bg-red-50 p-4 text-red-600">{error}</p>
        ) : logs.length === 0 ? (
          <p className="text-slate-600">No audit records found. Git audit tracking is currently disabled (Git not available in PATH).</p>
        ) : (
          <div className="space-y-4">
            {logs.map((entry, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 p-4">
                <p className="font-medium text-slate-900">{entry.message}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3 text-sm text-slate-500">
                  <p><strong>Hash:</strong> {entry.hash}</p>
                  <p><strong>Author:</strong> {entry.author}</p>
                  <p><strong>Date:</strong> {entry.date ? new Date(entry.date).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AuditLog;

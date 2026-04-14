import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-semibold text-slate-900">
            SaaS Config Dashboard
          </Link>
          {user ? (
            <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
              {user.role === 'admin' ? (
                <>
                  <Link className="rounded-md px-2 py-1 transition hover:bg-slate-100" to="/admin">Admin</Link>
                  <Link className="rounded-md px-2 py-1 transition hover:bg-slate-100" to="/admin/audit">Audit</Link>
                </>
              ) : (
                <Link className="rounded-md px-2 py-1 transition hover:bg-slate-100" to="/tenant">Tenant</Link>
              )}
            </nav>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
          {user ? (
            <>
              <span>{user.email}</span>
              <span className="rounded-md bg-slate-100 px-2 py-1">{user.role}</span>
              {user.tenantId ? <span className="rounded-md bg-slate-100 px-2 py-1">tenant: {user.tenantId}</span> : null}
              <button onClick={logout} className="rounded-md bg-slate-900 px-3 py-1 text-white transition hover:bg-slate-700">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="rounded-md bg-slate-900 px-3 py-1 text-white transition hover:bg-slate-700">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

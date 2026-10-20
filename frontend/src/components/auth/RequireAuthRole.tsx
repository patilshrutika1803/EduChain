import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import type { DemoRole } from '../../auth/demoAuth';
import { useAuth } from '../../auth/AuthProvider';

export function RequireAuthRole({ role }: { role: DemoRole }) {
  const { status, mode, role: currentRole, error } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <main className="mx-auto max-w-xl p-6" role="status" aria-live="polite">
        Checking your EduChain session…
      </main>
    );
  }

  if (mode === 'unconfigured') {
    return (
      <main className="mx-auto max-w-xl p-6">
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Supabase authentication is not configured. Set the frontend Supabase
          environment variables or explicitly enable demo mode for a local
          demonstration.
        </div>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="mx-auto max-w-xl p-6">
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || 'Unable to verify your account and role.'}
        </div>
        <Link to={`/${role}/login`} className="mt-4 inline-block text-sm text-blue-700 underline">
          Return to sign in
        </Link>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to={`/${role}/login`} state={{ from: location }} replace />;
  }

  if (currentRole === role) {
    return <Outlet />;
  }

  if (currentRole) {
    return <Navigate to={`/${currentRole}/dashboard`} replace />;
  }

  return <Navigate to={`/${role}/login`} state={{ from: location }} replace />;
}

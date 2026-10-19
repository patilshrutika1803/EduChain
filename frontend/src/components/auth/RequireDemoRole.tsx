import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { DemoRole } from '../../auth/demoAuth';
import { useDemoAuth } from '../../auth/useDemoAuth';

export function RequireDemoRole({ role }: { role: DemoRole }) {
  const { role: currentRole, error: storageError } = useDemoAuth();
  const location = useLocation();

  if (storageError) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Demo access is unavailable: {storageError}
        </div>
      </main>
    );
  }

  if (currentRole === role) {
    return <Outlet />;
  }

  if (currentRole) {
    return <Navigate to={`/${currentRole}/dashboard`} replace />;
  }

  return <Navigate to={`/${role}/login`} state={{ from: location }} replace />;
}

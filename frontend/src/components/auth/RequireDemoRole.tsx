import { Navigate, Outlet } from 'react-router-dom';
import { getDemoRole, type DemoRole } from '../../auth/demoAuth';

export function RequireDemoRole({ role }: { role: DemoRole }) {
  let currentRole: ReturnType<typeof getDemoRole> = null;
  let storageError = '';

  try {
    currentRole = getDemoRole();
  } catch (error) {
    storageError = error instanceof Error ? error.message : 'Unable to check the demo session.';
  }

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

  return <Navigate to={`/${role}/login`} replace />;
}

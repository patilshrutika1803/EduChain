import { DEMO_ACCOUNTS, type DemoRole } from '../../auth/demoAuth';

export function DemoCredentialsPanel({ role }: { role: DemoRole }) {
  const account = DEMO_ACCOUNTS[role];

  return (
    <section className="mt-5 rounded-xl border border-blue-200 bg-blue-50/70 p-4">
      <h3 className="text-sm font-semibold text-blue-900">Demo Login — Local Presentation Account</h3>
      <dl className="mt-3 space-y-2 text-xs">
        <div className="flex items-start gap-3">
          <dt className="w-16 flex-shrink-0 text-slate-500">Email</dt>
          <dd className="select-all break-all font-mono text-slate-800">{account.email}</dd>
        </div>
        <div className="flex items-start gap-3">
          <dt className="w-16 flex-shrink-0 text-slate-500">Password</dt>
          <dd className="select-all break-all font-mono text-slate-800">{account.password}</dd>
        </div>
      </dl>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
        For local prototype demonstration only. These are not real institutional accounts.
        Authentication is simulated in this browser and is not production security.
      </p>
    </section>
  );
}

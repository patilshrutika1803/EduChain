import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Info } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { NetworkBadge } from '../../components/ui/NetworkBadge';
import { useCredentialRecords } from '../../data/useCredentialRecords';

export function InstitutionDashboardPage() {
  const { credentials, error } = useCredentialRecords();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{greeting}, Institution Portal</h1>
          <p className="text-sm text-slate-500 mt-0.5">Institution overview of locally saved demonstration credentials.</p>
        </div>
      </div>

      <div className="mb-7 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
        <Info size={15} className="mt-0.5 flex-shrink-0" />
        <p>DEMO / LOCAL ONLY. These records persist in this browser; no blockchain transaction or issuer authorization is connected.</p>
      </div>
      {error && (
        <div role="alert" className="mb-7 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Saved credentials could not be loaded: {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent credentials */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Recent Credentials</h2>
              <Link to="/institution/credentials" className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Credential ID</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Student</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Degree</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {credentials.slice(0, 5).map(c => (
                    <tr key={c.credentialId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <code className="font-mono text-xs text-slate-700">{c.credentialId}</code>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">{c.studentName}</td>
                      <td className="px-5 py-3.5 text-slate-600 text-xs">{c.degree}</td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">DEMO / LOCAL ONLY</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                              <Link to={`/institution/credentials/${encodeURIComponent(c.credentialId)}`} className="text-xs text-blue-600 hover:text-blue-800 font-medium">View</Link>
                              <Link to={`/verify/${encodeURIComponent(c.credentialId)}`} className="text-xs text-slate-500 hover:text-slate-800">Check hash</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!error && credentials.length === 0 && <p className="text-center text-sm text-slate-500 py-10">No credentials have been saved yet.</p>}
              {!error && credentials.length > 5 && (
                <p className="px-5 py-3 text-xs text-slate-500">Showing 5 of {credentials.length} locally saved records.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Blockchain activity */}
        <div>
          <Card padding="none">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <Activity size={15} className="text-blue-600" />
              <h2 className="font-semibold text-slate-900">Blockchain status</h2>
            </div>
            <div className="divide-y divide-slate-50">
              <p className="text-sm text-slate-500 px-5 py-8">Not connected. Local credential saves are not blockchain activity.</p>
            </div>
            <div className="px-5 py-3 border-t border-slate-100">
              <NetworkBadge network="Not connected" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

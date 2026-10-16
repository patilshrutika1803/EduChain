import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { HashDisplay } from '../../../components/ui/HashDisplay';
import type { AuditEvent } from '../../../types';

const auditEvents: AuditEvent[] = [];

const actionColors: Record<string, string> = {
  'Credential Issued': 'bg-blue-50 text-blue-700',
  'Credential Suspended': 'bg-amber-50 text-amber-700',
  'Credential Revoked': 'bg-red-50 text-red-700',
  'Verification Performed': 'bg-green-50 text-green-700',
  'Wallet Connected': 'bg-violet-50 text-violet-700',
};

export function AuditLogsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-0.5">Historical audit logging is not implemented; local credential saves are not recorded as an audit trail.</p>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Timestamp', 'Action', 'Credential ID', 'Actor', 'Status', 'Transaction'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditEvents.map(event => (
                <tr key={event.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap font-mono">
                    {new Date(event.timestamp).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${actionColors[event.action] ?? 'bg-slate-100 text-slate-700'}`}>
                      {event.action}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {event.credentialId ? (
                      <code className="font-mono text-xs text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{event.credentialId}</code>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-600">{event.actor}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={event.status} size="sm" /></td>
                  <td className="px-5 py-3.5">
                    {event.txHash ? (
                      <HashDisplay value={event.txHash} truncate />
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {auditEvents.length === 0 && <p className="text-center text-sm text-slate-500 py-12">No audit events are persisted by this demo.</p>}
        </div>
      </Card>
    </div>
  );
}

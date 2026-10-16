import { FileText, Info } from 'lucide-react';
import { Card, StatCard } from '../../../components/ui/Card';
import { useCredentialRecords } from '../../../data/useCredentialRecords';

export function AnalyticsPage() {
  const { credentials, error } = useCredentialRecords();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Credential Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">A count of saved browser-local demo records only; verification analytics are unavailable.</p>
      </div>
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <Info size={14} className="mt-0.5 flex-shrink-0" />
        <p>These counts come from this browser&apos;s local credential storage. They are not a backend or blockchain activity report.</p>
      </div>
      {error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Local analytics could not be loaded: {error}
        </div>
      ) : (
        <StatCard label="Saved demo credentials" value={credentials.length} icon={<FileText size={20} />} color="blue" delta="Browser-local records" />
      )}
      <Card className="border-dashed">
        <p className="text-sm font-semibold text-slate-700">Verification and lifecycle analytics unavailable</p>
        <p className="mt-1 text-xs text-slate-500">This demo does not persist verification history or lifecycle events.</p>
      </Card>
    </div>
  );
}

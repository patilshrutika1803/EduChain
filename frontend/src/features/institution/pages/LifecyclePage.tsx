import { Info } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { useCredentialRecords } from '../../../data/useCredentialRecords';

export function LifecyclePage() {
  const { credentials, error } = useCredentialRecords();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Credential Lifecycle</h1>
        <p className="text-sm text-slate-500 mt-0.5">Suspend, reactivate, and revoke transitions are not implemented.</p>
      </div>
      <Card className="border-dashed">
        <div className="py-10 text-center">
          <Info size={24} className="mx-auto mb-3 text-slate-400" />
          {error ? (
            <p role="alert" className="text-sm text-red-700">Local credentials could not be loaded: {error}</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-700">{credentials.length} saved local demo credential{credentials.length === 1 ? '' : 's'}</p>
              <p className="mt-1 text-xs text-slate-500">
                No lifecycle transitions or historical events are stored. Demo records remain in their issued state.
              </p>
              <p className="mt-3 text-xs font-medium text-amber-700">No state change has been performed or claimed.</p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

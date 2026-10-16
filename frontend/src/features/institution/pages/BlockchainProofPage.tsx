import { Link, useParams } from 'react-router-dom';
import { Info } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { useCredentialRecords } from '../../../data/useCredentialRecords';

export function BlockchainProofPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { credentials, error, loading } = useCredentialRecords();
  const credential = credentials.find((record) => record.credentialId === id) ?? null;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Blockchain Proof Status</h1>
        <p className="text-sm text-slate-500 mt-0.5">An on-chain proof cannot be retrieved because blockchain integration is not implemented.</p>
      </div>
      {error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Local credential data could not be loaded: {error}
        </div>
      ) : loading ? (
        <p role="status" className="text-sm text-slate-500">Loading saved record...</p>
      ) : (
        <Card padding="lg" className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <Info size={16} className="mt-0.5 flex-shrink-0" />
            <p><strong>Not an on-chain proof.</strong> No blockchain transaction, block, contract, or digital signature exists in this local demo.</p>
          </div>
          <p className="text-sm text-slate-700">
            Credential ID: <code className="break-all font-mono">{id || '(empty identifier)'}</code>
          </p>
          {credential ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Locally calculated/stored SHA-256 (not anchored on-chain)</p>
              <p className="mt-1 break-all rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700">{credential.credentialHash}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No saved local record exists for this ID.</p>
          )}
          <div className="flex gap-3">
            <Link to="/institution/credentials" className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Back to Credentials</Link>
            {credential && <Link to={`/verify/${encodeURIComponent(credential.credentialId)}`} className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Check local hash</Link>}
          </div>
        </Card>
      )}
    </div>
  );
}

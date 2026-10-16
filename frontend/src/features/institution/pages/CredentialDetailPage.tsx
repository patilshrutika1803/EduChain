import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { useCredentialRecords } from '../../../data/useCredentialRecords';

export function CredentialDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { credentials, loading, error } = useCredentialRecords();
  const credential = credentials.find((record) => record.credentialId === id) ?? null;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <Link to="/institution/credentials" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
        <ArrowLeft size={15} /> Back to Credentials
      </Link>
      {error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Saved credential could not be loaded: {error}
        </div>
      ) : loading ? (
        <p role="status" className="text-sm text-slate-500">Loading saved credential...</p>
      ) : credential ? (
        <>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Credential Details</h1>
            <p className="mt-1 break-all font-mono text-sm text-slate-500">{credential.credentialId}</p>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <Info size={16} className="mt-0.5 flex-shrink-0" />
            <p>DEMO / LOCAL ONLY. A browser-stored record and hash do not prove issuer authorization or academic authenticity.</p>
          </div>
          <Card padding="lg">
            <dl className="grid gap-5 sm:grid-cols-2">
              {([
                ['Student name', credential.studentName],
                ['Student ID', credential.studentId],
                ['Student email', credential.studentEmail ?? 'Not provided'],
                ['Degree', credential.degree],
                ['Department', credential.department],
                ['CGPA', credential.cgpa],
                ['Graduation year', credential.graduationYear],
                ['Status', credential.status],
              ] as const).map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
                  <dd className="mt-1 break-words text-sm text-slate-900">{value}</dd>
                </div>
              ))}
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Issue timestamp</dt>
                <dd className="mt-1 break-all text-sm text-slate-900">
                  <time dateTime={credential.issueTimestamp}>{credential.issueTimestamp}</time>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Stored SHA-256 hash (local)</dt>
                <dd className="mt-1 break-all rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700">{credential.credentialHash}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={`/verify/${encodeURIComponent(credential.credentialId)}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Check local hash
              </Link>
              <Link to={`/institution/credentials/${encodeURIComponent(credential.credentialId)}/blockchain`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Blockchain proof status
              </Link>
            </div>
          </Card>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h1 className="text-lg font-semibold text-slate-800">Credential not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            <code className="break-all font-mono">{id || '(empty identifier)'}</code> is not in this browser's saved records.
          </p>
        </div>
      )}
    </div>
  );
}

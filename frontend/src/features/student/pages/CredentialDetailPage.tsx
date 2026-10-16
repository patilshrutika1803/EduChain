import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { useStudentCredentials } from '../useStudentCredentials';

export function StudentCredentialDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { credentials, error, loading } = useStudentCredentials();
  const credential = credentials.find((candidate) => candidate.credentialId === id);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-5">
        <Link to="/student/wallet" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
          <ArrowLeft size={15} /> Back to My Wallet
        </Link>
        {error ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Your credentials could not be loaded: {error}
          </div>
        ) : loading ? (
          <p role="status" className="text-sm text-slate-500">Loading your credential...</p>
        ) : credential ? (
          <>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Credential Details</h1>
              <p className="mt-1 break-all font-mono text-sm text-slate-500">{credential.credentialId}</p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <Info size={16} className="mt-0.5 flex-shrink-0" />
              <p>DEMO / LOCAL ONLY. The stored hash does not establish issuer authenticity or real-world academic validity.</p>
            </div>
            <Card padding="lg">
              <dl className="grid gap-5 sm:grid-cols-2">
                {([
                  ['Student name', credential.studentName],
                  ['Student ID', credential.studentId],
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
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">SHA-256 hash (local)</dt>
                  <dd className="mt-1 break-all rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700">{credential.credentialHash}</dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={`/student/credentials/${encodeURIComponent(credential.credentialId)}/share`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Share verification QR
                </Link>
                <Link to={`/verify/${encodeURIComponent(credential.credentialId)}`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Check local hash
                </Link>
              </div>
            </Card>
          </>
        ) : (
          <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h1 className="text-lg font-semibold text-slate-800">Credential not found</h1>
            <p className="mt-2 text-sm text-slate-500">
              This record is not available in your wallet. Student views are limited to credentials issued to your signed-in demo email.
            </p>
            <Link to="/student/wallet" className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Back to My Wallet
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

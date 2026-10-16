import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, PlusCircle, Info } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { useCredentialRecords } from '../../../data/useCredentialRecords';

export function CredentialsPage() {
  const { credentials, error, loading } = useCredentialRecords();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const searchQuery = searchParams.get('search') ?? '';

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = credentials.filter((credential) =>
    credential.credentialId.toLowerCase().includes(normalizedSearch)
    || credential.studentName.toLowerCase().includes(normalizedSearch)
    || credential.studentId.toLowerCase().includes(normalizedSearch)
    || credential.studentEmail?.toLowerCase().includes(normalizedSearch)
    || credential.degree.toLowerCase().includes(normalizedSearch)
    || credential.department.toLowerCase().includes(normalizedSearch),
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Credentials</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? 'Loading saved local demo credentials...' : `${credentials.length} saved local demo credential${credentials.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <Link to="/institution/credentials/issue" className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
          <PlusCircle size={14} /> Issue New
        </Link>
      </div>

      <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <Info size={14} className="mt-0.5 flex-shrink-0" />
        <p>DEMO / LOCAL ONLY. These records are stored in this browser and are not blockchain-verified.</p>
      </div>

      <Card className="mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              const next = new URLSearchParams(searchParams);
              if (event.target.value.trim()) next.set('search', event.target.value);
              else next.delete('search');
              setSearchParams(next, { replace: true });
            }}
            placeholder="Search by credential ID, student name, or student ID"
            aria-label="Search credentials"
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      {error && (
        <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Saved credentials could not be loaded: {error}
        </div>
      )}

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Credential ID', 'Student', 'Student ID', 'Degree', 'Department', 'Issued', 'Status', 'Actions'].map((heading) => (
                  <th key={heading} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((credential) => (
                <tr key={credential.credentialId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <code className="font-mono text-xs text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{credential.credentialId}</code>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">{credential.studentName}</td>
                  <td className="px-5 py-3.5 text-slate-600 text-xs">{credential.studentId}</td>
                  <td className="px-5 py-3.5 text-slate-600 text-xs">{credential.degree}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{credential.department}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                    <time dateTime={credential.issueTimestamp}>{new Date(credential.issueTimestamp).toLocaleString()}</time>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">DEMO / LOCAL ONLY</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-3">
                      <Link to={`/institution/credentials/${encodeURIComponent(credential.credentialId)}`} className="text-xs text-blue-600 hover:text-blue-800 font-medium">View</Link>
                      <Link to={`/verify/${encodeURIComponent(credential.credentialId)}`} className="text-xs text-slate-500 hover:text-slate-700">Check hash</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-14 px-6">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Search size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">{normalizedSearch ? 'No matching credentials' : 'No credentials saved yet'}</p>
              <p className="text-xs text-slate-500 mb-4">
                {normalizedSearch ? 'Try a credential ID, student name, or student ID.' : 'Issue a local demo credential to see it listed here.'}
              </p>
              {!normalizedSearch && (
                <Link to="/institution/credentials/issue" className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                  <PlusCircle size={14} /> Issue a credential
                </Link>
              )}
            </div>
          )}
          {loading && <p role="status" className="text-center text-sm text-slate-500 py-8">Loading credentials...</p>}
        </div>
      </Card>
    </div>
  );
}

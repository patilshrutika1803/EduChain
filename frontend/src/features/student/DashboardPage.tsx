import { Link } from 'react-router-dom';
import { Share2, QrCode, Shield, LogOut } from 'lucide-react';
import { signOutDemo } from '../../auth/demoAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import type { DemoCredentialRecord } from '../../types';
import { useStudentCredentials } from './useStudentCredentials';

export function StudentDashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { credentials, error, loading } = useStudentCredentials();
  const handleSignOut = () => {
    try {
      signOutDemo();
      navigate('/student/login', { replace: true });
    } catch (signOutError) {
      toast(signOutError instanceof Error ? signOutError.message : 'Unable to sign out in this browser.', 'error');
    }
  };
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Student nav */}
      <nav className="bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield size={13} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm">EduChain</span>
          <span className="text-slate-300 mx-1">|</span>
          <span className="text-xs text-slate-500">Student Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/student/wallet" className="text-xs font-medium text-blue-600 hover:text-blue-800">Open wallet</Link>
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">S</div>
          <span className="text-sm text-slate-700 hidden sm:block">Student Portal</span>
          <button onClick={handleSignOut} className="text-xs text-slate-400 hover:text-slate-600" aria-label="Sign out">
            <LogOut size={14} />
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">My Credentials</h1>
          <p className="text-sm text-slate-500 mt-0.5">Saved demo credentials associated with your student account.</p>
        </div>

        {error && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Credentials could not be loaded: {error}
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-5">
          {credentials.map(c => (
            <CredentialCard key={c.credentialId} credential={c} />
          ))}
        </div>

        {!loading && !error && credentials.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <Shield size={28} className="text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No credentials have been issued to this student account yet.</p>
          </div>
        )}
        {loading && <p role="status" className="text-sm text-slate-500">Loading saved credentials...</p>}
      </div>
    </div>
  );
}

function CredentialCard({ credential }: { credential: DemoCredentialRecord }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header strip */}
      <div className="bg-[#0f172a] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
            <Shield size={13} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-none">{credential.degree}</p>
            <p className="text-xs text-slate-400 mt-0.5">DEMO / LOCAL ONLY</p>
          </div>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
          DEMO
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-slate-600">{credential.studentName}</p>
            <p className="text-sm text-slate-600">{credential.department}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Class of</p>
            <p className="text-sm font-bold text-slate-900">{credential.graduationYear}</p>
          </div>
        </div>
        <p className="mb-4 break-all font-mono text-xs text-slate-500">ID: {credential.credentialId}</p>
        <details className="mb-4 border-t border-slate-100 pt-3">
          <summary className="cursor-pointer text-sm font-medium text-blue-700">Credential details</summary>
          <dl className="mt-3 space-y-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Issue timestamp</dt>
              <dd className="mt-1 break-all text-sm text-slate-800">
                <time dateTime={credential.issueTimestamp}>{credential.issueTimestamp}</time>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">CGPA</dt>
              <dd className="mt-1 text-sm text-slate-800">{credential.cgpa}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">SHA-256 hash</dt>
              <dd className="mt-1 break-all font-mono text-xs text-slate-700">{credential.credentialHash}</dd>
            </div>
          </dl>
        </details>
        <div className="flex gap-2">
          <Link to={`/student/credentials/${encodeURIComponent(credential.credentialId)}`} className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            View details
          </Link>
          <Link to={`/student/credentials/${encodeURIComponent(credential.credentialId)}/share`} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <Share2 size={12} /><QrCode size={12} /> Share QR
          </Link>
        </div>
      </div>
    </div>
  );
}

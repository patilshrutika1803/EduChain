import { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Shield, Mail, Lock, Wallet } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DemoCredentialsPanel } from '../../components/auth/DemoCredentialsPanel';
import { getDemoLoginRedirect } from '../../auth/demoAuth';
import { useAuth } from '../../auth/AuthProvider';

export function StudentLoginPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  if (auth.role) {
    return <Navigate to={getDemoLoginRedirect(auth.role, location.state)} replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (creatingAccount && !displayName.trim()) {
      setError('Please enter your name.');
      return;
    }
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (creatingAccount) {
        const needsConfirmation = await auth.signUp(email, password, displayName);
        if (needsConfirmation) {
          setNotice('Account created. Check your email to confirm it, then sign in.');
          setCreatingAccount(false);
        } else {
          navigate(getDemoLoginRedirect('student', location.state), { replace: true });
        }
      } else {
        await auth.signIn('student', email, password);
        navigate(getDemoLoginRedirect('student', location.state), { replace: true });
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to complete authentication.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Shield size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">EduChain</h1>
          <p className="text-sm text-slate-500 mt-1">Student Credential Wallet</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-base font-semibold text-slate-900 mb-6">Sign in to your student account</h2>

          {error && (
            <div role="alert" className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {auth.mode === 'unconfigured' && (
            <div role="status" className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
              Supabase authentication is not configured. Set
              {' '}<code>VITE_SUPABASE_URL</code> and
              {' '}<code>VITE_SUPABASE_PUBLISHABLE_KEY</code> in the frontend environment.
              Demo mode remains disabled unless explicitly enabled.
            </div>
          )}
          {auth.mode === 'demo' && (
            <div role="status" className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
              Local demo authentication is enabled; it is not Supabase-backed.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {creatingAccount && (
              <div className="mb-4">
                <Input
                  label="Full name"
                  type="text"
                  autoComplete="name"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                prefix={<Mail size={14} />}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                autoComplete={creatingAccount ? 'new-password' : 'current-password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                prefix={<Lock size={14} />}
              />
            </div>

            <Button type="submit" variant="primary" className="w-full justify-center mt-5" disabled={busy || auth.status === 'loading' || auth.mode === 'unconfigured' || (creatingAccount && auth.mode === 'demo')}>
              {busy ? 'Please wait…' : creatingAccount ? 'Create Student Account' : 'Sign In'}
            </Button>

            <div className="mt-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 border-t border-slate-200" />
                <span className="text-xs text-slate-400">or</span>
                <div className="flex-1 border-t border-slate-200" />
              </div>
              <Button type="button" variant="outline" className="w-full justify-center" disabled>
                <Wallet size={15} /> Wallet connection unavailable
              </Button>
            </div>
          </form>

          {notice && <p role="status" className="mt-4 text-center text-sm text-green-700">{notice}</p>}
          {auth.mode === 'supabase' && (
            <button
              type="button"
              className="mt-4 w-full text-center text-sm text-blue-700 hover:underline"
              onClick={() => {
                setCreatingAccount(value => !value);
                setError('');
                setNotice('');
              }}
            >
              {creatingAccount ? 'Already have an account? Sign in' : 'Create a student account'}
            </button>
          )}

          <p className="mt-4 text-xs text-slate-500 text-center">
            Student roles are limited to the account owner. This does not verify identity or credential authenticity.
          </p>
          {auth.status === 'error' && auth.error && (
            <p role="alert" className="mt-3 text-center text-xs text-red-700">
              {auth.error}
            </p>
          )}
          {auth.mode === 'demo' && <DemoCredentialsPanel role="student" />}
        </div>

        <p className="text-center mt-5 text-xs text-slate-400">
          <Link to="/" className="hover:text-slate-600">← Back to Home</Link>
          {' · '}
          <Link to="/institution/login" className="hover:text-slate-600">Institution Login</Link>
        </p>
      </div>
    </div>
  );
}

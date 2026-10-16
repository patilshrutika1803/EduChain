import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Home, Search } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">EduChain</span>
        </div>

        {/* 404 */}
        <div className="mb-6">
          <p className="text-7xl font-black text-slate-200 mb-4 leading-none">404</p>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Page not found</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            The page you're looking for doesn't exist, may have been moved, or the URL might be
            incorrect.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto justify-center"
          >
            <Home size={15} /> Go to Home
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm w-full sm:w-auto justify-center"
          >
            <ArrowLeft size={15} /> Go Back
          </button>
          <Link
            to="/verify"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 px-5 py-2.5 font-medium text-sm w-full sm:w-auto justify-center"
          >
            <Search size={15} /> Verify Credential
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-10">EduChain · Privacy-Aware Credential Verification</p>
      </div>
    </div>
  );
}

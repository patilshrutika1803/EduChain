import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Verify Credential', to: '/verify' },
  { label: 'About', to: '/#about' },
];

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900">EduChain</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 flex-1">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm font-medium transition-colors ${location.pathname === l.to ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 ml-auto">
            <Link to="/student/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors">
              Student Login
            </Link>
            <Link to="/institution/login" className="text-sm font-medium bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
              Institution Login
            </Link>
          </div>

          <button type="button" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} className="md:hidden ml-auto p-2 text-slate-500" onClick={() => setOpen(v => !v)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-slate-700 hover:text-blue-600">
              {l.label}
            </Link>
          ))}
          <Link to="/student/login" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-slate-700">Student Login</Link>
          <Link to="/institution/login" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-blue-600">Institution Login</Link>
        </div>
      )}
    </nav>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-[#0f172a] text-slate-400 py-10 mt-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                <Shield size={12} className="text-white" />
              </div>
              <span className="font-bold text-white text-sm">EduChain</span>
            </div>
            <p className="text-xs max-w-xs">Browser-local credential demo. Blockchain integration is planned and not connected.</p>
          </div>
          <div className="text-xs space-y-1">
            <p className="text-slate-300 font-medium mb-2">Platform</p>
            <Link to="/verify" className="block hover:text-slate-200 transition-colors">Verify Credential</Link>
            <Link to="/institution/login" className="block hover:text-slate-200 transition-colors">Institution Portal</Link>
            <Link to="/student/login" className="block hover:text-slate-200 transition-colors">Student Portal</Link>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 text-xs">
          <p>© 2026 EduChain. Prototype — for demonstration purposes only. Not an official government or university service.</p>
        </div>
      </div>
    </footer>
  );
}

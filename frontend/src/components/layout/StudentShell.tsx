import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, LogOut, Shield, Wallet } from 'lucide-react';
import { signOutDemo } from '../../auth/demoAuth';
import { useToast } from '../ui/Toast';

export function StudentShell() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = () => {
    try {
      signOutDemo();
      navigate('/student/login', { replace: true });
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to sign out in this browser.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-5 px-4 sm:px-6">
          <Link to="/student/dashboard" className="flex shrink-0 items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Shield size={16} className="text-white" />
            </span>
            <span className="font-bold text-slate-900">EduChain</span>
            <span className="hidden text-xs text-slate-500 sm:inline">Student Portal</span>
          </Link>
          <nav aria-label="Student navigation" className="flex flex-1 items-center gap-1">
            <NavLink
              to="/student/dashboard"
              className={({ isActive }) => `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <LayoutDashboard size={15} /> <span className="hidden sm:inline">Dashboard</span>
            </NavLink>
            <NavLink
              to="/student/wallet"
              className={({ isActive }) => `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Wallet size={15} /> <span className="hidden sm:inline">Wallet</span>
            </NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="hidden text-slate-400 sm:block" />
            <span className="hidden text-xs text-slate-600 sm:block">Student demo</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut size={15} /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

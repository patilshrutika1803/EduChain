import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, PlusCircle, Layers, CheckSquare, RefreshCw,
  Building2, Link2, BarChart3, ScrollText, Settings, LogOut,
  Wallet, Shield,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { useToast } from '../ui/Toast';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/institution/dashboard' },
    ],
  },
  {
    label: 'Credentials',
    items: [
      { label: 'All Credentials', icon: FileText, to: '/institution/credentials' },
      { label: 'Issue Credential', icon: PlusCircle, to: '/institution/credentials/issue' },
      { label: 'Batch Issuance (planned)', icon: Layers, to: '/institution/batch' },
    ],
  },
  {
    label: 'Verification',
    items: [
      { label: 'Verify', icon: CheckSquare, to: '/institution/verify' },
      { label: 'Blockchain (not connected)', icon: Link2, to: '/institution/blockchain' },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Institution Registry (not connected)', icon: Building2, to: '/institution/registry' },
      { label: 'Lifecycle (planned)', icon: RefreshCw, to: '/institution/lifecycle' },
      { label: 'Audit Logs (not persisted)', icon: ScrollText, to: '/institution/audit' },
      { label: 'Analytics', icon: BarChart3, to: '/institution/analytics' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', icon: Settings, to: '/institution/settings' },
    ],
  },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/institution/login', { replace: true });
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to sign out.', 'error');
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#0f172a] text-white ${mobile ? 'w-full' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield size={16} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-base text-white">EduChain</span>
          <p className="text-xs text-slate-400 leading-none mt-0.5">Institution Portal</p>
        </div>
      </div>

      {/* Grouped nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ label, icon: Icon, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/institution/credentials'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon size={15} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom — wallet + sign out */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <div className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={13} className="text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Wallet</span>
            <span className="text-[10px] text-slate-400 border border-white/10 rounded-full px-2 py-0.5">Not configured</span>
          </div>
          <span className="text-xs text-slate-400">Not connected</span>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-white/10 rounded-lg cursor-pointer transition-colors text-sm font-medium"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X } from 'lucide-react';

interface TopbarProps {
  title?: string;
  onMenuToggle: () => void;
  mobileOpen: boolean;
}

export function Topbar({ onMenuToggle, mobileOpen }: TopbarProps) {
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();

  const searchCredentials = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchVal.trim();
    navigate(query ? `/institution/credentials?search=${encodeURIComponent(query)}` : '/institution/credentials');
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center gap-4 px-4 lg:px-6 flex-shrink-0">
      <button
        className="lg:hidden text-slate-500 hover:text-slate-800 p-1"
        onClick={onMenuToggle}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <form onSubmit={searchCredentials} className="flex-1 max-w-md">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            aria-label="Search credentials"
            placeholder="Search credentials or students..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </form>

      <div className="flex items-center gap-2 ml-auto">
        <div
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-slate-400"
          title="Notifications are not connected in this prototype."
          aria-label="Notifications not connected"
        >
          <Bell size={17} />
          <span className="hidden xl:inline text-xs">Notifications not connected</span>
        </div>

        <div className="flex items-center gap-2 pl-2 pr-3 py-1.5">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
            I
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:block">Institution Portal</span>
        </div>
      </div>
    </header>
  );
}

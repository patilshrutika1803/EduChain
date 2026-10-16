import { useState } from 'react';
import { Save, User, Building2, Shield, Wallet, Bell, Sliders, Info, Database, Trash2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { NetworkBadge } from '../../../components/ui/NetworkBadge';
import { useToast } from '../../../components/ui/Toast';
import { resetDemoCredentials } from '../../../data/credentialStorage';
import { useCredentialRecords } from '../../../data/useCredentialRecords';

type Section = 'profile' | 'institution' | 'security' | 'wallet' | 'notifications' | 'preferences' | 'demo-data';

const NAV: { id: Section; label: string; Icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', Icon: User },
  { id: 'institution', label: 'Institution', Icon: Building2 },
  { id: 'security', label: 'Security', Icon: Shield },
  { id: 'wallet', label: 'Wallet', Icon: Wallet },
  { id: 'notifications', label: 'Notifications', Icon: Bell },
  { id: 'preferences', label: 'Preferences', Icon: Sliders },
  { id: 'demo-data', label: 'Demo Data', Icon: Database },
];

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`w-10 h-5.5 rounded-full flex items-center transition-colors relative ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}
      style={{ width: 40, height: 22 }}
    >
      <span
        className={`absolute w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`}
      />
    </button>
  );
}

function ProfileSection() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', role: 'Demo account' });
  return (
    <Card padding="lg" className="space-y-5">
      <h2 className="font-semibold text-slate-900">Profile Information</h2>
      <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          D
        </div>
        <div>
          <p className="font-semibold text-slate-900">{form.name}</p>
          <p className="text-sm text-slate-500">{form.role}</p>
          <button type="button" disabled className="mt-1 text-xs text-slate-400 cursor-not-allowed">Avatar change planned</button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <Input
          label="Email Address"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <Input label="Role" value={form.role} disabled />
        <Input label="Institution" value="Not configured" disabled />
      </div>
      <div className="flex justify-end">
        <Button onClick={() => toast('Profile changes are not saved by this prototype.', 'info')}>
          <Save size={14} /> Save Changes
        </Button>
      </div>
    </Card>
  );
}

function InstitutionSection() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '',
    id: '',
    email: '',
    website: '',
    address: '',
  });
  return (
    <Card padding="lg" className="space-y-5">
      <h2 className="font-semibold text-slate-900">Institution Information</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Institution Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <Input label="Institution ID" value={form.id} disabled hint="Assigned during registration." />
        <Input
          label="Official Email"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Website"
          type="url"
          value={form.website}
          onChange={e => setForm({ ...form, website: e.target.value })}
        />
      </div>
      <Input
        label="Address"
        value={form.address}
        onChange={e => setForm({ ...form, address: e.target.value })}
      />
      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <Info size={15} className="text-slate-500 flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-slate-700">Institution registry unavailable</p>
          <p className="text-xs text-slate-500">No registry connection or authorization status is available.</p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => toast('Institution details are not saved by this prototype.', 'info')}>
          <Save size={14} /> Save Changes
        </Button>
      </div>
    </Card>
  );
}

function SecuritySection() {
  const { toast } = useToast();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [mfa, setMfa] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  return (
    <div className="space-y-5">
      <Card padding="lg" className="space-y-4">
        <h2 className="font-semibold text-slate-900">Change Password</h2>
        <Input
          label="Current Password"
          type="password"
          value={form.current}
          onChange={e => setForm({ ...form, current: e.target.value })}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="New Password"
            type="password"
            value={form.next}
            onChange={e => setForm({ ...form, next: e.target.value })}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={form.confirm}
            onChange={e => setForm({ ...form, confirm: e.target.value })}
          />
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => toast('Password changes are unavailable in this prototype.', 'info')}>
            Update Password
          </Button>
        </div>
      </Card>
      <Card padding="lg" className="space-y-4">
        <h2 className="font-semibold text-slate-900">Security Settings</h2>
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div>
            <p className="text-sm font-medium text-slate-900">Two-Factor Authentication</p>
            <p className="text-xs text-slate-500 mt-0.5">Presentation-only toggle; no second factor is enforced.</p>
          </div>
          <Toggle label="Two-factor authentication presentation toggle" checked={mfa} onChange={setMfa} />
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-slate-900">Session Timeout (demo control)</p>
            <p className="text-xs text-slate-500 mt-0.5">Selection only; automatic logout is not implemented.</p>
          </div>
          <select
            value={sessionTimeout}
            onChange={e => setSessionTimeout(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="0">Never</option>
          </select>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => toast('Security settings are not saved or enforced by this prototype.', 'info')}>
            <Save size={14} /> Save
          </Button>
        </div>
      </Card>
    </div>
  );
}

function WalletSection() {
  return (
    <div className="space-y-5">
      <Card padding="lg" className="space-y-4">
        <h2 className="font-semibold text-slate-900">Wallet Connection</h2>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-blue-900">Primary Wallet</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
              Not connected
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Address</span>
              <span className="text-slate-500">Not configured</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Network</span>
              <NetworkBadge network="Not connected" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Authorization</span>
              <span className="text-slate-500">Not configured</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" disabled>
            Wallet unavailable
          </Button>
        </div>
      </Card>
      <Card padding="lg" className="space-y-3">
        <h2 className="font-semibold text-slate-900">Authorized Signers</h2>
        <p className="text-xs text-slate-500">
          Wallet connection and issuer authorization are not implemented in this prototype.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-slate-500 py-4">Signer management is not connected.</p>
        </div>
      </Card>
    </div>
  );
}

function NotificationsSection() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState({
    issued: true,
    revoked: true,
    suspended: true,
    batchComplete: true,
    loginAlert: true,
    weeklyDigest: false,
  });
  const rows: { key: keyof typeof prefs; label: string; desc: string }[] = [
    { key: 'issued', label: 'Credential Issued', desc: 'When a new credential is issued' },
    { key: 'revoked', label: 'Credential Revoked', desc: 'When a credential is revoked' },
    { key: 'suspended', label: 'Credential Suspended', desc: 'When a credential is suspended' },
    { key: 'batchComplete', label: 'Batch Complete', desc: 'When batch issuance completes' },
    { key: 'loginAlert', label: 'New Login Alert', desc: 'Alert on login from a new device' },
    { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Weekly summary of activity' },
  ];
  return (
    <Card padding="lg" className="space-y-4">
      <h2 className="font-semibold text-slate-900">Notification Preferences</h2>
      <div className="space-y-1">
        {rows.map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
            <Toggle label={`${label} presentation toggle`} checked={prefs[key]} onChange={v => setPrefs({ ...prefs, [key]: v })} />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button onClick={() => toast('Notification preference changes are not saved by this prototype.', 'info')}>
          <Save size={14} /> Save
        </Button>
      </div>
    </Card>
  );
}

function PreferencesSection() {
  const { toast } = useToast();
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [language, setLanguage] = useState('en');
  const [dense, setDense] = useState(false);
  return (
    <Card padding="lg" className="space-y-4">
      <h2 className="font-semibold text-slate-900">Preferences</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Date Format</label>
          <select
            value={dateFormat}
            onChange={e => setDateFormat(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>YYYY-MM-DD</option>
            <option>DD/MM/YYYY</option>
            <option>MM/DD/YYYY</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Timezone</label>
          <select
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Asia/Kolkata</option>
            <option>UTC</option>
            <option>America/New_York</option>
            <option>Europe/London</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Language</label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
      </div>
      <div className="flex items-center justify-between py-3 border-t border-slate-100">
        <div>
          <p className="text-sm font-medium text-slate-900">Dense Mode</p>
          <p className="text-xs text-slate-500">Compact table and list views</p>
        </div>
        <Toggle label="Dense mode presentation toggle" checked={dense} onChange={setDense} />
      </div>
      <div className="flex justify-end">
        <Button onClick={() => toast('Preference changes are not saved by this prototype.', 'info')}>
          <Save size={14} /> Save
        </Button>
      </div>
    </Card>
  );
}

export function SettingsPage() {
  const [active, setActive] = useState<Section>('profile');
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetError, setResetError] = useState('');
  const { credentials, error: credentialsError, loading } = useCredentialRecords();
  const { toast } = useToast();

  const handleReset = () => {
    try {
      resetDemoCredentials();
      setConfirmReset(false);
      setResetError('');
      toast('Local demo records were reset in this browser only. Other devices were not changed.', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to reset local demo records.';
      setResetError(message);
      toast(message, 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Demo settings and local credential data management.</p>
      </div>
      <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <Info size={13} className="mt-0.5 flex-shrink-0" />
        <p>Profile, security, notification, and preference controls are presentation-only. Password, two-factor, wallet, and institution registry features are not connected.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-6">
        <nav className="sm:w-48 flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {NAV.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                aria-current={active === id ? 'page' : undefined}
                onClick={() => setActive(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-slate-100 last:border-0 ${
                  active === id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </nav>
        <div className="flex-1 min-w-0">
          {active === 'profile' && <ProfileSection />}
          {active === 'institution' && <InstitutionSection />}
          {active === 'security' && <SecuritySection />}
          {active === 'wallet' && <WalletSection />}
          {active === 'notifications' && <NotificationsSection />}
          {active === 'preferences' && <PreferencesSection />}
          {active === 'demo-data' && (
            <Card padding="lg" className="space-y-5">
              <div className="flex items-start gap-3">
                <Database size={19} className="mt-0.5 text-blue-600" />
                <div>
                  <h2 className="font-semibold text-slate-900">Local demo data</h2>
                  <p role={credentialsError ? 'alert' : undefined} className="mt-1 text-sm text-slate-600">
                    {loading
                      ? 'Reading this browser’s saved demo records...'
                      : credentialsError
                        ? `Record count unavailable: ${credentialsError}`
                        : `${credentials.length} local demo record${credentials.length === 1 ? '' : 's'} saved in this browser.`}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Reset permanently deletes local demo credential records from this browser. It does not reset data on other devices, and it does not clear your sign-in session or unrelated browser storage.
              </div>
              {resetError && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {resetError}
                </p>
              )}
              {confirmReset ? (
                <div role="alertdialog" aria-modal="true" aria-labelledby="reset-title" className="rounded-xl border border-red-300 bg-red-50 p-4">
                  <h3 id="reset-title" className="font-semibold text-red-900">Permanently reset this browser’s demo records?</h3>
                  <p className="mt-1 text-sm text-red-800">
                    This cannot be undone. Only EduChain local demo credential records in this browser will be deleted.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setConfirmReset(false)}>Cancel</Button>
                    <Button type="button" variant="danger" onClick={handleReset}>
                      <Trash2 size={14} /> Confirm permanent reset
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => {
                    setResetError('');
                    setConfirmReset(true);
                  }}
                  disabled={!loading && credentials.length === 0 && !credentialsError}
                >
                  <Trash2 size={14} /> Reset local demo records
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

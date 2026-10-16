import { Info } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export function RegistryPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Institution Registry</h1>
        <p className="text-sm text-slate-500 mt-0.5">Institution registry and wallet authorization are not configured.</p>
      </div>

      <Card padding="lg">
        <h2 className="font-semibold text-slate-900 mb-2">Institution Profile</h2>
        <p className="text-sm text-slate-500">No institution records are connected to this prototype.</p>
      </Card>

      {/* Wallet */}
      <Card padding="lg" className="border-blue-200 bg-blue-50/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Wallet Connection</h2>
          <span className="text-xs text-slate-500">Not configured</span>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Wallet Address</p>
            <p className="text-sm text-slate-500">Not connected</p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Network</p>
              <span className="text-sm text-slate-500">Not connected</span>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Authorization</p>
              <span className="text-sm text-slate-500">Not configured</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" size="sm" disabled>
            <Info size={13} /> Wallet unavailable
          </Button>
        </div>
      </Card>

      {/* Authorization info */}
      <Card padding="lg" className="bg-slate-50 border-dashed">
        <h2 className="font-semibold text-slate-900">Institution Authorization</h2>
        <p className="text-sm text-slate-600 mt-2">No wallet is connected, and issuer authorization cannot be checked by this prototype.</p>
      </Card>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, QrCode, Lock } from 'lucide-react';
import { PublicNav } from '../../components/layout/PublicLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function VerifyPage() {
  const [searchParams] = useSearchParams();
  const [credentialId, setCredentialId] = useState(
    searchParams.get('id') ?? searchParams.get('credentialId') ?? '',
  );
  const navigate = useNavigate();

  useEffect(() => {
    const linkedId = searchParams.get('id') ?? searchParams.get('credentialId');
    if (linkedId) setCredentialId(linkedId);
  }, [searchParams]);

  const handleVerify = () => {
    if (!credentialId.trim()) return;
    navigate(`/verify/${encodeURIComponent(credentialId.trim())}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNav />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Verify Educational Credential</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Enter a Credential ID to check the saved browser-local demo record and its SHA-256 hash.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
          <div>
            <label htmlFor="credential-id" className="block text-sm font-semibold text-slate-700 mb-2">Credential ID</label>
            <div className="flex gap-3">
              <Input
                value={credentialId}
                id="credential-id"
                onChange={e => setCredentialId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
                placeholder="Enter credential ID"
                className="flex-1"
              />
              <Button onClick={handleVerify} disabled={!credentialId.trim()}>
                Check ID
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-xs text-slate-400 font-medium">or</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          <div className="w-full flex items-center justify-center gap-3 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-400">
            <QrCode size={20} />
            <span className="text-sm font-medium">QR scanning unavailable (shared links open directly)</span>
          </div>

          <p className="text-xs text-slate-500">Unknown IDs return NOT_FOUND. This page does not contact a registry or blockchain.</p>
        </div>

        <div className="mt-6 flex items-start gap-2 text-xs text-slate-500">
          <Lock size={12} className="flex-shrink-0 mt-0.5" />
          <p>A matching hash demonstrates integrity against the hash stored with this local record only. It does not verify issuer identity, a digital signature, or academic authenticity. The record is available only to browsers with access to its localStorage.</p>
        </div>
      </div>
    </div>
  );
}

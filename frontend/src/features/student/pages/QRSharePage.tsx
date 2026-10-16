import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../../../components/ui/Button';
import { useStudentCredentials } from '../useStudentCredentials';

export function QRSharePage() {
  const { id = '' } = useParams<{ id: string }>();
  const { credentials, error, loading } = useStudentCredentials();
  const [copyMessage, setCopyMessage] = useState('');
  const credential = credentials.find((candidate) => candidate.credentialId === id);
  const verificationLink = credential
    ? new URL(`/verify/${encodeURIComponent(credential.credentialId)}`, window.location.origin).toString()
    : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationLink);
      setCopyMessage('Verification link copied.');
    } catch {
      setCopyMessage('Could not copy automatically. Select and copy the verification link above.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-xl space-y-5">
        <Link
          to={credential ? `/student/credentials/${encodeURIComponent(credential.credentialId)}` : '/student/wallet'}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={15} /> {credential ? 'Back to Credential' : 'Back to My Wallet'}
        </Link>

        {error ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Your credential could not be loaded: {error}
          </div>
        ) : loading ? (
          <p role="status" className="text-sm text-slate-500">Loading saved credential...</p>
        ) : credential ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <QrCode size={26} className="mx-auto mb-3 text-blue-600" />
            <h1 className="text-lg font-semibold text-slate-900">Share a verification link</h1>
            <p className="mt-1 text-sm text-slate-600">{credential.degree} · {credential.department}</p>
            <p className="mt-1 break-all font-mono text-xs text-slate-500">{credential.credentialId}</p>
            <div className="mx-auto my-6 flex w-fit items-center justify-center rounded-xl border border-slate-200 bg-white p-3">
              <QRCodeSVG value={verificationLink} size={224} level="M" />
            </div>
            <label htmlFor="verification-link" className="mb-2 block text-left text-xs font-semibold text-slate-600">
              Public verification route (credential ID only)
            </label>
            <input
              id="verification-link"
              readOnly
              value={verificationLink}
              onFocus={(event) => event.currentTarget.select()}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-700"
            />
            <Button type="button" onClick={copyLink} className="mt-3 w-full">
              <Copy size={14} /> Copy verification link
            </Button>
            {copyMessage && <p role="status" className="mt-2 text-xs text-slate-600">{copyMessage}</p>}
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-xs text-amber-900">
              <p className="font-semibold">DEMO / LOCAL ONLY</p>
              <p className="mt-1">
                The QR includes only this credential ID and opens this app at {window.location.origin}. Verification reads the local record in this browser. A different device does not receive access to this browser&apos;s localStorage and cannot verify the record without a shared data source.
              </p>
              <p className="mt-2">A matching local hash checks data integrity only; it does not prove who issued this record or that the academic claim is authentic.</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <QrCode size={26} className="mx-auto mb-3 text-slate-300" />
            <h1 className="text-lg font-semibold text-slate-800">Credential unavailable</h1>
            <p className="mt-2 text-sm text-slate-500">
              <code className="break-all font-mono">{id || '(empty identifier)'}</code> is not available in your wallet.
            </p>
            <p className="mt-1 text-xs text-slate-500">QR sharing is limited to credentials matched to your signed-in demo email.</p>
          </div>
        )}
      </div>
    </div>
  );
}

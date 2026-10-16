import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { PublicNav } from '../../components/layout/PublicLayout';
import { findCredentialById, subscribeToCredentialChanges } from '../../data/credentialStorage';
import { hashCredentialData } from '../../data/credentialHash';
import type { DemoCredentialRecord } from '../../types';

type ResultStatus = 'CHECKING' | 'LOCAL_INTEGRITY_MATCH' | 'HASH_MISMATCH' | 'NOT_FOUND' | 'STORAGE_ERROR' | 'HASH_ERROR';

export function VerificationResultPage({ report = false }: { report?: boolean }) {
  const { id = '' } = useParams<{ id: string }>();
  const [status, setStatus] = useState<ResultStatus>('CHECKING');
  const [credential, setCredential] = useState<DemoCredentialRecord | null>(null);
  const [computedHash, setComputedHash] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let checkSequence = 0;

    const checkCredential = async () => {
      const sequence = ++checkSequence;
      setStatus('CHECKING');
      setCredential(null);
      setComputedHash('');
      setError('');

      let storedCredential: DemoCredentialRecord | null;
      try {
        storedCredential = findCredentialById(id);
      } catch (storageError) {
        if (active && sequence === checkSequence) {
          setError(storageError instanceof Error ? storageError.message : 'Unable to read browser-local credential storage.');
          setStatus('STORAGE_ERROR');
        }
        return;
      }

      if (!active || sequence !== checkSequence) return;
      if (!storedCredential) {
        setStatus('NOT_FOUND');
        return;
      }

      setCredential(storedCredential);
      try {
        const { credentialHash, ...credentialData } = storedCredential;
        const freshHash = await hashCredentialData(credentialData);
        if (!active || sequence !== checkSequence) return;
        setComputedHash(freshHash);
        setStatus(freshHash === credentialHash ? 'LOCAL_INTEGRITY_MATCH' : 'HASH_MISMATCH');
      } catch (hashError) {
        if (active && sequence === checkSequence) {
          setError(hashError instanceof Error ? hashError.message : 'Unable to calculate a SHA-256 hash for this record.');
          setStatus('HASH_ERROR');
        }
      }
    };

    void checkCredential();
    const unsubscribe = subscribeToCredentialChanges(() => {
      void checkCredential();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [id]);

  const isMatch = status === 'LOCAL_INTEGRITY_MATCH';
  const isFailure = status === 'HASH_MISMATCH' || status === 'NOT_FOUND' || status === 'STORAGE_ERROR' || status === 'HASH_ERROR';
  const resultLabel = {
    CHECKING: 'CHECKING',
    LOCAL_INTEGRITY_MATCH: 'LOCAL_INTEGRITY_MATCH',
    HASH_MISMATCH: 'HASH_MISMATCH',
    NOT_FOUND: 'NOT_FOUND',
    STORAGE_ERROR: 'STORAGE_ERROR',
    HASH_ERROR: 'HASH_ERROR',
  }[status];

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNav />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className={`rounded-2xl border bg-white p-8 shadow-sm ${isMatch ? 'border-green-200' : isFailure ? 'border-amber-200' : 'border-slate-200'}`}>
          {isMatch ? (
            <CheckCircle2 size={28} className="mx-auto mb-3 text-green-600" />
          ) : isFailure ? (
            <AlertTriangle size={28} className="mx-auto mb-3 text-amber-600" />
          ) : (
            <Info size={28} className="mx-auto mb-3 text-blue-600" />
          )}
          <p className={`text-center text-xs font-semibold uppercase tracking-wide ${isMatch ? 'text-green-700' : isFailure ? 'text-amber-700' : 'text-blue-700'}`}>
            {resultLabel}
          </p>
          <h1 className="mt-2 text-center text-xl font-bold text-slate-900">
            {status === 'CHECKING' ? 'Checking local record...' :
              status === 'LOCAL_INTEGRITY_MATCH' ? 'Local hash comparison matches' :
                status === 'HASH_MISMATCH' ? 'Stored data does not match its hash' :
                  status === 'NOT_FOUND' ? 'Credential not found' :
                    status === 'STORAGE_ERROR' ? 'Local storage could not be read' :
                      'Hash comparison could not be completed'}
          </h1>

          {(status === 'NOT_FOUND' || status === 'STORAGE_ERROR' || status === 'HASH_ERROR') && (
            <p role={status === 'NOT_FOUND' ? undefined : 'alert'} className="mt-3 break-words text-center text-sm text-slate-600">
              {status === 'NOT_FOUND'
                ? <>No saved browser-local record exists for <code className="font-mono">{id || '(empty identifier)'}</code>.</>
                : error}
            </p>
          )}

          {credential && (
            <div className="mt-7 border-t border-slate-100 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {([
                  ['Credential ID', credential.credentialId],
                  ['Student name', credential.studentName],
                  ['Student ID', credential.studentId],
                  ['Degree', credential.degree],
                  ['Department', credential.department],
                  ['CGPA', credential.cgpa],
                  ['Graduation year', credential.graduationYear],
                  ['Issue timestamp', credential.issueTimestamp],
                  ['Record status', credential.status],
                ] as const).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
                    <dd className="mt-1 break-words text-sm text-slate-900">{value}</dd>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Stored SHA-256 hash</p>
                  <p className="mt-1 break-all rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700">{credential.credentialHash}</p>
                </div>
                {computedHash && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Recomputed SHA-256 hash</p>
                    <p className={`mt-1 break-all rounded-lg border p-3 font-mono text-xs ${isMatch ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
                      {computedHash}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={`mt-6 rounded-xl border p-4 text-left ${isMatch ? 'border-blue-300 bg-blue-50 text-blue-950' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
            <p className="font-semibold">LOCAL_INTEGRITY_MATCH IS NOT BLOCKCHAIN-BACKED VERIFICATION</p>
            <p className="mt-1 text-xs">
              {isMatch
                ? 'This result means the current record data matches the SHA-256 hash stored alongside it in this browser. It does not establish issuer authenticity, authorization, a digital signature, or academic validity.'
                : 'This prototype compares browser-local record data with its stored SHA-256 hash. It does not contact a registry or blockchain and cannot establish issuer authenticity, authorization, a digital signature, or academic validity.'}
            </p>
            <p className="mt-2 text-xs font-medium">
              localStorage is not tamper-proof: coordinated modification of both the record and its stored hash can still produce a match.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/verify" className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Back to Verify</Link>
            {credential && !report && (
              <Link to={`/verify/${encodeURIComponent(credential.credentialId)}/report`} className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Open detailed report
              </Link>
            )}
            {credential && report && (
              <Link to={`/verify/${encodeURIComponent(credential.credentialId)}`} className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Back to result
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

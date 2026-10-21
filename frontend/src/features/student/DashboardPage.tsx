import { Link } from "react-router-dom"
import { Share2, QrCode, Shield } from "lucide-react"
import type { DemoCredentialRecord } from "../../types"
import { useStudentCredentials } from "./useStudentCredentials"
import { useAuth } from "../../auth/AuthProvider"
import { useApiCredentialRecords } from "../../data/useApiCredentialRecords"

export function StudentDashboardPage() {
  const { mode } = useAuth()
  const live = useApiCredentialRecords(mode === "supabase")
  const demo = useStudentCredentials()

  if (mode === "supabase") {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">My Credentials</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Credentials available to your authenticated student account.
          </p>
        </div>
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          Database records are off-chain. Public verification and blockchain
          proofs are not connected.
        </div>
        {live.error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            Credentials could not be loaded: {live.error}
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          {live.credentials.map((credential) => (
            <div
              key={credential.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between bg-[#0f172a] px-5 py-4 text-white">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-blue-400" />
                  <h2 className="text-sm font-bold">{credential.qualification_name}</h2>
                </div>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold uppercase text-amber-800">
                  {credential.status} / OFF-CHAIN
                </span>
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-600">
                  Graduated {credential.graduation_date}
                </p>
                <p className="mt-3 break-all font-mono text-xs text-slate-500">
                  ID: {credential.credential_identifier}
                </p>
                <Link
                  to={`/student/credentials/${encodeURIComponent(credential.credential_identifier)}`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  View details
                </Link>
              </div>
            </div>
          ))}
        </div>
        {live.loading && (
          <p role="status" className="mt-5 text-sm text-slate-500">
            Loading your credentials...
          </p>
        )}
        {!live.loading && !live.error && live.credentials.length === 0 && (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <Shield size={28} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm text-slate-500">
              No credentials have been issued to this student account yet.
            </p>
          </div>
        )}
      </div>
    )
  }

  const { credentials, error, loading } = demo
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">My Credentials</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Saved demo credentials associated with your student account.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          Credentials could not be loaded: {error}
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-5">
        {credentials.map((c) => (
          <CredentialCard key={c.credentialId} credential={c} />
        ))}
      </div>

      {!loading && !error && credentials.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <Shield size={28} className="text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">
            No credentials have been issued to this student account yet.
          </p>
        </div>
      )}
      {loading && (
        <p role="status" className="text-sm text-slate-500">
          Loading saved credentials...
        </p>
      )}
    </div>
  )
}

function CredentialCard({ credential }: { credential: DemoCredentialRecord }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header strip */}
      <div className="bg-[#0f172a] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
            <Shield size={13} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-none">
              {credential.degree}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">DEMO / LOCAL ONLY</p>
          </div>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
          DEMO
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-slate-600">{credential.studentName}</p>
            <p className="text-sm text-slate-600">{credential.department}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Class of</p>
            <p className="text-sm font-bold text-slate-900">
              {credential.graduationYear}
            </p>
          </div>
        </div>
        <p className="mb-4 break-all font-mono text-xs text-slate-500">
          ID: {credential.credentialId}
        </p>
        <details className="mb-4 border-t border-slate-100 pt-3">
          <summary className="cursor-pointer text-sm font-medium text-blue-700">
            Credential details
          </summary>
          <dl className="mt-3 space-y-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Issue timestamp
              </dt>
              <dd className="mt-1 break-all text-sm text-slate-800">
                <time dateTime={credential.issueTimestamp}>
                  {credential.issueTimestamp}
                </time>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                CGPA
              </dt>
              <dd className="mt-1 text-sm text-slate-800">{credential.cgpa}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                SHA-256 hash
              </dt>
              <dd className="mt-1 break-all font-mono text-xs text-slate-700">
                {credential.credentialHash}
              </dd>
            </div>
          </dl>
        </details>
        <div className="flex gap-2">
          <Link
            to={`/student/credentials/${encodeURIComponent(credential.credentialId)}`}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            View details
          </Link>
          <Link
            to={`/student/credentials/${encodeURIComponent(credential.credentialId)}/share`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Share2 size={12} />
            <QrCode size={12} /> Share QR
          </Link>
        </div>
      </div>
    </div>
  )
}

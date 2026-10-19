import { Link } from "react-router-dom"
import { Shield, Share2, QrCode, Wallet } from "lucide-react"
import { useStudentCredentials } from "../useStudentCredentials"

export function StudentWalletPage() {
  const { credentials, error, loading } = useStudentCredentials()

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
      <div className="flex items-center gap-2">
        <Wallet size={16} className="text-blue-600" />
        <h1 className="font-semibold text-slate-900 text-sm">
          My Digital Credential Wallet
        </h1>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        Demo records are stored only in this browser. This wallet filters them
        by the signed-in student demo email; sharing a QR does not transfer the
        record to another device.
      </div>
      {/* Wallet overview */}
      <div className="bg-[#0f172a] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold">Student Wallet</p>
            <p className="text-xs text-slate-400">Digital Credential Wallet</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
          <span className="text-xs text-slate-300">
            {credentials.length > 0
              ? `${credentials.length} saved demo credential${
                  credentials.length === 1 ? "" : "s"
                }`
              : "DEMO / LOCAL ONLY"}
          </span>
        </div>
      </div>

      {/* Credentials */}
      <div className="space-y-4">
        <h2 className="font-semibold text-slate-900">Credentials</h2>
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            Credentials could not be loaded: {error}
          </div>
        )}
        {credentials.map((c) => (
          <div
            key={c.credentialId}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-900">{c.degree}</h3>
                <p className="text-sm text-slate-500">{c.department}</p>
              </div>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                DEMO / LOCAL ONLY
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
              <span>Class of {c.graduationYear}</span>
            </div>
            <p className="mb-4 break-all font-mono text-xs text-slate-500">
              ID: {c.credentialId}
            </p>
            <details className="mb-4 border-t border-slate-100 pt-3">
              <summary className="cursor-pointer text-sm font-medium text-blue-700">
                Credential details
              </summary>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Student ID
                  </dt>
                  <dd className="mt-1 text-slate-800">{c.studentId}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Department
                  </dt>
                  <dd className="mt-1 text-slate-800">{c.department}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Graduation year
                  </dt>
                  <dd className="mt-1 text-slate-800">{c.graduationYear}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    CGPA
                  </dt>
                  <dd className="mt-1 text-slate-800">{c.cgpa}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Issue timestamp
                  </dt>
                  <dd className="mt-1 break-all text-slate-800">
                    <time dateTime={c.issueTimestamp}>{c.issueTimestamp}</time>
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    SHA-256 hash
                  </dt>
                  <dd className="mt-1 break-all font-mono text-xs text-slate-700">
                    {c.credentialHash}
                  </dd>
                </div>
              </dl>
            </details>
            <div className="flex gap-2">
              <Link
                to={`/student/credentials/${encodeURIComponent(c.credentialId)}`}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                View details
              </Link>
              <Link
                to={`/student/credentials/${encodeURIComponent(c.credentialId)}/share`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                <Share2 size={12} />
                <QrCode size={12} /> Share QR
              </Link>
            </div>
          </div>
        ))}
        {!loading && !error && credentials.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-sm text-slate-500">
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
    </div>
  )
}

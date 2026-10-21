import { useRef, useState, type FormEvent } from 'react';
import { AlertTriangle, CheckCircle2, Info, LockKeyhole } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { hashCredentialData } from '../../../data/credentialHash';
import { listCredentials, saveCredential } from '../../../data/credentialStorage';
import { issueCredential, type ApiCredential } from '../../../data/credentialApi';
import { useAuth } from '../../../auth/AuthProvider';
import type { DemoCredentialData, DemoCredentialRecord } from '../../../types';

interface CredentialForm {
  studentName: string;
  studentId: string;
  studentEmail: string;
  studentProfileId: string;
  degree: string;
  department: string;
  cgpa: string;
  graduationYear: string;
  graduationDate: string;
}

type FormErrors = Partial<Record<keyof CredentialForm, string>>;

const emptyForm: CredentialForm = {
  studentName: '',
  studentId: '',
  studentEmail: '',
  studentProfileId: '',
  degree: '',
  department: '',
  cgpa: '',
  graduationYear: '',
  graduationDate: '',
};

function createCredentialId(): string {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === 'function') {
    return `EDU-${cryptoApi.randomUUID()}`;
  }

  if (typeof cryptoApi?.getRandomValues !== 'function') {
    throw new Error('Secure browser randomness is unavailable; a credential ID could not be generated.');
  }

  const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
  const randomPart = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `EDU-${randomPart}`;
}

function validateForm(form: CredentialForm): {
  errors: FormErrors;
  data: Omit<DemoCredentialData, 'credentialId' | 'issueTimestamp' | 'status'> | null;
} {
  const errors: FormErrors = {};
  const studentName = form.studentName.trim();
  const studentId = form.studentId.trim();
  const studentEmail = form.studentEmail.trim().toLowerCase();
  const degree = form.degree.trim();
  const department = form.department.trim();
  const cgpaText = form.cgpa.trim();
  const graduationYearText = form.graduationYear.trim();
  const cgpa = Number(cgpaText);
  const graduationYear = Number(graduationYearText);

  if (!studentName) errors.studentName = 'Enter the student name.';
  if (!studentId) errors.studentId = 'Enter the student ID.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) {
    errors.studentEmail = 'Enter a valid student email address.';
  }
  if (!degree) errors.degree = 'Enter the degree.';
  if (!department) errors.department = 'Enter the department.';
  if (!cgpaText || !Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10) {
    errors.cgpa = 'Enter a CGPA from 0 to 10.';
  }
  const latestReasonableYear = new Date().getFullYear() + 10;
  if (!/^\d{4}$/.test(graduationYearText) || graduationYear < 1900 || graduationYear > latestReasonableYear) {
    errors.graduationYear = `Enter a four-digit year from 1900 to ${latestReasonableYear}.`;
  }

  return {
    errors,
    data: Object.keys(errors).length > 0
      ? null
      : { studentName, studentId, studentEmail, degree, department, cgpa, graduationYear },
  };
}

export function IssueCredentialPage() {
  const { mode: authMode, role } = useAuth();
  const backendMode = authMode === 'supabase';
  const [form, setForm] = useState<CredentialForm>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form');
  const [reviewData, setReviewData] = useState<Omit<DemoCredentialData, 'credentialId' | 'issueTimestamp' | 'status'> | null>(null);
  const [record, setRecord] = useState<DemoCredentialRecord | null>(null);
  const [backendRecord, setBackendRecord] = useState<ApiCredential | null>(null);
  const [realReviewData, setRealReviewData] = useState<{
    studentProfileId: string;
    qualificationName: string;
    graduationDate: string;
  } | null>(null);
  const [issueError, setIssueError] = useState('');
  const [isIssuing, setIsIssuing] = useState(false);
  const submissionInProgress = useRef(false);

  if (role === 'platform_admin') {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Credential issuance is reserved for institution administrators with an
          active issuer membership at a verified institution. The platform
          administrator account does not inherit issuer permissions.
        </div>
      </div>
    );
  }

  const updateField = (field: keyof CredentialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setIssueError('');
  };

  const openReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (backendMode) {
      const profileId = form.studentProfileId.trim();
      const graduationDate = form.graduationDate;
      const nextErrors: FormErrors = {};
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(profileId)) {
        nextErrors.studentProfileId = 'Enter a valid student profile UUID.';
      }
      if (!form.degree.trim()) nextErrors.degree = 'Enter the qualification name.';
      if (!form.department.trim()) nextErrors.department = 'Enter the department.';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(graduationDate) ||
        Number.isNaN(Date.parse(`${graduationDate}T00:00:00.000Z`)) ||
        new Date(`${graduationDate}T00:00:00.000Z`).toISOString().slice(0, 10) !== graduationDate) {
        nextErrors.graduationDate = 'Enter a valid graduation date.';
      }
      setErrors(nextErrors);
      setIssueError('');
      if (Object.keys(nextErrors).length > 0) return;
      setRealReviewData({
        studentProfileId: profileId,
        qualificationName: `${form.degree.trim()} - ${form.department.trim()}`,
        graduationDate,
      });
      setStep('review');
      return;
    }

    const result = validateForm(form);
    setErrors(result.errors);
    setIssueError('');
    if (!result.data) return;
    setReviewData(result.data);
    setStep('review');
  };

  const confirmIssuance = async () => {
    if (submissionInProgress.current) return;

    submissionInProgress.current = true;
    setIsIssuing(true);
    setIssueError('');

    try {
      if (backendMode) {
        if (!realReviewData) {
          throw new Error('Review the credential details before issuing.');
        }
        const saved = await issueCredential(realReviewData);
        setBackendRecord(saved);
        setStep('success');
        return;
      }
      if (!reviewData) {
        throw new Error('Review the credential details before issuing.');
      }

      const existingIds = new Set(listCredentials().map((credential) => credential.credentialId));
      let credentialId = '';
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const candidate = createCredentialId();
        if (!existingIds.has(candidate)) {
          credentialId = candidate;
          break;
        }
      }
      if (!credentialId) {
        throw new Error('Unable to generate a unique credential ID. Please try again.');
      }

      const credentialData: DemoCredentialData = {
        ...reviewData,
        credentialId,
        issueTimestamp: new Date().toISOString(),
        status: 'DEMO_LOCAL',
      };
      const credentialHash = await hashCredentialData(credentialData);
      const savedRecord: DemoCredentialRecord = { ...credentialData, credentialHash };
      saveCredential(savedRecord);
      setRecord(savedRecord);
      setStep('success');
    } catch (error) {
      setIssueError(error instanceof Error ? error.message : 'Credential issuance failed. No success was recorded.');
    } finally {
      submissionInProgress.current = false;
      setIsIssuing(false);
    }
  };

  const startCorrection = () => {
    setStep('form');
    setIssueError('');
  };

  if (step === 'success' && backendRecord) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Issue New Credential</h1>
          <p className="text-sm text-slate-500 mt-0.5">Credential record saved by the EduChain API.</p>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <p>
            <strong>DATABASE / OFF-CHAIN ONLY.</strong> This record is not a blockchain transaction,
            digital signature, or public verification proof.
          </p>
        </div>
        <Card padding="lg">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 size={20} />
            <h2 className="font-semibold">Database record created</h2>
          </div>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Credential ID</dt>
              <dd className="mt-1 break-all font-mono text-sm text-slate-900">{backendRecord.credential_identifier}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Qualification</dt>
              <dd className="mt-1 text-sm text-slate-900">{backendRecord.qualification_name}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Graduation date</dt>
              <dd className="mt-1 text-sm text-slate-900">{backendRecord.graduation_date}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
              <dd className="mt-1 text-sm font-semibold text-amber-700">OFF-CHAIN / NOT BLOCKCHAIN VERIFIED</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">SHA-256 commitment</dt>
              <dd className="mt-1 break-all font-mono text-xs text-slate-700">{backendRecord.commitment_hash}</dd>
            </div>
          </dl>
        </Card>
      </div>
    );
  }

  if (step === 'success' && record) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Issue New Credential</h1>
          <p className="text-sm text-slate-500 mt-0.5">Local demonstration credential saved successfully.</p>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <p>
            <strong>DEMO / LOCAL ONLY.</strong> No blockchain transaction, digital signature, or issuer
            authorization occurred. This credential is not blockchain-verified. Use synthetic data only.
          </p>
        </div>

        <Card padding="lg">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 size={20} />
            <h2 className="font-semibold">Credential saved</h2>
          </div>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Credential ID</dt>
              <dd className="mt-1 break-all font-mono text-sm text-slate-900">{record.credentialId}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Student name</dt>
              <dd className="mt-1 text-sm text-slate-900">{record.studentName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Student ID</dt>
              <dd className="mt-1 text-sm text-slate-900">{record.studentId}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Student email</dt>
              <dd className="mt-1 break-all text-sm text-slate-900">{record.studentEmail}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Degree</dt>
              <dd className="mt-1 text-sm text-slate-900">{record.degree}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Department</dt>
              <dd className="mt-1 text-sm text-slate-900">{record.department}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">CGPA</dt>
              <dd className="mt-1 text-sm text-slate-900">{record.cgpa}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Graduation year</dt>
              <dd className="mt-1 text-sm text-slate-900">{record.graduationYear}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Issue timestamp</dt>
              <dd className="mt-1 break-all text-sm text-slate-900">
                <time dateTime={record.issueTimestamp}>{record.issueTimestamp}</time>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">SHA-256 hash</dt>
              <dd className="mt-1 break-all rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700">
                {record.credentialHash}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
              <dd className="mt-1 text-sm font-semibold text-amber-700">DEMO / LOCAL ONLY</dd>
            </div>
          </dl>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Issue New Credential</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {backendMode
            ? step === 'review' ? 'Review the database credential request.' : 'Enter a student profile ID and qualification details.'
            : step === 'review' ? 'Review the academic details before local issuance.' : 'Enter academic details to prepare a local demonstration credential.'}
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <Info size={16} className="mt-0.5 flex-shrink-0" />
        <p>{backendMode
          ? 'API / OFF-CHAIN ONLY. Issuance requires a verified institution issuer membership and database-owner validation. No blockchain transaction or signature will occur.'
          : 'DEMO / LOCAL ONLY. Do not enter real student information. No blockchain transaction, digital signature, or issuer authorization will occur.'}
        </p>
      </div>

      {step === 'form' ? (
        <Card padding="lg">
          <form onSubmit={openReview} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {backendMode ? (
                <Input
                  label="Student profile UUID"
                  autoComplete="off"
                  value={form.studentProfileId}
                  onChange={(event) => updateField('studentProfileId', event.target.value)}
                  error={errors.studentProfileId}
                  hint="Use the student's Supabase profile UUID; the API verifies that it is a student profile."
                />
              ) : <>
              <Input
                label="Student name"
                autoComplete="off"
                value={form.studentName}
                onChange={(event) => updateField('studentName', event.target.value)}
                error={errors.studentName}
              />
              <Input
                label="Student ID"
                autoComplete="off"
                value={form.studentId}
                onChange={(event) => updateField('studentId', event.target.value)}
                error={errors.studentId}
              />
              <Input
                label="Student email (wallet account)"
                type="email"
                autoComplete="off"
                value={form.studentEmail}
                onChange={(event) => updateField('studentEmail', event.target.value)}
                error={errors.studentEmail}
                hint="Credentials appear only in the wallet signed in with this email."
              />
              </>}
              <Input
                label={backendMode ? 'Qualification' : 'Degree'}
                autoComplete="off"
                value={form.degree}
                onChange={(event) => updateField('degree', event.target.value)}
                error={errors.degree}
              />
              <Input
                label="Department"
                autoComplete="off"
                value={form.department}
                onChange={(event) => updateField('department', event.target.value)}
                error={errors.department}
              />
              {!backendMode && <Input
                label="CGPA"
                type="number"
                min="0"
                max="10"
                step="any"
                inputMode="decimal"
                value={form.cgpa}
                onChange={(event) => updateField('cgpa', event.target.value)}
                error={errors.cgpa}
              />}
              {backendMode ? <Input
                label="Graduation date"
                type="date"
                value={form.graduationDate}
                onChange={(event) => updateField('graduationDate', event.target.value)}
                error={errors.graduationDate}
              /> : <Input
                label="Graduation year"
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="e.g. 2025"
                value={form.graduationYear}
                onChange={(event) => updateField('graduationYear', event.target.value)}
                error={errors.graduationYear}
                hint={`Four digits, 1900–${new Date().getFullYear() + 10}.`}
              />}
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit">Review details</Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card padding="lg">
          <h2 className="font-semibold text-slate-900">Review {backendMode ? 'credential request' : 'academic details'}</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {(backendMode ? [
              ['Student profile UUID', realReviewData?.studentProfileId],
              ['Qualification', realReviewData?.qualificationName],
              ['Graduation date', realReviewData?.graduationDate],
            ] as const : [
              ['Student name', reviewData?.studentName],
              ['Student ID', reviewData?.studentId],
              ['Student email', reviewData?.studentEmail],
              ['Degree', reviewData?.degree],
              ['Department', reviewData?.department],
              ['CGPA', reviewData?.cgpa],
              ['Graduation year', reviewData?.graduationYear],
            ] as const).map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
                <dd className="mt-1 break-words text-sm text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>

          {issueError && (
            <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {issueError} No credential was reported as issued.
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" onClick={startCorrection} disabled={isIssuing}>
              Back to edit
            </Button>
            <Button type="button" onClick={confirmIssuance} loading={isIssuing} disabled={isIssuing}>
              <LockKeyhole size={15} />
              {backendMode ? 'Submit issuance request' : 'Confirm local issuance'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

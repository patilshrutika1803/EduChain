export type CredentialStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
export type VerificationResult = 'VERIFIED' | 'TAMPERED' | 'REVOKED' | 'SUSPENDED' | 'NOT_FOUND' | 'INVALID_ISSUER' | 'INVALID_SIGNATURE';

export type DemoCredentialStatus = 'DEMO_LOCAL';

export interface DemoCredentialData {
  credentialId: string;
  studentId: string;
  studentEmail?: string;
  studentName: string;
  degree: string;
  department: string;
  cgpa: number;
  graduationYear: number;
  issueTimestamp: string;
  status: DemoCredentialStatus;
}

export interface DemoCredentialRecord extends DemoCredentialData {
  credentialHash: string;
}

export interface Credential {
  credentialId: string;
  studentName: string;
  studentId: string;
  credentialType: string;
  degree: string;
  department: string;
  institution: string;
  graduationYear: number;
  cgpa: number;
  issueDate: string;
  status: CredentialStatus;
  credentialHash: string;
  issuerSignature: string;
  issuerWallet: string;
  blockchainTxHash: string;
  blockNumber: number;
  contractAddress: string;
  network: string;
  ipfsCid?: string;
  revocationDate?: string;
  revocationReason?: string;
  suspensionDate?: string;
}

export interface Institution {
  institutionId: string;
  name: string;
  registrationId: string;
  walletAddress: string;
  authorizationStatus: 'AUTHORIZED' | 'UNAUTHORIZED';
  isActive: boolean;
  network: string;
  registeredDate: string;
  email: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  credentialId?: string;
  actor: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  txHash?: string;
}

export interface VerificationStep {
  id: string;
  label: string;
  status: 'pending' | 'checking' | 'success' | 'failed';
}

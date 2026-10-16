import type { DemoCredentialData } from '../types';

export class CredentialHashError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CredentialHashError';
  }
}

export function serializeCredentialData(data: DemoCredentialData): string {
  return JSON.stringify({
    credentialId: data.credentialId,
    studentId: data.studentId,
    studentEmail: data.studentEmail,
    studentName: data.studentName,
    degree: data.degree,
    department: data.department,
    cgpa: data.cgpa,
    graduationYear: data.graduationYear,
    issueTimestamp: data.issueTimestamp,
    status: data.status,
  });
}

export async function hashCredentialData(data: DemoCredentialData): Promise<string> {
  if (typeof globalThis.crypto?.subtle?.digest !== 'function') {
    throw new CredentialHashError('Web Crypto SHA-256 is unavailable in this environment.');
  }

  try {
    const bytes = new TextEncoder().encode(serializeCredentialData(data));
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  } catch {
    throw new CredentialHashError('Unable to calculate the credential SHA-256 hash.');
  }
}

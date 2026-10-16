import type { DemoCredentialRecord } from '../types';

const STORAGE_KEY = 'educhain-demo-credentials';
const STORAGE_CHANGE_EVENT = 'educhain-demo-credentials-changed';
const SHA256_HEX_PATTERN = /^[0-9a-f]{64}$/;

export class CredentialStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CredentialStorageError';
  }
}

function getLocalStorage(): Storage {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Browser storage is unavailable.');
    }
    return window.localStorage;
  } catch {
    throw new CredentialStorageError('Browser localStorage is unavailable.');
  }
}

function isRecord(value: unknown): value is DemoCredentialRecord {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Partial<DemoCredentialRecord>;
  return (
    typeof record.credentialId === 'string' &&
    record.credentialId.trim().length > 0 &&
    typeof record.studentId === 'string' &&
    record.studentId.trim().length > 0 &&
    (record.studentEmail === undefined ||
      (typeof record.studentEmail === 'string' &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.studentEmail))) &&
    typeof record.studentName === 'string' &&
    record.studentName.trim().length > 0 &&
    typeof record.degree === 'string' &&
    record.degree.trim().length > 0 &&
    typeof record.department === 'string' &&
    record.department.trim().length > 0 &&
    typeof record.cgpa === 'number' &&
    Number.isFinite(record.cgpa) &&
    record.cgpa >= 0 &&
    record.cgpa <= 10 &&
    typeof record.graduationYear === 'number' &&
    Number.isInteger(record.graduationYear) &&
    record.graduationYear >= 1900 &&
    record.graduationYear <= new Date().getFullYear() + 10 &&
    typeof record.issueTimestamp === 'string' &&
    !Number.isNaN(Date.parse(record.issueTimestamp)) &&
    record.status === 'DEMO_LOCAL' &&
    typeof record.credentialHash === 'string' &&
    SHA256_HEX_PATTERN.test(record.credentialHash)
  );
}

function readCredentials(): DemoCredentialRecord[] {
  const storage = getLocalStorage();
  let rawValue: string | null;

  try {
    rawValue = storage.getItem(STORAGE_KEY);
  } catch {
    throw new CredentialStorageError('Unable to read credential records from localStorage.');
  }

  if (rawValue === null) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawValue);
  } catch {
    throw new CredentialStorageError('Stored credential data is malformed JSON; no records were changed.');
  }

  if (!Array.isArray(parsed) || !parsed.every(isRecord)) {
    throw new CredentialStorageError('Stored credential data contains malformed records; no records were changed.');
  }

  const ids = new Set<string>();
  for (const record of parsed) {
    if (ids.has(record.credentialId)) {
      throw new CredentialStorageError('Stored credential data contains duplicate credential IDs.');
    }
    ids.add(record.credentialId);
  }

  return parsed;
}

function notifyCredentialChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
  }
}

export function subscribeToCredentialChanges(listener: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      listener();
    }
  };

  window.addEventListener(STORAGE_CHANGE_EVENT, listener);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(STORAGE_CHANGE_EVENT, listener);
    window.removeEventListener('storage', handleStorage);
  };
}

export function listCredentials(): DemoCredentialRecord[] {
  return readCredentials();
}

export function resetDemoCredentials(): void {
  try {
    getLocalStorage().removeItem(STORAGE_KEY);
  } catch {
    throw new CredentialStorageError('Unable to reset local demo credentials in this browser.');
  }

  notifyCredentialChange();
}

export function findCredentialById(credentialId: string): DemoCredentialRecord | null {
  return readCredentials().find((record) => record.credentialId === credentialId) ?? null;
}

export function saveCredential(record: DemoCredentialRecord): void {
  if (!isRecord(record)) {
    throw new CredentialStorageError('Credential record is invalid and was not saved.');
  }

  const records = readCredentials();
  if (records.some((existing) => existing.credentialId === record.credentialId)) {
    throw new CredentialStorageError(`Credential ID "${record.credentialId}" already exists.`);
  }

  records.push(record);
  try {
    getLocalStorage().setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    throw new CredentialStorageError('Unable to save the credential record to localStorage.');
  }
  notifyCredentialChange();
}

export function updateCredential(record: DemoCredentialRecord): void {
  if (!isRecord(record)) {
    throw new CredentialStorageError('Credential record is invalid and was not updated.');
  }

  const records = readCredentials();
  const recordIndex = records.findIndex((existing) => existing.credentialId === record.credentialId);
  if (recordIndex === -1) {
    throw new CredentialStorageError(`Credential ID "${record.credentialId}" does not exist.`);
  }

  records[recordIndex] = record;
  try {
    getLocalStorage().setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    throw new CredentialStorageError('Unable to update the credential record in localStorage.');
  }
  notifyCredentialChange();
}

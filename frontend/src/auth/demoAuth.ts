import { isDemoModeEnabled } from './demoMode';

export type DemoRole = 'student' | 'institution';

export interface DemoSession {
  role: DemoRole;
  expiresAt: number;
}

export const DEMO_ACCOUNTS: Record<DemoRole, { email: string; password: string }> = {
  student: {
    email: 'student.demo@example.test',
    password: 'StudentDemo@123',
  },
  institution: {
    email: 'institution.demo@example.test',
    password: 'InstitutionDemo@123',
  },
};

const SESSION_KEY = 'educhain-prototype-role';
const SESSION_CHANGE_EVENT = 'educhain-demo-auth-changed';
const SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000;

export class DemoAuthStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DemoAuthStorageError';
  }
}

function getSessionStorage(): Storage {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Browser storage is unavailable.');
    }
    return window.sessionStorage;
  } catch {
    throw new DemoAuthStorageError('Browser sessionStorage is unavailable.');
  }
}

function notifySessionChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
  }
}

function isDemoRole(value: unknown): value is DemoRole {
  return value === 'student' || value === 'institution';
}

function isDemoSession(value: unknown): value is DemoSession {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const session = value as { role?: unknown; expiresAt?: unknown };
  return (
    isDemoRole(session.role) &&
    typeof session.expiresAt === 'number' &&
    Number.isFinite(session.expiresAt)
  );
}

export function subscribeToDemoAuth(listener: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === SESSION_KEY || event.key === null) {
      listener();
    }
  };

  window.addEventListener(SESSION_CHANGE_EVENT, listener);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(SESSION_CHANGE_EVENT, listener);
    window.removeEventListener('storage', handleStorage);
  };
}

export function getDemoSession(): DemoSession | null {
  const storage = getSessionStorage();
  let rawSession: string | null;
  try {
    rawSession = storage.getItem(SESSION_KEY);
  } catch {
    throw new DemoAuthStorageError('Unable to read the demo session from this browser.');
  }

  if (rawSession === null) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawSession);
  } catch {
    parsed = null;
  }

  if (!isDemoSession(parsed)) {
    try {
      storage.removeItem(SESSION_KEY);
    } catch {
      throw new DemoAuthStorageError('Unable to clear malformed demo session data.');
    }
    return null;
  }

  if (parsed.expiresAt <= Date.now()) {
    try {
      storage.removeItem(SESSION_KEY);
    } catch {
      throw new DemoAuthStorageError('Unable to clear the expired demo session.');
    }
    return null;
  }

  return parsed;
}

export function authenticateDemo(role: DemoRole, email: string, password: string): boolean {
  if (!isDemoModeEnabled()) {
    return false;
  }

  const account = DEMO_ACCOUNTS[role];
  if (email.trim().toLowerCase() !== account.email || password !== account.password) {
    return false;
  }

  try {
    getSessionStorage().setItem(SESSION_KEY, JSON.stringify({
      role,
      expiresAt: Date.now() + SESSION_LIFETIME_MS,
    } satisfies DemoSession));
  } catch {
    throw new DemoAuthStorageError('Unable to save the demo session in this browser.');
  }
  notifySessionChange();
  return true;
}

export function getDemoRole(): DemoRole | null {
  return getDemoSession()?.role ?? null;
}

export function signOutDemo(): void {
  try {
    getSessionStorage().removeItem(SESSION_KEY);
  } catch {
    throw new DemoAuthStorageError('Unable to clear the demo session from this browser.');
  }
  notifySessionChange();
}

export function getDemoLoginRedirect(role: DemoRole, state: unknown): string {
  const fallback = `/${role}/dashboard`;
  if (typeof state !== 'object' || state === null || !('from' in state)) {
    return fallback;
  }

  const from = (state as { from?: unknown }).from;
  if (typeof from !== 'object' || from === null || !('pathname' in from)) {
    return fallback;
  }

  const destination = from as { pathname?: unknown; search?: unknown; hash?: unknown };
  const pathname = destination.pathname;
  if (
    typeof pathname !== 'string' ||
    !(pathname === `/${role}` || pathname.startsWith(`/${role}/`)) ||
    pathname === `/${role}/login` ||
    pathname.startsWith(`/${role}/login/`)
  ) {
    return fallback;
  }

  const search = typeof destination.search === 'string' ? destination.search : '';
  const hash = typeof destination.hash === 'string' ? destination.hash : '';
  return `${pathname}${search}${hash}`;
}

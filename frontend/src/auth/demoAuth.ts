export type DemoRole = 'student' | 'institution';

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

export class DemoAuthStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DemoAuthStorageError';
  }
}

export function authenticateDemo(role: DemoRole, email: string, password: string): boolean {
  const account = DEMO_ACCOUNTS[role];
  if (email.trim().toLowerCase() !== account.email || password !== account.password) {
    return false;
  }

  try {
    sessionStorage.setItem(SESSION_KEY, role);
  } catch {
    throw new DemoAuthStorageError('Unable to save the demo session in this browser.');
  }
  return true;
}

export function getDemoRole(): DemoRole | null {
  let role: string | null;
  try {
    role = sessionStorage.getItem(SESSION_KEY);
  } catch {
    throw new DemoAuthStorageError('Unable to read the demo session from this browser.');
  }
  return role === 'student' || role === 'institution' ? role : null;
}

export function signOutDemo(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    throw new DemoAuthStorageError('Unable to clear the demo session from this browser.');
  }
}

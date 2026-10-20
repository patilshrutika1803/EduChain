import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  authenticateDemo,
  getDemoSession,
  signOutDemo,
  subscribeToDemoAuth,
  type DemoRole,
} from './demoAuth';
import { isDemoModeEnabled } from './demoMode';
import { getBrowserSupabaseClient } from './supabase';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';
type AuthMode = 'demo' | 'supabase' | 'unconfigured';

interface AuthContextValue {
  status: AuthStatus;
  mode: AuthMode;
  role: DemoRole | null;
  email: string | null;
  error: string;
  signIn: (role: DemoRole, email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';

interface ResolvedProfile {
  role: DemoRole;
}

async function getProfile(accessToken: string): Promise<ResolvedProfile> {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof result === 'object' &&
      result !== null &&
      'message' in result &&
      typeof result.message === 'string'
        ? result.message
        : 'Unable to load the account profile.';
    const error = new Error(message);
    if (
      response.status === 403 &&
      typeof result === 'object' &&
      result !== null &&
      'code' in result &&
      result.code === 'profile_not_found'
    ) {
      error.name = 'ProfileNotFoundError';
    }
    throw error;
  }

  if (
    typeof result !== 'object' ||
    result === null ||
    !('role' in result) ||
    (result.role !== 'student' && result.role !== 'institution')
  ) {
    throw new Error('The account has no supported EduChain role.');
  }
  return { role: result.role };
}

function profileDisplayName(session: Session): string {
  const metadataName = session.user.user_metadata?.display_name;
  if (typeof metadataName === 'string' && metadataName.trim()) {
    return metadataName.trim();
  }
  return session.user.email?.split('@')[0] || 'Student';
}

async function createStudentProfile(session: Session): Promise<void> {
  const client = getBrowserSupabaseClient();
  if (!client) {
    throw new Error('Supabase authentication is not configured.');
  }

  const { error } = await client.from('profiles').insert({
    id: session.user.id,
    display_name: profileDisplayName(session),
    role: 'student',
  });

  if (error) {
    throw new Error(
      'Your account is authenticated, but a student profile could not be provisioned. Verify the database migrations and profile policies.',
    );
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [role, setRole] = useState<DemoRole | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState('');
  const requestId = useRef(0);
  const demoMode = isDemoModeEnabled();
  const client = demoMode ? undefined : getBrowserSupabaseClient();
  const mode: AuthMode = demoMode ? 'demo' : client ? 'supabase' : 'unconfigured';

  const updateForSession = useCallback(
    async (
      session: Session | null,
      allowStudentProvision = false,
    ): Promise<DemoRole | null> => {
      const currentRequest = ++requestId.current;
      if (!session) {
        setRole(null);
        setEmail(null);
        setError('');
        setStatus('unauthenticated');
        return null;
      }

      setStatus('loading');
      setEmail(session.user.email ?? null);
      setError('');
      try {
        let profile: ResolvedProfile;
        try {
          profile = await getProfile(session.access_token);
        } catch (profileError) {
          if (
            allowStudentProvision &&
            profileError instanceof Error &&
            profileError.name === 'ProfileNotFoundError'
          ) {
            await createStudentProfile(session);
            profile = await getProfile(session.access_token);
          } else {
            throw profileError;
          }
        }
        if (currentRequest !== requestId.current) return null;
        setRole(profile.role);
        setStatus('authenticated');
        return profile.role;
      } catch (profileError) {
        if (currentRequest !== requestId.current) return null;
        setRole(null);
        setStatus('error');
        setError(
          profileError instanceof Error
            ? profileError.message
            : 'Unable to verify the account profile.',
        );
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    if (demoMode) {
      const refreshDemo = () => {
        try {
          const session = getDemoSession();
          setRole(session?.role ?? null);
          setEmail(null);
          setError('');
          setStatus(session ? 'authenticated' : 'unauthenticated');
        } catch (demoError) {
          setRole(null);
          setStatus('error');
          setError(
            demoError instanceof Error
              ? demoError.message
              : 'Unable to check the demo session.',
          );
        }
      };
      refreshDemo();
      return subscribeToDemoAuth(refreshDemo);
    }

    if (!client) {
      setRole(null);
      setStatus('unauthenticated');
      return;
    }

    let active = true;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (active) void updateForSession(session);
    });
    void client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) {
        setStatus('error');
        setError('Unable to restore the Supabase session.');
        return;
      }
      void updateForSession(data.session);
    }).catch(() => {
      if (!active) return;
      setStatus('error');
      setError('Unable to restore the Supabase session.');
    });

    return () => {
      active = false;
      requestId.current++;
      subscription.unsubscribe();
    };
  }, [client, demoMode, updateForSession]);

  const signIn = useCallback(
    async (requestedRole: DemoRole, userEmail: string, password: string) => {
      setError('');
      if (demoMode) {
        if (!authenticateDemo(requestedRole, userEmail, password)) {
          throw new Error('Invalid demo email or password.');
        }
        return;
      }
      if (!client) {
        throw new Error('Supabase authentication is not configured.');
      }

      const { data, error: signInError } = await client.auth.signInWithPassword({
        email: userEmail.trim(),
        password,
      });
      if (signInError || !data.session) {
        throw new Error(signInError?.message ?? 'Supabase did not create a session.');
      }

      const verifiedRole = await updateForSession(
        data.session,
        requestedRole === 'student',
      );
      if (!verifiedRole) {
        throw new Error('Unable to verify the account profile. Check the profile setup and try again.');
      }
      if (verifiedRole !== requestedRole) {
        throw new Error(
          `This account is registered as a ${verifiedRole} and cannot use the ${requestedRole} portal.`,
        );
      }
    },
    [client, demoMode, updateForSession],
  );

  const signUp = useCallback(
    async (userEmail: string, password: string, displayName: string) => {
      if (demoMode || !client) {
        throw new Error('Sign-up is available only with configured Supabase authentication.');
      }
      const { data, error: signUpError } = await client.auth.signUp({
        email: userEmail.trim(),
        password,
        options: { data: { display_name: displayName.trim() } },
      });
      if (signUpError) throw new Error(signUpError.message);
      if (!data.session) {
        setStatus('unauthenticated');
        return true;
      }
      await createStudentProfile(data.session);
      const verifiedRole = await updateForSession(data.session);
      if (verifiedRole !== 'student') {
        throw new Error('The student account profile could not be verified.');
      }
      return false;
    },
    [client, demoMode, updateForSession],
  );

  const signOut = useCallback(async () => {
    if (demoMode) {
      signOutDemo();
      return;
    }
    if (!client) {
      throw new Error('Supabase authentication is not configured.');
    }
    const { error: signOutError } = await client.auth.signOut();
    if (signOutError) throw new Error(signOutError.message);
  }, [client, demoMode]);

  const value = useMemo(
    () => ({ status, mode, role, email, error, signIn, signUp, signOut }),
    [status, mode, role, email, error, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}

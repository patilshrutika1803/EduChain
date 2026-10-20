import { useEffect, useState } from 'react';
import { getDemoSession, subscribeToDemoAuth, type DemoRole } from './demoAuth';
import { isDemoModeEnabled } from './demoMode';

interface DemoAuthState {
  role: DemoRole | null;
  expiresAt: number | null;
  error: string;
}

function readDemoAuth(): DemoAuthState {
  if (!isDemoModeEnabled()) {
    return { role: null, expiresAt: null, error: '' };
  }

  try {
    const session = getDemoSession();
    return { role: session?.role ?? null, expiresAt: session?.expiresAt ?? null, error: '' };
  } catch (error) {
    return {
      role: null,
      expiresAt: null,
      error: error instanceof Error ? error.message : 'Unable to check the demo session.',
    };
  }
}

export function useDemoAuth(): DemoAuthState {
  const [state, setState] = useState(readDemoAuth);

  useEffect(() => {
    if (!isDemoModeEnabled()) {
      return;
    }

    const refresh = () => setState(readDemoAuth());
    return subscribeToDemoAuth(refresh);
  }, []);

  useEffect(() => {
    if (state.expiresAt === null) {
      return;
    }
    const timeout = window.setTimeout(
      () => setState(readDemoAuth()),
      Math.max(0, state.expiresAt - Date.now()),
    );
    return () => window.clearTimeout(timeout);
  }, [state.expiresAt]);

  return state;
}

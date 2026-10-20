import { useCallback, useEffect, useState } from 'react';
import { listCredentials, subscribeToCredentialChanges } from './credentialStorage';
import type { DemoCredentialRecord } from '../types';
import { useAuth } from '../auth/AuthProvider';

interface CredentialRecordsState {
  credentials: DemoCredentialRecord[];
  error: string;
  loading: boolean;
}

export function useCredentialRecords(): CredentialRecordsState {
  const { mode } = useAuth();
  const [state, setState] = useState<CredentialRecordsState>({
    credentials: [],
    error: '',
    loading: true,
  });

  const refresh = useCallback(() => {
    if (mode !== 'demo') {
      setState({
        credentials: [],
        error: 'Browser-stored credentials are demo-only and are hidden outside explicit demo mode.',
        loading: false,
      });
      return;
    }

    try {
      setState({ credentials: listCredentials(), error: '', loading: false });
    } catch (error) {
      setState({
        credentials: [],
        error: error instanceof Error ? error.message : 'Unable to read saved credentials.',
        loading: false,
      });
    }
  }, [mode]);

  useEffect(() => {
    refresh();
    return subscribeToCredentialChanges(refresh);
  }, [refresh]);

  return state;
}

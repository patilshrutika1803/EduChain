import { useCallback, useEffect, useState } from 'react';
import { listCredentials, subscribeToCredentialChanges } from './credentialStorage';
import type { DemoCredentialRecord } from '../types';

interface CredentialRecordsState {
  credentials: DemoCredentialRecord[];
  error: string;
  loading: boolean;
}

export function useCredentialRecords(): CredentialRecordsState {
  const [state, setState] = useState<CredentialRecordsState>({
    credentials: [],
    error: '',
    loading: true,
  });

  const refresh = useCallback(() => {
    try {
      setState({ credentials: listCredentials(), error: '', loading: false });
    } catch (error) {
      setState({
        credentials: [],
        error: error instanceof Error ? error.message : 'Unable to read saved credentials.',
        loading: false,
      });
    }
  }, []);

  useEffect(() => {
    refresh();
    return subscribeToCredentialChanges(refresh);
  }, [refresh]);

  return state;
}

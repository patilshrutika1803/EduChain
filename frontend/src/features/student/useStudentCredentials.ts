import { DEMO_ACCOUNTS } from '../../auth/demoAuth';
import { useCredentialRecords } from '../../data/useCredentialRecords';

export function useStudentCredentials() {
  const { credentials, error, loading } = useCredentialRecords();
  const accountEmail = DEMO_ACCOUNTS.student.email.trim().toLowerCase();
  return {
    credentials: credentials.filter(
      (credential) => credential.studentEmail?.trim().toLowerCase() === accountEmail,
    ),
    error,
    loading,
  };
}

import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import type { CredentialStatus, VerificationResult } from '../../types';

type Status = CredentialStatus | VerificationResult | string;

const configs: Record<string, { label: string; classes: string; Icon: typeof CheckCircle }> = {
  ACTIVE: { label: 'Active', classes: 'bg-green-50 text-green-700 border-green-200', Icon: CheckCircle },
  VERIFIED: { label: 'Verified', classes: 'bg-green-50 text-green-700 border-green-200', Icon: CheckCircle },
  SUSPENDED: { label: 'Suspended', classes: 'bg-amber-50 text-amber-700 border-amber-200', Icon: AlertTriangle },
  REVOKED: { label: 'Revoked', classes: 'bg-red-50 text-red-700 border-red-200', Icon: XCircle },
  TAMPERED: { label: 'Tampered', classes: 'bg-red-50 text-red-700 border-red-200', Icon: AlertTriangle },
  NOT_FOUND: { label: 'Not Found', classes: 'bg-slate-50 text-slate-600 border-slate-200', Icon: XCircle },
  INVALID_ISSUER: { label: 'Invalid Issuer', classes: 'bg-red-50 text-red-700 border-red-200', Icon: XCircle },
  INVALID_SIGNATURE: { label: 'Invalid Signature', classes: 'bg-red-50 text-red-700 border-red-200', Icon: XCircle },
  AUTHORIZED: { label: 'Authorized', classes: 'bg-green-50 text-green-700 border-green-200', Icon: CheckCircle },
  UNAUTHORIZED: { label: 'Unauthorized', classes: 'bg-red-50 text-red-700 border-red-200', Icon: XCircle },
  PENDING: { label: 'Pending', classes: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Clock },
  SUCCESS: { label: 'Success', classes: 'bg-green-50 text-green-700 border-green-200', Icon: CheckCircle },
  FAILED: { label: 'Failed', classes: 'bg-red-50 text-red-700 border-red-200', Icon: XCircle },
};

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const config = configs[status] ?? { label: status, classes: 'bg-slate-50 text-slate-600 border-slate-200', Icon: Clock };
  const { label, classes, Icon } = config;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-1.5',
  }[size];

  const iconSize = size === 'lg' ? 14 : 12;

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${classes} ${sizeClasses}`}>
      {showIcon && <Icon size={iconSize} />}
      {label}
    </span>
  );
}

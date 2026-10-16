import { Radio } from 'lucide-react';

interface NetworkBadgeProps {
  network: string;
}

export function NetworkBadge({ network }: NetworkBadgeProps) {
  const normalizedNetwork = network.trim().toLowerCase();
  const isDisconnected = normalizedNetwork === 'not connected';
  const isTestnet = normalizedNetwork.includes('sepolia') || normalizedNetwork.includes('hardhat');
  const statusClasses = isDisconnected
    ? 'bg-slate-50 text-slate-600 border-slate-200'
    : isTestnet
      ? 'bg-violet-50 text-violet-700 border-violet-200'
      : 'bg-green-50 text-green-700 border-green-200';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusClasses}`}>
      <Radio size={11} />
      {network}
    </span>
  );
}

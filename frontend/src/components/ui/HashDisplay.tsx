import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface HashDisplayProps {
  value: string;
  label?: string;
  truncate?: boolean;
  className?: string;
}

export function HashDisplay({ value, label, truncate = true, className = '' }: HashDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const display = truncate ? `${value.slice(0, 10)}...${value.slice(-6)}` : value;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && <span className="text-xs text-slate-500 font-medium">{label}</span>}
      <code className="font-mono text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
        {display}
      </code>
      <button
        type="button"
        onClick={copy}
        title="Copy to clipboard"
        aria-label="Copy hash to clipboard"
        className="text-slate-400 hover:text-slate-700 transition-colors p-0.5"
      >
        {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
      </button>
      {copyError && <span role="status" className="text-xs text-amber-700">Clipboard unavailable</span>}
    </div>
  );
}

export function FullHashDisplay({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  };

  return (
    <div className="space-y-1">
      {label && <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>}
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
        <code className="font-mono text-xs text-slate-700 break-all flex-1">{value}</code>
        <button
          type="button"
          onClick={copy}
          title="Copy"
          aria-label="Copy hash to clipboard"
          className="text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0"
        >
          {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
        </button>
      </div>
      {copyError && <p role="status" className="text-xs text-amber-700">Clipboard unavailable; select and copy the hash.</p>}
    </div>
  );
}

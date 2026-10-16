import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  const padMap = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };
  return (
    <div className={`bg-white border border-slate-200 rounded-xl ${padMap[padding]} ${className}`}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'slate';
  delta?: string;
}

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', value: 'text-blue-700' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', value: 'text-green-700' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', value: 'text-amber-700' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', value: 'text-red-700' },
  slate: { bg: 'bg-slate-50', icon: 'text-slate-600', value: 'text-slate-700' },
};

export function StatCard({ label, value, icon, color = 'blue', delta }: StatCardProps) {
  const c = colorMap[color];
  return (
    <Card className="flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg ${c.bg} ${c.icon} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold ${c.value}`}>{value}</p>
        {delta && <p className="text-xs text-slate-400 mt-0.5">{delta}</p>}
      </div>
    </Card>
  );
}

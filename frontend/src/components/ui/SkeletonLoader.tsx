interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-100">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-3 flex-1" />
      <Skeleton className="h-5 w-14 rounded-full" />
      <Skeleton className="h-3 w-12" />
    </div>
  );
}

export function SkeletonTable({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex gap-4">
        {[28, 24, 40, 16, 20, 14].map((w, i) => (
          <Skeleton key={i} className={`h-3 w-${w}`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        ))}
      </div>
      <SkeletonTable rows={5} />
    </div>
  );
}

export function SkeletonCredentialDetail() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-60" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

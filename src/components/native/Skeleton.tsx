// ─────────────────────────────────────────────
// Skeleton — native-style shimmer loading placeholder
// Usage: <Skeleton className="h-4 w-32" />
//        <SkeletonCard /> for full card layout
// ─────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Skeleton({ className = '', rounded = 'md' }: SkeletonProps) {
  const r = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }[rounded];
  return <div className={`skeleton ${r} ${className}`} aria-hidden="true" />;
}

/** Card-shaped skeleton — for stat tiles, exam cards, etc */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 bg-white rounded-xl border border-gray-100 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-10 h-10" rounded="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

/** List of skeleton rows — for lists like classes, exams */
export function SkeletonList({ count = 5, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Stat grid — for dashboard metrics */
export function SkeletonStatGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-white rounded-xl border border-gray-100">
          <Skeleton className="w-8 h-8 mb-2" rounded="lg" />
          <Skeleton className="h-6 w-1/2 mb-1" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

/** Page-level skeleton — header + cards */
export function SkeletonPage() {
  return (
    <div className="p-4 space-y-4 fade-in">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <SkeletonStatGrid />
      <SkeletonList count={3} />
    </div>
  );
}

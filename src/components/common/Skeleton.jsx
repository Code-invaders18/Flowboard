// Lightweight skeleton placeholder for loading states.
export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-border ${className}`}
      aria-hidden="true"
    />
  );
}

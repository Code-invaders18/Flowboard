import { Skeleton } from '../common';

// Skeleton placeholders shown while the tree loads.
export function SidebarSkeleton() {
  return (
    <div className="space-y-2 p-3" aria-busy="true" aria-label="Loading sidebar">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="ml-3 h-4 w-1/2" />
      <Skeleton className="ml-6 h-4 w-3/5" />
      <Skeleton className="ml-6 h-4 w-2/5" />
      <Skeleton className="ml-3 h-4 w-1/2" />
      <Skeleton className="ml-6 h-4 w-1/2" />
    </div>
  );
}

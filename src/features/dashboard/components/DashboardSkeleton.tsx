import React from 'react';
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="flex-1 p-4 space-y-4 pb-24 max-w-md mx-auto w-full">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <LoadingSkeleton className="h-6 w-36" />
          <LoadingSkeleton className="h-3 w-24" />
        </div>
        <LoadingSkeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Hero Card Skeleton */}
      <LoadingSkeleton className="h-36 w-full rounded-[20px]" />

      {/* Money Summary Skeleton */}
      <div className="grid grid-cols-3 gap-2.5">
        <LoadingSkeleton className="h-16 w-full rounded-[20px]" />
        <LoadingSkeleton className="h-16 w-full rounded-[20px]" />
        <LoadingSkeleton className="h-16 w-full rounded-[20px]" />
      </div>

      {/* Budget Skeleton */}
      <LoadingSkeleton className="h-24 w-full rounded-[20px]" />

      {/* Today Spending Skeleton */}
      <LoadingSkeleton className="h-28 w-full rounded-[20px]" />
    </div>
  );
};

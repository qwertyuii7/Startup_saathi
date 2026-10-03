"use client";

export function AnalysisSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      
      {/* Top Banner Skeleton */}
      <div className="bg-neutral-100 rounded-2xl h-36 w-full" />

      {/* Summary Row Skeleton */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
        <div className="h-5 bg-neutral-200 rounded w-1/4" />
        <div className="flex gap-2">
          <div className="h-8 bg-neutral-200 rounded-xl w-24" />
          <div className="h-8 bg-neutral-200 rounded-xl w-28" />
          <div className="h-8 bg-neutral-200 rounded-xl w-32" />
        </div>
      </div>

      {/* Scheme Cards Skeletons */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 bg-neutral-200 rounded w-1/3" />
              <div className="h-4 bg-neutral-200 rounded w-20" />
            </div>
            <div className="h-3 bg-neutral-100 rounded w-2/3" />
            <div className="h-3 bg-neutral-100 rounded w-1/2" />
            <div className="pt-2 flex gap-2">
              <div className="h-6 bg-neutral-100 rounded-lg w-32" />
              <div className="h-6 bg-neutral-100 rounded-lg w-28" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

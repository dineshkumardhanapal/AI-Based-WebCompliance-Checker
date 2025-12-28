'use client';

function LoadingSkeleton() {
  return (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-100/50 dark:border-slate-700/50 p-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-4">
        <div className="h-8 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-lg w-3/4 animate-shimmer"></div>
        <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-lg w-1/2 animate-shimmer"></div>
      </div>
      
      {/* Score Section Skeleton */}
      <div className="flex flex-col items-center mb-8 space-y-6">
        <div className="w-48 h-48 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-full animate-shimmer"></div>
        <div className="w-full max-w-md h-3 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-full animate-shimmer"></div>
      </div>
      
      {/* Checks Skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-6 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-full animate-shimmer"></div>
              <div className="h-5 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-lg w-1/2 animate-shimmer"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-lg w-full animate-shimmer"></div>
              <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-lg w-3/4 animate-shimmer"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingSkeleton;

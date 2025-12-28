'use client';

import { Loader2 } from 'lucide-react';

function ProgressIndicator({ stage, progress, estimatedTime }) {
  const stages = [
    'Fetching webpage...',
    'Analyzing content...',
    'Running compliance checks...',
    'Generating recommendations...',
  ];

  const currentStageIndex = stages.findIndex(s => s === stage) !== -1 
    ? stages.findIndex(s => s === stage) 
    : 0;

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-100/50 dark:border-slate-700/50 p-6 sm:p-8" role="status" aria-live="polite" aria-label="Analysis in progress">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={28} />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-full blur-xl"></div>
        </div>
        <div className="flex-1">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{stage || 'Analyzing...'}</p>
          {estimatedTime && (
            <p className="text-sm text-slate-600 dark:text-slate-400">Estimated time: ~{estimatedTime}s</p>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="mb-8">
          <div className="relative h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow-sm">
                {progress}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stages */}
      <div className="space-y-3">
        {stages.map((s, index) => {
          const isActive = index === currentStageIndex;
          const isCompleted = index < currentStageIndex;
          
          return (
            <div 
              key={index}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700' 
                  : isCompleted
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                  : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600'
              }`}
            >
              <div className={`flex-shrink-0 w-3 h-3 rounded-full transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-500 shadow-lg shadow-blue-500/50 animate-pulse' 
                  : isCompleted
                  ? 'bg-green-500'
                  : 'bg-slate-300 dark:bg-slate-600'
              }`}></div>
              <span className={`text-sm font-medium transition-colors ${
                isActive 
                  ? 'text-blue-700 dark:text-blue-300' 
                  : isCompleted
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                {s}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProgressIndicator;

'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Info, Lightbulb } from 'lucide-react';

function RuleCheck({ check }) {
  const { name, passed, details, recommendation } = check;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`group relative bg-white dark:bg-slate-800 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${
      passed 
        ? 'border-green-200 dark:border-green-800/30 hover:border-green-300 dark:hover:border-green-700' 
        : 'border-red-200 dark:border-red-800/30 hover:border-red-300 dark:hover:border-red-700'
    }`}>
      {/* Header */}
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Status Badge */}
            <div className={`flex-shrink-0 p-2.5 rounded-xl ${
              passed 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {passed ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${
                  passed
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {passed ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                {name}
              </h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                {details}
              </p>
            </div>
          </div>

          {/* Expand Button */}
          <button
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
            className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 ${
              expanded
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 border-t border-slate-200 dark:border-slate-700 pt-5 space-y-4 animate-fadeIn">
          {!passed && recommendation && (
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <strong className="text-sm font-bold text-slate-900 dark:text-white">
                  AI Recommendation
                </strong>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {recommendation}
              </p>
            </div>
          )}
          
          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This check validates WCAG compliance standards for web accessibility.
            </span>
          </div>
        </div>
      )}

      {/* Recommendation Preview */}
      {!expanded && !passed && recommendation && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer group"
            aria-label="Expand to view AI recommendation"
          >
            <Lightbulb className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="underline decoration-dotted underline-offset-2">Click to view AI recommendation</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default RuleCheck;

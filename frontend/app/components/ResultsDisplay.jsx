'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Filter, X, Globe, Award, AlertCircle } from 'lucide-react';
import RuleCheck from './RuleCheck';
import ResultsActions from './ResultsActions';
import SuccessCelebration from './SuccessCelebration';

function ResultsDisplay({ results, onNewCheck }) {
  const { score, passedCount, totalCount, checks, url } = results;
  const [filter, setFilter] = useState('all'); // all, passed, failed

  const filteredChecks = checks.filter(check => {
    if (filter === 'passed') return check.passed;
    if (filter === 'failed') return !check.passed;
    return true;
  });

  const passedChecks = checks.filter(c => c.passed).length;
  const failedChecks = checks.filter(c => !c.passed).length;
  const percentage = Math.round((passedCount / totalCount) * 100);

  const getScoreLabel = () => {
    if (passedCount === totalCount) return 'Perfect!';
    if (passedCount >= 7) return 'Good';
    if (passedCount >= 5) return 'Fair';
    return 'Needs Work';
  };

  const getScoreColor = () => {
    if (passedCount === totalCount) return 'from-green-500 to-emerald-600';
    if (passedCount >= 7) return 'from-blue-500 to-indigo-600';
    if (passedCount >= 5) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  useEffect(() => {
    // Smooth scroll to results when component mounts
    const timer = setTimeout(() => {
      const element = document.querySelector('.results-display');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="results-display space-y-8" role="region" aria-label="Compliance check results">
      <SuccessCelebration score={score} passedCount={passedCount} totalCount={totalCount} />
      
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
              Compliance Results
            </h2>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors break-all"
                aria-label={`Open ${url} in new tab`}
              >
                {url.length > 60 ? `${url.substring(0, 60)}...` : url}
              </a>
            </div>
          </div>
          <ResultsActions results={results} onNewCheck={onNewCheck} />
        </div>

        {/* Score Card */}
        <div className="bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 sm:p-8 border border-blue-100/50 dark:border-blue-800/30">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Score Badge */}
            <div className="flex-shrink-0">
              <div className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br ${getScoreColor()} flex items-center justify-center shadow-2xl`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                <div className="relative text-center">
                  <div className="text-4xl sm:text-5xl font-extrabold text-white mb-1" aria-label={`Score: ${score}`}>
                    {score}
                  </div>
                  <div className="text-sm sm:text-base font-semibold text-white/90">
                    {getScoreLabel()}
                  </div>
                </div>
              </div>
            </div>

            {/* Score Details */}
            <div className="flex-1 w-full">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Overall Score</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {percentage}%
                  </span>
                </div>
                <div 
                  className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner"
                  role="progressbar" 
                  aria-valuenow={passedCount} 
                  aria-valuemin={0} 
                  aria-valuemax={totalCount}
                  aria-label={`${passedCount} out of ${totalCount} checks passed`}
                >
                  <div 
                    className={`h-full bg-gradient-to-r ${getScoreColor()} rounded-full transition-all duration-500 shadow-lg`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-green-200 dark:border-green-800/30">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{passedChecks}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Passed</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-red-200 dark:border-red-800/30">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{failedChecks}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Failed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Checks Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Compliance Checks
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Detailed analysis of each WCAG 2.1 compliance check
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter checks"
              className="px-4 py-2.5 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white font-semibold text-sm cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 shadow-sm"
            >
              <option value="all">All ({checks.length})</option>
              <option value="passed">Passed ({passedChecks})</option>
              <option value="failed">Failed ({failedChecks})</option>
            </select>
          </div>
        </div>

        <div className="space-y-4" role="list">
          {filteredChecks.map((check, index) => (
            <RuleCheck key={index} check={check} />
          ))}
        </div>

        {filteredChecks.length === 0 && (
          <div className="text-center py-12 px-4">
            <AlertCircle className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No checks match the selected filter
            </p>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Try selecting a different filter option
            </p>
            <button 
              onClick={() => setFilter('all')} 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <X size={18} />
              Clear Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsDisplay;

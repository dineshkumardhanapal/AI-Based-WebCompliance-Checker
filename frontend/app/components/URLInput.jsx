'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, CheckCircle2, Clock, X, ArrowRight } from 'lucide-react';

function URLInput({ onCheck, loading }) {
  const [url, setUrl] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [recentUrls, setRecentUrls] = useState([]);
  const inputRef = useRef(null);

  // Load recent URLs from localStorage
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('checkHistory') || '[]');
      const urls = [...new Set(history.map(item => item.url).slice(0, 5))];
      setRecentUrls(urls);
    } catch (e) {
      console.error('Failed to load recent URLs:', e);
    }
  }, []);

  // Validate URL format
  useEffect(() => {
    const urlPattern = /^https?:\/\/.+/;
    setIsValid(urlPattern.test(url.trim()));
  }, [url]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K to focus input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to close recent URLs dropdown
      if (e.key === 'Escape') {
        setShowRecent(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && !loading && isValid) {
      onCheck(url.trim());
    }
  };

  const handleRecentClick = (recentUrl) => {
    setUrl(recentUrl);
    setIsValid(true);
    setShowRecent(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      {/* Main Container */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Field */}
          <div className="relative">
            <div className="flex items-center gap-3">
              {/* Search Icon */}
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-xl">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              
              {/* Input */}
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setShowRecent(false);
                  }}
                  onFocus={() => recentUrls.length > 0 && setShowRecent(true)}
                  onBlur={() => setTimeout(() => setShowRecent(false), 200)}
                  placeholder="Enter website URL (e.g., https://example.com)"
                  className={`w-full px-4 py-3.5 text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-700/50 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                    isValid && url.trim()
                      ? 'border-green-500 focus:ring-green-500/20 focus:border-green-500'
                      : 'border-slate-200 dark:border-slate-600 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                  disabled={loading}
                  required
                  aria-label="Website URL to check for compliance"
                />
                
                {/* Validation Icon */}
                {url && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {isValid ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !url.trim() || !isValid}
                aria-label={loading ? 'Checking compliance, please wait' : 'Run compliance check'}
                aria-busy={loading}
                className="flex-shrink-0 px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:from-slate-300 disabled:via-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 min-w-[180px] disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Check Compliance</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            
            {/* Recent URLs Dropdown */}
            {showRecent && recentUrls.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-700/50">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-2">Recent Checks</span>
                  <button
                    type="button"
                    onClick={() => setShowRecent(false)}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                    aria-label="Close recent URLs"
                  >
                    <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {recentUrls.map((recentUrl, index) => (
                    <button
                      key={`recent-${recentUrl}-${index}`}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleRecentClick(recentUrl)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 group border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                    >
                      <Clock className="w-4 h-4 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                      <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 truncate">{recentUrl}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default URLInput;

'use client';

import { useState, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { History, Search, Menu, X, Github, Twitter, Linkedin, Mail, Shield, FileText, HelpCircle, ExternalLink, Zap, Sparkles, CheckCircle2, Clock, Download, Filter, Moon, BarChart3, Target, Globe, Users } from 'lucide-react';
import URLInput from './components/URLInput';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSkeleton from './components/LoadingSkeleton';
import ProgressIndicator from './components/ProgressIndicator';
import EnhancedError from './components/EnhancedError';
import EmptyState from './components/EmptyState';
import HistorySidebar from './components/HistorySidebar';

function HomePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState('generic');
  const [progressStage, setProgressStage] = useState('');
  const [progress, setProgress] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const resultsRef = useRef(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedResults = localStorage.getItem('lastCheckResult');
    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults);
        setResults(parsed);
      } catch (e) {
        console.error('Failed to load saved results:', e);
      }
    }
  }, []);

  const determineErrorType = (errorMessage) => {
    const message = errorMessage.toLowerCase();
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network';
    }
    if (message.includes('invalid url') || message.includes('url format')) {
      return 'validation';
    }
    if (message.includes('timeout')) {
      return 'timeout';
    }
    if (message.includes('server') || message.includes('500')) {
      return 'server';
    }
    return 'generic';
  };

  const simulateProgress = () => {
    const stages = [
      { name: 'Fetching webpage...', progress: 20 },
      { name: 'Analyzing content...', progress: 40 },
      { name: 'Running compliance checks...', progress: 70 },
      { name: 'Generating recommendations...', progress: 90 },
    ];

    stages.forEach((stage, index) => {
      setTimeout(() => {
        setProgressStage(stage.name);
        setProgress(stage.progress);
      }, (index + 1) * 1000);
    });
  };

  const safeParseJson = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch (e) {
        console.error('Failed to parse JSON response', e);
      }
    }
    try {
      const text = await response.text();
      return { message: text };
    } catch {
      return {};
    }
  };

  const handleCheck = async (urlToCheck) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setProgress(0);
    setProgressStage('Fetching webpage...');
    simulateProgress();

    toast.loading('Starting compliance check...', { id: 'check-status' });

    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlToCheck }),
      });

      if (!response.ok) {
        const errorData = await safeParseJson(response);
        const errorMessage = errorData?.error || errorData?.message || 'Failed to check URL';
        const type = determineErrorType(errorMessage);
        setErrorType(type);
        setError(errorMessage);
        toast.error(errorMessage, { id: 'check-status' });
        setLoading(false);
        setProgress(0);
        setProgressStage('');
        return;
      }

      const data = await safeParseJson(response);
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response from server');
      }

      setProgress(100);
      setProgressStage('Complete!');
      
      setTimeout(() => {
        setResults(data);
        setUrl(urlToCheck);
        
        // Save to localStorage
        try {
          localStorage.setItem('lastCheckResult', JSON.stringify(data));
          const history = JSON.parse(localStorage.getItem('checkHistory') || '[]');
          const newHistoryItem = { 
            ...data, 
            timestamp: new Date().toISOString(), 
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
          };
          history.unshift(newHistoryItem);
          localStorage.setItem('checkHistory', JSON.stringify(history.slice(0, 20)));
        } catch (e) {
          console.error('Failed to save to history:', e);
        }

        toast.success(`Compliance check completed! Score: ${data.score}`, { 
          id: 'check-status',
          duration: 4000,
        });

        // Clear progress once results are shown
        setTimeout(() => {
          setProgress(0);
          setProgressStage('');
          setLoading(false);
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 600);
      }, 500);

    } catch (err) {
      const type = err.message?.toLowerCase().includes('fetch') ? 'network' : 'generic';
      setErrorType(type);
      const errorMessage = err.message || 'An error occurred. Please ensure the Python backend server is running on port 3001.';
      setError(errorMessage);
      toast.error(errorMessage, { id: 'check-status', duration: 5000 });
        setLoading(false);
        setProgress(0);
        setProgressStage('');
    }
  };

  const handleRetry = () => {
    if (url) {
      handleCheck(url);
    }
  };

  const handleSelectHistoryItem = (item) => {
    setResults(item);
    setUrl(item.url);
    setError(null);
    setHistoryOpen(false);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      
      <div className="relative z-0">
        {/* Skip to main content */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg"
        >
        Skip to main content
      </a>
      
        {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
              background: 'rgba(255, 255, 255, 0.98)',
            color: '#0F172A',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(59, 130, 246, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#16A34A',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#DC2626',
              secondary: '#fff',
            },
          },
        }}
      />
      
        {/* Navigation Header - Perfect UI/UX Design */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-blue-100/40 dark:bg-slate-900/80 dark:border-slate-700/60 shadow-sm">
          {/* Subtle blue tint overlay for cohesion */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/40 via-indigo-50/30 to-purple-50/40 dark:from-transparent dark:via-transparent dark:to-transparent pointer-events-none"></div>
          <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo and Brand */}
              <a 
                href="#main-content" 
                className="flex items-center gap-3 group cursor-pointer"
                aria-label="Home"
              >
                <div className="flex-shrink-0 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <svg 
                    className="w-9 h-9 relative z-10 transition-transform duration-300 group-hover:scale-110"
                    viewBox="0 0 100 100" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M50 10 L20 18 L20 45 C20 65 35 82 50 90 C65 82 80 65 80 45 L80 18 Z" 
                      fill="url(#navShieldGradient)" 
                      stroke="currentColor" 
                      strokeWidth="2.5"
                      className="text-blue-600 dark:text-blue-400"
                    />
                    <path 
                      d="M35 50 L45 60 L65 35" 
                      stroke="#10b981" 
                      strokeWidth="5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient id="navShieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                    Compliance Checker
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                    WCAG 2.1
                  </span>
                </div>
              </a>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                <a 
                  href="#main-content" 
                  className="relative px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 rounded-lg group"
                >
                  <span className="relative z-10">Check URL</span>
                  <span className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                </a>
                <a 
                  href="#features" 
                  className="relative px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 rounded-lg group"
                >
                  <span className="relative z-10">Features</span>
                  <span className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                </a>
                <a 
                  href="#about" 
                  className="relative px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 rounded-lg group"
                >
                  <span className="relative z-10">About</span>
                  <span className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                </a>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
                <button
                  onClick={() => setHistoryOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
                >
                  <History size={18} className="relative" />
                  <span>History</span>
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

            {/* Mobile Menu - Enhanced */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-slate-200 dark:border-slate-700 animate-fadeIn">
                <div className="py-4 space-y-1">
                  <a 
                    href="#main-content" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
                  >
                    Check URL
                  </a>
                  <a 
                    href="#features" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
                  >
                    Features
                  </a>
                  <a 
                    href="#about" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
                  >
                    About
                  </a>
                  <div className="px-4 pt-2">
                    <button
                      onClick={() => {
                        setHistoryOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-base font-semibold rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <History size={20} />
                      <span>Check History</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
        </nav>

        {/* History button - Mobile only */}
      <button
          className="fixed top-20 right-6 z-40 p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-blue-100 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 touch-target md:hidden"
        onClick={() => setHistoryOpen(true)}
        aria-label="Open check history"
        aria-expanded={historyOpen}
      >
          <History size={22} />
      </button>

        {/* History sidebar */}
      {historyOpen && (
        <>
          <div 
              className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setHistoryOpen(false)}
            aria-hidden="true"
          />
          <HistorySidebar
            isOpen={historyOpen}
            onClose={() => setHistoryOpen(false)}
            onSelectCheck={handleSelectHistoryItem}
          />
        </>
      )}
      
        {/* Hero Section */}
        <header className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white mt-20">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.08]">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
          </div>
          
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-700/20 via-transparent to-transparent"></div>
          
          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
            <div className="text-center space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-xs font-medium text-white/90 tracking-wide uppercase">AI-Powered Compliance</span>
              </div>
              
              {/* Main Title */}
              <div className="space-y-3">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                  <span className="block text-white">Web Compliance</span>
                  <span className="block bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                    Checker
                  </span>
                </h1>
              </div>
              
              {/* Description */}
              <p className="text-lg sm:text-xl lg:text-2xl text-blue-50/90 max-w-3xl mx-auto leading-relaxed font-light text-center">
                Ensure your website meets WCAG accessibility standards with instant analysis and AI-powered recommendations
              </p>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm">
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-1 h-1 rounded-full bg-white/60"></div>
                  <span>Free Forever</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-1 h-1 rounded-full bg-white/60"></div>
                  <span>No Sign-up Required</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-1 h-1 rounded-full bg-white/60"></div>
                  <span>10,000+ Websites Checked</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Wave Pattern Divider */}
          <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              {/* Multiple wave curves for dynamic feel */}
              <path d="M0,120 Q150,80 300,100 T600,90 T900,100 T1200,85 L1200,120 Z" fill="white" className="dark:fill-slate-900" />
            </svg>
          </div>
      </header>

        {/* Main content */}
        <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20" tabIndex={-1}>
          <div className="space-y-12">
            {/* URL Input Section */}
        <URLInput onCheck={handleCheck} loading={loading} />

            {/* Loading State */}
        {loading && (
              <div className="space-y-6 animate-fadeIn">
            <ProgressIndicator 
              stage={progressStage}
              progress={progress}
              estimatedTime={30 - Math.floor(progress / 3.33)}
            />
            <LoadingSkeleton />
          </div>
        )}

            {/* Error State */}
        {error && (
              <div className="animate-fadeIn">
          <EnhancedError 
            error={error} 
            onRetry={handleRetry}
            type={errorType}
          />
              </div>
        )}

            {/* Empty State */}
        {!loading && !error && !results && (
              <div className="animate-fadeIn">
                <EmptyState />
              </div>
        )}

            {/* Results */}
        {!loading && results && (
              <div className="animate-fadeIn" ref={resultsRef}>
          <ResultsDisplay 
            results={results} 
            onNewCheck={() => {
              setResults(null);
              setUrl('');
              setError(null);
              // Clear localStorage to prevent reloading old results on refresh
              try {
                localStorage.removeItem('lastCheckResult');
              } catch (e) {
                console.error('Failed to clear localStorage:', e);
              }
              toast.success('Ready for a new check!');
            }}
          />
              </div>
        )}
          </div>
      </main>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-full mb-6 border border-blue-200/50 dark:border-blue-800/50">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Powerful Features</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need for
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Compliance Checking</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed text-center">
              Comprehensive WCAG compliance analysis with AI-powered insights and modern tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {/* Feature 1 */}
            <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 mb-4 shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">10 Compliance Checks</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-left">
                  Comprehensive analysis against WCAG 2.1 standards including keyboard accessibility, color contrast, and semantic HTML
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 mb-4 shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI-Powered Recommendations</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-left">
                  Get contextual, actionable recommendations powered by OpenAI GPT-5 for fixing compliance issues
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 hover:shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 mb-4 shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Instant Analysis</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-left">
                  Receive detailed compliance reports in under 30 seconds with real-time progress tracking
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 hover:shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 mb-4 shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Check History</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-left">
                  Track your compliance checks over time with automatic history saving and easy access to past results
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4 shadow-lg">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Export Results</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-left">
                  Download compliance reports in JSON or PDF format for documentation and sharing with your team
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg">
                  <Moon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Dark Mode</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-left">
                  Beautiful dark mode support with automatic system preference detection for comfortable viewing
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-3xl p-8 sm:p-12 border border-blue-100/50 dark:border-blue-800/30">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">10</div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider leading-relaxed">Compliance Checks</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">&lt;30s</div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider leading-relaxed">Analysis Time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-3">100%</div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider leading-relaxed">Free Forever</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">WCAG</div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider leading-relaxed">2.1 Compliant</div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-full mb-6 border border-blue-200/50 dark:border-blue-800/50">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">About Our Mission</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                Making Web Accessibility
                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Simple & Accessible</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed text-left">
                Web Compliance Checker is dedicated to making the web more accessible for everyone. We believe that accessibility should be simple, fast, and available to all developers and organizations, regardless of their size or budget.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-left">
                Our AI-powered platform helps you ensure your websites meet WCAG 2.1 standards, providing instant analysis and actionable recommendations to improve accessibility for all users.
              </p>

              {/* Key Points */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-left">WCAG 2.1 Compliance</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed text-left">
                      Ensuring your website meets international accessibility standards set by the World Wide Web Consortium
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-left">Inclusive Design</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed text-left">
                      Making the web accessible for users with disabilities, improving usability for everyone
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-left">Free & Open</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed text-left">
                      No sign-up required, no hidden fees. Accessibility tools should be available to everyone, forever.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Visual Elements */}
            <div className="relative">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Accessibility First</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">WCAG 2.1 Standards</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <span className="text-sm font-semibold text-green-700 dark:text-green-400">10/10</span>
                    </div>
                  </div>
                  
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full w-full"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">10</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Checks</div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">&lt;30s</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Analysis</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span>Powered by OpenAI GPT-5</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 border-t border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {/* Brand Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <svg 
                    className="w-8 h-8"
                    viewBox="0 0 100 100" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M50 10 L20 18 L20 45 C20 65 35 82 50 90 C65 82 80 65 80 45 L80 18 Z" 
                      fill="url(#footerShieldGradient)" 
                      stroke="currentColor" 
                      strokeWidth="2.5"
                      className="text-blue-600 dark:text-blue-400"
                    />
                    <path 
                      d="M35 50 L45 60 L65 35" 
                      stroke="#10b981" 
                      strokeWidth="5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient id="footerShieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Compliance Checker
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  AI-powered web accessibility compliance checker. Ensure your website meets WCAG standards with instant analysis.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                    aria-label="GitHub"
                  >
                    <Github size={20} />
                  </a>
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                    aria-label="Twitter"
                  >
                    <Twitter size={20} />
                  </a>
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={20} />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Quick Links
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a 
                      href="#main-content" 
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <ExternalLink size={14} />
                      Check URL
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#features" 
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <ExternalLink size={14} />
                      Features
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#about" 
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <ExternalLink size={14} />
                      About
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={() => setHistoryOpen(true)}
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <History size={14} />
                      Check History
                    </button>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Resources
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a 
                      href="https://www.w3.org/WAI/WCAG21/quickref/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <FileText size={14} />
                      WCAG Guidelines
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.w3.org/WAI/fundamentals/accessibility-principles/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <Shield size={14} />
                      Accessibility Principles
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <HelpCircle size={14} />
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <FileText size={14} />
                      Documentation
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact & Legal */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Contact
                </h3>
                <ul className="space-y-3 mb-6">
                  <li>
                    <a 
                      href="mailto:support@compliancechecker.com" 
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <Mail size={14} />
                      support@compliancechecker.com
                    </a>
                  </li>
                </ul>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <ul className="space-y-2">
                    <li>
                      <a 
                        href="#" 
                        className="text-xs text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                      >
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a 
                        href="#" 
                        className="text-xs text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                      >
                        Terms of Service
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center md:text-left">
                  © {new Date().getFullYear()} Compliance Checker. All rights reserved.
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center md:text-right">
                  Built with ❤️ for web accessibility compliance checking
                </p>
              </div>
            </div>
          </div>
      </footer>
      </div>
    </div>
  );
}

export default HomePage;

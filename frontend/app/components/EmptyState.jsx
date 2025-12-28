'use client';

import { Sparkles, Shield, Zap, ArrowRight, Users, TrendingUp, Award, CheckCircle2, Star, Target, Clock } from 'lucide-react';

function EmptyState() {
  const features = [
    { icon: Shield, title: '10 Compliance Checks', value: 'WCAG 2.1', color: 'from-blue-500 to-blue-600' },
    { icon: Zap, title: 'AI Recommendations', value: 'GPT-5 Powered', color: 'from-purple-500 to-purple-600' },
    { icon: Sparkles, title: 'Instant Analysis', value: '< 30s', color: 'from-indigo-500 to-indigo-600' },
  ];

  const benefits = [
    { icon: Shield, title: 'WCAG 2.1 Compliant', desc: 'Meets international standards', color: 'text-blue-600 dark:text-blue-400' },
    { icon: Zap, title: 'Instant Results', desc: 'Get analysis in under 30 seconds', color: 'text-purple-600 dark:text-purple-400' },
    { icon: Sparkles, title: 'AI-Powered', desc: 'Smart recommendations', color: 'text-indigo-600 dark:text-indigo-400' },
    { icon: CheckCircle2, title: '10 Key Checks', desc: 'Comprehensive analysis', color: 'text-green-600 dark:text-green-400' },
  ];

  const processSteps = [
    { step: '1', title: 'Submit URL', desc: 'Enter the website URL' },
    { step: '2', title: 'Analysis', desc: 'System evaluates compliance' },
    { step: '3', title: 'Results', desc: 'Get detailed scoring' },
    { step: '4', title: 'Recommendations', desc: 'AI-powered insights' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-full mb-6 border border-blue-200/50 dark:border-blue-800/50">
          <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">AI-Powered Accessibility Analysis</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Comprehensive WCAG Compliance Analysis
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed text-center">
          Evaluate your website against 10 critical accessibility standards and receive actionable insights to improve user experience and meet regulatory requirements.
        </p>
      </div>

      {/* Feature Cards - Horizontal Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 rounded-full blur-2xl transition-opacity`}></div>
            <div className="relative text-center">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                {feature.title}
              </h3>
              <p className={`text-2xl font-bold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                {feature.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Benefits Section - Modern Card Layout */}
      <div className="bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-3xl p-8 sm:p-10 mb-12 border border-blue-100/50 dark:border-blue-800/30">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            Why Check Compliance?
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-5 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300"
            >
              <div className={`${benefit.color} mb-3`}>
                <benefit.icon className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1.5 text-sm text-left">
                {benefit.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-left">
                {benefit.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">10,000+</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Websites Checked</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">99.9%</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Uptime</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">Trusted</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">by Developers</p>
          </div>
        </div>
      </div>

      {/* Process Overview */}
      <div className="relative">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-10">
          How It Works
        </h3>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2 relative">
          {processSteps.map((item, index) => (
            <div key={index} className="flex items-center w-full md:w-auto">
              <div className="flex flex-col items-center text-center flex-1 md:flex-initial md:min-w-[200px]">
                {/* Step Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 w-full md:w-auto">
                  {/* Step Icon */}
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md mb-4 mx-auto">
                    {item.step}
                  </div>
                  
                  {/* Step Title */}
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-2 text-center">
                    {item.title}
                  </h4>
                  
                  {/* Step Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-center">
                    {item.desc}
                  </p>
                </div>
              </div>
              
              {/* Arrow Connector */}
              {index < processSteps.length - 1 && (
                <div className="hidden md:flex items-center justify-center mx-2 flex-shrink-0">
                  <ArrowRight className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmptyState;

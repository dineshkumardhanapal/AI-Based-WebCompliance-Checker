'use client';

import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
function EnhancedError({ error, onRetry, type = 'generic' }) {
  const errorTypes = {
    network: {
      icon: WifiOff,
      title: 'Connection Error',
      message: 'Unable to reach the server. Please check your internet connection.',
      suggestion: 'Make sure you are connected to the internet and try again.',
    },
    validation: {
      icon: AlertCircle,
      title: 'Invalid URL',
      message: 'The URL you entered is not valid.',
      suggestion: 'Please enter a valid URL starting with http:// or https://',
    },
    server: {
      icon: AlertCircle,
      title: 'Server Error',
      message: 'The server encountered an error processing your request.',
      suggestion: 'Please try again in a few moments.',
    },
    timeout: {
      icon: Wifi,
      title: 'Request Timeout',
      message: 'The request took too long to complete.',
      suggestion: 'The website may be slow or unavailable. Try again or check another URL.',
    },
    generic: {
      icon: AlertCircle,
      title: 'Something Went Wrong',
      message: error || 'An unexpected error occurred.',
      suggestion: 'Please try again or contact support if the problem persists.',
    },
  };

  const errorInfo = errorTypes[type] || errorTypes.generic;
  const Icon = errorInfo.icon;

  return (
    <div className="enhanced-error" role="alert" aria-live="assertive">
      <div className="error-icon-container">
        <Icon size={48} />
      </div>
      
      <h3 className="error-title">{errorInfo.title}</h3>
      <p className="error-message">{errorInfo.message}</p>
      <p className="error-suggestion">{errorInfo.suggestion}</p>

      {onRetry && (
        <div className="error-actions">
          <button 
            className="error-retry-button"
            onClick={onRetry}
            aria-label="Retry the request"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      )}

      {type === 'network' && (
        <div className="error-troubleshooting">
          <details>
            <summary>Troubleshooting Tips</summary>
            <ul>
              <li>Check your internet connection</li>
              <li>Verify the Python backend server is running on port 3001</li>
              <li>Check if a firewall is blocking the connection</li>
              <li>Try refreshing the page</li>
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}

export default EnhancedError;

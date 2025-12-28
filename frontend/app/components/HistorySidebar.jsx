'use client';

import { useState, useEffect } from 'react';
import { History, X, Clock, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
function HistorySidebar({ isOpen, onClose, onSelectCheck }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('checkHistory');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      localStorage.removeItem('checkHistory');
      setHistory([]);
      toast.success('History cleared!');
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="history-sidebar" role="complementary" aria-label="Check history">
      <div className="history-header">
        <div className="history-title">
          <History size={20} />
          <h3>Check History</h3>
        </div>
        <button
          className="history-close"
          onClick={onClose}
          aria-label="Close history"
        >
          <X size={20} />
        </button>
      </div>

      <div className="history-content">
        {history.length === 0 ? (
          <div className="history-empty">
            <History size={48} />
            <p>No check history yet</p>
            <span>Your recent checks will appear here</span>
          </div>
        ) : (
          <>
            <div className="history-actions">
              <button onClick={clearHistory} className="clear-history-button">
                Clear All
              </button>
            </div>
            <div className="history-list">
              {history.map((item, index) => (
                <div
                  key={item.id || `history-${item.url}-${item.timestamp || index}`}
                  className="history-item"
                  onClick={() => {
                    onSelectCheck(item);
                    onClose();
                    toast.success('Check loaded!');
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Load check for ${item.url}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectCheck(item);
                      onClose();
                    }
                  }}
                >
                  <div className="history-item-header">
                    <div className="history-score-badge">
                      {item.score}
                    </div>
                    <div className="history-time">
                      <Clock size={14} />
                      {formatDate(item.timestamp)}
                    </div>
                  </div>
                  <div className="history-url">
                    <ExternalLink size={14} />
                    {item.url.length > 50 ? `${item.url.substring(0, 50)}...` : item.url}
                  </div>
                  <div className="history-stats">
                    <span className="stat passed">{item.passedCount} passed</span>
                    <span className="stat failed">{item.totalCount - item.passedCount} failed</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HistorySidebar;

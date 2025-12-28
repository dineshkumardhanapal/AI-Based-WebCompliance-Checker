'use client';

import { Download, Share2, History, RefreshCw, FileText, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

function ResultsActions({ results, onNewCheck }) {
  const [copied, setCopied] = useState(false);

  const exportJSON = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compliance-check-${results.url.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Results exported as JSON!');
  };

  const exportPDF = async () => {
    try {
      // Dynamic import for jsPDF
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Helper function to sanitize text for PDF (remove Unicode characters)
      const sanitizeText = (text) => {
        if (!text) return '';
        // Replace or remove problematic Unicode characters
        return String(text)
          .replace(/[\u2018\u2019]/g, "'")  // Smart quotes
          .replace(/[\u201C\u201D]/g, '"')  // Smart double quotes
          .replace(/\u2013/g, '-')          // En dash
          .replace(/\u2014/g, '--')         // Em dash
          .replace(/\u2026/g, '...')        // Ellipsis
          .replace(/[^\x00-\x7F]/g, '');    // Remove any remaining non-ASCII
      };
      
      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Compliance Check Results', 20, 20);
      
      // Timestamp
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 28);
      
      // URL
      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.text(`URL: ${sanitizeText(results.url)}`, 20, 40);
      
      // Score with visual indicator
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const scoreColor = results.score >= 80 ? [34, 197, 94] : results.score >= 50 ? [234, 179, 8] : [239, 68, 68];
      doc.setTextColor(...scoreColor);
      doc.text(`Score: ${results.score}%`, 20, 55);
      
      // Summary
      doc.setTextColor(0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Passed: ${results.passedCount} / ${results.totalCount} checks`, 20, 65);
      
      // Separator line
      doc.setDrawColor(200);
      doc.line(20, 72, 190, 72);
      
      // Checks header
      let yPos = 82;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text('Compliance Checks:', 20, yPos);
      yPos += 12;
      
      results.checks.forEach((check, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        // Check name with status
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        
        // Status indicator (use ASCII text instead of Unicode)
        const status = check.passed ? '[PASS]' : '[FAIL]';
        const statusColor = check.passed ? [34, 197, 94] : [239, 68, 68];
        
        // Draw status
        doc.setTextColor(...statusColor);
        doc.text(status, 20, yPos);
        
        // Draw check name
        doc.setTextColor(0);
        doc.text(sanitizeText(check.name), 45, yPos);
        yPos += 6;
        
        // Details
        if (check.details) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(80);
          const sanitizedDetails = sanitizeText(check.details);
          const lines = doc.splitTextToSize(sanitizedDetails, 165);
          // Limit to 3 lines max
          const displayLines = lines.slice(0, 3);
          doc.text(displayLines, 25, yPos);
          yPos += displayLines.length * 4 + 6;
        } else {
          yPos += 6;
        }
      });
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        doc.text('Web Compliance Checker', 20, 290);
      }
      
      doc.save(`compliance-check-${Date.now()}.pdf`);
      toast.success('Results exported as PDF!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF. JSON export available.');
    }
  };

  const copyResults = async () => {
    try {
      const text = `Compliance Check Results\nURL: ${results.url}\nScore: ${results.score}\n\n${results.checks.map((c, i) => `${i + 1}. ${c.name}: ${c.passed ? 'PASS' : 'FAIL'}`).join('\n')}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Results copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const shareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Compliance Check Results',
          text: `Check out these compliance results: ${results.score}`,
          url: window.location.href,
        });
        toast.success('Results shared!');
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyResults(); // Fallback to copy
        }
      }
    } else {
      copyResults(); // Fallback to copy
    }
  };

  return (
    <div className="results-actions" role="toolbar" aria-label="Results actions">
      <div className="actions-group primary">
        <button
          className="action-button primary"
          onClick={exportJSON}
          aria-label="Export results as JSON"
        >
          <FileText size={18} />
          Export JSON
        </button>
        
        <button
          className="action-button primary"
          onClick={exportPDF}
          aria-label="Export results as PDF"
        >
          <Download size={18} />
          Export PDF
        </button>
      </div>

      <div className="actions-group secondary">
        <button
          className="action-button secondary"
          onClick={shareResults}
          aria-label="Share results"
        >
          <Share2 size={18} />
          Share
        </button>
        
        <button
          className="action-button secondary"
          onClick={copyResults}
          aria-label="Copy results to clipboard"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        
        <button
          className="action-button secondary"
          onClick={onNewCheck}
          aria-label="Run new check"
        >
          <RefreshCw size={18} />
          New Check
        </button>
      </div>
    </div>
  );
}

export default ResultsActions;

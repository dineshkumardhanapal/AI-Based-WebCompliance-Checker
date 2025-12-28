'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

function SuccessCelebration({ score, passedCount, totalCount }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (passedCount === totalCount) {
      // Perfect score celebration
      setShow(true);
      toast.success('Perfect Score! 🎉 All checks passed!', {
        duration: 5000,
        icon: '🎉',
        style: {
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          fontSize: '1.1rem',
          fontWeight: '600',
        },
      });
      setTimeout(() => setShow(false), 3000);
    } else if (passedCount >= 8) {
      // Great score
      setShow(true);
      toast.success(`Excellent! ${score} - Great job! 🎊`, {
        duration: 4000,
      });
      setTimeout(() => setShow(false), 2500);
    }
  }, [score, passedCount, totalCount]);

  if (!show || (passedCount !== totalCount && passedCount < 8)) {
    return null;
  }

  return (
    <div className={`success-celebration ${passedCount === totalCount ? 'perfect' : 'great'}`}>
      <div className="celebration-content">
        <CheckCircle2 size={48} className="celebration-icon" />
        <Sparkles size={24} className="sparkle-1" />
        <Sparkles size={24} className="sparkle-2" />
        <Sparkles size={24} className="sparkle-3" />
        {passedCount === totalCount ? (
          <h3>Perfect Score! 🎉</h3>
        ) : (
          <h3>Excellent Results! 🎊</h3>
        )}
        <p>Your website meets high accessibility standards!</p>
      </div>
    </div>
  );
}

export default SuccessCelebration;

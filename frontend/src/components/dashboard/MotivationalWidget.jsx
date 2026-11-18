import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * MotivationalWidget: Inspirational quote and weekly progress summary.
 *
 * Features:
 * - Rotating motivational quotes
 * - Weekly activity summary
 * - Streak information
 * - Button to refresh quote
 */

const QUOTES = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Focus is the gateway to success.",
    author: "Cal Newport"
  },
  {
    text: "Your focus determines your reality.",
    author: "George Harrison"
  },
  {
    text: "Success is the product of daily habits—not once-in-a-lifetime transformations.",
    author: "James Clear"
  },
  {
    text: "The mind is everything. What you think, you become.",
    author: "Buddha"
  },
  {
    text: "You don't have to see the whole staircase, just take the first step.",
    author: "Martin Luther King Jr."
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  }
];

function MotivationalWidget({ stats = {} }) {
  const { streak = 0, last7Days = [] } = stats;

  const [isRotating, setIsRotating] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(
    Math.floor(Math.random() * QUOTES.length)
  );

  const currentQuote = QUOTES[quoteIndex];

  const rotateQuote = () => {
    setIsRotating(true);
    setTimeout(() => {
      setQuoteIndex((Math.floor(Math.random() * QUOTES.length) + quoteIndex + 1) % QUOTES.length);
      setIsRotating(false);
    }, 300);
  };

  // Get this week's total
  const _weeklyTotal = useMemo(() => {
    return last7Days.reduce((sum, day) => sum + (day.minutes || 0), 0);
  }, [last7Days]);

  // Get active days this week
  const activeDays = useMemo(() => {
    return last7Days.filter((day) => day.minutes > 0).length;
  }, [last7Days]);

  return (
    <motion.div
      className="widget glass-panel motivation-widget"
      layout
    >
      <div className="motivation-header">
        <div className="widget-title-section">
          <span className="widget-icon">💡</span>
          <div>
            <h3 className="widget-title">Inspiration</h3>
            <p className="widget-subtitle">Keep building momentum</p>
          </div>
        </div>
        <motion.button
          type="button"
          className="quote-rotate-btn"
          onClick={rotateQuote}
          disabled={isRotating}
          whileHover={{ rotate: 180 }}
          whileTap={{ scale: 0.9 }}
        >
          🔄
        </motion.button>
      </div>

      <motion.div
        className="quote-display"
        initial={{ opacity: 0 }}
        animate={{ opacity: isRotating ? 0.5 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="quote-text">"{currentQuote.text}"</p>
        <p className="quote-author">— {currentQuote.author}</p>
      </motion.div>

      <div className="motivation-stats">
        <div className="stat-row">
          <span className="stat-label">Active days this week</span>
          <span className="stat-badge">{activeDays} / 7</span>
        </div>
        {streak > 0 && (
          <div className="stat-row streak-highlight">
            <span className="stat-label">🔥 Current streak</span>
            <span className="stat-badge streak-badge">{streak} days</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default MotivationalWidget;

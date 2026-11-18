import { useState, useMemo } from 'react';

/**
 * QuoteWidget: Displays motivational quotes.
 * 
 * Rotates through hardcoded quote collection. OK to use static content
 * (quotes, not user-generated data). Rotates on component load and
 * optionally on button press.
 */

const MOTIVATIONAL_QUOTES = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Focus is the gateway to success. Embrace deep work.",
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
    text: "Discipline is doing what needs to be done, even if you don't want to do it.",
    author: "Unknown"
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

function QuoteWidget() {
  const quote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[randomIndex];
  }, []);

  const [isRotating, setIsRotating] = useState(false);
  const [displayQuote, setDisplayQuote] = useState(quote);

  const rotateQuote = () => {
    setIsRotating(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
      setDisplayQuote(MOTIVATIONAL_QUOTES[randomIndex]);
      setIsRotating(false);
    }, 300);
  };

  return (
    <div className="widget-glass-panel quote-widget" style={{ minWidth: '280px' }}>
      <div className="widget-header">
        <div style={{ flex: 1 }}>
          <div className="widget-title">💡 Daily Inspiration</div>
        </div>
        <button
          type="button"
          onClick={rotateQuote}
          disabled={isRotating}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--va-accent-gold)',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '4px',
            transition: 'transform 0.3s ease',
            transform: isRotating ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
          title="Rotate quote"
        >
          🔄
        </button>
      </div>

      <div style={{ opacity: isRotating ? 0.5 : 1, transition: 'opacity 0.3s ease' }}>
        <div className="quote-text">"{displayQuote.text}"</div>
        <div className="quote-author">— {displayQuote.author}</div>
      </div>
    </div>
  );
}

export default QuoteWidget;

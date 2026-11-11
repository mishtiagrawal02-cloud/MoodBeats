import { STORAGE_KEYS } from '../../utils/constants';

function Header({ userName: propUserName, latestMood }) {
  // Get user name from props or fallback to localStorage
  const userName = propUserName || localStorage.getItem(STORAGE_KEYS.USER_NAME) || 'Awantika';
  
  // Get time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  
  // Format date
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="dashboard-welcome-header" style={{ marginBottom: 'var(--space-xl)' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-lg)'
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            fontWeight: 800,
            marginBottom: 'var(--space-xs)',
            background: 'var(--gradient)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{greeting}, {userName}</span>
            <i className="fas fa-heart" style={{ color: 'var(--neon-purple)', fontSize: '0.85em' }}></i>
          </h1>
          <p style={{
            color: 'var(--muted-grey)',
            fontSize: 'var(--font-size-base)',
            maxWidth: '54ch'
          }}>
            Focus, study and discover the soundscapes that elevate your mind.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-md)'
        }}>
          {latestMood && (
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'rgba(139, 53, 255, 0.12)',
                border: '1px solid rgba(191, 90, 255, 0.3)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--soft-lavender)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 500
              }}
              title="Latest check-in mood from your previous study session (read-only)"
            >
              <span style={{ fontSize: '1.2rem' }}>{latestMood.emoji}</span>
              <span>Last Mood: <strong>{latestMood.value}/5</strong></span>
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            padding: '10px 18px',
            background: 'var(--charcoal)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--soft-lavender)',
            fontWeight: 500
          }}>
            <i className="far fa-calendar" style={{ color: 'var(--electric-violet)' }}></i>
            <span>{dateStr}</span>
          </div>

          <button 
            type="button"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--charcoal)',
              border: '1px solid var(--border)',
              color: 'var(--soft-lavender)',
              fontSize: 'var(--font-size-lg)',
              transition: 'all var(--transition-base)'
            }}
            aria-label="Notifications"
            title="Notifications"
          >
            <i className="far fa-bell"></i>
          </button>

          <div 
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--gradient)',
              color: 'var(--obsidian)',
              fontWeight: 700,
              fontSize: 'var(--font-size-base)',
              boxShadow: '0 0 14px var(--glow)'
            }}
            title={`Signed in as ${userName}`}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

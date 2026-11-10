import { STORAGE_KEYS } from '../../utils/constants';

function Header() {
  // Get user name from localStorage
  const userName = localStorage.getItem(STORAGE_KEYS.USER_NAME) || 'User';
  
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
    <header style={{ marginBottom: 'var(--space-xl)' }}>
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
            marginBottom: 'var(--space-sm)',
            background: 'var(--gradient)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'inline-block'
          }}>
            {greeting}, <span>{userName}</span> <i className="fas fa-heart" style={{ color: 'var(--neon-purple)' }}></i>
          </h1>
          <p style={{
            color: 'var(--muted-grey)',
            fontSize: 'var(--font-size-base)',
            maxWidth: '50ch'
          }}>
            Focus, study and discover the music that works for you.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-lg)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            padding: 'var(--space-md) var(--space-lg)',
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
          >
            <i className="far fa-bell"></i>
          </button>

          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--gradient)',
            color: 'var(--obsidian)',
            fontWeight: 700,
            fontSize: 'var(--font-size-base)'
          }}>
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

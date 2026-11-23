import { Link } from 'react-router-dom';

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric'
});
const TIME_FORMAT = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

function Header({ title, userName, date = new Date(), showClock = false }) {
  const initial = Array.from(userName || 'M')[0].toLocaleUpperCase();
  const token = localStorage.getItem('moodbeats:token');
  const avatarUrl = localStorage.getItem('moodbeats:avatarUrl');

  return (
    <header className="workspace-toolbar">
      <h1 id="page-title">{title}</h1>
      <div className="workspace-toolbar-meta">
        <time className="workspace-date" dateTime={date.toISOString()}>
          <i className="far fa-calendar" aria-hidden="true" />
          {DATE_FORMAT.format(date)}
          {showClock && <span className="workspace-clock">{TIME_FORMAT.format(date)}</span>}
        </time>

        {!token && (
          <Link
            to="/login"
            className="btn btn-secondary"
            style={{ fontSize: '13px', padding: '6px 12px', textDecoration: 'none' }}
          >
            <i className="fas fa-right-to-bracket" style={{ marginRight: '6px' }} />
            Sign in
          </Link>
        )}

        <Link className="workspace-avatar" to="/profile" aria-label="Profile and settings" style={{ overflow: 'hidden' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName || 'Profile'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              referrerPolicy="no-referrer"
            />
          ) : (
            initial
          )}
        </Link>
      </div>
    </header>
  );
}

export default Header;

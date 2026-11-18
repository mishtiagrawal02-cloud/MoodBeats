import { Link } from 'react-router-dom';

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric'
});
const TIME_FORMAT = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

function Header({ title, userName, date = new Date(), showClock = false }) {
  const initial = Array.from(userName || 'M')[0].toLocaleUpperCase();

  return (
    <header className="workspace-toolbar">
      <h1 id="page-title">{title}</h1>
      <div className="workspace-toolbar-meta">
        <time className="workspace-date" dateTime={date.toISOString()}>
          <i className="far fa-calendar" aria-hidden="true" />
          {DATE_FORMAT.format(date)}
          {showClock && <span className="workspace-clock">{TIME_FORMAT.format(date)}</span>}
        </time>
        <Link className="workspace-avatar" to="/profile" aria-label="Profile and settings">
          {initial}
        </Link>
      </div>
    </header>
  );
}

export default Header;

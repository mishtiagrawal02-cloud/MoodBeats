import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/dashboard', icon: 'fa-table-cells-large', label: 'Dashboard', shortLabel: 'Home' },
  { path: '/study', icon: 'fa-circle-play', label: 'Study room', shortLabel: 'Study' },
  { path: '/audio', icon: 'fa-headphones', label: 'Audio Library', shortLabel: 'Audio' },
  { path: '/sessions', icon: 'fa-clock-rotate-left', label: 'Sessions', shortLabel: 'History' },
  { path: '/analytics', icon: 'fa-chart-simple', label: 'Analytics', shortLabel: 'Stats' },
  { path: '/profile', icon: 'fa-user', label: 'Profile', shortLabel: 'Profile' }
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink to="/dashboard" className="sidebar-logo" aria-label="MoodBeats dashboard">
        <span className="sidebar-mark" aria-hidden="true"><i className="fas fa-wave-square" /></span>
        <span>MoodBeats</span>
      </NavLink>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {NAV_ITEMS.map(({ path, icon, label, shortLabel }) => (
          <NavLink
            key={path}
            to={path}
            className="nav-item"
            aria-label={label}
          >
            <i className={`fas ${icon}`} aria-hidden="true" />
            <span className="nav-label">{label}</span>
            <span className="nav-label-short">{shortLabel}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;

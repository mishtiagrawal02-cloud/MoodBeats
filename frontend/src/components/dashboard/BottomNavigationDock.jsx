import { useNavigate, useLocation } from 'react-router-dom';
import { memo } from 'react';

/**
 * BottomNavigationDock: Floating navigation dock at bottom of dashboard.
 * 
 * Wires to:
 * - React Router useNavigate() for navigation
 * - React Router useLocation() for active state highlighting
 * - Existing routes: /dashboard, /study, /audio, /sessions, /analytics, /profile
 * 
 * Preserves all existing navigation behavior.
 */

const NAV_ITEMS = [
  { path: '/dashboard', icon: 'fa-th-large', label: 'Dashboard' },
  { path: '/study', icon: 'fa-play-circle', label: 'Study' },
  { path: '/audio', icon: 'fa-music', label: 'Audio' },
  { path: '/sessions', icon: 'fa-history', label: 'Sessions' },
  { path: '/analytics', icon: 'fa-chart-line', label: 'Analytics' },
  { path: '/profile', icon: 'fa-user-circle', label: 'Profile' }
];

function BottomNavigationDock() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (path) => {
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bottom-nav-dock" aria-label="Quick navigation">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.path}
          className={`dock-nav-btn ${isActive(item.path) ? 'active' : ''}`}
          onClick={() => handleNavClick(item.path)}
          title={item.label}
          type="button"
          aria-label={item.label}
          aria-current={isActive(item.path) ? 'page' : undefined}
        >
          <i className={`fas ${item.icon}`}></i>
        </button>
      ))}
    </nav>
  );
}

export default memo(BottomNavigationDock);

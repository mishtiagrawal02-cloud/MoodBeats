import { NavLink } from 'react-router-dom';

function Sidebar() {
  const navItems = [
    { path: '/dashboard', icon: 'fa-th-large', label: 'Dashboard' },
    { path: '/study', icon: 'fa-play-circle', label: 'Study' },
    { path: '/audio', icon: 'fa-music', label: 'Audio Library' },
    { path: '/sessions', icon: 'fa-history', label: 'Sessions' },
    { path: '/analytics', icon: 'fa-chart-line', label: 'Analytics' },
    { path: '/profile', icon: 'fa-user-circle', label: 'Profile' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <i className="fas fa-wave-square"></i>
        <span>MoodBeats</span>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <i className={`fas ${item.icon}`}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <svg 
          viewBox="0 0 200 120" 
          className="mountain-illustration" 
          aria-hidden="true"
          style={{ width: '100%', height: 'auto', opacity: 0.6 }}
        >
          <defs>
            <linearGradient id="moon-glow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#BF5AFF', stopOpacity: 0.4 }} />
              <stop offset="100%" style={{ stopColor: '#8B35FF', stopOpacity: 0.1 }} />
            </linearGradient>
          </defs>
          <circle cx="160" cy="25" r="18" fill="url(#moon-glow)" />
          <circle cx="160" cy="25" r="12" fill="#C9B4FF" opacity="0.8" />
          <path 
            d="M0,80 L40,50 L60,65 L80,40 L100,60 L130,35 L160,55 L200,45 L200,120 L0,120 Z" 
            fill="#15111D" 
            opacity="0.6" 
          />
          <path 
            d="M0,90 L30,70 L50,80 L90,60 L120,75 L150,65 L180,75 L200,70 L200,120 L0,120 Z" 
            fill="#15111D" 
            opacity="0.8" 
          />
        </svg>
      </div>
    </aside>
  );
}

export default Sidebar;

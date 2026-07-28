import React from 'react';

export default function Sidebar({ activeItem = 'Home', onSelectTab }) {
  const navItems = [
    {
      id: 'Home',
      label: 'Home',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    {
      id: 'Manage Members',
      label: 'Manage Members',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      id: 'Manage Payments',
      label: 'Manage Payments',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      )
    },
    {
      id: 'Manage Benefit Types',
      label: 'Manage Benefit Types',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    },
    {
      id: 'Approve Benefit Requests',
      label: 'Approve Benefit Requests',
      badge: '3',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      )
    },
    {
      id: 'Generate Reports',
      label: 'Generate Reports',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" x2="18" y1="20" y2="10" />
          <line x1="12" x2="12" y1="20" y2="4" />
          <line x1="6" x2="6" y1="20" y2="14" />
        </svg>
      )
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-section-title">Navigation</div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id.toLowerCase().replace(/\s+/g, '-')}`}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                if (onSelectTab) onSelectTab(item.id);
              }}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="nav-item-badge">{item.badge}</span>}
            </a>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div>U.C.A.R.E. v1.0 Prototype</div>
        <div style={{ fontSize: '0.68rem', marginTop: '2px' }}>ISPSC Tagudin Campus</div>
      </div>
    </aside>
  );
}

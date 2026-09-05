import React, { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

export default function Sidebar({ activeItem = 'Home', onSelectTab, isOpen = false, onClose, customItems, pendingCount = 3, onSignOut }) {
  const sidebarNavRef = useRef(null);

  const defaultItems = [
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
      id: 'Announcements',
      label: 'Announcements',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11l18-5v12L3 14v-3z" />
          <path d="M11 13v9" />
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
          <path d="M22 21v-2a4 4 0 0 3-3.87" />
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
      badge: pendingCount > 0 ? String(pendingCount) : null,
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

  const navItems = customItems || defaultItems;

  useEffect(() => {
    if (sidebarNavRef.current) {
      const items = sidebarNavRef.current.querySelectorAll('.nav-item');
      if (items.length > 0) {
        animate(Array.from(items), {
          translateX: [-16, 0],
          opacity: [0, 1],
          duration: 340,
          delay: stagger(40),
          ease: 'outCubic'
        });
      }
    }
  }, [isOpen]);

  const handleNavClick = (id) => {
    if (onSelectTab) onSelectTab(id);
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar-section-title">Navigation</div>
        <nav className="sidebar-nav" ref={sidebarNavRef}>
          {navItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id.toLowerCase().replace(/\s+/g, '-')}`}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id);
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
          {onSignOut && (
            <button
              type="button"
              className="sidebar-signout-btn"
              onClick={() => {
                if (onClose) onClose();
                onSignOut();
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Sign Out</span>
            </button>
          )}
          <div style={{ marginTop: onSignOut ? '8px' : '0' }}>U.C.A.R.E. Portal v1.0</div>
          <div style={{ fontSize: '0.68rem', marginTop: '2px' }}>ISPSC Tagudin Campus</div>
        </div>
      </aside>
    </>
  );
}

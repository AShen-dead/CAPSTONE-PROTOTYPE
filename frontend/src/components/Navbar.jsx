import React from 'react';

export default function Navbar({
  logoUrl,
  systemTitle = "ISPSC Tagudin Federated Faculty Union",
  systemSubtitle = "Compensation & Assistance Records Engine",
  userName = "Sec. Administrator",
  userRole = "Faculty Union Admin",
  roleBadge = "SYSTEM ADMIN",
  onLogout,
}) {
  return (
    <header className="top-navbar">
      {/* Left: Brand Logo & Title (Clean Header Left) */}
      <div className="nav-brand">
        {logoUrl ? (
          <div className="brand-logo-container">
            <img src={logoUrl} alt="U.C.A.R.E. Logo" className="brand-logo-img" />
          </div>
        ) : (
          <div className="brand-logo-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            U.C.A.R.E.
          </div>
        )}
        <div className="brand-info">
          <span className="brand-title">{systemTitle}</span>
          <span className="brand-subtitle">{systemSubtitle}</span>
        </div>
      </div>

      {/* Right: Notification Bell, Role Badge, Profile & Logout */}
      <div className="nav-user">
        {/* Notification Bell */}
        <button className="nav-icon-btn" title="Notifications" aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="notification-dot" />
        </button>

        {/* Role Badge */}
        <div className="system-admin-badge">
          <span className="indicator-dot" />
          <span className="badge-label">{roleBadge}</span>
        </div>

        {/* User Profile */}
        <div className="user-profile-summary">
          <div className="avatar-circle">
            {userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SA'}
          </div>
          <div className="user-name-role">
            <span className="user-name">{userName}</span>
            <span className="user-role">{userRole}</span>
          </div>
        </div>

        {/* Sign Out Button */}
        {onLogout && (
          <button
            className="nav-logout-btn"
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="logout-label">Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
}

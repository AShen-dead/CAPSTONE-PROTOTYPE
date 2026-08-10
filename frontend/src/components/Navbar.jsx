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
      {/* Left: Brand Logo & Title with Changeable Logo Picture */}
      <div className="nav-brand">
        {logoUrl ? (
          <div className="brand-logo-container">
            <img src={logoUrl} alt="U.C.A.R.E. Logo" className="brand-logo-img" />
          </div>
        ) : (
          <div className="brand-logo-badge">
            U.C.A.R.E.
          </div>
        )}
        <div className="brand-info">
          <span className="brand-title">{systemTitle}</span>
          <span className="brand-subtitle">{systemSubtitle}</span>
        </div>
      </div>

      {/* Right: Role Badge, User Profile & Logout */}
      <div className="nav-user">
        <div className="system-admin-badge">
          <span className="indicator-dot"></span>
          {roleBadge}
        </div>
        
        <div className="user-profile-summary">
          <div className="avatar-circle">
            {userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SA'}
          </div>
          <div className="user-name-role">
            <span className="user-name">{userName}</span>
            <span className="user-role">{userRole}</span>
          </div>
        </div>

        {/* Logout Button */}
        {onLogout && (
          <button
            className="nav-logout-btn"
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
}

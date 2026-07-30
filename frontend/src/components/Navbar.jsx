import React from 'react';

export default function Navbar({
  logoUrl,
  systemTitle = "ISPSC Tagudin Federated Faculty Union",
  systemSubtitle = "Compensation & Assistance Records Engine",
  userName = "Sec. Administrator",
  userRole = "Faculty Union Admin",
  roleBadge = "SYSTEM ADMIN"
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

      {/* Right: Role Badge & User Profile (Dynamic for Future Backend Auth) */}
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
      </div>
    </header>
  );
}

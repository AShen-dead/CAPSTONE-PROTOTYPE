import React from 'react';

export default function Navbar({ logoUrl }) {
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
          <span className="brand-title">ISPSC Tagudin Federated Faculty Union</span>
          <span className="brand-subtitle">Compensation & Assistance Records Engine</span>
        </div>
      </div>

      {/* Right: SYSTEM ADMIN Role Badge & Profile */}
      <div className="nav-user">
        <div className="system-admin-badge">
          <span className="indicator-dot"></span>
          SYSTEM ADMIN
        </div>
        
        <div className="user-profile-summary">
          <div className="avatar-circle">
            SA
          </div>
          <div className="user-name-role">
            <span className="user-name">Sec. Administrator</span>
            <span className="user-role">Faculty Union Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}

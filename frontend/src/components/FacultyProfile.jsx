import React from 'react';

export default function FacultyProfile({ currentUser, onLogout }) {
  const user = currentUser || { name: 'Prof. Maria Santos', email: 'faculty@ucare.local' };

  return (
    <main className="main-content">
      {/* Profile Header */}
      <div className="faculty-profile-header-card">
        <div className="faculty-avatar-large">
          {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'FM'}
        </div>
        <div className="faculty-profile-info">
          <div className="faculty-profile-name">{user.name}</div>
          <div className="faculty-profile-role">Faculty Member • ISPSC Tagudin Campus</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Email: {user.email}
          </div>
        </div>
      </div>

      {/* Settings Grid (2-column on Laptop, 1-column on Phone) */}
      <div className="settings-grid">
        {/* Employment Info Setting Card */}
        <div className="setting-card" onClick={() => alert('Employment Info: College of Teacher Education, Assistant Professor III')}>
          <div className="setting-card-left">
            <div className="setting-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <div className="setting-card-title">Employment Information</div>
              <div className="setting-card-subtitle">College of Teacher Education, Rank & Department</div>
            </div>
          </div>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>&gt;</span>
        </div>

        {/* Change Password Setting Card */}
        <div className="setting-card" onClick={() => alert('Change password dialog')}>
          <div className="setting-card-left">
            <div className="setting-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <div className="setting-card-title">Change Password</div>
              <div className="setting-card-subtitle">Update security credentials & password</div>
            </div>
          </div>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>&gt;</span>
        </div>

        {/* Notification Settings Card */}
        <div className="setting-card" onClick={() => alert('Notification settings dialog')}>
          <div className="setting-card-left">
            <div className="setting-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div>
              <div className="setting-card-title">Notification Settings</div>
              <div className="setting-card-subtitle">Email notifications for benefit updates</div>
            </div>
          </div>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>&gt;</span>
        </div>

        {/* Member Guidelines Card */}
        <div className="setting-card" onClick={() => alert('ISPSC Faculty Union Constitution & By-Laws')}>
          <div className="setting-card-left">
            <div className="setting-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <div className="setting-card-title">Union By-Laws & Policies</div>
              <div className="setting-card-subtitle">Read faculty assistance policies</div>
            </div>
          </div>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>&gt;</span>
        </div>
      </div>

      {/* Separate Red Log Out Action Card */}
      <div 
        className="setting-card" 
        style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', marginTop: '12px' }}
        onClick={() => onLogout && onLogout()}
      >
        <div className="setting-card-left">
          <div className="setting-icon-box" style={{ backgroundColor: '#FEE2E2', color: '#DC2626', borderColor: '#FCA5A5' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>
          <div>
            <div className="setting-card-title" style={{ color: '#DC2626' }}>Log Out of U.C.A.R.E.</div>
            <div className="setting-card-subtitle" style={{ color: '#991B1B' }}>Sign out of your faculty account session</div>
          </div>
        </div>
        <span style={{ fontSize: '1.2rem', color: '#DC2626', fontWeight: 'bold' }}>&gt;</span>
      </div>
    </main>
  );
}

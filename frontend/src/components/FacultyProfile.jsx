import React, { useState } from 'react';

export default function FacultyProfile({ currentUser, onLogout }) {
  const user = currentUser || { name: 'Prof. Maria Santos', email: 'faculty@ucare.local' };

  // Modal State Controls
  const [activeModal, setActiveModal] = useState(null); // 'employment', 'password', 'notifications', 'policies'

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState('');

  // Notification Settings State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [benefitAlerts, setBenefitAlerts] = useState(true);
  const [bulletinAlerts, setBulletinAlerts] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordFeedback('Error: New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback('Error: New passwords do not match. Please check again.');
      return;
    }

    setPasswordFeedback('Success: Password updated successfully!');
    setTimeout(() => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordFeedback('');
      setActiveModal(null);
    }, 1200);
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    setNotifSaved(true);
    setTimeout(() => {
      setNotifSaved(false);
      setActiveModal(null);
    }, 1000);
  };

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
        {/* 1. Employment Info Setting Card */}
        <div className="setting-card" onClick={() => setActiveModal('employment')}>
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
              <div className="setting-card-subtitle">College of Teacher Education, Rank &amp; Department</div>
            </div>
          </div>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>&gt;</span>
        </div>

        {/* 2. Change Password Setting Card */}
        <div className="setting-card" onClick={() => setActiveModal('password')}>
          <div className="setting-card-left">
            <div className="setting-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <div className="setting-card-title">Change Password</div>
              <div className="setting-card-subtitle">Update security credentials &amp; password</div>
            </div>
          </div>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>&gt;</span>
        </div>

        {/* 3. Notification Settings Card */}
        <div className="setting-card" onClick={() => setActiveModal('notifications')}>
          <div className="setting-card-left">
            <div className="setting-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div>
              <div className="setting-card-title">Notification Settings</div>
              <div className="setting-card-subtitle">Email &amp; SMS alerts for unpaid dues</div>
            </div>
          </div>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>&gt;</span>
        </div>

        {/* 4. Union Laws & Policies Card */}
        <div className="setting-card" onClick={() => setActiveModal('policies')}>
          <div className="setting-card-left">
            <div className="setting-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <div className="setting-card-title">Union Laws &amp; Policies</div>
              <div className="setting-card-subtitle">Read faculty constitution &amp; assistance policies</div>
            </div>
          </div>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>&gt;</span>
        </div>
      </div>

      {/* Log Out Button Card */}
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

      {/* ───────────────────────────────────────────────────────────────────
         MODAL 1: Employment Information
         ─────────────────────────────────────────────────────────────────── */}
      {activeModal === 'employment' && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3>Employment Information</h3>
              <button className="btn-close-modal" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="modal-body-form" style={{ gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Employee ID</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary-maroon)' }}>EMP-2026-0842</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Membership Status</div>
                  <span className="status-tag active" style={{ marginTop: '2px' }}>Active Member</span>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>College / Campus</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-main)' }}>College of Teacher Education</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Academic Rank / Position</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-main)' }}>Associate Professor II</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Employment Status</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-main)' }}>Permanent / Tenured</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Date Hired</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-main)' }}>September 15, 2018</div>
                </div>
              </div>

              <div style={{ background: '#FEF8E7', border: '1px solid #FCE8B3', padding: '12px 14px', borderRadius: '6px', fontSize: '0.82rem', color: '#92400E' }}>
                💡 <strong>Total Remitted Dues:</strong> ₱ 28,500.00 (ISPSC Tagudin Faculty Union Records Engine)
              </div>

              <div className="modal-actions">
                <button className="btn-primary" onClick={() => setActiveModal(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────
         MODAL 2: Change Password
         ─────────────────────────────────────────────────────────────────── */}
      {activeModal === 'password' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Change Account Password</h3>
              <button className="btn-close-modal" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="modal-body-form">
              {passwordFeedback && (
                <div style={{ 
                  padding: '10px 14px', 
                  borderRadius: '6px', 
                  fontSize: '0.84rem',
                  fontWeight: '600',
                  backgroundColor: passwordFeedback.startsWith('Error') ? '#FEE2E2' : '#E8F6EF',
                  color: passwordFeedback.startsWith('Error') ? '#B91C1C' : '#2E8B57',
                  border: `1px solid ${passwordFeedback.startsWith('Error') ? '#FCA5A5' : '#C1E6D0'}`
                }}>
                  {passwordFeedback}
                </div>
              )}

              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password"
                  className="form-input"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password"
                  className="form-input"
                  placeholder="Enter new password (min. 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password"
                  className="form-input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save New Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────
         MODAL 3: Notification Settings
         ─────────────────────────────────────────────────────────────────── */}
      {activeModal === 'notifications' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Notification Settings</h3>
              <button className="btn-close-modal" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveNotifications} className="modal-body-form" style={{ gap: '16px' }}>
              {notifSaved && (
                <div style={{ padding: '10px 14px', borderRadius: '6px', fontSize: '0.84rem', fontWeight: '700', backgroundColor: '#E8F6EF', color: '#2E8B57', border: '1px solid #C1E6D0' }}>
                  ✓ Notification preferences updated successfully!
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '10px 12px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>⚠️ Unpaid Dues Email Reminders</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Get email alerts when monthly contribution is due</div>
                  </div>
                  <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--primary-maroon)' }} />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '10px 12px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>📱 SMS Verification Alerts</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Receive SMS notification when payment is verified</div>
                  </div>
                  <input type="checkbox" checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--primary-maroon)' }} />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '10px 12px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>🏥 Benefit Claim Approval Updates</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Alerts when assistance claims are approved or paid out</div>
                  </div>
                  <input type="checkbox" checked={benefitAlerts} onChange={(e) => setBenefitAlerts(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--primary-maroon)' }} />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '10px 12px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>📢 Union News &amp; Meeting Bulletins</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Monthly financial statements &amp; general assembly notices</div>
                  </div>
                  <input type="checkbox" checked={bulletinAlerts} onChange={(e) => setBulletinAlerts(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--primary-maroon)' }} />
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Preferences</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────
         MODAL 4: Union Laws & Policies Reader
         ─────────────────────────────────────────────────────────────────── */}
      {activeModal === 'policies' && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '660px' }}>
            <div className="modal-header">
              <h3>ISPSC Faculty Union Laws &amp; Policies</h3>
              <button className="btn-close-modal" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <div className="modal-body-form" style={{ maxHeight: '440px', overflowY: 'auto', gap: '16px', fontSize: '0.875rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #8B1E3F 0%, #6E1731 100%)', color: '#FFF', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#F4B942' }}>ISPSC Tagudin Federated Faculty Union</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#FCE8B3' }}>Compensation &amp; Assistance Records Engine (U.C.A.R.E.) Charter</p>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                <h4 style={{ color: 'var(--primary-maroon)', marginTop: 0 }}>Article I — Monthly Union Contribution Dues</h4>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.5', margin: 0 }}>
                  Every regular faculty member of ISPSC Tagudin Campus shall remit a mandatory monthly contribution of <strong>₱500.00</strong> to support the mutual assistance fund, operational expenditures, and emergency aid reserves.
                </p>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                <h4 style={{ color: 'var(--primary-maroon)', marginTop: 0 }}>Article II — Assistance Fund Benefit Categories</h4>
                <ul style={{ paddingLeft: '20px', margin: '4px 0', lineHeight: '1.6' }}>
                  <li><strong>Medical &amp; Hospitalization Assistance:</strong> Financial grant up to <strong>₱15,000.00</strong> per illness or hospital confinement.</li>
                  <li><strong>Bereavement &amp; Funeral Assistance:</strong> Death benefit grant up to <strong>₱10,000.00</strong> for immediate family members.</li>
                  <li><strong>Educational &amp; Calamity Relief:</strong> Financial assistance up to <strong>₱8,000.00</strong> for natural disaster damage or academic research support.</li>
                </ul>
              </div>

              <div>
                <h4 style={{ color: 'var(--primary-maroon)', marginTop: 0 }}>Article III — Remittance Verification &amp; Auditing</h4>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.5', margin: 0 }}>
                  All uploaded proof of payment receipts are audited by the Union Treasurer and Secretary-Administrator. Official verification is issued within 5 working days upon receipt of remittance proof.
                </p>
              </div>

              <div className="modal-actions" style={{ marginTop: '12px' }}>
                <button className="btn-primary" onClick={() => setActiveModal(null)}>I Understand &amp; Agree</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

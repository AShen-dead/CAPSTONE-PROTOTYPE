import React, { useState } from 'react';

// =========================================================================
// OFFICIAL U.C.A.R.E. LOGO PICTURE PATH
// =========================================================================
const LOGO_IMAGE_PATH = "/assets/ucare-logo.jpg";

export default function Navbar({
  logoUrl,
  systemTitle = "ISPSC Tagudin Federated Faculty Union",
  systemSubtitle = "Compensation & Assistance Records Engine",
  userName = "Sec. Administrator",
  userRole = "Faculty Union Admin",
  roleBadge = "SYSTEM ADMIN",
  onLogout,
  onMenuToggle,
  onNavigate,
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Notifications highlighting unpaid dues, due dates, and pending verification
  const isFaculty = userRole.toLowerCase().includes('faculty') && !userRole.toLowerCase().includes('admin');

  const [notifications, setNotifications] = useState(
    isFaculty ? [
      {
        id: 1,
        type: 'unpaid',
        title: '⚠️ Unpaid Monthly Dues',
        message: 'Monthly Union Contribution for August 2026 (₱500.00) is UNPAID.',
        date: '2 hours ago',
        unread: true,
        actionTab: 'Submit Application / Receipt'
      },
      {
        id: 2,
        type: 'due',
        title: '💳 Upcoming Assessment Due',
        message: 'Special Assistance Fund Assessment (₱300.00) is due on Aug 30, 2026.',
        date: '1 day ago',
        unread: true,
        actionTab: 'Submit Application / Receipt'
      },
      {
        id: 3,
        type: 'pending',
        title: '⌛ Proof Under Verification',
        message: 'Your proof of payment (REF-2026-0904 - ₱1,500.00) is pending admin verification.',
        date: '2 days ago',
        unread: true,
        actionTab: 'Payment History'
      }
    ] : [
      {
        id: 101,
        type: 'verification',
        title: '📋 3 Payments Pending Verification',
        message: 'Prof. Maria Santos & 2 others submitted proof of payment receipts requiring verification.',
        date: '10 mins ago',
        unread: true,
        actionTab: 'Manage Payments'
      },
      {
        id: 102,
        type: 'unpaid_summary',
        title: '⚠️ Unpaid Faculty Member Alert',
        message: '8 faculty members have outstanding/unpaid union dues for August 2026.',
        date: '3 hours ago',
        unread: true,
        actionTab: 'Manage Members'
      },
      {
        id: 103,
        type: 'benefit',
        title: '🏥 Benefit Request Pending Review',
        message: 'Medical assistance claim (₱15,000.00) from Engr. Roberto Garcia requires approval.',
        date: '5 hours ago',
        unread: true,
        actionTab: 'Approve Benefit Requests'
      }
    ]
  );

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (notif) => {
    // Mark as read
    setNotifications(notifications.map(n => n.id === notif.id ? { ...n, unread: false } : n));
    setShowNotifications(false);
    if (onNavigate && notif.actionTab) {
      onNavigate(notif.actionTab);
    }
  };

  return (
    <header className="top-navbar">
      {/* Mobile Hamburger Menu Toggle Button */}
      {onMenuToggle && (
        <button
          className="nav-hamburger"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      {/* Left: Brand Logo & Title */}
      <div className="nav-brand">
        <div className="brand-logo-container">
          <img 
            src={logoUrl || LOGO_IMAGE_PATH} 
            alt="U.C.A.R.E. Official Logo" 
            className="brand-logo-img"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        <div className="brand-info">
          <span className="brand-title">{systemTitle}</span>
          <span className="brand-subtitle">{systemSubtitle}</span>
        </div>
      </div>

      {/* Right: Notification Bell Dropdown, Role Badge, Profile & Logout */}
      <div className="nav-user">
        {/* Notification Bell with Unpaid Dues Dropdown Menu */}
        <div className="notification-dropdown-container" style={{ position: 'relative' }}>
          <button 
            className="nav-icon-btn" 
            title="Unpaid Dues & System Notifications" 
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="notification-badge-count">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Interactive Notifications Panel */}
          {showNotifications && (
            <div className="notification-dropdown-menu">
              <div className="notification-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    Notifications &amp; Unpaid Dues
                  </span>
                  {unreadCount > 0 && (
                    <span className="notif-count-pill">{unreadCount} New</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    className="notif-mark-read-btn"
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      className={`notification-item ${n.unread ? 'notification-item--unread' : ''}`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="notif-item-top">
                        <span className="notif-item-title">{n.title}</span>
                        <span className="notif-item-date">{n.date}</span>
                      </div>
                      <p className="notif-item-msg">{n.message}</p>
                      {n.actionTab && (
                        <div className="notif-item-action">
                          <span>Click to resolve ➔</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No notifications right now.
                  </div>
                )}
              </div>

              <div className="notification-footer">
                <span>U.C.A.R.E. Automated Reminders</span>
              </div>
            </div>
          )}
        </div>

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

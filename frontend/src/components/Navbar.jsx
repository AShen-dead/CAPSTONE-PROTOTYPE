import React, { useState, useEffect, useRef } from 'react';
import { animateNotificationDropdown, animateButtonPress, animateModalOpen, animateModalClose } from '../utils/animations';

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
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const dropdownRef = useRef(null);
  const signOutModalRef = useRef(null);
  const signOutOverlayRef = useRef(null);

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

  useEffect(() => {
    if (showNotifications && dropdownRef.current) {
      animateNotificationDropdown(dropdownRef.current);
    }
  }, [showNotifications]);

  useEffect(() => {
    if (showSignOutModal && signOutModalRef.current) {
      animateModalOpen(signOutModalRef.current, signOutOverlayRef.current);
    }
  }, [showSignOutModal]);

  const handleCloseSignOutModal = () => {
    if (signOutModalRef.current) {
      animateModalClose(signOutModalRef.current, signOutOverlayRef.current, () => setShowSignOutModal(false));
    } else {
      setShowSignOutModal(false);
    }
  };

  const handleConfirmLogout = () => {
    if (signOutModalRef.current) {
      animateModalClose(signOutModalRef.current, signOutOverlayRef.current, () => {
        setShowSignOutModal(false);
        if (onLogout) onLogout();
      });
    } else if (onLogout) {
      onLogout();
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (notif) => {
    setNotifications(notifications.map(n => n.id === notif.id ? { ...n, unread: false } : n));
    setShowNotifications(false);
    if (onNavigate && notif.actionTab) {
      onNavigate(notif.actionTab);
    }
  };

  return (
    <>
      <header className="top-navbar">
        {/* Mobile Hamburger Menu Toggle Button */}
        {onMenuToggle && (
          <button
            className="nav-hamburger"
            onClick={(e) => {
              animateButtonPress(e.currentTarget);
              onMenuToggle();
            }}
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
              onClick={(e) => {
                animateButtonPress(e.currentTarget);
                setShowNotifications(!showNotifications);
              }}
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
              <div className="notification-dropdown-menu" ref={dropdownRef}>
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

          {/* Sign Out Trigger Button */}
          {onLogout && (
            <button
              className="nav-logout-btn"
              onClick={(e) => {
                animateButtonPress(e.currentTarget);
                setShowSignOutModal(true);
              }}
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

      {/* ───────────────────────────────────────────────────────────────────
         SIGN OUT CONFIRMATION MODAL (Both Admin & Faculty Panels)
         ─────────────────────────────────────────────────────────────────── */}
      {showSignOutModal && (
        <div className="modal-overlay" ref={signOutOverlayRef}>
          <div className="modal-content" ref={signOutModalRef} style={{ maxWidth: '440px' }}>
            <div className="modal-header" style={{ backgroundColor: 'linear-gradient(135deg, #8B1E3F 0%, #6E1731 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.25rem' }}>🚪</span>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Sign Out Confirmation</h3>
              </div>
              <button className="btn-close-modal" onClick={handleCloseSignOutModal}>✕</button>
            </div>

            <div className="modal-body-form" style={{ padding: '24px', gap: '18px', textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  Are you sure you want to sign out?
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  You will be signed out of your <strong>{systemTitle}</strong> session ({userRole}). Any unsaved draft inputs will be cleared.
                </p>
              </div>

              <div className="modal-actions" style={{ justifyContent: 'center', gap: '14px', marginTop: '6px' }}>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={handleCloseSignOutModal}
                  style={{ minWidth: '120px' }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-primary"
                  onClick={handleConfirmLogout}
                  style={{ 
                    minWidth: '130px',
                    background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                    boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)' 
                  }}
                >
                  Yes, Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

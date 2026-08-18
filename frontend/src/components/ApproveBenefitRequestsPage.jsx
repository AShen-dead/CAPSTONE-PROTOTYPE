import React, { useState, useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { animatePageEntrance, animateModalOpen, animateModalClose } from '../utils/animations';

export default function ApproveBenefitRequestsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const containerRef = useRef(null);
  const listRef = useRef(null);
  const requestModalRef = useRef(null);
  const requestOverlayRef = useRef(null);

  const initialRequests = [
    {
      id: 1,
      memberName: 'Prof. Maria Santos',
      avatar: 'MS',
      benefitType: 'Medical Assistance',
      dateFiled: 'Jul 26, 2026',
      amountRequested: '₱ 15,000.00',
      status: 'Pending',
      attachment: 'Hospitalization_Record.pdf',
      attachmentUrl: '/assets/login-bg.jpg',
      notes: 'Hospitalization record attached for knee surgery.'
    },
    {
      id: 2,
      memberName: 'Dr. Juan Dela Cruz',
      avatar: 'JD',
      benefitType: 'Bereavement Assistance',
      dateFiled: 'Jul 24, 2026',
      amountRequested: '₱ 12,000.00',
      status: 'Pending',
      attachment: 'Death_Certificate_Copy.pdf',
      attachmentUrl: '/assets/login-bg.jpg',
      notes: 'Death certificate copy submitted for audit review.'
    },
    {
      id: 3,
      memberName: 'Prof. Elena Ramos',
      avatar: 'ER',
      benefitType: 'Educational Assistance',
      dateFiled: 'Jul 20, 2026',
      amountRequested: '₱ 8,500.00',
      status: 'Pending',
      attachment: 'Conference_Presentation.pdf',
      attachmentUrl: '/assets/login-bg.jpg',
      notes: 'International conference paper presentation registration fee.'
    },
    {
      id: 4,
      memberName: 'Engr. Roberto Garcia',
      avatar: 'RG',
      benefitType: 'Calamity Relief',
      dateFiled: 'Jul 15, 2026',
      amountRequested: '₱ 10,000.00',
      status: 'Approved',
      attachment: 'Calamity_Damage_Photos.pdf',
      attachmentUrl: '/assets/login-bg.jpg',
      notes: 'Typhoon damage assistance disbursement approved.'
    },
    {
      id: 5,
      memberName: 'Dr. Clarissa Reyes',
      avatar: 'CR',
      benefitType: 'Medical Assistance',
      dateFiled: 'Jul 10, 2026',
      amountRequested: '₱ 5,000.00',
      status: 'Declined',
      attachment: 'Outpatient_Receipt.pdf',
      attachmentUrl: '/assets/login-bg.jpg',
      notes: 'Outpatient prescription claim exceeded period cutoff.'
    }
  ];

  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem('ucare_benefit_requests');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialRequests;
      }
    }
    return initialRequests;
  });

  useEffect(() => {
    if (containerRef.current) {
      animatePageEntrance(containerRef.current);
    }
  }, []);

  useEffect(() => {
    if (listRef.current) {
      const cards = listRef.current.querySelectorAll('.request-card');
      if (cards.length > 0) {
        animate(Array.from(cards), {
          translateY: [16, 0],
          opacity: [0, 1],
          duration: 360,
          delay: stagger(50),
          ease: 'outCubic'
        });
      }
    }
  }, [activeFilter, requests]);

  useEffect(() => {
    if (selectedRequest && requestModalRef.current) {
      animateModalOpen(requestModalRef.current, requestOverlayRef.current);
    }
  }, [selectedRequest]);

  const handleCloseModal = () => {
    if (requestModalRef.current) {
      animateModalClose(requestModalRef.current, requestOverlayRef.current, () => setSelectedRequest(null));
    } else {
      setSelectedRequest(null);
    }
  };

  const handleDecision = (id, newStatus) => {
    const updated = requests.map(item => item.id === id ? { ...item, status: newStatus } : item);
    setRequests(updated);
    localStorage.setItem('ucare_benefit_requests', JSON.stringify(updated));
    window.dispatchEvent(new Event('ucare_requests_updated'));
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest({ ...selectedRequest, status: newStatus });
    }
  };

  const filteredRequests = requests.filter(r => {
    if (activeFilter === 'Pending') return r.status === 'Pending';
    if (activeFilter === 'Approved') return r.status === 'Approved';
    if (activeFilter === 'Declined') return r.status === 'Declined';
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'Pending').length;

  return (
    <div className="main-content" ref={containerRef}>
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Approve benefit requests</h1>
          <p>Review faculty assistance applications, inspect uploaded proof documents &amp; remarks</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
        {['All', 'Pending', 'Approved', 'Declined'].map((tab) => (
          <button
            key={tab}
            className={`btn-categories ${activeFilter === tab ? 'active' : ''}`}
            onClick={() => setActiveFilter(tab)}
            style={{
              borderColor: activeFilter === tab ? 'var(--primary-maroon)' : undefined,
              backgroundColor: activeFilter === tab ? '#FDF2F5' : undefined,
              color: activeFilter === tab ? 'var(--primary-maroon)' : undefined,
              fontWeight: activeFilter === tab ? '800' : '600'
            }}
          >
            {tab}
            {tab === 'Pending' && pendingCount > 0 && (
              <span className="nav-item-badge" style={{ marginLeft: '4px' }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Requests List Cards */}
      <div className="requests-list" ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredRequests.map((item) => (
          <div 
            key={item.id} 
            className="request-card"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-light)',
              borderLeft: item.status === 'Pending' ? '4px solid var(--accent-amber)' : item.status === 'Approved' ? '4px solid var(--secondary-emerald)' : '4px solid var(--status-declined-text)',
              borderRadius: 'var(--radius-md)',
              padding: '22px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px'
            }}
          >
            <div className="request-info" style={{ display: 'flex', flex: 1, gap: '16px', alignItems: 'center' }}>
              <div className="member-avatar" style={{ width: '48px', height: '48px', fontSize: '1.05rem', flexShrink: 0 }}>
                {item.avatar}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <div className="request-header-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="request-benefit-title" style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    {item.benefitType}
                  </span>
                  <span className={`status-tag ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </div>

                <div className="request-member-name" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Submitted by: <strong style={{ color: 'var(--text-main)' }}>{item.memberName}</strong> &nbsp;•&nbsp; Filed: {item.dateFiled}
                </div>

                <div style={{ fontSize: '0.84rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>Requested: <strong className="amount-text" style={{ fontSize: '0.95rem' }}>{item.amountRequested}</strong></span>
                  <span>•</span>
                  <span style={{ fontStyle: 'italic' }}>"{item.notes}"</span>
                </div>

                {/* Attachment & Remarks Preview Button */}
                <div style={{ marginTop: '4px' }}>
                  <button 
                    className="btn-sm btn-outline"
                    onClick={() => setSelectedRequest(item)}
                    style={{ gap: '6px', fontWeight: '600' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    View Attachment &amp; Remarks ({item.attachment || 'Document.png'})
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons: Pending vs Decided */}
            <div className="request-actions" style={{ flexShrink: 0 }}>
              {item.status === 'Pending' ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="btn-sm btn-danger"
                    onClick={() => handleDecision(item.id, 'Declined')}
                    style={{ padding: '9px 18px' }}
                  >
                    Decline
                  </button>
                  <button 
                    className="btn-sm btn-success"
                    onClick={() => handleDecision(item.id, 'Approved')}
                    style={{ padding: '9px 18px' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Approve
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'right' }}>
                  <span className={`status-tag ${item.status.toLowerCase()}`} style={{ padding: '6px 16px', fontSize: '0.75rem' }}>
                    {item.status === 'Approved' ? '✓ Approved' : '✕ Declined'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
            No benefit requests found under "{activeFilter}".
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────────────
         BENEFIT REQUEST INSPECTION MODAL (Shows Faculty Notes & Picture Attachment)
         ─────────────────────────────────────────────────────────────────── */}
      {selectedRequest && (
        <div className="modal-overlay" ref={requestOverlayRef}>
          <div className="modal-content" ref={requestModalRef} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.25rem' }}>🏥</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Benefit Application Inspection</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#FCE8B3' }}>{selectedRequest.memberName} — {selectedRequest.benefitType}</p>
                </div>
              </div>
              <button className="btn-close-modal" onClick={handleCloseModal}>✕</button>
            </div>

            <div className="modal-body-form" style={{ gap: '16px' }}>
              {/* Metadata Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Faculty Member</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary-maroon)' }}>{selectedRequest.memberName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Requested Amount</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#2E8B57' }}>{selectedRequest.amountRequested}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Application Status</div>
                  <span className={`status-tag ${selectedRequest.status.toLowerCase()}`} style={{ marginTop: '2px' }}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>

              {/* Faculty Remarks / Notes */}
              <div style={{ background: '#FEF8E7', border: '1px solid #FCE8B3', padding: '12px 14px', borderRadius: '6px', fontSize: '0.86rem', color: '#92400E' }}>
                <strong>Faculty Remarks / Reason:</strong>
                <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#78350F' }}>"{selectedRequest.notes}"</div>
              </div>

              {/* Uploaded Attachment Image Box */}
              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Uploaded Supporting Document / Proof Attachment:</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Filed: {selectedRequest.dateFiled}</span>
                </label>

                <div style={{ 
                  background: '#1E293B', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  maxHeight: '340px',
                  overflow: 'hidden',
                  border: '1px solid #334155'
                }}>
                  <img 
                    src={selectedRequest.attachmentUrl || selectedRequest.filePreviewUrl || '/assets/login-bg.jpg'} 
                    alt="Supporting Attachment Screenshot" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '300px', 
                      objectFit: 'contain', 
                      borderRadius: '4px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
                    }} 
                    onError={(e) => {
                      e.target.src = '/assets/login-bg.jpg';
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#CBD5E1', marginTop: '8px' }}>
                    File: {selectedRequest.attachment || 'Application_Document.pdf'}
                  </div>
                </div>
              </div>

              {/* Decision Action Buttons inside Modal */}
              <div className="modal-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                {selectedRequest.status === 'Pending' ? (
                  <button 
                    type="button" 
                    className="btn-sm btn-danger"
                    onClick={() => handleDecision(selectedRequest.id, 'Declined')}
                    style={{ padding: '10px 20px' }}
                  >
                    Decline Request
                  </button>
                ) : (
                  <div />
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Close Preview
                  </button>

                  {selectedRequest.status === 'Pending' && (
                    <button 
                      type="button" 
                      className="btn-primary"
                      onClick={() => handleDecision(selectedRequest.id, 'Approved')}
                      style={{ background: 'linear-gradient(135deg, #2E8B57 0%, #256F46 100%)', boxShadow: '0 4px 14px rgba(46, 139, 87, 0.4)' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Approve Request
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { animatePageEntrance, animateModalOpen, animateModalClose } from '../utils/animations';
import { fetchBenefitRequests, decideBenefitRequest } from '../api';

const STORAGE_BASE = 'http://localhost:8000/storage/';

export default function ApproveBenefitRequestsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const containerRef = useRef(null);
  const listRef = useRef(null);
  const requestModalRef = useRef(null);
  const requestOverlayRef = useRef(null);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBenefitRequests();
      const raw = res?.data || [];
      const mapped = raw.map(item => {
        const fm = item.faculty_member;
        const u = fm?.user;
        const memberName = u?.name ?? (fm ? trimName(fm.first_name, fm.last_name) : 'Faculty Member');
        const initials = memberName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'FM';
        const docPath = item.documents?.[0]?.document_path;

        return {
          id: item.id,
          memberName,
          email: u?.email || '—',
          avatar: initials,
          profilePhoto: u?.profile_photo,
          benefitType: item.benefit_type?.benefit_name ?? item.benefit_type?.name ?? 'Assistance',
          dateFiled: item.request_date
            ? new Date(item.request_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—',
          amountRequested: item.amount_requested
            ? `₱ ${Number(item.amount_requested).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
            : '—',
          status: item.status || 'Pending',
          attachment: docPath ? docPath.split('/').pop() : null,
          attachmentUrl: docPath ? STORAGE_BASE + docPath : null,
          notes: item.reason || 'No remarks provided.',
          raw: item,
        };
      });
      setRequests(mapped);
    } catch (err) {
      console.error('Failed to load benefit requests:', err);
      setError('Could not load benefit requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const trimName = (first, last) => {
    return `${first || ''} ${last || ''}`.trim() || 'Faculty Member';
  };

  useEffect(() => {
    loadRequests();
  }, []);

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

  const handleDecision = async (id, newStatus) => {
    setActionLoading(id);
    try {
      await decideBenefitRequest(id, newStatus);
      
      // Update locally
      const updated = requests.map(item => item.id === id ? { ...item, status: newStatus } : item);
      setRequests(updated);

      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }

      window.dispatchEvent(new Event('ucare_requests_updated'));
    } catch (err) {
      alert(err?.data?.message || 'Failed to update request status.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (activeFilter === 'Pending') return r.status === 'Pending';
    if (activeFilter === 'Approved') return r.status === 'Approved';
    if (activeFilter === 'Declined') return r.status === 'Declined' || r.status === 'Rejected';
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
      <div className="filter-tabs" style={{ marginBottom: '8px' }}>
        {['All', 'Pending', 'Approved', 'Declined'].map((tab) => (
          <button
            key={tab}
            className={`btn-categories filter-tab ${activeFilter === tab ? 'active' : ''}`}
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

      {/* Error state */}
      {error && (
        <div style={{
          backgroundColor: '#FEE2E2',
          border: '1px solid #FCA5A5',
          color: '#B91C1C',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '0.88rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button className="btn-sm btn-outline" onClick={loadRequests}>Retry</button>
        </div>
      )}

      {/* Requests List Cards */}
      <div className="requests-list" ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
            Loading benefit requests...
          </div>
        ) : filteredRequests.length > 0 ? (
          filteredRequests.map((item) => {
            const isPending = item.status === 'Pending';
            const isApproved = item.status === 'Approved';
            const isBusy = actionLoading === item.id;

            return (
              <div 
                key={item.id} 
                className="request-card"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-light)',
                  borderLeft: isPending ? '4px solid var(--accent-amber)' : isApproved ? '4px solid var(--secondary-emerald)' : '4px solid var(--status-declined-text)',
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
                  <div 
                    className="member-avatar" 
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      fontSize: '1.05rem', 
                      flexShrink: 0,
                      overflow: 'hidden',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #8B1E3F 0%, #6E1731 100%)',
                      color: '#fff',
                      fontWeight: '700',
                      border: '2px solid #F4B942',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                    }}
                  >
                    {item.profilePhoto ? (
                      <img 
                        src={item.profilePhoto.startsWith('http') ? item.profilePhoto : STORAGE_BASE + item.profilePhoto.replace(/^\/+/, '')} 
                        alt={item.memberName} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      item.avatar
                    )}
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

                    <div style={{ fontSize: '0.84rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {item.amountRequested !== '—' && (
                        <>
                          <span>Requested: <strong className="amount-text" style={{ fontSize: '0.95rem' }}>{item.amountRequested}</strong></span>
                          <span>•</span>
                        </>
                      )}
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
                        {item.attachment ? `View Attachment (${item.attachment})` : 'View Details & Remarks'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Pending vs Decided */}
                <div className="request-actions" style={{ flexShrink: 0 }}>
                  {isPending ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        className="btn-sm btn-danger"
                        onClick={() => handleDecision(item.id, 'Declined')}
                        disabled={isBusy}
                        style={{ padding: '9px 18px' }}
                      >
                        {isBusy ? '…' : 'Decline'}
                      </button>
                      <button 
                        className="btn-sm btn-success"
                        onClick={() => handleDecision(item.id, 'Approved')}
                        disabled={isBusy}
                        style={{ padding: '9px 18px' }}
                      >
                        {isBusy ? '…' : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Approve
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'right' }}>
                      <span className={`status-tag ${item.status.toLowerCase()}`} style={{ padding: '6px 16px', fontSize: '0.75rem' }}>
                        {isApproved ? '✓ Approved' : '✕ Declined'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
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
              <div className="modal-meta-grid-3" style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
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

                {selectedRequest.attachmentUrl ? (
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
                    {selectedRequest.attachment?.toLowerCase().endsWith('.pdf') ? (
                      <div style={{ padding: '24px', textAlign: 'center' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#F4B942" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <div style={{ color: '#F1F5F9', marginTop: '10px', fontSize: '0.9rem', fontWeight: '600' }}>
                          PDF Document: {selectedRequest.attachment}
                        </div>
                        <a 
                          href={selectedRequest.attachmentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn-sm btn-primary"
                          style={{ marginTop: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          Open / Download PDF ↗
                        </a>
                      </div>
                    ) : (
                      <>
                        <img 
                          src={selectedRequest.attachmentUrl} 
                          alt="Supporting Attachment" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '280px', 
                            objectFit: 'contain', 
                            borderRadius: '4px', 
                            boxShadow: '0 4px 16px rgba(0,0,0,0.4)' 
                          }} 
                        />
                        <div style={{ fontSize: '0.75rem', color: '#CBD5E1', marginTop: '8px' }}>
                          <a 
                            href={selectedRequest.attachmentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ color: '#93C5FD', textDecoration: 'underline' }}
                          >
                            Open full size ({selectedRequest.attachment}) ↗
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div style={{ 
                    padding: '24px', 
                    textAlign: 'center', 
                    background: '#F8FAFC', 
                    borderRadius: '8px', 
                    border: '1px dashed var(--border-light)', 
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem'
                  }}>
                    No supporting document was attached to this request.
                  </div>
                )}
              </div>

              {/* Decision Action Buttons inside Modal */}
              <div className="modal-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                {selectedRequest.status === 'Pending' ? (
                  <button 
                    type="button" 
                    className="btn-sm btn-danger"
                    onClick={() => handleDecision(selectedRequest.id, 'Declined')}
                    disabled={actionLoading === selectedRequest.id}
                    style={{ padding: '10px 20px' }}
                  >
                    {actionLoading === selectedRequest.id ? '…' : 'Decline Request'}
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
                      disabled={actionLoading === selectedRequest.id}
                      style={{ background: 'linear-gradient(135deg, #2E8B57 0%, #256F46 100%)', boxShadow: '0 4px 14px rgba(46, 139, 87, 0.4)' }}
                    >
                      {actionLoading === selectedRequest.id ? '…' : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Approve Request
                        </>
                      )}
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


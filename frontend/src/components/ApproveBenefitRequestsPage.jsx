import React, { useState } from 'react';

export default function ApproveBenefitRequestsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [requests, setRequests] = useState([
    {
      id: 1,
      memberName: 'Prof. Maria Santos',
      avatar: 'MS',
      benefitType: 'Medical Assistance',
      dateFiled: 'Jul 26, 2026',
      amountRequested: '₱ 15,000.00',
      status: 'Pending',
      attachment: 'Hospitalization_Record.pdf',
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
      notes: 'Outpatient prescription claim exceeded period cutoff.'
    }
  ]);

  const handleDecision = (id, newStatus) => {
    setRequests(requests.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const filteredRequests = requests.filter(r => {
    if (activeFilter === 'Pending') return r.status === 'Pending';
    if (activeFilter === 'Approved') return r.status === 'Approved';
    if (activeFilter === 'Declined') return r.status === 'Declined';
    return true;
  });

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Approve benefit requests</h1>
          <p>Review and act upon faculty assistance applications</p>
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
            {tab === 'Pending' && (
              <span className="nav-item-badge" style={{ marginLeft: '4px' }}>
                {requests.filter(r => r.status === 'Pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Requests List Cards */}
      <div className="requests-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

                {item.attachment && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--primary-maroon)', fontWeight: '600', marginTop: '2px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                    Attachment: {item.attachment}
                  </div>
                )}
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
    </div>
  );
}

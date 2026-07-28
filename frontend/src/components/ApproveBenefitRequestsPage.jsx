import React, { useState } from 'react';

export default function ApproveBenefitRequestsPage() {
  const [requests, setRequests] = useState([
    {
      id: 1,
      memberName: 'Prof. Maria Santos',
      avatar: 'MS',
      benefitType: 'Medical Assistance',
      dateFiled: 'Jul 26, 2026',
      amountRequested: '₱ 15,000.00',
      status: 'Pending',
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
      notes: 'Death certificate copy submitted for review.'
    },
    {
      id: 3,
      memberName: 'Prof. Elena Ramos',
      avatar: 'ER',
      benefitType: 'Educational Assistance',
      dateFiled: 'Jul 20, 2026',
      amountRequested: '₱ 8,500.00',
      status: 'Pending',
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
      notes: 'Typhoon damage assistance disbursement.'
    },
    {
      id: 5,
      memberName: 'Dr. Clarissa Reyes',
      avatar: 'CR',
      benefitType: 'Medical Assistance',
      dateFiled: 'Jul 10, 2026',
      amountRequested: '₱ 5,000.00',
      status: 'Declined',
      notes: 'Outpatient prescription claim exceeded period cutoff.'
    }
  ]);

  const handleDecision = (id, newStatus) => {
    setRequests(requests.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Approve benefit requests</h1>
          <p>Review and act upon faculty assistance applications</p>
        </div>
      </div>

      {/* Requests List Cards */}
      <div className="requests-list">
        {requests.map((item) => (
          <div key={item.id} className="request-card">
            <div className="request-info">
              <div className="request-header-row">
                <span className="request-benefit-title">{item.benefitType}</span>
                <span className={`status-tag ${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>

              <div className="request-member-name">
                Submitted by: <strong>{item.memberName}</strong>
              </div>

              <div className="request-meta-row">
                <span>Filed: {item.dateFiled}</span>
                <span>•</span>
                <span>Amount: <strong className="amount-text">{item.amountRequested}</strong></span>
                <span>•</span>
                <span style={{ fontStyle: 'italic', color: '#64748b' }}>"{item.notes}"</span>
              </div>
            </div>

            {/* Action Buttons: Pending vs Decided */}
            <div className="request-actions">
              {item.status === 'Pending' ? (
                <>
                  <button 
                    className="btn-sm btn-danger"
                    onClick={() => handleDecision(item.id, 'Declined')}
                  >
                    Decline
                  </button>
                  <button 
                    className="btn-sm btn-success"
                    onClick={() => handleDecision(item.id, 'Approved')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Approve
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'right' }}>
                  <span className={`status-tag ${item.status.toLowerCase()}`}>
                    {item.status === 'Approved' ? '✓ Approved' : '✕ Declined'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

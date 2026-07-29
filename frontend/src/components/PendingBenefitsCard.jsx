import React from 'react';

export default function PendingBenefitsCard({ mostRecent, recentList }) {
  const defaultMostRecent = mostRecent || {
    benefitType: 'Medical Assistance',
    memberName: 'Prof. Maria Santos',
    dateFiled: 'Jul 26, 2026',
    amount: '₱ 15,000.00',
    status: 'Pending Review'
  };

  const defaultList = recentList || [
    { id: 1, memberName: 'Dr. Juan Dela Cruz', benefitType: 'Bereavement Assistance', status: 'Pending', statusType: 'pending' },
    { id: 2, memberName: 'Engr. Roberto Garcia', benefitType: 'Calamity Relief', status: 'Approved', statusType: 'approved' },
    { id: 3, memberName: 'Prof. Elena Ramos', benefitType: 'Educational Aid', status: 'Pending', statusType: 'pending' }
  ];

  return (
    <div className="dashboard-card pending-card-container">
      <div className="card-header-label">
        <span>PENDING BENEFIT</span>
        <span style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: '600' }}>3 Awaiting Action</span>
      </div>

      {/* Highlighted Entry: Most Recent Pending Request */}
      <div className="pending-benefit-highlight">
        <div className="pending-highlight-top">
          <span className="pending-benefit-type">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {defaultMostRecent.benefitType}
          </span>
          <span className="status-tag pending">{defaultMostRecent.status}</span>
        </div>
        
        <div className="pending-member-name">{defaultMostRecent.memberName}</div>
        
        <div className="pending-meta">
          <span>Filed: {defaultMostRecent.dateFiled}</span>
          <strong style={{ fontSize: '0.9rem' }}>{defaultMostRecent.amount}</strong>
        </div>
      </div>

      {/* Compact list rows below */}
      <div className="pending-list">
        {defaultList.map((item) => (
          <div key={item.id} className="pending-list-item">
            <div className="item-left">
              <span className="item-member">{item.memberName}</span>
              <span className="item-benefit">{item.benefitType}</span>
            </div>
            <span className={`status-tag ${item.statusType}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

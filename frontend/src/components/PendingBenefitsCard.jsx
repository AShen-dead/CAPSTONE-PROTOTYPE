import React from 'react';

export default function PendingBenefitsCard({ mostRecent, recentList, onNavigate }) {
  const topItem = mostRecent || {
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

  const handleCardClick = () => {
    if (onNavigate) {
      onNavigate('Approve Benefit Requests');
    }
  };

  return (
    <div 
      className="dashboard-card pending-card-container"
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-header-label">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B47806" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>PENDING BENEFIT REVIEWS</span>
        </div>
        <span 
          className="trend-badge" 
          style={{ backgroundColor: '#FEF8E7', color: '#B47806', border: '1px solid #FCE8B3', cursor: 'pointer' }}
        >
          Review Requests &gt;
        </span>
      </div>

      {/* Featured Highlight Card (View Only) */}
      <div className="pending-benefit-highlight">
        <div className="pending-highlight-top">
          <span className="pending-benefit-type">
            {topItem.benefitType}
          </span>
          <span className="status-tag pending">
            {topItem.status}
          </span>
        </div>

        <div className="pending-member-name">{topItem.memberName}</div>

        <div className="pending-meta">
          <span>Filed: {topItem.dateFiled}</span>
          <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{topItem.amount}</strong>
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

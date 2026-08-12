import React from 'react';

export default function RecentPaymentsTable({ payments, onNavigate }) {
  const samplePayments = payments || [
    {
      id: 1,
      member: 'Prof. Antonio Mendoza',
      avatar: 'AM',
      date: 'Jul 28, 2026',
      type: 'Monthly Dues',
      refNo: 'REF-2026-0891',
      amount: '₱ 500.00',
      status: 'Completed'
    },
    {
      id: 2,
      member: 'Dr. Clarissa Reyes',
      avatar: 'CR',
      date: 'Jul 27, 2026',
      type: 'Special Contribution',
      refNo: 'REF-2026-0890',
      amount: '₱ 1,200.00',
      status: 'Completed'
    },
    {
      id: 3,
      member: 'Engr. Michael Tan',
      avatar: 'MT',
      date: 'Jul 27, 2026',
      type: 'Monthly Dues',
      refNo: 'REF-2026-0889',
      amount: '₱ 500.00',
      status: 'Completed'
    },
    {
      id: 4,
      member: 'Prof. Beatriz Laurel',
      avatar: 'BL',
      date: 'Jul 25, 2026',
      type: 'Mutual Aid Fund',
      refNo: 'REF-2026-0888',
      amount: '₱ 1,000.00',
      status: 'Completed'
    },
    {
      id: 5,
      member: 'Dr. Fernando Lopez',
      avatar: 'FL',
      date: 'Jul 24, 2026',
      type: 'Monthly Dues',
      refNo: 'REF-2026-0887',
      amount: '₱ 500.00',
      status: 'Completed'
    }
  ];

  return (
    <div className="recent-activity-panel">
      <div className="panel-header">
        <h2>Recent Payment Activity</h2>
        <button 
          className="view-all-link"
          onClick={(e) => {
            e.preventDefault();
            if (onNavigate) onNavigate('Manage Payments');
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          View all 
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Date</th>
              <th>Type</th>
              <th>Reference #</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {samplePayments.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="member-cell">
                    <div className="member-avatar">{item.avatar}</div>
                    <span>{item.member}</span>
                  </div>
                </td>
                <td>{item.date}</td>
                <td>{item.type}</td>
                <td>
                  <span className="ref-code">{item.refNo}</span>
                </td>
                <td>
                  <span className="amount-text">{item.amount}</span>
                </td>
                <td>
                  <span className="status-tag approved">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React from 'react';
import StatCard from './StatCard';

export default function FacultyHome({ currentUser, onNavigate }) {
  const user = currentUser || { name: 'Prof. Maria Santos', email: 'faculty@ucare.local' };

  const recentRequests = [
    { id: 1, type: 'Medical Assistance', date: 'Jul 26, 2026', amount: '₱ 15,000.00', status: 'Pending' },
    { id: 2, type: 'Educational Assistance', date: 'May 12, 2026', amount: '₱ 8,500.00', status: 'Released' }
  ];

  const recentPayments = [
    { id: 1, date: 'Jul 28, 2026', type: 'Monthly Dues', refNo: 'REF-2026-0891', amount: '₱ 500.00', status: 'Verified' },
    { id: 2, date: 'Jun 28, 2026', type: 'Monthly Dues', refNo: 'REF-2026-0742', amount: '₱ 500.00', status: 'Verified' },
    { id: 3, date: 'May 28, 2026', type: 'Monthly Dues', refNo: 'REF-2026-0618', amount: '₱ 500.00', status: 'Verified' }
  ];

  return (
    <main className="main-content">
      {/* Page Header / Profile Summary Row */}
      <div className="faculty-profile-header-card">
        <div className="faculty-avatar-large">
          {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'FM'}
        </div>
        <div className="faculty-profile-info">
          <div className="faculty-profile-name">{user.name}</div>
          <div className="faculty-profile-role">Faculty Member • ISPSC Tagudin Campus</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            College of Teacher Education
          </div>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="top-panels-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <StatCard
          headerTitle="TOTAL CONTRIBUTIONS"
          value="₱ 28,500.00"
          subtitle="Your total union dues remitted to date"
          chartType="bar"
          data={[3500, 4500, 5000, 5000, 5000, 5500]}
          labels={['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']}
        />

        <StatCard
          headerTitle="ACTIVE REQUESTS"
          value="1 Pending"
          subtitle="Assistance applications currently under review"
          chartType="area"
          isMainFocus={true}
          data={[0, 1, 0, 1, 0, 1]}
          labels={['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']}
        />
      </div>

      {/* Side-by-side (Laptop) / Stacked (Phone) Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
        {/* Assistance Requests Section */}
        <div className="recent-activity-panel">
          <div className="panel-header">
            <h2>My Assistance Requests</h2>
            <button 
              className="view-all-link" 
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => onNavigate && onNavigate('My assistance requests')}
            >
              View all &gt;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentRequests.map(req => (
              <div key={req.id} className="pending-list-item">
                <div className="item-left">
                  <span className="item-member" style={{ fontSize: '0.95rem' }}>{req.type}</span>
                  <span className="item-benefit">Filed: {req.date} • {req.amount}</span>
                </div>
                <span className={`status-tag ${req.status === 'Pending' ? 'pending' : 'released'}`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History Section */}
        <div className="recent-activity-panel">
          <div className="panel-header">
            <h2>Payment History</h2>
            <button 
              className="view-all-link" 
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => onNavigate && onNavigate('Payment history')}
            >
              View all &gt;
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map(p => (
                  <tr key={p.id}>
                    <td>{p.date}</td>
                    <td>{p.type}</td>
                    <td><strong className="amount-text">{p.amount}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

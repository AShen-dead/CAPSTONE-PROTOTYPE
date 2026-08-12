import React, { useState } from 'react';

export default function FacultyRequests() {
  const [filter, setFilter] = useState('All');

  const [requests] = useState([
    { id: 1, type: 'Medical Assistance', date: 'Jul 26, 2026', amount: '₱ 15,000.00', status: 'Pending', notes: 'Hospitalization claim under review.' },
    { id: 2, type: 'Educational Assistance', date: 'May 12, 2026', amount: '₱ 8,500.00', status: 'Released', notes: 'Conference registration fee reimbursed.' },
    { id: 3, type: 'Bereavement Assistance', date: 'Jan 10, 2026', amount: '₱ 10,000.00', status: 'Released', notes: 'Mutual aid claim processed.' }
  ]);

  const filteredRequests = requests.filter(r => {
    if (filter === 'Pending') return r.status === 'Pending';
    if (filter === 'Released') return r.status === 'Released';
    return true;
  });

  return (
    <main className="main-content">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>My assistance requests</h1>
          <p>Track status and updates on your submitted benefit applications</p>
        </div>

        {/* Filter Tabs (Top Right on Laptop) */}
        <div className="filter-tabs">
          <button className={`filter-tab ${filter === 'All' ? 'active' : ''}`} onClick={() => setFilter('All')}>
            All ({requests.length})
          </button>
          <button className={`filter-tab ${filter === 'Pending' ? 'active' : ''}`} onClick={() => setFilter('Pending')}>
            Pending ({requests.filter(r => r.status === 'Pending').length})
          </button>
          <button className={`filter-tab ${filter === 'Released' ? 'active' : ''}`} onClick={() => setFilter('Released')}>
            Released ({requests.filter(r => r.status === 'Released').length})
          </button>
        </div>
      </div>

      {/* Requests List Cards & Table */}
      <div className="recent-activity-panel">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Date Filed</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map(r => (
                  <tr key={r.id}>
                    <td><strong style={{ color: 'var(--text-main)' }}>{r.type}</strong></td>
                    <td>{r.date}</td>
                    <td><strong className="amount-text">{r.amount}</strong></td>
                    <td>
                      <span className={`status-tag ${r.status === 'Pending' ? 'pending' : 'released'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{r.notes}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No requests found under "{filter}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

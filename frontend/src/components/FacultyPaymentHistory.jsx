import React, { useState } from 'react';
import StatCard from './StatCard';

export default function FacultyPaymentHistory() {
  const [payments] = useState([
    { id: 1, date: 'Jul 28, 2026', type: 'Monthly Dues', refNo: 'REF-2026-0891', amount: '₱ 500.00', status: 'Verified' },
    { id: 2, date: 'Jul 20, 2026', type: 'Special Assessment', refNo: 'REF-2026-0854', amount: '₱ 1,000.00', status: 'To verify' },
    { id: 3, date: 'Jun 28, 2026', type: 'Monthly Dues', refNo: 'REF-2026-0742', amount: '₱ 500.00', status: 'Verified' },
    { id: 4, date: 'May 28, 2026', type: 'Monthly Dues', refNo: 'REF-2026-0618', amount: '₱ 500.00', status: 'Verified' },
    { id: 5, date: 'Apr 28, 2026', type: 'Monthly Dues', refNo: 'REF-2026-0490', amount: '₱ 500.00', status: 'Verified' }
  ]);

  return (
    <main className="main-content">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Payment history</h1>
          <p>Personal record of all your faculty union contributions and payments</p>
        </div>
      </div>

      {/* Two Summary Cards */}
      <div className="top-panels-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <StatCard
          headerTitle="TOTAL PAID"
          value="₱ 28,500.00"
          subtitle="All-time verified union payments"
          trendText="Verified"
          trendPositive={true}
          chartType="bar"
          data={[3000, 3500, 4500, 5000, 5000, 5500]}
          labels={['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']}
        />

        <StatCard
          headerTitle="TO BE VERIFIED"
          value="₱ 1,000.00"
          subtitle="Recent payment remittance awaiting admin verification"
          trendText="1 Pending"
          trendPositive={true}
          chartType="area"
          isMainFocus={true}
          data={[0, 0, 500, 0, 1000, 1000]}
          labels={['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']}
        />
      </div>

      {/* Payment Entries Table */}
      <div className="recent-activity-panel">
        <div className="panel-header">
          <h2>Payment Log Entries</h2>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Reference #</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td>{p.date}</td>
                  <td><strong style={{ color: 'var(--text-main)' }}>{p.type}</strong></td>
                  <td><span className="ref-code">{p.refNo}</span></td>
                  <td><strong className="amount-text">{p.amount}</strong></td>
                  <td>
                    <span className={`status-tag ${p.status === 'Verified' ? 'verified' : 'to-verify'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

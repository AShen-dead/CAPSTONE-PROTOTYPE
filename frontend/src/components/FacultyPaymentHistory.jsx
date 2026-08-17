import React, { useState, useEffect, useRef } from 'react';
import StatCard from './StatCard';
import { animatePageEntrance, animateStatCards, animateTableRows } from '../utils/animations';

export default function FacultyPaymentHistory() {
  const containerRef = useRef(null);
  const panelsRef = useRef(null);
  const tableRef = useRef(null);

  const [payments] = useState([
    { id: 1, date: 'Jul 28, 2026', type: 'Monthly Dues', refNo: 'REF-2026-0891', amount: '₱ 500.00', status: 'Verified' },
    { id: 2, date: 'Jul 20, 2026', type: 'Special Assessment', refNo: 'REF-2026-0854', amount: '₱ 1,000.00', status: 'To verify' },
    { id: 3, date: 'Jun 28, 2026', type: 'Monthly Dues', refNo: 'REF-2026-0742', amount: '₱ 500.00', status: 'Verified' },
    { id: 4, date: 'May 28, 2026', type: 'Monthly Dues', refNo: 'REF-2026-0618', amount: '₱ 500.00', status: 'Verified' },
    { id: 5, date: 'Apr 28, 2026', type: 'Monthly Dues', refNo: 'REF-2026-0490', amount: '₱ 500.00', status: 'Verified' }
  ]);

  useEffect(() => {
    if (containerRef.current) {
      animatePageEntrance(containerRef.current);
    }
    if (panelsRef.current) {
      animateStatCards(panelsRef.current);
    }
    if (tableRef.current) {
      animateTableRows(tableRef.current);
    }
  }, []);

  return (
    <main className="main-content" ref={containerRef}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Payment history</h1>
          <p>Personal record of all your faculty union contributions and payments</p>
        </div>
      </div>

      {/* Two Summary Cards */}
      <div className="top-panels-grid" ref={panelsRef} style={{ gridTemplateColumns: '1fr 1fr' }}>
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
      <div className="recent-activity-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="panel-header" style={{ padding: '20px 24px 0 24px' }}>
          <h2>Payment Log Entries</h2>
        </div>

        {/* Swipeable Responsive Table Container */}
        <div className="table-responsive" style={{ touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch', border: 'none' }}>
          <table className="data-table" ref={tableRef} style={{ minWidth: '680px' }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap' }}>Date</th>
                <th style={{ whiteSpace: 'nowrap' }}>Type</th>
                <th style={{ whiteSpace: 'nowrap' }}>Reference #</th>
                <th style={{ whiteSpace: 'nowrap' }}>Amount</th>
                <th style={{ whiteSpace: 'nowrap' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{p.date}</td>
                  <td style={{ whiteSpace: 'nowrap' }}><strong style={{ color: 'var(--text-main)' }}>{p.type}</strong></td>
                  <td style={{ whiteSpace: 'nowrap' }}><span className="ref-code">{p.refNo}</span></td>
                  <td style={{ whiteSpace: 'nowrap' }}><strong className="amount-text">{p.amount}</strong></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
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

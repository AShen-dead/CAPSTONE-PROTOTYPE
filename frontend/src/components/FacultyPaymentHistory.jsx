import React, { useState, useEffect, useRef } from 'react';
import StatCard from './StatCard';
import { animatePageEntrance, animateStatCards, animateTableRows } from '../utils/animations';
import { fetchFacultyDashboard, fetchFacultyPayments } from '../api';

export default function FacultyPaymentHistory() {
  const containerRef = useRef(null);
  const panelsRef = useRef(null);
  const tableRef = useRef(null);

  const [dashboardData, setDashboardData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashRes, payRes] = await Promise.all([
          fetchFacultyDashboard(),
          fetchFacultyPayments()
        ]);
        setDashboardData(dashRes);
        setPayments(payRes?.data || []);
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      animatePageEntrance(containerRef.current);
    }
    if (panelsRef.current && !loading) {
      animateStatCards(panelsRef.current);
    }
    if (tableRef.current && !loading) {
      animateTableRows(tableRef.current);
    }
  }, [loading]);

  const totalPaid = dashboardData?.total_contributions || 0;
  
  // Calculate unverified amount
  const pendingAmount = payments
    .filter(p => p.status !== 'Verified' && p.status !== 'Completed')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const pendingCount = payments.filter(p => p.status !== 'Verified' && p.status !== 'Completed').length;

  const chartLabels = dashboardData?.chart_labels || ['—', '—', '—', '—', '—', '—'];
  const contributionsChart = dashboardData?.contributions_chart || [0, 0, 0, 0, 0, 0];
  
  const formatCurrency = (val) => '₱ ' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 });
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d) ? dateStr : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

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
      <div className="top-panels-grid top-panels-grid--two-col" ref={panelsRef}>
        <StatCard
          headerTitle="TOTAL PAID"
          value={loading ? '...' : formatCurrency(totalPaid)}
          subtitle="All-time verified union payments"
          trendText="Verified"
          trendPositive={true}
          chartType="bar"
          data={contributionsChart}
          labels={chartLabels}
        />

        <StatCard
          headerTitle="TO BE VERIFIED"
          value={loading ? '...' : formatCurrency(pendingAmount)}
          subtitle="Recent payment remittance awaiting admin verification"
          trendText={`${pendingCount} Pending`}
          trendPositive={pendingCount === 0}
          chartType="area"
          isMainFocus={true}
          data={contributionsChart} // Fallback data since we don't track pending per month
          labels={chartLabels}
        />
      </div>

      {/* Payment Entries Table */}
      <div className="recent-activity-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="panel-header" style={{ padding: '20px 24px 0 24px' }}>
          <h2>Payment Log Entries</h2>
        </div>

        {/* Swipeable Responsive Table Container */}
        <div className="table-responsive" style={{ touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch', border: 'none' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              ⏳ Loading payment history...
            </div>
          ) : (
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
                {payments.length > 0 ? (
                  payments.map(p => (
                    <tr key={p.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(p.payment_date)}</td>
                      <td style={{ whiteSpace: 'nowrap' }}><strong style={{ color: 'var(--text-main)' }}>{p.payment_method || 'Contribution'}</strong></td>
                      <td style={{ whiteSpace: 'nowrap' }}><span className="ref-code">{p.reference_no || `PAY-${p.id}`}</span></td>
                      <td style={{ whiteSpace: 'nowrap' }}><strong className="amount-text">{formatCurrency(p.amount)}</strong></td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className={`status-tag ${p.status === 'Verified' ? 'verified' : p.status === 'Pending' ? 'to-verify' : 'declined'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No payment records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}

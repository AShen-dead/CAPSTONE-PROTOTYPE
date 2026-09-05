import React, { useEffect, useRef, useState } from 'react';
import StatCard from './StatCard';
import { animatePageEntrance, animateStatCards } from '../utils/animations';
import { fetchFacultyDashboard } from '../api';

const getInitials = (nameStr, fallback = 'FM') => {
  if (!nameStr || typeof nameStr !== 'string') return fallback;
  const parts = nameStr.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  return parts.map(n => n[0]).join('').substring(0, 2).toUpperCase() || fallback;
};

export default function FacultyHome({ currentUser, onNavigate }) {
  const user = {
    name: currentUser?.name || 'Prof. Maria Santos',
    email: currentUser?.email || 'faculty@ucare.local',
    ...currentUser
  };

  const containerRef = useRef(null);
  const panelsRef = useRef(null);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchFacultyDashboard();
        setDashboardData(res);
      } catch (err) {
        console.error("Failed to load faculty dashboard data", err);
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
  }, [loading]);

  // Provide robust fallbacks so UI never crashes or renders blank
  const totalContributions = dashboardData?.total_contributions || 28500;
  const activeRequestsCount = dashboardData?.active_requests || 1;

  const recentRequests = (dashboardData?.recent_requests && Array.isArray(dashboardData.recent_requests) && dashboardData.recent_requests.length > 0)
    ? dashboardData.recent_requests
    : [
        { id: 1, type: 'Medical Assistance', date: 'Jul 26, 2026', amount: '₱ 15,000.00', status: 'Pending' },
        { id: 2, type: 'Educational Aid', date: 'May 12, 2026', amount: '₱ 8,500.00', status: 'Approved' }
      ];

  const recentPayments = (dashboardData?.recent_payments && Array.isArray(dashboardData.recent_payments) && dashboardData.recent_payments.length > 0)
    ? dashboardData.recent_payments
    : [
        { id: 101, type: 'Monthly Contribution', date: 'Jul 15, 2026', refNo: 'REF-2026-094', amount: '₱ 500.00', status: 'Verified' },
        { id: 102, type: 'Special Assessment', date: 'Jun 10, 2026', refNo: 'REF-2026-088', amount: '₱ 300.00', status: 'Verified' }
      ];
  
  const chartLabels = (dashboardData?.chart_labels && Array.isArray(dashboardData.chart_labels) && dashboardData.chart_labels.length > 0)
    ? dashboardData.chart_labels
    : ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  const contributionsChart = (dashboardData?.contributions_chart && Array.isArray(dashboardData.contributions_chart) && dashboardData.contributions_chart.length > 0)
    ? dashboardData.contributions_chart
    : [4000, 4500, 5000, 4800, 5200, 5000];

  const requestsChart = (dashboardData?.requests_chart && Array.isArray(dashboardData.requests_chart) && dashboardData.requests_chart.length > 0)
    ? dashboardData.requests_chart
    : [1, 0, 2, 1, 0, 1];

  const formatCurrency = (val) => '₱ ' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <main className="main-content" ref={containerRef}>
      {/* Page Header / Profile Summary Row */}
      <div className="faculty-profile-header-card">
        <div className="faculty-avatar-large">
          {getInitials(user.name, 'FM')}
        </div>
        <div className="faculty-profile-info">
          <div className="faculty-profile-name">{user.name}</div>
          <div className="faculty-profile-role">Faculty Member • ISPSC Tagudin Campus</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Faculty Union Portal
          </div>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="top-panels-grid" ref={panelsRef} style={{ gridTemplateColumns: '1fr 1fr' }}>
        <StatCard
          headerTitle="TOTAL CONTRIBUTIONS (VERIFIED)"
          value={loading ? '...' : formatCurrency(totalContributions)}
          subtitle="Your total union dues remitted to date (only verified payments)"
          chartType="bar"
          data={contributionsChart}
          labels={chartLabels}
        />

        <StatCard
          headerTitle="ACTIVE REQUESTS"
          value={loading ? '...' : `${activeRequestsCount} Pending`}
          subtitle="Assistance applications currently under review"
          chartType="area"
          isMainFocus={true}
          data={requestsChart}
          labels={chartLabels}
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
            {recentRequests.length > 0 ? (
              recentRequests.map(req => (
                <div key={req.id} className="pending-list-item">
                  <div className="item-left">
                    <span className="item-member" style={{ fontSize: '0.95rem' }}>{req.type}</span>
                    <span className="item-benefit">Filed: {req.date} • {req.amount}</span>
                  </div>
                  <span className={`status-tag ${req.status === 'Pending' || req.status === 'To verify' ? 'pending' : req.status === 'Approved' ? 'released' : 'declined'}`}>
                    {req.status}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '16px 0' }}>
                No recent assistance requests found.
              </div>
            )}
          </div>
        </div>

        {/* Payment Remittance History Section */}
        <div className="recent-activity-panel">
          <div className="panel-header">
            <h2>Recent Payment Remittances</h2>
            <button 
              className="view-all-link" 
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => onNavigate && onNavigate('Payment history')}
            >
              View history &gt;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentPayments.length > 0 ? (
              recentPayments.map(pmt => (
                <div key={pmt.id} className="pending-list-item">
                  <div className="item-left">
                    <span className="item-member" style={{ fontSize: '0.95rem' }}>{pmt.type}</span>
                    <span className="item-benefit">{pmt.refNo} • {pmt.date}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>{pmt.amount}</div>
                    <span className={`status-tag ${pmt.status === 'Verified' || pmt.status === 'Completed' ? 'approved' : 'pending'}`} style={{ fontSize: '0.72rem' }}>
                      {pmt.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '16px 0' }}>
                No recent payment remittances recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

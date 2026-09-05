import React, { useEffect, useRef, useState } from 'react';
import StatCard from './StatCard';
import { animatePageEntrance, animateStatCards } from '../utils/animations';
import { fetchFacultyDashboard } from '../api';

export default function FacultyHome({ currentUser, onNavigate }) {
  const user = currentUser || { name: 'Faculty Member', email: 'faculty@ucare.local' };
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

  // Provide fallbacks while loading
  const totalContributions = dashboardData?.total_contributions || 0;
  const activeRequestsCount = dashboardData?.active_requests || 0;
  const recentRequests = dashboardData?.recent_requests || [];
  const recentPayments = dashboardData?.recent_payments || [];
  
  const chartLabels = dashboardData?.chart_labels || ['—', '—', '—', '—', '—', '—'];
  const contributionsChart = dashboardData?.contributions_chart || [0, 0, 0, 0, 0, 0];
  const requestsChart = dashboardData?.requests_chart || [0, 0, 0, 0, 0, 0];

  const formatCurrency = (val) => '₱ ' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 });

  const resolvePhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
    return `/storage/${photo.replace(/^\/+/, '')}`;
  };

  const photoUrl = resolvePhotoUrl(user.profile_photo_url || user.profile_photo);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    setPhotoError(false);
  }, [user.profile_photo_url, user.profile_photo]);

  return (
    <main className="main-content" ref={containerRef}>
      {/* Page Header / Profile Summary Row */}
      <div className="faculty-profile-header-card">
        <div 
          className="faculty-avatar-large"
          style={{
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: onNavigate ? 'pointer' : 'default',
            border: '2px solid #F4B942',
            boxShadow: '0 4px 14px rgba(139, 30, 63, 0.3)'
          }}
          onClick={() => onNavigate && onNavigate('Profile')}
          title="Click to view and edit profile"
        >
          {photoUrl && !photoError ? (
            <img 
              src={photoUrl} 
              alt={user.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={() => setPhotoError(true)}
            />
          ) : (
            user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'FM'
          )}
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
      <div className="top-panels-grid top-panels-grid--two-col" ref={panelsRef}>
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
      <div className="faculty-home-split-grid">
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentPayments.length > 0 ? (
              recentPayments.map(p => (
                <div key={p.id} className="pending-list-item">
                  <div className="item-left">
                    <span className="item-member" style={{ fontSize: '0.95rem' }}>{p.type}</span>
                    <span className="item-benefit">Paid: {p.date} • <strong style={{ color: 'var(--primary-maroon)' }}>{p.amount}</strong></span>
                  </div>
                  <span className={`status-tag ${p.status === 'Verified' || p.status === 'Completed' ? 'verified' : p.status === 'Pending' || p.status === 'To verify' ? 'to-verify' : 'declined'}`} style={{ padding: '4px 12px', fontSize: '0.72rem' }}>
                    {p.status}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '16px 0' }}>
                No recent payments found.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

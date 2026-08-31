import React, { useState, useEffect, useRef } from 'react';
import { fetchDashboard } from './api';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import PendingBenefitsCard from './components/PendingBenefitsCard';
import RecentPaymentsTable from './components/RecentPaymentsTable';
import ManageMembersPage from './components/ManageMembersPage';
import ManagePaymentsPage from './components/ManagePaymentsPage';
import ManageBenefitTypesPage from './components/ManageBenefitTypesPage';
import ApproveBenefitRequestsPage from './components/ApproveBenefitRequestsPage';
import GenerateReportsPage from './components/GenerateReportsPage';
import AnnouncementsPage from './components/AnnouncementsPage';
import FacultyPanel from './components/FacultyPanel';
import LoginPage from './components/LoginPage';
import { animatePageEntrance, animateStatCards } from './utils/animations';
import './App.css';

function AdminHomeContent({ onNavigate }) {
  const containerRef = useRef(null);
  const panelsRef    = useRef(null);

  const [dash,    setDash]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetchDashboard()
      .then(data => setDash(data))
      .catch(() => setError('Could not load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) animatePageEntrance(containerRef.current);
    if (!loading && panelsRef.current)    animateStatCards(panelsRef.current);
  }, [loading]);

  // ── Derive chart/stat values from API response ──────────────
  const totalContributions     = dash?.total_contributions      ?? 0;
  const thisMonthContributions = dash?.this_month_contributions ?? 0;
  const currentMonthLabel      = dash?.current_month_label      ?? '';
  const cumulativeData         = dash?.cumulative_chart?.data   ?? [0, 0, 0, 0, 0, 0];
  const cumulativeLabels       = dash?.cumulative_chart?.labels ?? ['','','','','',''];
  const monthlyData            = dash?.monthly_chart?.data      ?? [0, 0, 0, 0, 0, 0];
  const monthlyLabels          = dash?.monthly_chart?.labels    ?? ['','','','','',''];

  const formatPHP = (val) =>
    '₱ ' + Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2 });

  if (loading) {
    return (
      <main className="main-content">
        <div className="dashboard-header">
          <div className="dashboard-header-text">
            <h1>Secretary-Admin Dashboard</h1>
            <p>Loading data…</p>
          </div>
        </div>
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          ⏳ Fetching live data from the database…
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-content">
        <div className="dashboard-header">
          <div className="dashboard-header-text">
            <h1>Secretary-Admin Dashboard</h1>
            <p style={{ color: '#DC2626' }}>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content" ref={containerRef}>
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Secretary-Admin Dashboard</h1>
          <p>Overview of ISPSC Tagudin Federated Faculty Union contributions and benefit requests</p>
        </div>
      </div>

      <div className="top-panels-grid" ref={panelsRef}>
        <StatCard
          headerTitle="TOTAL CONTRIBUTIONS"
          value={formatPHP(totalContributions)}
          subtitle="All-time overall collected funds"
          chartType="bar"
          data={cumulativeData}
          labels={cumulativeLabels}
        />
        <StatCard
          headerTitle="CONTRIBUTION THIS MONTH"
          value={formatPHP(thisMonthContributions)}
          subtitle={`${currentMonthLabel} faculty union contribution activity`}
          chartType="area"
          isMainFocus={true}
          data={monthlyData}
          labels={monthlyLabels}
        />
        <PendingBenefitsCard
          mostRecent={dash?.most_recent_request ?? null}
          recentList={dash?.recent_requests ?? []}
          onNavigate={onNavigate}
        />
      </div>

      <RecentPaymentsTable
        payments={dash?.recent_payments ?? []}
        onNavigate={onNavigate}
      />
    </main>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [pendingCount, setPendingCount] = useState(() => {
    const saved = localStorage.getItem('ucare_benefit_requests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter(r => r.status === 'Pending').length;
      } catch (e) {
        return 3;
      }
    }
    return 3;
  });

  useEffect(() => {
    const syncPendingCount = () => {
      const saved = localStorage.getItem('ucare_benefit_requests');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPendingCount(parsed.filter(r => r.status === 'Pending').length);
        } catch (e) {}
      }
    };

    window.addEventListener('ucare_requests_updated', syncPendingCount);
    return () => window.removeEventListener('ucare_requests_updated', syncPendingCount);
  }, []);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setActiveTab('Home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // 1) Unauthenticated -> Show Login Page
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} onLoginSuccess={handleLogin} />;
  }

  // 2) Faculty user -> Render Adaptive Faculty Panel
  if (currentUser.role === 'faculty') {
    return <FacultyPanel currentUser={currentUser} onLogout={handleLogout} />;
  }

  // 3) Admin user -> Render Secretary-Admin Dashboard
  const navbarConfig = {
    systemTitle: 'ISPSC Tagudin Federated Faculty Union',
    systemSubtitle: 'Compensation & Assistance Records Engine',
    userName: currentUser?.name ?? 'Sec. Administrator',
    userRole: 'Faculty Union Admin',
    roleBadge: 'SYSTEM ADMIN',
    onLogout: handleLogout,
    onMenuToggle: () => setSidebarOpen(v => !v),
    onNavigate: setActiveTab
  };

  const renderAdminContent = () => {
    switch (activeTab) {
      case 'Announcements':
        return <AnnouncementsPage />;
      case 'Manage Members':
        return <ManageMembersPage />;
      case 'Manage Payments':
        return <ManagePaymentsPage />;
      case 'Manage Benefit Types':
        return <ManageBenefitTypesPage />;
      case 'Approve Benefit Requests':
        return <ApproveBenefitRequestsPage />;
      case 'Generate Reports':
        return <GenerateReportsPage />;
      case 'Home':
      default:
        return <AdminHomeContent onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      <Navbar {...navbarConfig} />

      <div className="app-body">
        <Sidebar
          activeItem={activeTab}
          onSelectTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          pendingCount={pendingCount}
        />
        {renderAdminContent()}
      </div>
    </div>
  );
}

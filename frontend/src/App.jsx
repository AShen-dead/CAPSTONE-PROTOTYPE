import React, { useState } from 'react';
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
import LoginPage from './components/LoginPage';
import { getToken, getUser, clearAuth, logout } from './api';
import './App.css';

function App() {
  // ── ALL hooks must be at the top — no hooks after conditional returns ──
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken());
  const [currentUser, setCurrentUser]         = useState(() => getUser());
  const [activeTab, setActiveTab]             = useState('Home');

  // ── Auth handlers ──────────────────────────────────────────────────────
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveTab('Home'); // Always land on the dashboard after login
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (_) {
      // If server is unreachable, still clear local auth
    } finally {
      clearAuth();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setActiveTab('Home');
    }
  };

  // ── Show Login page when not authenticated ─────────────────────────────
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // ── Dashboard (admin and faculty) ──────────────────────────────────────

  const navbarConfig = {
    logoUrl:       null,
    systemTitle:   'ISPSC Tagudin Federated Faculty Union',
    systemSubtitle:'Compensation & Assistance Records Engine',
    userName:      currentUser?.name   ?? 'User',
    userRole:      currentUser?.role === 'admin' ? 'Faculty Union Admin' : 'Faculty Member',
    roleBadge:     currentUser?.role === 'admin' ? 'SYSTEM ADMIN'        : 'FACULTY',
    onLogout:      handleLogout,
  };

  const totalContributionsData  = [1100000, 1220000, 1290000, 1380000, 1420000, 1482500];
  const monthlyContributionsData = [115000, 132000, 120000, 150000, 135000, 145800];
  const chartLabels = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  const renderMainContent = () => {
    switch (activeTab) {
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
        return (
          <main className="main-content">
            <div className="dashboard-header">
              <div className="dashboard-header-text">
                <h1>Secretary-Admin Dashboard</h1>
                <p>Overview of ISPSC Tagudin Federated Faculty Union contributions and benefit requests</p>
              </div>
            </div>

            <div className="top-panels-grid">
              <StatCard
                headerTitle="TOTAL CONTRIBUTIONS"
                value="₱ 1,482,500.00"
                subtitle="All-time overall collected funds"
                trendText="12.4% vs last year"
                trendPositive={true}
                chartType="bar"
                data={totalContributionsData}
                labels={chartLabels}
              />
              <StatCard
                headerTitle="CONTRIBUTION THIS MONTH"
                value="₱ 145,800.00"
                subtitle="July 2026 faculty union contribution activity"
                trendText="8.2% vs June"
                trendPositive={true}
                chartType="area"
                isMainFocus={true}
                data={monthlyContributionsData}
                labels={chartLabels}
              />
              <PendingBenefitsCard />
            </div>

            <RecentPaymentsTable />
          </main>
        );
    }
  };

  return (
    <div className="app-container">
      <Navbar {...navbarConfig} />
      <div className="app-body">
        <Sidebar activeItem={activeTab} onSelectTab={setActiveTab} />
        {renderMainContent()}
      </div>
    </div>
  );
}

export default App;

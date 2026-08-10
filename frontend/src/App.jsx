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
  // ── Auth state (persisted in localStorage) ─────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken());
  const [currentUser, setCurrentUser] = useState(() => getUser());

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
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

  // ── Show Login if not authenticated ────────────────────────
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // ── Dashboard ───────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('Home');

  // Dynamic Navbar Configuration (driven by logged-in user)
  const navbarConfig = {
    logoUrl: null,
    systemTitle: "ISPSC Tagudin Federated Faculty Union",
    systemSubtitle: "Compensation & Assistance Records Engine",
    userName: currentUser?.name ?? "User",
    userRole: currentUser?.role === 'admin' ? 'Faculty Union Admin' : 'Faculty Member',
    roleBadge: currentUser?.role === 'admin' ? 'SYSTEM ADMIN' : 'FACULTY',
    onLogout: handleLogout,
  };

  // Dynamic Home Page Charts Data Arrays (Ready for future backend API payload)
  const totalContributionsData = [1100000, 1220000, 1290000, 1380000, 1420000, 1482500];
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

            {/* Top Panels Row (Left to Right) */}
            <div className="top-panels-grid">
              {/* Panel 1: Total Contributions */}
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

              {/* Panel 2: Contribution This Month (Main Focus Panel) */}
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

              {/* Panel 3: Pending Benefit */}
              <PendingBenefitsCard />
            </div>

            {/* Bottom Panel: Recent Payment Activity */}
            <RecentPaymentsTable />
          </main>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Dynamic Top Bar Navbar */}
      <Navbar {...navbarConfig} />

      <div className="app-body">
        {/* Left Sidebar Navigation */}
        <Sidebar activeItem={activeTab} onSelectTab={setActiveTab} />

        {/* Main Content Area */}
        {renderMainContent()}
      </div>
    </div>
  );
}

export default App;

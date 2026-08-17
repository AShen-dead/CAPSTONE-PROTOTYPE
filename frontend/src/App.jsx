import React, { useState, useEffect, useRef } from 'react';
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
import FacultyPanel from './components/FacultyPanel';
import LoginPage from './components/LoginPage';
import { animatePageEntrance, animateStatCards } from './utils/animations';
import './App.css';

function AdminHomeContent({ onNavigate }) {
  const containerRef = useRef(null);
  const panelsRef = useRef(null);

  // Dynamic charts data
  const totalContributionsData = [120000, 135000, 140000, 142000, 148000, 155000];
  const monthlyContributionsData = [18000, 22000, 21000, 25000, 27000, 32000];
  const chartLabels = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  useEffect(() => {
    if (containerRef.current) {
      animatePageEntrance(containerRef.current);
    }
    if (panelsRef.current) {
      animateStatCards(panelsRef.current);
    }
  }, []);

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
          value="₱ 1,482,500.00"
          subtitle="All-time overall collected funds"
          chartType="bar"
          data={totalContributionsData}
          labels={chartLabels}
        />
        <StatCard
          headerTitle="CONTRIBUTION THIS MONTH"
          value="₱ 145,800.00"
          subtitle="July 2026 faculty union contribution activity"
          chartType="area"
          isMainFocus={true}
          data={monthlyContributionsData}
          labels={chartLabels}
        />
        <PendingBenefitsCard onNavigate={onNavigate} />
      </div>

      <RecentPaymentsTable onNavigate={onNavigate} />
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

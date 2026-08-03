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
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('Home');

  // Dynamic Navbar Configuration State (Ready for future Laravel backend auth & settings API)
  const [navbarConfig, setNavbarConfig] = useState({
    logoUrl: null, // Set image URL when dynamic logo picture is uploaded
    systemTitle: "ISPSC Tagudin Federated Faculty Union",
    systemSubtitle: "Compensation & Assistance Records Engine",
    userName: "Sec. Administrator",
    userRole: "Faculty Union Admin",
    roleBadge: "SYSTEM ADMIN"
  });

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

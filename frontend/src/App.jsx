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
      {/* Top Bar */}
      <Navbar />

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

import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import FacultyHome from './FacultyHome';
import FacultyRequests from './FacultyRequests';
import FacultySubmit from './FacultySubmit';
import FacultyPaymentHistory from './FacultyPaymentHistory';
import FacultyProfile from './FacultyProfile';
import { animateButtonPress } from '../utils/animations';

export default function FacultyPanel({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('Home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 5 Destinations for Faculty Navigation
  const facultyNavItems = [
    {
      id: 'Home',
      label: 'Home',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    {
      id: 'My assistance requests',
      label: 'Requests',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )
    },
    {
      id: 'Submit',
      label: 'Submit',
      isPlus: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )
    },
    {
      id: 'Payment history',
      label: 'History',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      )
    },
    {
      id: 'Profile',
      label: 'Profile',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    }
  ];

  const renderFacultyContent = () => {
    switch (activeTab) {
      case 'My assistance requests':
        return <FacultyRequests />;
      case 'Submit':
        return <FacultySubmit currentUser={currentUser} onSubmitSuccess={() => setActiveTab('My assistance requests')} />;
      case 'Payment history':
        return <FacultyPaymentHistory />;
      case 'Profile':
        return <FacultyProfile currentUser={currentUser} onLogout={onLogout} />;
      case 'Home':
      default:
        return <FacultyHome currentUser={currentUser} onNavigate={setActiveTab} />;
    }
  };

  const navbarConfig = {
    systemTitle: 'ISPSC Tagudin Faculty Union',
    systemSubtitle: 'Faculty Member Portal',
    userName: currentUser?.name ?? 'Prof. Maria Santos',
    userRole: 'Faculty Member',
    roleBadge: 'FACULTY',
    onLogout: onLogout,
    onMenuToggle: () => setSidebarOpen(v => !v),
    onNavigate: (tab) => {
      if (tab === 'Submit Application / Receipt') setActiveTab('Submit');
      else if (tab === 'Payment History') setActiveTab('Payment history');
      else setActiveTab(tab);
    }
  };

  return (
    <div className="app-container faculty-panel-active">
      {/* Top Navbar */}
      <Navbar {...navbarConfig} />

      <div className="app-body">
        {/* Persistent Left Sidebar on Laptop */}
        <Sidebar
          activeItem={activeTab}
          onSelectTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          customItems={facultyNavItems.map(item => ({
            id: item.id,
            label: item.id === 'My assistance requests' ? 'My Assistance Requests' : item.id === 'Payment history' ? 'Payment History' : item.id,
            icon: item.icon
          }))}
        />

        {/* Main Content Screen */}
        {renderFacultyContent()}
      </div>

      {/* Fixed Bottom Navigation Bar on Phone (< 768px) */}
      <nav className="mobile-bottom-nav">
        {facultyNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`bottom-nav-item ${isActive ? 'active' : ''} ${item.isPlus ? 'bottom-nav-item--plus' : ''}`}
              onClick={(e) => {
                animateButtonPress(e.currentTarget);
                setActiveTab(item.id);
              }}
            >
              <div className={item.isPlus ? 'bottom-nav-icon-circle' : 'bottom-nav-icon'}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

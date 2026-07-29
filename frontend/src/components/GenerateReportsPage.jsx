import React, { useState } from 'react';

export default function GenerateReportsPage() {
  const [reportType, setReportType] = useState('Summary of financial contributions');
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState('2026-07-28');
  const [isExporting, setIsExporting] = useState(false);

  // Sample data maps for different report types
  const reportData = {
    'Summary of financial contributions': [
      { col1: 'Prof. Antonio Mendoza', col2: 'Monthly Dues + Mutual Aid', col3: '14 Transactions', col4: '₱ 42,000.00' },
      { col1: 'Dr. Fernando Lopez', col2: 'Monthly Dues + Mutual Aid', col3: '15 Transactions', col4: '₱ 45,100.00' },
      { col1: 'Dr. Juan Dela Cruz', col2: 'Monthly Dues', col3: '11 Transactions', col4: '₱ 34,200.00' },
      { col1: 'Dr. Clarissa Reyes', col2: 'Monthly Dues + Special', col3: '10 Transactions', col4: '₱ 31,500.00' },
      { col1: 'Prof. Maria Santos', col2: 'Monthly Dues', col3: '9 Transactions', col4: '₱ 28,500.00' }
    ],
    'Assistance disbursement report': [
      { col1: 'Prof. Maria Santos', col2: 'Medical Assistance', col3: 'Approved (Jul 26)', col4: '₱ 15,000.00' },
      { col1: 'Engr. Roberto Garcia', col2: 'Calamity Relief', col3: 'Disbursed (Jul 15)', col4: '₱ 10,000.00' },
      { col1: 'Prof. Elena Ramos', col2: 'Educational Aid', col3: 'Approved (Jul 20)', col4: '₱ 8,500.00' },
      { col1: 'Dr. Juan Dela Cruz', col2: 'Bereavement Assistance', col3: 'Disbursed (Jun 12)', col4: '₱ 12,000.00' }
    ],
    'Audit-ready transaction report': [
      { col1: 'REF-2026-0891', col2: 'Prof. Antonio Mendoza', col3: 'Jul 28, 2026', col4: '₱ 500.00' },
      { col1: 'REF-2026-0890', col2: 'Dr. Clarissa Reyes', col3: 'Jul 27, 2026', col4: '₱ 1,200.00' },
      { col1: 'REF-2026-0889', col2: 'Engr. Michael Tan', col3: 'Jul 27, 2026', col4: '₱ 500.00' },
      { col1: 'REF-2026-0888', col2: 'Prof. Beatriz Laurel', col3: 'Jul 25, 2026', col4: '₱ 1,000.00' }
    ],
    'Member contribution report': [
      { col1: 'Prof. Maria Santos', col2: 'College of Teacher Education', col3: 'Active Member', col4: '₱ 28,500.00' },
      { col1: 'Dr. Juan Dela Cruz', col2: 'College of Computing & IT', col3: 'Active Member', col4: '₱ 34,200.00' },
      { col1: 'Engr. Roberto Garcia', col2: 'College of Engineering', col3: 'On leave', col4: '₱ 19,800.00' },
      { col1: 'Prof. Beatriz Laurel', col2: 'College of Teacher Education', col3: 'Retired', col4: '₱ 52,800.00' }
    ]
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`Report "${reportType}" successfully generated and ready for download!`);
    }, 800);
  };

  const currentRows = reportData[reportType] || reportData['Summary of financial contributions'];

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Generate reports</h1>
          <p>Export financial summaries, assistance disbursements, and audit logs</p>
        </div>
      </div>

      {/* Report Controls Card */}
      <div className="report-controls-card">
        <div className="report-controls-grid">
          {/* Report Type Selector */}
          <div className="form-group">
            <label>Report Category Type</label>
            <select 
              className="form-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="Summary of financial contributions">Summary of financial contributions</option>
              <option value="Assistance disbursement report">Assistance disbursement report</option>
              <option value="Audit-ready transaction report">Audit-ready transaction report</option>
              <option value="Member contribution report">Member contribution report</option>
            </select>
          </div>

          {/* Date From */}
          <div className="form-group">
            <label>From Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="form-group">
            <label>To Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* Export Button */}
          <button 
            className="btn-primary" 
            onClick={handleExport}
            disabled={isExporting}
            style={{ height: '42px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {isExporting ? 'Generating...' : 'Export Report'}
          </button>
        </div>
      </div>

      {/* Report Preview Card */}
      <div className="recent-activity-panel">
        <div className="panel-header">
          <div>
            <h2>Report Output Preview</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing sample data for <strong>"{reportType}"</strong> ({fromDate} to {toDate})
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                {reportType === 'Audit-ready transaction report' ? (
                  <>
                    <th>Reference #</th>
                    <th>Member</th>
                    <th>Date Logged</th>
                    <th>Amount</th>
                  </>
                ) : reportType === 'Assistance disbursement report' ? (
                  <>
                    <th>Member</th>
                    <th>Assistance Category</th>
                    <th>Disbursement Status</th>
                    <th>Total Amount</th>
                  </>
                ) : (
                  <>
                    <th>Faculty Member</th>
                    <th>Category / Dept</th>
                    <th>Record Count / Status</th>
                    <th>Running Total</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, idx) => (
                <tr key={idx}>
                  <td><strong style={{ color: 'var(--text-main)' }}>{row.col1}</strong></td>
                  <td>{row.col2}</td>
                  <td>{row.col3}</td>
                  <td><span className="amount-text">{row.col4}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

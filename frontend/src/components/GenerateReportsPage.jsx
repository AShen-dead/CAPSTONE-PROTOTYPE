import React, { useState } from 'react';

export default function GenerateReportsPage() {
  const [reportType, setReportType] = useState('Paid & Remitted Member Contributions');
  const [exportFormat, setExportFormat] = useState('CSV'); // CSV, Excel, PDF
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState('2026-07-28');
  const [isExporting, setIsExporting] = useState(false);

  // Sample data maps for report categories
  const reportData = {
    'Paid & Remitted Member Contributions': [
      { col1: 'Prof. Antonio Mendoza', col2: 'College of Arts & Sciences', col3: 'Remitted (Jul 28, 2026)', col4: '₱ 42,000.00' },
      { col1: 'Dr. Fernando Lopez', col2: 'College of Agriculture', col3: 'Remitted (Jul 24, 2026)', col4: '₱ 45,100.00' },
      { col1: 'Dr. Juan Dela Cruz', col2: 'College of Computing & IT', col3: 'Remitted (Jul 27, 2026)', col4: '₱ 34,200.00' },
      { col1: 'Dr. Clarissa Reyes', col2: 'College of Business Admin', col3: 'Remitted (Jul 27, 2026)', col4: '₱ 31,500.00' },
      { col1: 'Prof. Maria Santos', col2: 'College of Teacher Education', col3: 'Remitted (Jul 28, 2026)', col4: '₱ 28,500.00' }
    ],
    'Outstanding / Unremitted Dues Summary': [
      { col1: 'Engr. Roberto Garcia', col2: 'College of Engineering', col3: 'Unremitted (On leave)', col4: '₱ 2,500.00' },
      { col1: 'Prof. Elena Ramos', col2: 'College of Nursing', col3: 'Pending Remittance', col4: '₱ 1,500.00' },
      { col1: 'Prof. Beatriz Laurel', col2: 'College of Teacher Education', col3: 'Retired - Final Audit', col4: '₱ 500.00' }
    ],
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

  const currentRows = reportData[reportType] || reportData['Paid & Remitted Member Contributions'];

  // Table Headers helper based on selected report category
  const getTableHeaders = () => {
    if (reportType === 'Audit-ready transaction report') {
      return ['Reference #', 'Member', 'Date Logged', 'Amount'];
    }
    if (reportType === 'Assistance disbursement report') {
      return ['Member', 'Assistance Category', 'Disbursement Status', 'Total Amount'];
    }
    if (reportType === 'Paid & Remitted Member Contributions') {
      return ['Faculty Member', 'College / Dept', 'Remittance Status', 'Total Remitted'];
    }
    if (reportType === 'Outstanding / Unremitted Dues Summary') {
      return ['Faculty Member', 'College / Dept', 'Outstanding Status', 'Unremitted Balance'];
    }
    return ['Faculty Member', 'Category / Dept', 'Record Count / Status', 'Running Total'];
  };

  // File Export Handler
  const handleExport = () => {
    setIsExporting(true);

    setTimeout(() => {
      const headers = getTableHeaders();
      const sanitizeName = reportType.toLowerCase().replace(/[^a-z0-9]/g, '_');

      // PDF Export
      if (exportFormat === 'PDF') {
        const printWin = window.open('', '_blank', 'width=900,height=700');
        if (printWin) {
          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>U.C.A.R.E. Report - ${reportType}</title>
              <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1e293b; }
                .header { border-bottom: 2px solid #8b1e3f; padding-bottom: 12px; margin-bottom: 20px; }
                .title { font-size: 20px; font-weight: bold; color: #8b1e3f; }
                .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
                .meta { font-size: 12px; margin-bottom: 20px; color: #475569; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th { background-color: #8b1e3f; color: white; padding: 10px; text-align: left; font-size: 12px; }
                td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
                tr:nth-child(even) { background-color: #f8fafc; }
                .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="title">U.C.A.R.E. Official Union Report</div>
                <div class="subtitle">ISPSC Tagudin Federated Faculty Union • ${reportType}</div>
              </div>
              <div class="meta">
                <strong>Date Range:</strong> ${fromDate} to ${toDate} &nbsp;|&nbsp;
                <strong>Generated On:</strong> ${new Date().toLocaleString()}
              </div>
              <table>
                <thead>
                  <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                  ${currentRows.map(r => `
                    <tr>
                      <td><strong>${r.col1}</strong></td>
                      <td>${r.col2}</td>
                      <td>${r.col3}</td>
                      <td><strong>${r.col4}</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <div class="footer">Confidential System Document • ISPSC Tagudin Faculty Union Admin Panel</div>
              <script>window.onload = function() { window.print(); };</script>
            </body>
            </html>
          `;
          printWin.document.write(htmlContent);
          printWin.document.close();
        }
        setIsExporting(false);
        return;
      }

      // CSV & Excel Export
      const fileHeader = headers.map(h => `"${h}"`);
      const fileRows = currentRows.map(r => [
        `"${r.col1.replace(/"/g, '""')}"`,
        `"${r.col2.replace(/"/g, '""')}"`,
        `"${r.col3.replace(/"/g, '""')}"`,
        `"${r.col4.replace(/"/g, '""')}"`
      ]);

      const csvText = [
        `"U.C.A.R.E. REPORT: ${reportType.toUpperCase()}"`,
        `"Date Range: ${fromDate} to ${toDate}"`,
        `"Generated On: ${new Date().toLocaleString()}"`,
        '',
        fileHeader.join(','),
        ...fileRows.map(row => row.join(','))
      ].join('\r\n');

      const bomCsvContent = '\uFEFF' + csvText;
      const fileExt = 'csv';
      const blob = new Blob([bomCsvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ucare_${sanitizeName}_${fromDate}_to_${toDate}.${fileExt}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExporting(false);
    }, 400);
  };

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Generate reports</h1>
          <p>Export financial summaries, paid & remitted contributions, assistance disbursements, and audit logs</p>
        </div>
      </div>

      {/* Report Controls Card */}
      <div className="report-controls-card">
        <div style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-maroon)', marginBottom: '16px' }}>
          Report Filter Parameters & Export Format
        </div>

        <div className="report-controls-grid">
          {/* Report Category Type Selector */}
          <div className="form-group">
            <label>Report Category Type</label>
            <select 
              className="form-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="Paid & Remitted Member Contributions">Paid & Remitted Member Contributions</option>
              <option value="Outstanding / Unremitted Dues Summary">Outstanding / Unremitted Dues Summary</option>
              <option value="Summary of financial contributions">Summary of financial contributions</option>
              <option value="Assistance disbursement report">Assistance disbursement report</option>
              <option value="Audit-ready transaction report">Audit-ready transaction report</option>
              <option value="Member contribution report">Member contribution report</option>
            </select>
          </div>

          {/* Export File Format Selector */}
          <div className="form-group">
            <label>Export File Format</label>
            <select 
              className="form-select"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <option value="CSV">CSV (.csv)</option>
              <option value="Excel">Excel Spreadsheet (.xlsx)</option>
              <option value="PDF">PDF Document (.pdf)</option>
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
        </div>

        {/* Export Button Row */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn-primary" 
            onClick={handleExport}
            disabled={isExporting}
            style={{ height: '44px', padding: '0 28px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {isExporting ? 'Generating Report...' : `Export report ${exportFormat}`}
          </button>
        </div>
      </div>

      {/* Report Output Preview Card */}
      <div className="recent-activity-panel">
        <div className="panel-header">
          <div>
            <h2>Report Output Preview</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing records for <strong>"{reportType}"</strong> ({fromDate} to {toDate})
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                {getTableHeaders().map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, idx) => (
                <tr key={idx}>
                  <td><strong style={{ color: 'var(--text-main)' }}>{row.col1}</strong></td>
                  <td>{row.col2}</td>
                  <td>
                    {row.col3.includes('Remitted') ? (
                      <span className="status-tag approved">{row.col3}</span>
                    ) : row.col3.includes('Unremitted') ? (
                      <span className="status-tag pending">{row.col3}</span>
                    ) : (
                      row.col3
                    )}
                  </td>
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

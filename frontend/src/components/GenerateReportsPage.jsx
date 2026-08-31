import React, { useState, useEffect, useRef } from 'react';
import { animatePageEntrance, animateTableRows, animateButtonPress } from '../utils/animations';
import { fetchReports } from '../api';

export default function GenerateReportsPage() {
  const [reportType, setReportType] = useState('Verified Payments Log');
  const [exportFormat, setExportFormat] = useState('CSV'); // CSV, Excel, PDF
  
  // Set default dates (e.g. current month)
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [fromDate, setFromDate] = useState(firstDay.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(today.toISOString().split('T')[0]);
  const [isAllTime, setIsAllTime] = useState(false);
  
  const [isExporting, setIsExporting] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);
  const tableRef = useRef(null);

  // Load data when dates change
  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const actualFrom = isAllTime ? '' : fromDate;
        const actualTo = isAllTime ? '' : toDate;
        const res = await fetchReports(actualFrom, actualTo);
        setLogs(res?.data || []);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, [fromDate, toDate, isAllTime]);

  useEffect(() => {
    if (containerRef.current) {
      animatePageEntrance(containerRef.current);
    }
  }, []);

  useEffect(() => {
    if (tableRef.current && !loading) {
      animateTableRows(tableRef.current);
    }
  }, [logs, loading]);

  const headers = ['Reference #', 'Faculty Member', 'Payment Type', 'Verified Timestamp', 'Amount'];

  // File Export Handler
  const handleExport = (e) => {
    animateButtonPress(e.currentTarget);
    setIsExporting(true);

    setTimeout(() => {
      const sanitizeName = reportType.toLowerCase().replace(/[^a-z0-9]/g, '_');

      const dateRangeText = isAllTime ? 'All Time' : `${fromDate} to ${toDate}`;

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
                <strong>Date Range:</strong> ${dateRangeText} &nbsp;|&nbsp;
                <strong>Generated On:</strong> ${new Date().toLocaleString()}
              </div>
              <table>
                <thead>
                  <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                  ${logs.map(r => `
                    <tr>
                      <td><strong>${r.reference_no}</strong></td>
                      <td>${r.faculty_name}<br/><small>${r.department}</small></td>
                      <td>${r.type}</td>
                      <td>${r.timestamp}</td>
                      <td><strong>${r.amount}</strong></td>
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

      // CSV Export (also used for Excel)
      const fileHeader = headers.map(h => `"${h}"`);
      const fileRows = logs.map(r => [
        `"${r.reference_no}"`,
        `"${r.faculty_name}"`,
        `"${r.type}"`,
        `"${r.timestamp}"`,
        `"${r.amount}"`
      ]);

      const csvText = [
        `"U.C.A.R.E. REPORT: ${reportType.toUpperCase()}"`,
        `"Date Range: ${dateRangeText}"`,
        `"Generated On: ${new Date().toLocaleString()}"`,
        '',
        fileHeader.join(','),
        ...fileRows.map(row => row.join(','))
      ].join('\r\n');

      const bomCsvContent = '\uFEFF' + csvText;
      const fileExt = exportFormat === 'Excel' ? 'csv' : 'csv'; // Using CSV format for Excel
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
    <div className="main-content" ref={containerRef}>
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Generate reports / Logs</h1>
          <p>View and export timestamped logs of all verified payment transactions</p>
        </div>
      </div>

      {/* Report Controls Card */}
      <div className="report-controls-card">
        <div style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-maroon)', marginBottom: '16px' }}>
          Report Filter Parameters &amp; Export Format
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
              <option value="Verified Payments Log">Verified Payments Log</option>
              {/* Additional reports (like Excel integration) can be added here later */}
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
              <option value="Excel">Excel Spreadsheet (.csv)</option>
              <option value="PDF">PDF Document (.pdf)</option>
            </select>
          </div>

          {/* All Time Checkbox */}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: '1 / -1', paddingBottom: '8px' }}>
            <input 
              type="checkbox" 
              id="allTime" 
              checked={isAllTime}
              onChange={(e) => setIsAllTime(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="allTime" style={{ margin: 0, cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-main)' }}>
              Show All Time (Ignore Date Range)
            </label>
          </div>

          {/* Date From */}
          <div className="form-group" style={{ opacity: isAllTime ? 0.5 : 1 }}>
            <label>From Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              disabled={isAllTime}
            />
          </div>

          {/* Date To */}
          <div className="form-group" style={{ opacity: isAllTime ? 0.5 : 1 }}>
            <label>To Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              disabled={isAllTime}
            />
          </div>
        </div>

        {/* Export Button Row */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn-primary" 
            onClick={handleExport}
            disabled={isExporting || loading}
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
              Showing records for <strong>"{reportType}"</strong> ({isAllTime ? 'All Time' : `${fromDate} to ${toDate}`})
            </div>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
             <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
               ⏳ Fetching logs from database...
             </div>
          ) : (
            <table className="data-table" ref={tableRef}>
              <thead>
                <tr>
                  {headers.map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? logs.map((row, idx) => (
                  <tr key={idx}>
                    <td><span className="ref-code">{row.reference_no}</span></td>
                    <td>
                      <strong style={{ color: 'var(--text-main)' }}>{row.faculty_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.department}</div>
                    </td>
                    <td>{row.type}</td>
                    <td><span style={{ fontSize: '0.85rem' }}>{row.timestamp}</span></td>
                    <td><span className="amount-text">{row.amount}</span></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No verified payments found for this date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

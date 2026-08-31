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
  const [isAllTime, setIsAllTime] = useState(true); // Default to all time
  
  const [isExporting, setIsExporting] = useState(false);
  const [reportData, setReportData] = useState({ mode: 'logs', data: [] });
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);
  const tableRef = useRef(null);

  // Load data when dates or report type change
  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const actualFrom = isAllTime ? '' : fromDate;
        const actualTo = isAllTime ? '' : toDate;
        const res = await fetchReports(actualFrom, actualTo, reportType);
        setReportData(res || { mode: 'logs', data: [] });
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [fromDate, toDate, isAllTime, reportType]);

  useEffect(() => {
    if (containerRef.current) {
      animatePageEntrance(containerRef.current);
    }
  }, []);

  useEffect(() => {
    if (tableRef.current && !loading) {
      animateTableRows(tableRef.current);
    }
  }, [reportData, loading]);

  const isGridMode = reportData.mode === 'grid';

  // File Export Handler
  const handleExport = (e) => {
    animateButtonPress(e.currentTarget);
    setIsExporting(true);

    setTimeout(() => {
      const sanitizeName = reportType.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const dateRangeText = isAllTime ? 'All Time' : `${fromDate} to ${toDate}`;

      // Build Headers and Rows according to active mode
      let exportHeaders = [];
      let exportRows = [];

      if (isGridMode) {
        exportHeaders = (reportData.columns || []).map(c => c.label);
        exportRows = (reportData.rows || []).map(r => 
          (reportData.columns || []).map(c => `"${(r[c.key] ?? '').toString().replace(/"/g, '""')}"`)
        );
        // Append totals row
        if (reportData.column_totals) {
          exportRows.push(
            (reportData.columns || []).map(c => `"${(reportData.column_totals[c.key] ?? '').toString().replace(/"/g, '""')}"`)
          );
        }
      } else {
        exportHeaders = ['Reference #', 'Faculty Member', 'College / Department', 'Payment Type / Purpose', 'Date Logged', 'Amount'];
        exportRows = (reportData.data || []).map(r => [
          `"${r.reference_no}"`,
          `"${r.faculty_name}"`,
          `"${r.department}"`,
          `"${r.type}"`,
          `"${r.timestamp}"`,
          `"${r.amount}"`
        ]);
      }

      // PDF Export
      if (exportFormat === 'PDF') {
        const printWin = window.open('', '_blank', 'width=1000,height=700');
        if (printWin) {
          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>U.C.A.R.E. Report - ${reportType}</title>
              <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #1e293b; }
                .header { border-bottom: 2px solid #8b1e3f; padding-bottom: 12px; margin-bottom: 16px; }
                .title { font-size: 20px; font-weight: bold; color: #8b1e3f; }
                .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
                .meta { font-size: 12px; margin-bottom: 16px; color: #475569; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
                th { background-color: #8b1e3f; color: white; padding: 8px; text-align: left; }
                td { padding: 7px 8px; border-bottom: 1px solid #e2e8f0; }
                tr:nth-child(even) { background-color: #f8fafc; }
                tfoot tr td { font-weight: bold; background-color: #f1f5f9; border-top: 2px solid #cbd5e1; }
                .footer { margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: center; }
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
                  <tr>${exportHeaders.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                  ${isGridMode ? (reportData.rows || []).map(r => `
                    <tr>
                      ${(reportData.columns || []).map(c => `<td>${r[c.key] ?? '—'}</td>`).join('')}
                    </tr>
                  `).join('') : (reportData.data || []).map(r => `
                    <tr>
                      <td><strong>${r.reference_no}</strong></td>
                      <td>${r.faculty_name}</td>
                      <td>${r.department}</td>
                      <td>${r.type}</td>
                      <td>${r.timestamp}</td>
                      <td><strong>${r.amount}</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
                ${isGridMode && reportData.column_totals ? `
                  <tfoot>
                    <tr>
                      ${(reportData.columns || []).map(c => `<td>${reportData.column_totals[c.key] ?? ''}</td>`).join('')}
                    </tr>
                  </tfoot>
                ` : ''}
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
      const csvText = [
        `"U.C.A.R.E. REPORT: ${reportType.toUpperCase()}"`,
        `"Date Range: ${dateRangeText}"`,
        `"Generated On: ${new Date().toLocaleString()}"`,
        '',
        exportHeaders.map(h => `"${h}"`).join(','),
        ...exportRows.map(row => row.join(','))
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
    <div className="main-content" ref={containerRef}>
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Generate reports / Logs</h1>
          <p>Export verified payment logs or dynamic Excel-style cross-tab matrix grids across all beneficiary drives</p>
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
            <label>Report Type / Layout</label>
            <select 
              className="form-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="Verified Payments Log">📋 Verified Payments Log (List View)</option>
              <option value="Contribution Drive Grid (Matrix/Excel-style)">📊 Contribution Drive Grid (Excel-style Matrix)</option>
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
              <option value="Excel">Excel Spreadsheet (.csv / .xlsx)</option>
              <option value="PDF">PDF Document (.pdf)</option>
            </select>
          </div>

          {/* All Time Checkbox */}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: '1 / -1', paddingBottom: '4px' }}>
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

        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          {loading ? (
             <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
               ⏳ Fetching report records from database...
             </div>
          ) : isGridMode ? (
            /* Matrix Grid View */
            <table className="data-table" ref={tableRef} style={{ minWidth: '850px' }}>
              <thead>
                <tr>
                  {(reportData.columns || []).map((col, i) => (
                    <th key={i} style={{ whiteSpace: 'nowrap' }}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(reportData.rows && reportData.rows.length > 0) ? (
                  reportData.rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {(reportData.columns || []).map((col, cIdx) => (
                        <td key={cIdx} style={{ whiteSpace: 'nowrap' }}>
                          {col.key === 'faculty_name' ? (
                            <strong style={{ color: 'var(--text-main)' }}>{row[col.key]}</strong>
                          ) : col.key === 'total_paid' ? (
                            <span className="amount-text" style={{ fontWeight: '700' }}>{row[col.key]}</span>
                          ) : (
                            row[col.key] ?? '—'
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={(reportData.columns || []).length || 4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
              {reportData.column_totals && reportData.rows && reportData.rows.length > 0 && (
                <tfoot>
                  <tr style={{ background: '#F8FAFC', borderTop: '2px solid #E2E8F0', fontWeight: '700' }}>
                    {(reportData.columns || []).map((col, i) => (
                      <td key={i} style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                        {col.key === 'no' ? 'TOTAL' : reportData.column_totals[col.key] || ''}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          ) : (
            /* Log List View */
            <table className="data-table" ref={tableRef}>
              <thead>
                <tr>
                  <th>Reference #</th>
                  <th>Faculty Member</th>
                  <th>Payment Type / Purpose</th>
                  <th>Verified Timestamp</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data && reportData.data.length > 0 ? reportData.data.map((row, idx) => (
                  <tr key={idx}>
                    <td><span className="ref-code">{row.reference_no}</span></td>
                    <td>
                      <strong style={{ color: 'var(--text-main)' }}>{row.faculty_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.department}</div>
                    </td>
                    <td>
                      <span className="status-tag approved" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                        {row.type}
                      </span>
                    </td>
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

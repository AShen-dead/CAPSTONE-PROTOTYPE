import React, { useState, useEffect, useRef } from 'react';
import { animatePageEntrance, animateTableRows } from '../utils/animations';
import { fetchFacultyRequests } from '../api';

export default function FacultyRequests() {
  const [filter, setFilter] = useState('All');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const res = await fetchFacultyRequests();
        setRequests(res?.data || []);
      } catch (err) {
        console.error("Failed to load requests", err);
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      animatePageEntrance(containerRef.current);
    }
  }, []);

  useEffect(() => {
    if (tableRef.current && !loading) {
      animateTableRows(tableRef.current);
    }
  }, [filter, requests, loading]);

  const filteredRequests = requests.filter(r => {
    if (filter === 'Pending') return r.status === 'Pending' || r.status === 'To verify' || r.status === 'Needs Review';
    if (filter === 'Released') return r.status === 'Approved' || r.status === 'Released' || r.status === 'Completed';
    return true;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d) ? dateStr : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (val) => '₱ ' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <main className="main-content" ref={containerRef}>
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>My Assistance Requests</h1>
          <p>Track the status of your union benefit applications</p>
        </div>
      </div>

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'All' ? 'active' : ''}`}
          onClick={() => setFilter('All')}
        >
          All Applications
        </button>
        <button 
          className={`filter-tab ${filter === 'Pending' ? 'active' : ''}`}
          onClick={() => setFilter('Pending')}
        >
          Under Review
        </button>
        <button 
          className={`filter-tab ${filter === 'Released' ? 'active' : ''}`}
          onClick={() => setFilter('Released')}
        >
          Released / Approved
        </button>
      </div>

      <div className="recent-activity-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-responsive" style={{ border: 'none' }}>
          {loading ? (
             <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
               ⏳ Loading requests...
             </div>
          ) : (
            <table className="data-table" ref={tableRef} style={{ minWidth: '600px' }}>
              <thead>
                <tr>
                  <th>Date Filed</th>
                  <th>Benefit Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map(req => (
                    <tr key={req.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(req.created_at)}</td>
                      <td><strong>{req.benefit_type?.name || 'Assistance Request'}</strong></td>
                      <td style={{ whiteSpace: 'nowrap' }} className="amount-text">
                        {formatCurrency(req.amount_requested || 0)}
                      </td>
                      <td>
                        <span className={`status-tag ${
                          (req.status === 'Pending' || req.status === 'To verify') ? 'pending' :
                          (req.status === 'Approved' || req.status === 'Released' || req.status === 'Completed') ? 'released' :
                          'declined'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {req.remarks || 'Application submitted'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No {filter !== 'All' ? filter.toLowerCase() : ''} requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}

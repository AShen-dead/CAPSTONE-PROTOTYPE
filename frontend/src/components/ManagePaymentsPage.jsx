import React, { useState } from 'react';

export default function ManagePaymentsPage() {
  const [activeFilter, setActiveFilter] = useState('All'); // All, To verify, Verified
  const [showRecordModal, setShowRecordModal] = useState(false);

  const [payments, setPayments] = useState([
    {
      id: 1,
      member: 'Prof. Maria Santos',
      avatar: 'MS',
      type: 'Contribution',
      refNo: 'REF-2026-0904',
      status: 'To verify',
      amount: '₱ 1,500.00',
      date: 'Jul 28, 2026'
    },
    {
      id: 2,
      member: 'Dr. Juan Dela Cruz',
      avatar: 'JD',
      type: 'Contribution',
      refNo: 'REF-2026-0903',
      status: 'To verify',
      amount: '₱ 2,000.00',
      date: 'Jul 27, 2026'
    },
    {
      id: 3,
      member: 'Engr. Roberto Garcia',
      avatar: 'RG',
      type: 'Benefit Disbursement',
      refNo: 'REF-2026-0902',
      status: 'Verified',
      amount: '₱ 10,000.00',
      date: 'Jul 26, 2026'
    },
    {
      id: 4,
      member: 'Prof. Antonio Mendoza',
      avatar: 'AM',
      type: 'Contribution',
      refNo: 'REF-2026-0901',
      status: 'Verified',
      amount: '₱ 500.00',
      date: 'Jul 25, 2026'
    },
    {
      id: 5,
      member: 'Dr. Clarissa Reyes',
      avatar: 'CR',
      type: 'Contribution',
      refNo: 'REF-2026-0900',
      status: 'To verify',
      amount: '₱ 1,200.00',
      date: 'Jul 24, 2026'
    },
    {
      id: 6,
      member: 'Prof. Elena Ramos',
      avatar: 'ER',
      type: 'Benefit Disbursement',
      refNo: 'REF-2026-0899',
      status: 'Verified',
      amount: '₱ 5,000.00',
      date: 'Jul 22, 2026'
    }
  ]);

  // Record payment modal state
  const [newMember, setNewMember] = useState('');
  const [newType, setNewType] = useState('Contribution');
  const [newRefNo, setNewRefNo] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const handleVerify = (id) => {
    setPayments(payments.map(item => item.id === id ? { ...item, status: 'Verified' } : item));
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!newMember.trim() || !newAmount.trim()) return;

    const initials = newMember
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'FM';

    const generatedRef = newRefNo.trim() || `REF-2026-0${Math.floor(100 + Math.random() * 900)}`;

    const newPayment = {
      id: Date.now(),
      member: newMember.trim(),
      avatar: initials,
      type: newType,
      refNo: generatedRef,
      status: 'To verify',
      amount: `₱ ${parseFloat(newAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      date: 'Jul 28, 2026'
    };

    setPayments([newPayment, ...payments]);
    setNewMember('');
    setNewRefNo('');
    setNewAmount('');
    setShowRecordModal(false);
  };

  const filteredPayments = payments.filter(p => {
    if (activeFilter === 'To verify') return p.status === 'To verify';
    if (activeFilter === 'Verified') return p.status === 'Verified';
    return true;
  });

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Manage payments</h1>
          <p>Record union dues, verify transactions, and monitor payment status</p>
        </div>

        {/* Clean Top-Right Action Button (No Duplicate +) */}
        <button 
          className="btn-primary"
          onClick={() => setShowRecordModal(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Record Payment
        </button>
      </div>

      {/* Controls Row: Status Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${activeFilter === 'All' ? 'active' : ''}`}
          onClick={() => setActiveFilter('All')}
        >
          All ({payments.length})
        </button>
        <button 
          className={`filter-tab ${activeFilter === 'To verify' ? 'active' : ''}`}
          onClick={() => setActiveFilter('To verify')}
        >
          To verify ({payments.filter(p => p.status === 'To verify').length})
        </button>
        <button 
          className={`filter-tab ${activeFilter === 'Verified' ? 'active' : ''}`}
          onClick={() => setActiveFilter('Verified')}
        >
          Verified ({payments.filter(p => p.status === 'Verified').length})
        </button>
      </div>

      {/* Payments Table */}
      <div className="recent-activity-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Type</th>
                <th>Reference #</th>
                <th>Status</th>
                <th>Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="member-cell">
                        <div className="member-avatar">{item.avatar}</div>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{item.member}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.date}</div>
                        </div>
                      </div>
                    </td>
                    <td>{item.type}</td>
                    <td><span className="ref-code">{item.refNo}</span></td>
                    <td>
                      <span className={`status-tag ${item.status === 'Verified' ? 'verified' : 'to-verify'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td><span className="amount-text">{item.amount}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      {item.status === 'To verify' ? (
                        <button 
                          className="btn-sm btn-success"
                          onClick={() => handleVerify(item.id)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Verify
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: '600' }}>✓ Verified</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No payments found under "{activeFilter}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showRecordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Record New Payment</h3>
              <button className="btn-close-modal" onClick={() => setShowRecordModal(false)}>✕</button>
            </div>

            <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Faculty Member Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. Prof. Maria Santos"
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Category Type</label>
                <select className="form-select" value={newType} onChange={(e) => setNewType(e.target.value)}>
                  <option value="Contribution">Contribution (Monthly Dues)</option>
                  <option value="Benefit Disbursement">Benefit Disbursement</option>
                  <option value="Special Assessment">Special Assessment</option>
                </select>
              </div>

              <div className="form-group">
                <label>OR / Reference #</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. REF-2026-0905"
                  value={newRefNo}
                  onChange={(e) => setNewRefNo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Amount (₱)</label>
                <input 
                  type="number" 
                  className="form-input"
                  placeholder="e.g. 1500.00"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowRecordModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Payment Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

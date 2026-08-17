import React, { useState } from 'react';

export default function ManagePaymentsPage() {
  const [activeFilter, setActiveFilter] = useState('All'); // All, To verify, Verified
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null); // Proof preview modal state

  // Default initial payments with sample proof receipt images
  const initialPayments = [
    {
      id: 1,
      member: 'Prof. Maria Santos',
      avatar: 'MS',
      type: 'Contribution',
      refNo: 'REF-2026-0904',
      status: 'To verify',
      amount: '₱ 1,500.00',
      date: 'Jul 28, 2026',
      proofUrl: '/assets/login-bg.jpg',
      notes: 'Faculty online bank transfer receipt submitted'
    },
    {
      id: 2,
      member: 'Dr. Juan Dela Cruz',
      avatar: 'JD',
      type: 'Contribution',
      refNo: 'REF-2026-0903',
      status: 'To verify',
      amount: '₱ 2,000.00',
      date: 'Jul 27, 2026',
      proofUrl: '/assets/login-bg.jpg',
      notes: 'Remittance slip uploaded via mobile portal'
    },
    {
      id: 3,
      member: 'Engr. Roberto Garcia',
      avatar: 'RG',
      type: 'Benefit Disbursement',
      refNo: 'REF-2026-0902',
      status: 'Verified',
      amount: '₱ 10,000.00',
      date: 'Jul 26, 2026',
      proofUrl: '/assets/login-bg.jpg',
      notes: 'Disbursement voucher #DV-992'
    },
    {
      id: 4,
      member: 'Prof. Antonio Mendoza',
      avatar: 'AM',
      type: 'Contribution',
      refNo: 'REF-2026-0901',
      status: 'Verified',
      amount: '₱ 500.00',
      date: 'Jul 25, 2026',
      proofUrl: '/assets/login-bg.jpg',
      notes: 'Monthly dues collection'
    },
    {
      id: 5,
      member: 'Dr. Clarissa Reyes',
      avatar: 'CR',
      type: 'Contribution',
      refNo: 'REF-2026-0900',
      status: 'To verify',
      amount: '₱ 1,200.00',
      date: 'Jul 24, 2026',
      proofUrl: '/assets/login-bg.jpg',
      notes: 'Deposit receipt verification pending'
    },
    {
      id: 6,
      member: 'Prof. Elena Ramos',
      avatar: 'ER',
      type: 'Benefit Disbursement',
      refNo: 'REF-2026-0899',
      status: 'Verified',
      amount: '₱ 5,000.00',
      date: 'Jul 22, 2026',
      proofUrl: '/assets/login-bg.jpg',
      notes: 'Approved medical grant payout'
    }
  ];

  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem('ucare_submitted_payments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...parsed, ...initialPayments];
      } catch (e) {
        return initialPayments;
      }
    }
    return initialPayments;
  });

  // Record payment modal state
  const [newMember, setNewMember] = useState('');
  const [newType, setNewType] = useState('Contribution');
  const [newRefNo, setNewRefNo] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const handleVerify = (id) => {
    const updated = payments.map(item => item.id === id ? { ...item, status: 'Verified' } : item);
    setPayments(updated);
    if (selectedProof && selectedProof.id === id) {
      setSelectedProof({ ...selectedProof, status: 'Verified' });
    }
  };

  const handleFlagIssue = (id) => {
    const updated = payments.map(item => item.id === id ? { ...item, status: 'Flagged / Needs Review' } : item);
    setPayments(updated);
    if (selectedProof && selectedProof.id === id) {
      setSelectedProof({ ...selectedProof, status: 'Flagged / Needs Review' });
    }
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
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      proofUrl: '/assets/login-bg.jpg',
      notes: 'Recorded manually by Admin'
    };

    setPayments([newPayment, ...payments]);
    setNewMember('');
    setNewRefNo('');
    setNewAmount('');
    setShowRecordModal(false);
  };

  const filteredPayments = payments.filter(p => {
    if (activeFilter === 'To verify') return p.status === 'To verify' || p.status.includes('Needs Review');
    if (activeFilter === 'Verified') return p.status === 'Verified';
    return true;
  });

  const countToVerify = payments.filter(p => p.status === 'To verify' || p.status.includes('Needs Review')).length;
  const countVerified = payments.filter(p => p.status === 'Verified').length;

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Manage payments</h1>
          <p>Verify faculty proof of payment receipts, record union dues, and monitor payment status</p>
        </div>

        {/* Clean Top-Right Action Button */}
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
          <span>All</span>
          <span className="filter-count-badge">({payments.length})</span>
        </button>
        <button 
          className={`filter-tab ${activeFilter === 'To verify' ? 'active' : ''}`}
          onClick={() => setActiveFilter('To verify')}
        >
          <span>To verify</span>
          <span className="filter-count-badge warning">({countToVerify})</span>
        </button>
        <button 
          className={`filter-tab ${activeFilter === 'Verified' ? 'active' : ''}`}
          onClick={() => setActiveFilter('Verified')}
        >
          <span>Verified</span>
          <span className="filter-count-badge success">({countVerified})</span>
        </button>
      </div>

      {/* Payments Table with Proof Column & Preview Action */}
      <div className="recent-activity-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Type</th>
                <th>Reference #</th>
                <th>Proof of Payment</th>
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
                      <button 
                        className="btn-sm btn-outline"
                        onClick={() => setSelectedProof(item)}
                        style={{ gap: '6px', fontWeight: '600' }}
                        title="Click to view uploaded proof of payment image"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        View Proof
                      </button>
                    </td>
                    <td>
                      <span className={`status-tag ${item.status === 'Verified' ? 'verified' : item.status.includes('Needs Review') ? 'declined' : 'to-verify'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td><span className="amount-text">{item.amount}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      {item.status === 'Verified' ? (
                        <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: '700' }}>✓ Verified</span>
                      ) : (
                        <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn-sm btn-success"
                            onClick={() => handleVerify(item.id)}
                            title="Mark transaction as verified"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Verify
                          </button>
                          <button 
                            className="btn-sm btn-outline"
                            onClick={() => setSelectedProof(item)}
                            title="Inspect proof document"
                          >
                            Inspect
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No payments found under "{activeFilter}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Preview Panel Modal (Submit Proof of Payment paired with Verify Payments) */}
      {selectedProof && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>📄</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Proof of Payment Verification</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#FCE8B3' }}>{selectedProof.member} — {selectedProof.type}</p>
                </div>
              </div>
              <button className="btn-close-modal" onClick={() => setSelectedProof(null)}>✕</button>
            </div>

            <div className="modal-body-form" style={{ gap: '16px' }}>
              {/* Payment Details Metadata Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Reference #</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary-maroon)' }}>{selectedProof.refNo}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Amount Remitted</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#2E8B57' }}>{selectedProof.amount}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Current Status</div>
                  <span className={`status-tag ${selectedProof.status === 'Verified' ? 'verified' : 'to-verify'}`} style={{ marginTop: '2px' }}>
                    {selectedProof.status}
                  </span>
                </div>
              </div>

              {/* Uploaded Receipt Image Preview Box */}
              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Uploaded Proof Image / Receipt Document:</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date: {selectedProof.date}</span>
                </label>

                <div style={{ 
                  background: '#1E293B', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  maxHeight: '340px',
                  overflow: 'hidden',
                  border: '1px solid #334155'
                }}>
                  <img 
                    src={selectedProof.proofUrl || '/assets/login-bg.jpg'} 
                    alt="Proof of Payment Screenshot" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '300px', 
                      objectFit: 'contain', 
                      borderRadius: '4px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
                    }} 
                    onError={(e) => {
                      e.target.src = '/assets/login-bg.jpg';
                    }}
                  />
                </div>
              </div>

              {/* Notes / Remittance Description */}
              {selectedProof.notes && (
                <div style={{ fontSize: '0.83rem', color: 'var(--text-main)', background: '#FEF8E7', border: '1px solid #FCE8B3', padding: '10px 14px', borderRadius: '6px' }}>
                  <strong>Faculty Remittance Notes:</strong> {selectedProof.notes}
                </div>
              )}

              {/* Verification Action Decision Buttons */}
              <div className="modal-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  type="button" 
                  className="btn-sm btn-danger"
                  onClick={() => handleFlagIssue(selectedProof.id)}
                  style={{ gap: '6px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Flag Issue / Reject
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setSelectedProof(null)}
                  >
                    Close Preview
                  </button>

                  {selectedProof.status !== 'Verified' && (
                    <button 
                      type="button" 
                      className="btn-primary"
                      onClick={() => handleVerify(selectedProof.id)}
                      style={{ background: 'linear-gradient(135deg, #2E8B57 0%, #256F46 100%)', boxShadow: '0 4px 14px rgba(46, 139, 87, 0.4)' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Mark as Verified
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Record New Payment</h3>
              <button className="btn-close-modal" onClick={() => setShowRecordModal(false)}>✕</button>
            </div>

            <form onSubmit={handleRecordPayment} className="modal-body-form">
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

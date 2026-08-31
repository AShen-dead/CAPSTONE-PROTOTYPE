import React, { useState, useEffect, useRef, useCallback } from 'react';
import { animatePageEntrance, animateTableRows, animateModalOpen, animateModalClose } from '../utils/animations';
import { apiFetch } from '../api';

// Storage base URL for proof images served by Laravel
const STORAGE_BASE = 'http://localhost:8000/storage/';

function proofImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return STORAGE_BASE + path;
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0] || '').join('').toUpperCase().substring(0, 2) || '??';
}

function formatAmount(val) {
  return '₱ ' + Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2 });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d) ? dateStr : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Map API payment → display shape
function mapPayment(p) {
  const fm   = p.faculty_member ?? {};
  const name = fm.first_name ? `${fm.first_name} ${fm.last_name}` : (p.member ?? '—');
  const proof = p.proof ?? null;
  return {
    id:       p.id,
    member:   name,
    avatar:   getInitials(name),
    type:     p.payment_method ?? 'Contribution',
    refNo:    p.reference_no  ?? `PAY-${p.id}`,
    status:   p.status        ?? 'Pending',
    amount:   formatAmount(p.amount ?? 0),
    date:     formatDate(p.payment_date),
    proofUrl: proof?.proof_image ? proofImageUrl(proof.proof_image) : null,
    notes:    p.notes ?? null,
    rawAmount: Number(p.amount ?? 0),
  };
}

export default function ManagePaymentsPage() {
  const [activeFilter,    setActiveFilter]    = useState('All');
  const [payments,        setPayments]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [actionLoading,   setActionLoading]   = useState(null); // id of the row being actioned
  const [selectedProof,   setSelectedProof]   = useState(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [error,           setError]           = useState(null);

  // Record modal fields
  const [newMember, setNewMember] = useState('');
  const [newType,   setNewType]   = useState('Contribution');
  const [newRefNo,  setNewRefNo]  = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [saving,    setSaving]    = useState(false);

  const containerRef    = useRef(null);
  const tableRef        = useRef(null);
  const proofModalRef   = useRef(null);
  const proofOverlayRef = useRef(null);
  const recordModalRef  = useRef(null);
  const recordOverlayRef= useRef(null);

  // ── Load payments from API ──────────────────────────────────
  const loadPayments = useCallback(async () => {
    try {
      const res = await apiFetch('/payments');
      setPayments((res?.data ?? []).map(mapPayment));
      setError(null);
    } catch {
      setError('Could not load payments from the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  useEffect(() => {
    if (containerRef.current) animatePageEntrance(containerRef.current);
  }, []);

  useEffect(() => {
    if (tableRef.current) animateTableRows(tableRef.current);
  }, [activeFilter, payments]);

  useEffect(() => {
    if (selectedProof && proofModalRef.current)
      animateModalOpen(proofModalRef.current, proofOverlayRef.current);
  }, [selectedProof]);

  useEffect(() => {
    if (showRecordModal && recordModalRef.current)
      animateModalOpen(recordModalRef.current, recordOverlayRef.current);
  }, [showRecordModal]);

  // ── Helpers ───────────────────────────────────────────────
  const handleCloseProofModal = () => {
    if (proofModalRef.current) {
      animateModalClose(proofModalRef.current, proofOverlayRef.current, () => setSelectedProof(null));
    } else {
      setSelectedProof(null);
    }
  };

  const handleCloseRecordModal = () => {
    if (recordModalRef.current) {
      animateModalClose(recordModalRef.current, recordOverlayRef.current, () => setShowRecordModal(false));
    } else {
      setShowRecordModal(false);
    }
  };

  // ── Verify payment → PATCH /api/payments/{id} ────────────
  const handleVerify = async (id) => {
    setActionLoading(id);
    try {
      await apiFetch(`/payments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Verified' }),
      });
      // Update local state optimistically
      setPayments(prev =>
        prev.map(p => p.id === id ? { ...p, status: 'Verified' } : p)
      );
      if (selectedProof?.id === id) {
        setSelectedProof(prev => ({ ...prev, status: 'Verified' }));
      }
    } catch {
      alert('Failed to verify payment. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Flag / reject ─────────────────────────────────────────
  const handleFlagIssue = async (id) => {
    setActionLoading(id);
    try {
      await apiFetch(`/payments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Flagged / Needs Review' }),
      });
      setPayments(prev =>
        prev.map(p => p.id === id ? { ...p, status: 'Flagged / Needs Review' } : p)
      );
      if (selectedProof?.id === id) {
        setSelectedProof(prev => ({ ...prev, status: 'Flagged / Needs Review' }));
      }
    } catch {
      alert('Failed to flag payment. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Record new payment (admin manual entry) ───────────────
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!newMember.trim() || !newAmount.trim()) return;
    setSaving(true);

    try {
      // We need a faculty_member id — look up by name or use a fallback approach.
      // Since this is admin manual entry, we POST directly and reload.
      // For now, record with the minimal required fields the API accepts.
      const generatedRef = newRefNo.trim() || `REF-${Date.now()}`;
      const body = {
        payment_date:   new Date().toISOString().split('T')[0],
        amount:         parseFloat(newAmount),
        payment_method: newType,
        reference_no:   generatedRef,
        status:         'Pending',
      };

      // Faculty members list to resolve the name
      const membersRes = await apiFetch('/faculty-members');
      const members    = membersRes?.data ?? [];
      const matched    = members.find(m =>
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(newMember.trim().toLowerCase())
      );

      if (!matched) {
        alert(`No faculty member found matching "${newMember}". Please use the exact name from Manage Members.`);
        setSaving(false);
        return;
      }

      // Also need a contribution_id — use the member's first contribution or create without it
      const contribRes = await apiFetch(`/contributions?faculty_id=${matched.id}`);
      const contribs   = contribRes?.data ?? [];
      const contrib    = contribs[0];

      if (!contrib) {
        alert(`No contribution record found for ${matched.first_name} ${matched.last_name}. Please add a contribution first.`);
        setSaving(false);
        return;
      }

      const res = await apiFetch('/payments', {
        method: 'POST',
        body: JSON.stringify({
          ...body,
          faculty_id:      matched.id,
          contribution_id: contrib.id,
        }),
      });

      setPayments(prev => [mapPayment(res.data), ...prev]);
      setNewMember('');
      setNewRefNo('');
      setNewAmount('');
      handleCloseRecordModal();
    } catch (err) {
      alert('Failed to record payment. Check the server.');
    } finally {
      setSaving(false);
    }
  };

  // ── Filter ────────────────────────────────────────────────
  const filteredPayments = payments.filter(p => {
    if (activeFilter === 'To verify') return p.status === 'To verify' || p.status === 'Pending' || p.status.includes('Needs Review');
    if (activeFilter === 'Verified')  return p.status === 'Verified';
    return true;
  });

  const countToVerify = payments.filter(p => p.status === 'To verify' || p.status === 'Pending' || p.status.includes('Needs Review')).length;
  const countVerified = payments.filter(p => p.status === 'Verified').length;

  const statusClass = (status = '') => {
    const s = status.toLowerCase();
    if (s === 'verified') return 'verified';
    if (s.includes('needs review') || s === 'flagged') return 'declined';
    return 'to-verify';
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="main-content" ref={containerRef}>
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Manage Payments</h1>
          <p>Verify faculty proof of payment receipts, record union dues, and monitor payment status</p>
        </div>
        <button className="btn-primary" onClick={() => setShowRecordModal(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Record Payment
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.875rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button className={`filter-tab ${activeFilter === 'All' ? 'active' : ''}`} onClick={() => setActiveFilter('All')}>
          <span>All</span>
          <span className="filter-count-badge">({payments.length})</span>
        </button>
        <button className={`filter-tab ${activeFilter === 'To verify' ? 'active' : ''}`} onClick={() => setActiveFilter('To verify')}>
          <span>To verify</span>
          <span className="filter-count-badge warning">({countToVerify})</span>
        </button>
        <button className={`filter-tab ${activeFilter === 'Verified' ? 'active' : ''}`} onClick={() => setActiveFilter('Verified')}>
          <span>Verified</span>
          <span className="filter-count-badge success">({countVerified})</span>
        </button>
      </div>

      {/* Table */}
      <div className="recent-activity-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              ⏳ Loading payments…
            </div>
          ) : (
            <table className="data-table" ref={tableRef}>
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
                        {item.proofUrl ? (
                          <button
                            className="btn-sm btn-outline"
                            onClick={() => setSelectedProof(item)}
                            style={{ gap: '6px', fontWeight: '600' }}
                            title="Click to view uploaded proof of payment image"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            View Proof
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No file</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-tag ${statusClass(item.status)}`}>{item.status}</span>
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
                              disabled={actionLoading === item.id}
                              title="Mark transaction as verified"
                            >
                              {actionLoading === item.id ? '…' : (
                                <>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  Verify
                                </>
                              )}
                            </button>
                            {item.proofUrl && (
                              <button className="btn-sm btn-outline" onClick={() => setSelectedProof(item)} title="Inspect proof document">
                                Inspect
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      {payments.length === 0 ? 'No payments recorded yet.' : `No payments found under "${activeFilter}".`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Proof Preview Modal */}
      {selectedProof && (
        <div className="modal-overlay" ref={proofOverlayRef}>
          <div className="modal-content" ref={proofModalRef} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>📄</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Proof of Payment Verification</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#FCE8B3' }}>{selectedProof.member} — {selectedProof.type}</p>
                </div>
              </div>
              <button className="btn-close-modal" onClick={handleCloseProofModal}>✕</button>
            </div>

            <div className="modal-body-form" style={{ gap: '16px' }}>
              {/* Metadata row */}
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
                  <span className={`status-tag ${statusClass(selectedProof.status)}`} style={{ marginTop: '2px' }}>
                    {selectedProof.status}
                  </span>
                </div>
              </div>

              {/* Proof image */}
              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Uploaded Proof Image / Receipt Document:</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date: {selectedProof.date}</span>
                </label>
                <div style={{ background: '#1E293B', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxHeight: '340px', overflow: 'hidden', border: '1px solid #334155' }}>
                  {selectedProof.proofUrl ? (
                    <img
                      src={selectedProof.proofUrl}
                      alt="Proof of Payment"
                      style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span style={{ color: '#94A3B8', fontSize: '0.875rem' }}>No proof image uploaded.</span>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedProof.notes && (
                <div style={{ fontSize: '0.83rem', color: 'var(--text-main)', background: '#FEF8E7', border: '1px solid #FCE8B3', padding: '10px 14px', borderRadius: '6px' }}>
                  <strong>Faculty Remittance Notes:</strong> {selectedProof.notes}
                </div>
              )}

              {/* Action buttons */}
              <div className="modal-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn-sm btn-danger"
                  onClick={() => handleFlagIssue(selectedProof.id)}
                  disabled={actionLoading === selectedProof.id}
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
                  <button type="button" className="btn-secondary" onClick={handleCloseProofModal}>
                    Close Preview
                  </button>
                  {selectedProof.status !== 'Verified' && (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => handleVerify(selectedProof.id)}
                      disabled={actionLoading === selectedProof.id}
                      style={{ background: 'linear-gradient(135deg, #2E8B57 0%, #256F46 100%)', boxShadow: '0 4px 14px rgba(46, 139, 87, 0.4)' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {actionLoading === selectedProof.id ? 'Saving…' : 'Mark as Verified'}
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
        <div className="modal-overlay" ref={recordOverlayRef}>
          <div className="modal-content" ref={recordModalRef}>
            <div className="modal-header">
              <h3>Record New Payment</h3>
              <button className="btn-close-modal" onClick={handleCloseRecordModal}>✕</button>
            </div>

            <form onSubmit={handleRecordPayment} className="modal-body-form">
              <div className="form-group">
                <label>Faculty Member Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Maria Santos"
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  required
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Must match a name in Manage Members</small>
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
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseRecordModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Payment Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

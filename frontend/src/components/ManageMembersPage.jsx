import React, { useState, useEffect, useRef } from 'react';
import { animatePageEntrance, animateTableRows, animateModalOpen, animateModalClose } from '../utils/animations';
import { fetchFacultyMembers, createFacultyMember, updateFacultyMember, deleteFacultyMember } from '../api';

const STORAGE_BASE = 'http://localhost:8000/storage/';

export default function ManageMembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  // Add Member Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [newMemberEmpNo, setNewMemberEmpNo] = useState('');
  const [newMemberStatus, setNewMemberStatus] = useState('Active');
  const [newMemberDept, setNewMemberDept] = useState('College of Computing & IT');
  const [newMemberContact, setNewMemberContact] = useState('');
  const [newMemberContribution, setNewMemberContribution] = useState('');
  const [formFeedback, setFormFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Edit Member Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editStatus, setEditStatus] = useState('Active');
  const [editDept, setEditDept] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editFeedback, setEditFeedback] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const containerRef = useRef(null);
  const tableRef = useRef(null);
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const editModalRef = useRef(null);
  const editOverlayRef = useRef(null);

  // Category Filter items
  const categories = ['All', 'Active', 'On leave', 'Retired'];

  // Load real members from API
  const loadMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFacultyMembers();
      setMembers(res.data || []);
    } catch (err) {
      console.error('Failed to load faculty members:', err);
      setError('Could not load faculty accounts. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  // Filtered members calculation
  const filteredMembers = members.filter(member => {
    const term = searchTerm.toLowerCase();
    const name = (member.name || '').toLowerCase();
    const dept = (member.department || '').toLowerCase();
    const email = (member.email || '').toLowerCase();
    const empNo = (member.employee_no || '').toLowerCase();

    const matchesSearch = name.includes(term) || dept.includes(term) || email.includes(term) || empNo.includes(term);
    const matchesCategory = selectedCategory === 'All' || (member.status || '').toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    if (containerRef.current) {
      animatePageEntrance(containerRef.current);
    }
  }, []);

  useEffect(() => {
    if (tableRef.current) {
      animateTableRows(tableRef.current);
    }
  }, [selectedCategory, searchTerm, members]);

  useEffect(() => {
    if (showAddModal && modalRef.current) {
      animateModalOpen(modalRef.current, overlayRef.current);
    }
  }, [showAddModal]);

  useEffect(() => {
    if (showEditModal && editModalRef.current) {
      animateModalOpen(editModalRef.current, editOverlayRef.current);
    }
  }, [showEditModal]);

  const handleCloseAddModal = () => {
    if (modalRef.current) {
      animateModalClose(modalRef.current, overlayRef.current, () => {
        setShowAddModal(false);
        setFormFeedback('');
      });
    } else {
      setShowAddModal(false);
      setFormFeedback('');
    }
  };

  const handleCloseEditModal = () => {
    if (editModalRef.current) {
      animateModalClose(editModalRef.current, editOverlayRef.current, () => {
        setShowEditModal(false);
        setEditingMember(null);
        setEditFeedback('');
      });
    } else {
      setShowEditModal(false);
      setEditingMember(null);
      setEditFeedback('');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (member) => {
    setEditingMember(member);
    setEditStatus(member.status || 'Active');
    setEditDept(member.department || '');
    setEditContact(member.contact_no || '');
    setEditFeedback('');
    setShowEditModal(true);
  };

  // Submit Add Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      setFormFeedback('Error: Full name and email address are required.');
      return;
    }

    setIsSaving(true);
    setFormFeedback('');

    try {
      await createFacultyMember({
        name: newMemberName.trim(),
        email: newMemberEmail.trim(),
        password: newMemberPassword.trim() || 'password123',
        employee_no: newMemberEmpNo.trim() || undefined,
        department: newMemberDept.trim() || 'General',
        status: newMemberStatus,
        contact_no: newMemberContact.trim() || undefined,
        initial_contribution: newMemberContribution ? parseFloat(newMemberContribution) : undefined,
      });

      setFormFeedback('Success: Faculty member account registered successfully!');
      
      // Reload member directory
      await loadMembers();

      setTimeout(() => {
        setNewMemberName('');
        setNewMemberEmail('');
        setNewMemberPassword('');
        setNewMemberEmpNo('');
        setNewMemberContact('');
        setNewMemberContribution('');
        handleCloseAddModal();
      }, 1000);
    } catch (err) {
      const msg = err?.data?.message || err?.data?.errors?.email?.[0] || 'Failed to create faculty account.';
      setFormFeedback(`Error: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Edit Member
  const handleUpdateMember = async (e) => {
    e.preventDefault();
    if (!editingMember) return;

    setIsUpdating(true);
    setEditFeedback('');

    try {
      await updateFacultyMember(editingMember.id, {
        department: editDept.trim() || 'General',
        status: editStatus,
        contact_no: editContact.trim() || null,
      });

      setEditFeedback('Success: Faculty member details updated!');
      await loadMembers();

      setTimeout(() => {
        handleCloseEditModal();
      }, 900);
    } catch (err) {
      const msg = err?.data?.message || 'Failed to update member.';
      setEditFeedback(`Error: ${msg}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Member
  const handleDeleteMember = async (member) => {
    if (!window.confirm(`Are you sure you want to remove ${member.name}? This will deactivate their faculty account.`)) {
      return;
    }

    try {
      await deleteFacultyMember(member.id);
      await loadMembers();
    } catch (err) {
      alert(err?.data?.message || 'Failed to delete member.');
    }
  };

  // Helper for initials
  const getInitials = (name) => {
    return (name || 'Faculty')
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="main-content" ref={containerRef}>
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Manage members</h1>
          <p>ISPSC Tagudin Federated Faculty Union Member Directory &amp; Running Totals</p>
        </div>

        {/* Clean Top-Right Action Button */}
        <button 
          className="btn-primary"
          onClick={() => {
            setFormFeedback('');
            setShowAddModal(true);
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Member
        </button>
      </div>

      {/* Controls Row */}
      <div className="controls-row">
        {/* Search Field */}
        <div className="search-field-container">
          <svg className="search-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, department, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories Dropdown Filter Button */}
        <div className="category-dropdown-container">
          <button 
            className="btn-categories"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span>Category: {selectedCategory}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {showCategoryDropdown && (
            <div className="dropdown-menu">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className={`dropdown-item ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          backgroundColor: '#FEE2E2',
          border: '1px solid #FCA5A5',
          color: '#B91C1C',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '0.88rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button className="btn-sm btn-outline" onClick={loadMembers}>Retry</button>
        </div>
      )}

      {/* Members Table */}
      <div className="recent-activity-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table" ref={tableRef}>
            <thead>
              <tr>
                <th>Faculty Member</th>
                <th>Employee ID</th>
                <th>Status</th>
                <th>Total Verified Contribution</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Loading faculty directory...
                  </td>
                </tr>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  let statusClass = 'active';
                  const s = (member.status || '').toLowerCase();
                  if (s === 'on leave') statusClass = 'leave';
                  if (s === 'retired') statusClass = 'retired';

                  return (
                    <tr key={member.id}>
                      <td>
                        <div className="member-cell">
                          <div 
                            className="member-avatar"
                            style={{ 
                              padding: 0, 
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'linear-gradient(135deg, #8B1E3F 0%, #6E1731 100%)',
                              color: '#fff',
                              fontWeight: '700'
                            }}
                          >
                            {member.profile_photo ? (
                              <img 
                                src={STORAGE_BASE + member.profile_photo} 
                                alt={member.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              getInitials(member.name)
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{member.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {member.department || 'General'} • {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          fontFamily: 'monospace', 
                          fontSize: '0.8rem', 
                          fontWeight: '700',
                          padding: '3px 8px',
                          background: '#F1F5F9',
                          borderRadius: '4px',
                          color: '#475569'
                        }}>
                          {member.employee_no || '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-tag ${statusClass}`}>
                          {member.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        <span className="amount-text">
                          ₱ {Number(member.total_contributions || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn-sm btn-outline"
                            onClick={() => handleOpenEdit(member)}
                            title="Edit Member Details"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-sm btn-outline"
                            onClick={() => handleDeleteMember(member)}
                            title="Delete Member"
                            style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#DC2626', borderColor: '#FCA5A5' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    {searchTerm ? `No faculty accounts found matching "${searchTerm}".` : 'No registered faculty accounts yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Modal: Add Real Faculty Account */}
      {showAddModal && (
        <div className="modal-overlay" ref={overlayRef}>
          <div className="modal-content" ref={modalRef} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3>Register Real Faculty Member</h3>
              <button 
                className="btn-close-modal"
                onClick={handleCloseAddModal}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="modal-body-form">
              {formFeedback && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  fontWeight: '600',
                  backgroundColor: formFeedback.startsWith('Error') ? '#FEE2E2' : '#E8F6EF',
                  color: formFeedback.startsWith('Error') ? '#B91C1C' : '#2E8B57',
                  border: `1px solid ${formFeedback.startsWith('Error') ? '#FCA5A5' : '#C1E6D0'}`
                }}>
                  {formFeedback}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Full Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Prof. Juan Luna"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Email Address (Login) *</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="e.g. juan@ucare.local"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Initial Password</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Default: password123"
                    value={newMemberPassword}
                    onChange={(e) => setNewMemberPassword(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Employee ID No.</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Auto-generated if blank"
                    value={newMemberEmpNo}
                    onChange={(e) => setNewMemberEmpNo(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Employment Status</label>
                  <select 
                    className="form-select"
                    value={newMemberStatus}
                    onChange={(e) => setNewMemberStatus(e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="On leave">On leave</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Contact Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 0917-123-4567"
                    value={newMemberContact}
                    onChange={(e) => setNewMemberContact(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>College / Department</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. College of Teacher Education"
                  value={newMemberDept}
                  onChange={(e) => setNewMemberDept(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Initial Verified Contribution (₱, optional)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  placeholder="e.g. 500.00"
                  value={newMemberContribution}
                  onChange={(e) => setNewMemberContribution(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={handleCloseAddModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? 'Registering...' : 'Register Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Modal: Edit Member */}
      {showEditModal && editingMember && (
        <div className="modal-overlay" ref={editOverlayRef}>
          <div className="modal-content" ref={editModalRef} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Edit Faculty Member</h3>
              <button 
                className="btn-close-modal"
                onClick={handleCloseEditModal}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="modal-body-form">
              {editFeedback && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  fontWeight: '600',
                  backgroundColor: editFeedback.startsWith('Error') ? '#FEE2E2' : '#E8F6EF',
                  color: editFeedback.startsWith('Error') ? '#B91C1C' : '#2E8B57',
                  border: `1px solid ${editFeedback.startsWith('Error') ? '#FCA5A5' : '#C1E6D0'}`
                }}>
                  {editFeedback}
                </div>
              )}

              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontWeight: '800', color: 'var(--primary-maroon)', fontSize: '0.95rem' }}>{editingMember.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {editingMember.email} • ID: {editingMember.employee_no || 'N/A'}
                </div>
              </div>

              <div className="form-group">
                <label>Employment Status</label>
                <select 
                  className="form-select"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="On leave">On leave</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>

              <div className="form-group">
                <label>College / Department</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Contact Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. 0917-123-4567"
                  value={editContact}
                  onChange={(e) => setEditContact(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={handleCloseEditModal}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isUpdating}>
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

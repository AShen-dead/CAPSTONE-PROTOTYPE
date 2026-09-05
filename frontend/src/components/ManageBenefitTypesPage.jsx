import React, { useState, useEffect, useRef } from 'react';
import { animatePageEntrance, animateModalOpen, animateModalClose } from '../utils/animations';
import { fetchBenefitTypes, createBenefitType, updateBenefitType, deleteBenefitType } from '../api';

export default function ManageBenefitTypesPage() {
  const [benefitTypes, setBenefitTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStatus, setNewStatus] = useState('Active');
  const [addFeedback, setAddFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState('Active');
  const [editFeedback, setEditFeedback] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const containerRef = useRef(null);
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const editModalRef = useRef(null);
  const editOverlayRef = useRef(null);

  const loadBenefitTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBenefitTypes();
      setBenefitTypes(res?.data || []);
    } catch (err) {
      console.error('Failed to load benefit types:', err);
      setError('Could not load benefit types. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBenefitTypes();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      animatePageEntrance(containerRef.current);
    }
  }, []);

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
        setAddFeedback('');
      });
    } else {
      setShowAddModal(false);
      setAddFeedback('');
    }
  };

  const handleCloseEditModal = () => {
    if (editModalRef.current) {
      animateModalClose(editModalRef.current, editOverlayRef.current, () => {
        setShowEditModal(false);
        setEditingType(null);
        setEditFeedback('');
      });
    } else {
      setShowEditModal(false);
      setEditingType(null);
      setEditFeedback('');
    }
  };

  const handleOpenEdit = (item) => {
    setEditingType(item);
    setEditTitle(item.benefit_name || '');
    setEditDesc(item.description || '');
    setEditStatus(item.status || 'Active');
    setEditFeedback('');
    setShowEditModal(true);
  };

  // Toggle active/inactive status
  const toggleStatus = async (item) => {
    const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateBenefitType(item.id, { status: nextStatus });
      setBenefitTypes(benefitTypes.map(b => b.id === item.id ? { ...b, status: nextStatus } : b));
    } catch (err) {
      alert(err?.data?.message || 'Failed to update benefit type status.');
    }
  };

  // Add new benefit type
  const handleAddBenefitType = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setAddFeedback('Error: Benefit category title is required.');
      return;
    }

    setIsSaving(true);
    setAddFeedback('');

    try {
      await createBenefitType({
        benefit_name: newTitle.trim(),
        description: newDesc.trim() || null,
        status: newStatus,
      });

      setAddFeedback('Success: New benefit type added successfully!');
      await loadBenefitTypes();

      setTimeout(() => {
        setNewTitle('');
        setNewDesc('');
        setNewStatus('Active');
        handleCloseAddModal();
      }, 900);
    } catch (err) {
      const msg = err?.data?.message || err?.data?.errors?.benefit_name?.[0] || 'Failed to add benefit type.';
      setAddFeedback(`Error: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Update existing benefit type
  const handleUpdateBenefitType = async (e) => {
    e.preventDefault();
    if (!editingType || !editTitle.trim()) return;

    setIsUpdating(true);
    setEditFeedback('');

    try {
      await updateBenefitType(editingType.id, {
        benefit_name: editTitle.trim(),
        description: editDesc.trim() || null,
        status: editStatus,
      });

      setEditFeedback('Success: Benefit type updated successfully!');
      await loadBenefitTypes();

      setTimeout(() => {
        handleCloseEditModal();
      }, 900);
    } catch (err) {
      const msg = err?.data?.message || 'Failed to update benefit type.';
      setEditFeedback(`Error: ${msg}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete benefit type
  const handleDeleteBenefitType = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.benefit_name}"?`)) {
      return;
    }

    try {
      await deleteBenefitType(item.id);
      setBenefitTypes(benefitTypes.filter(b => b.id !== item.id));
    } catch (err) {
      alert(err?.data?.message || 'Failed to delete benefit type.');
    }
  };

  return (
    <div className="main-content" ref={containerRef}>
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Manage benefit types</h1>
          <p>Configure faculty compensation, assistance categories, and policy guidelines</p>
        </div>

        {/* Clean Top-Right Action Button */}
        <button 
          className="btn-primary"
          onClick={() => {
            setAddFeedback('');
            setShowAddModal(true);
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Benefit Type
        </button>
      </div>

      {/* Error Banner */}
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
          <button className="btn-sm btn-outline" onClick={loadBenefitTypes}>Retry</button>
        </div>
      )}

      {/* Benefit Types Table */}
      <div className="recent-activity-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '240px' }}>Benefit Type</th>
                <th>Description</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Loading benefit types...
                  </td>
                </tr>
              ) : benefitTypes.length > 0 ? (
                benefitTypes.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                        {item.benefit_name}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {item.description || 'Standard union benefit category.'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-tag ${(item.status || 'active').toLowerCase()}`}>
                        {item.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-sm btn-outline"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Benefit Details"
                        >
                          Edit
                        </button>
                        <button 
                          className={`btn-sm ${item.status === 'Active' ? 'btn-outline' : 'btn-success'}`}
                          onClick={() => toggleStatus(item)}
                          title={item.status === 'Active' ? 'Deactivate Benefit' : 'Activate Benefit'}
                        >
                          {item.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          className="btn-sm btn-outline"
                          onClick={() => handleDeleteBenefitType(item)}
                          title="Delete Benefit"
                          style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No benefit types configured yet. Click "Add Benefit Type" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Benefit Type Modal */}
      {showAddModal && (
        <div className="modal-overlay" ref={overlayRef}>
          <div className="modal-content" ref={modalRef} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>Add New Benefit Type</h3>
              <button className="btn-close-modal" onClick={handleCloseAddModal}>✕</button>
            </div>

            <form onSubmit={handleAddBenefitType} className="modal-body-form">
              {addFeedback && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  fontWeight: '600',
                  backgroundColor: addFeedback.startsWith('Error') ? '#FEE2E2' : '#E8F6EF',
                  color: addFeedback.startsWith('Error') ? '#B91C1C' : '#2E8B57',
                  border: `1px solid ${addFeedback.startsWith('Error') ? '#FCA5A5' : '#C1E6D0'}`
                }}>
                  {addFeedback}
                </div>
              )}

              <div className="form-group">
                <label>Benefit Category Title *</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. Special Assistance Benefit"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description &amp; Eligibility Policy</label>
                <textarea 
                  className="form-input"
                  rows="3"
                  placeholder="Enter policy details and guidelines..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label>Initial Status</label>
                <select 
                  className="form-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                  {isSaving ? 'Saving...' : 'Save Benefit Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Benefit Type Modal */}
      {showEditModal && editingType && (
        <div className="modal-overlay" ref={editOverlayRef}>
          <div className="modal-content" ref={editModalRef} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>Edit Benefit Type</h3>
              <button className="btn-close-modal" onClick={handleCloseEditModal}>✕</button>
            </div>

            <form onSubmit={handleUpdateBenefitType} className="modal-body-form">
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

              <div className="form-group">
                <label>Benefit Category Title *</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description &amp; Eligibility Policy</label>
                <textarea 
                  className="form-input"
                  rows="3"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select 
                  className="form-select"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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


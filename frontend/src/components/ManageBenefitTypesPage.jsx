import React, { useState } from 'react';

export default function ManageBenefitTypesPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  const [benefitTypes, setBenefitTypes] = useState([
    {
      id: 1,
      title: 'Medical Benefit',
      description: 'Assistance for hospitalization, surgery, and major medical expenses incurred by faculty members.',
      status: 'Active',
      maxAmount: '₱ 20,000.00'
    },
    {
      id: 2,
      title: 'Bereavement Benefit',
      description: 'Financial aid provided to immediate family members upon the passing of a union member.',
      status: 'Active',
      maxAmount: '₱ 15,000.00'
    },
    {
      id: 3,
      title: 'Educational Assistance Benefit',
      description: 'Support for member professional development, conference attendance, or graduate studies.',
      status: 'Active',
      maxAmount: '₱ 10,000.00'
    },
    {
      id: 4,
      title: 'Calamity Relief Benefit',
      description: 'Emergency funds for members affected by natural disasters, floods, or fire incidents.',
      status: 'Active',
      maxAmount: '₱ 8,000.00'
    },
    {
      id: 5,
      title: 'Retirement Token Benefit',
      description: 'Lump-sum compensation gift presented to retiring faculty members upon honorable discharge.',
      status: 'Inactive',
      maxAmount: '₱ 25,000.00'
    }
  ]);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMax, setNewMax] = useState('');

  const toggleStatus = (id) => {
    setBenefitTypes(benefitTypes.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: item.status === 'Active' ? 'Inactive' : 'Active'
        };
      }
      return item;
    }));
  };

  const handleAddBenefitType = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newBenefit = {
      id: Date.now(),
      title: newTitle.trim(),
      description: newDesc.trim() || 'Standard union benefit category.',
      status: 'Active',
      maxAmount: newMax.trim() ? `₱ ${parseFloat(newMax).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '₱ 10,000.00'
    };

    setBenefitTypes([...benefitTypes, newBenefit]);
    setNewTitle('');
    setNewDesc('');
    setNewMax('');
    setShowAddModal(false);
  };

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Manage benefit types</h1>
          <p>Configure faculty compensation, assistance categories, and policy guidelines</p>
        </div>

        {/* Clean Top-Right Action Button (No Duplicate +) */}
        <button 
          className="btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Benefit Type
        </button>
      </div>

      {/* Benefit Types Table */}
      <div className="recent-activity-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '220px' }}>Benefit Type</th>
                <th>Description</th>
                <th>Cap Limit</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {benefitTypes.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{item.title}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {item.description}
                    </span>
                  </td>
                  <td>
                    <span className="amount-text">{item.maxAmount}</span>
                  </td>
                  <td>
                    <span className={`status-tag ${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button 
                        className={`btn-sm ${item.status === 'Active' ? 'btn-outline' : 'btn-success'}`}
                        onClick={() => toggleStatus(item.id)}
                      >
                        {item.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Benefit Type Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Benefit Type</h3>
              <button className="btn-close-modal" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddBenefitType} className="modal-body-form">
              <div className="form-group">
                <label>Benefit Category Title</label>
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
                <label>Description & Eligibility Policy</label>
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
                <label>Maximum Claim Ceiling Amount (₱)</label>
                <input 
                  type="number" 
                  className="form-input"
                  placeholder="e.g. 15000.00"
                  value={newMax}
                  onChange={(e) => setNewMax(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Benefit Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

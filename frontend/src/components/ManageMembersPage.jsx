import React, { useState } from 'react';

export default function ManageMembersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Initial faculty members data
  const [members, setMembers] = useState([
    { id: 1, name: 'Prof. Maria Santos', avatar: 'MS', status: 'Active', department: 'College of Teacher Education', totalContribution: '₱ 28,500.00' },
    { id: 2, name: 'Dr. Juan Dela Cruz', avatar: 'JD', status: 'Active', department: 'College of Computing & IT', totalContribution: '₱ 34,200.00' },
    { id: 3, name: 'Engr. Roberto Garcia', avatar: 'RG', status: 'On leave', department: 'College of Engineering', totalContribution: '₱ 19,800.00' },
    { id: 4, name: 'Prof. Antonio Mendoza', avatar: 'AM', status: 'Active', department: 'College of Arts & Sciences', totalContribution: '₱ 42,000.00' },
    { id: 5, name: 'Dr. Clarissa Reyes', avatar: 'CR', status: 'Active', department: 'College of Business Administration', totalContribution: '₱ 31,500.00' },
    { id: 6, name: 'Prof. Elena Ramos', avatar: 'ER', status: 'On leave', department: 'College of Nursing', totalContribution: '₱ 16,400.00' },
    { id: 7, name: 'Dr. Fernando Lopez', avatar: 'FL', status: 'Active', department: 'College of Agriculture', totalContribution: '₱ 45,100.00' },
    { id: 8, name: 'Prof. Beatriz Laurel', avatar: 'BL', status: 'Retired', department: 'College of Teacher Education', totalContribution: '₱ 52,800.00' }
  ]);

  // Form state for adding new member
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberStatus, setNewMemberStatus] = useState('Active');
  const [newMemberDept, setNewMemberDept] = useState('College of Computing & IT');
  const [newMemberContribution, setNewMemberContribution] = useState('');

  // Category Filter items
  const categories = ['All', 'Active', 'On leave', 'Retired'];

  // Filtered members calculation
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || member.status.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const initials = newMemberName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'FM';

    const formattedContribution = newMemberContribution.trim()
      ? `₱ ${parseFloat(newMemberContribution).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      : '₱ 0.00';

    const newEntry = {
      id: Date.now(),
      name: newMemberName.trim(),
      avatar: initials,
      status: newMemberStatus,
      department: newMemberDept,
      totalContribution: formattedContribution
    };

    setMembers([newEntry, ...members]);
    setNewMemberName('');
    setNewMemberContribution('');
    setShowAddModal(false);
  };

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Manage members</h1>
          <p>ISPSC Tagudin Federated Faculty Union Member Directory & Running Totals</p>
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
            placeholder="Search Name..."
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

      {/* Members Table */}
      <div className="recent-activity-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Total Contribution</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  let statusClass = 'active';
                  if (member.status.toLowerCase() === 'on leave') statusClass = 'leave';
                  if (member.status.toLowerCase() === 'retired') statusClass = 'retired';

                  return (
                    <tr key={member.id}>
                      <td>
                        <div className="member-cell">
                          <div className="member-avatar">{member.avatar}</div>
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{member.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.department}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-tag ${statusClass}`}>
                          {member.status}
                        </span>
                      </td>
                      <td>
                        <span className="amount-text">{member.totalContribution}</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No faculty members found matching "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Modal: Add Member */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Faculty Member</h3>
              <button 
                className="btn-close-modal"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. Prof. Juan Luna"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
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
                <label>Initial Total Contribution (₱)</label>
                <input 
                  type="number" 
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
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

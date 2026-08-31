import React, { useState, useEffect, useRef } from 'react';
import { fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../api';
import { animatePageEntrance, animateTableRows, animateModalOpen, animateModalClose } from '../utils/animations';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const containerRef = useRef(null);
  const tableRef = useRef(null);
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  const loadAnnouncements = async () => {
    try {
      const res = await fetchAnnouncements();
      setAnnouncements(res?.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  useEffect(() => {
    if (containerRef.current) animatePageEntrance(containerRef.current);
  }, []);

  useEffect(() => {
    if (tableRef.current) animateTableRows(tableRef.current);
  }, [announcements]);

  useEffect(() => {
    if (showModal && modalRef.current) {
      animateModalOpen(modalRef.current, overlayRef.current);
    }
  }, [showModal]);

  const handleOpenModal = (announcement = null) => {
    if (announcement) {
      setEditingId(announcement.id);
      setTitle(announcement.title);
      setContent(announcement.content);
    } else {
      setEditingId(null);
      setTitle('');
      setContent('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (modalRef.current) {
      animateModalClose(modalRef.current, overlayRef.current, () => {
        setShowModal(false);
      });
    } else {
      setShowModal(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    
    try {
      if (editingId) {
        await updateAnnouncement(editingId, { title, content });
      } else {
        await createAnnouncement({ title, content });
      }
      await loadAnnouncements();
      handleCloseModal();
    } catch (err) {
      alert('Failed to save announcement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      await loadAnnouncements();
    } catch (err) {
      alert('Failed to delete announcement.');
    }
  };

  return (
    <div className="main-content" ref={containerRef}>
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Announcements</h1>
          <p>Broadcast updates and news to all faculty members</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal(null)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Announcement
        </button>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.875rem' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="recent-activity-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              ⏳ Loading announcements…
            </div>
          ) : (
            <table className="data-table" ref={tableRef}>
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Title</th>
                  <th style={{ width: '45%' }}>Content Preview</th>
                  <th style={{ width: '15%' }}>Date Posted</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.length > 0 ? (
                  announcements.map((item) => (
                    <tr key={item.id}>
                      <td><div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{item.title}</div></td>
                      <td>
                        <div style={{ 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          maxWidth: '400px',
                          color: 'var(--text-muted)',
                          fontSize: '0.875rem'
                        }}>
                          {item.content}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                          {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button className="btn-sm btn-outline" onClick={() => handleOpenModal(item)}>Edit</button>
                          <button className="btn-sm btn-danger" onClick={() => handleDelete(item.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No announcements posted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" ref={overlayRef}>
          <div className="modal-content" ref={modalRef} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Announcement' : 'Create Announcement'}</h3>
              <button className="btn-close-modal" onClick={handleCloseModal}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal-body-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Union General Assembly"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea
                  className="form-input"
                  placeholder="Type the announcement details here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="6"
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

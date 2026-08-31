import React, { useState, useEffect, useRef } from 'react';
import { fetchAnnouncements } from '../api';
import { animatePageEntrance } from '../utils/animations';

export default function FacultyAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchAnnouncements();
        setAnnouncements(res?.data || []);
      } catch (err) {
        console.error('Failed to load announcements', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      animatePageEntrance(containerRef.current);
    }
  }, []);

  return (
    <div className="main-content" ref={containerRef}>
      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div className="dashboard-header-text">
          <h1>Announcements</h1>
          <p>Important news and updates from the faculty union</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '80px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            ⏳ Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1', color: 'var(--text-muted)' }}>
            No announcements at this time.
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 8px 0' }}>
                {announcement.title}
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {new Date(announcement.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                <span style={{ margin: '0 4px' }}>•</span>
                <span style={{ color: 'var(--primary-maroon)', fontWeight: '600' }}>{announcement.author?.name || 'Admin'}</span>
              </div>
              <p style={{ 
                fontSize: '1rem', 
                lineHeight: '1.6', 
                color: 'var(--text-main)', 
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {announcement.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

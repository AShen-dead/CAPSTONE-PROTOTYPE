import React, { useState } from 'react';

export default function FacultySubmit({ onSubmitSuccess }) {
  const [activeToggle, setActiveToggle] = useState('Assistance request');
  const [categoryType, setCategoryType] = useState('Medical Assistance');
  const [reasonText, setReasonText] = useState('');
  const [amountVal, setAmountVal] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert(`Success! Your ${activeToggle.toLowerCase()} has been submitted for verification.`);
      setReasonText('');
      setAmountVal('');
      setUploadedFile(null);
      if (onSubmitSuccess) onSubmitSuccess();
    }, 600);
  };

  return (
    <main className="main-content">
      {/* Page Header */}
      <div className="dashboard-header" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div className="dashboard-header-text">
          <h1>Submit Application / Receipt</h1>
          <p>Submit a new benefit assistance request or upload proof of payment remittance</p>
        </div>
      </div>

      {/* Form Panel (Centered Fixed-Width Panel on Laptop) */}
      <div className="submit-form-panel">
        {/* Toggle Tabs */}
        <div className="filter-tabs" style={{ width: '100%', justifyContent: 'center' }}>
          <button 
            className={`filter-tab ${activeToggle === 'Assistance request' ? 'active' : ''}`}
            onClick={() => setActiveToggle('Assistance request')}
            style={{ flex: 1, textAlign: 'center' }}
          >
            Assistance Request
          </button>
          <button 
            className={`filter-tab ${activeToggle === 'Proof of payment' ? 'active' : ''}`}
            onClick={() => setActiveToggle('Proof of payment')}
            style={{ flex: 1, textAlign: 'center' }}
          >
            Proof of Payment
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Category Dropdown */}
          <div className="form-group">
            <label>{activeToggle === 'Assistance request' ? 'Benefit Category' : 'Payment Type'}</label>
            <select 
              className="form-select"
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value)}
            >
              {activeToggle === 'Assistance request' ? (
                <>
                  <option value="Medical Assistance">Medical Assistance</option>
                  <option value="Bereavement Assistance">Bereavement Assistance</option>
                  <option value="Educational Assistance">Educational Assistance</option>
                  <option value="Calamity Relief">Calamity Relief</option>
                </>
              ) : (
                <>
                  <option value="Monthly Contribution Dues">Monthly Contribution Dues</option>
                  <option value="Special Assessment Fee">Special Assessment Fee</option>
                </>
              )}
            </select>
          </div>

          {/* Amount Field */}
          <div className="form-group">
            <label>Amount (₱)</label>
            <input 
              type="number" 
              className="form-input" 
              placeholder="e.g. 5000.00"
              value={amountVal}
              onChange={(e) => setAmountVal(e.target.value)}
              required
            />
          </div>

          {/* Reason / Notes Textarea */}
          <div className="form-group">
            <label>{activeToggle === 'Assistance request' ? 'Reason / Details' : 'OR / Transaction Reference #'}</label>
            <textarea 
              className="form-input" 
              rows="3" 
              placeholder={activeToggle === 'Assistance request' ? 'Describe the situation or claim details...' : 'Enter official receipt or deposit reference #...'}
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* File Upload Area */}
          <div className="form-group">
            <label>Supporting Document / Proof</label>
            <label className="upload-dropzone">
              <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                {uploadedFile ? uploadedFile.name : 'Click or drop files to upload'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Supports PDF, PNG, JPG (Max 10MB)
              </div>
              <input 
                type="file" 
                style={{ display: 'none' }}
                onChange={(e) => setUploadedFile(e.target.files[0])}
              />
            </label>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {isSubmitting ? 'Submitting...' : `Submit ${activeToggle}`}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

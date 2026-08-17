import React, { useState } from 'react';

export default function FacultySubmit({ onSubmitSuccess }) {
  const [activeToggle, setActiveToggle] = useState('Proof of payment');
  const [categoryType, setCategoryType] = useState('Monthly Contribution Dues');
  const [reasonText, setReasonText] = useState('');
  const [amountVal, setAmountVal] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreviewUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // Create new payment record from faculty submission
      const newPayment = {
        id: Date.now(),
        member: 'Prof. Maria Santos',
        avatar: 'MS',
        type: categoryType === 'Monthly Contribution Dues' ? 'Contribution' : categoryType,
        refNo: reasonText.trim() || `REF-2026-0${Math.floor(100 + Math.random() * 900)}`,
        status: 'To verify',
        amount: `₱ ${parseFloat(amountVal || 500).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        proofUrl: filePreviewUrl || '/assets/login-bg.jpg',
        notes: reasonText || 'Faculty remitted proof of payment'
      };

      // Save to shared localStorage for Admin Manage Payments verification
      const existing = JSON.parse(localStorage.getItem('ucare_submitted_payments') || '[]');
      localStorage.setItem('ucare_submitted_payments', JSON.stringify([newPayment, ...existing]));

      setIsSubmitting(false);
      alert(`Success! Your ${activeToggle.toLowerCase()} (₱${amountVal}) has been submitted for admin verification.`);
      setReasonText('');
      setAmountVal('');
      setUploadedFile(null);
      setFilePreviewUrl(null);
      if (onSubmitSuccess) onSubmitSuccess();
    }, 500);
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
            type="button"
            className={`filter-tab ${activeToggle === 'Proof of payment' ? 'active' : ''}`}
            onClick={() => setActiveToggle('Proof of payment')}
            style={{ flex: 1, textAlign: 'center' }}
          >
            Proof of Payment
          </button>
          <button 
            type="button"
            className={`filter-tab ${activeToggle === 'Assistance request' ? 'active' : ''}`}
            onClick={() => setActiveToggle('Assistance request')}
            style={{ flex: 1, textAlign: 'center' }}
          >
            Assistance Request
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
              placeholder="e.g. 1500.00"
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
            <label>Supporting Document / Proof of Payment Image</label>
            <label className="upload-dropzone" style={{ borderStyle: uploadedFile ? 'solid' : 'dashed', borderColor: uploadedFile ? 'var(--primary-maroon)' : undefined }}>
              {filePreviewUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <img src={filePreviewUrl} alt="Receipt Preview" style={{ maxHeight: '140px', borderRadius: '6px', objectFit: 'contain' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary-maroon)' }}>{uploadedFile.name}</span>
                </div>
              ) : (
                <>
                  <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                    {uploadedFile ? uploadedFile.name : 'Click or drop payment receipt screenshot / photo'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Supports PNG, JPG, JPEG (Max 10MB)
                  </div>
                </>
              )}
              <input 
                type="file" 
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
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

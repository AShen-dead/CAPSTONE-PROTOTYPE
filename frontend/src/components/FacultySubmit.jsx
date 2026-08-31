import React, { useState } from 'react';
import { sendNotify } from '../api';

export default function FacultySubmit({ currentUser, onSubmitSuccess }) {
  const [activeToggle, setActiveToggle] = useState('Proof of payment');
  const [categoryType, setCategoryType] = useState('Monthly Contribution Dues');
  const [reasonText, setReasonText] = useState('');
  const [amountVal, setAmountVal] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialBenefitRequests = [
    {
      id: 1,
      memberName: 'Prof. Maria Santos',
      avatar: 'MS',
      benefitType: 'Medical Assistance',
      dateFiled: 'Jul 26, 2026',
      amountRequested: '₱ 15,000.00',
      status: 'Pending',
      attachment: 'Hospitalization_Record.pdf',
      notes: 'Hospitalization record attached for knee surgery.'
    },
    {
      id: 2,
      memberName: 'Dr. Juan Dela Cruz',
      avatar: 'JD',
      benefitType: 'Bereavement Assistance',
      dateFiled: 'Jul 24, 2026',
      amountRequested: '₱ 12,000.00',
      status: 'Pending',
      attachment: 'Death_Certificate_Copy.pdf',
      notes: 'Death certificate copy submitted for audit review.'
    },
    {
      id: 3,
      memberName: 'Prof. Elena Ramos',
      avatar: 'ER',
      benefitType: 'Educational Assistance',
      dateFiled: 'Jul 20, 2026',
      amountRequested: '₱ 8,500.00',
      status: 'Pending',
      attachment: 'Conference_Presentation.pdf',
      notes: 'International conference paper presentation registration fee.'
    },
    {
      id: 4,
      memberName: 'Engr. Roberto Garcia',
      avatar: 'RG',
      benefitType: 'Calamity Relief',
      dateFiled: 'Jul 15, 2026',
      amountRequested: '₱ 10,000.00',
      status: 'Approved',
      attachment: 'Calamity_Damage_Photos.pdf',
      notes: 'Typhoon damage assistance disbursement approved.'
    },
    {
      id: 5,
      memberName: 'Dr. Clarissa Reyes',
      avatar: 'CR',
      benefitType: 'Medical Assistance',
      dateFiled: 'Jul 10, 2026',
      amountRequested: '₱ 5,000.00',
      status: 'Declined',
      attachment: 'Outpatient_Receipt.pdf',
      notes: 'Outpatient prescription claim exceeded period cutoff.'
    }
  ];

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

  const handleToggleChange = (newMode) => {
    setActiveToggle(newMode);
    if (newMode === 'Assistance request') {
      setCategoryType('Medical Assistance');
    } else {
      setCategoryType('Monthly Contribution Dues');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const facultyName = currentUser?.name || 'Faculty Member';
    const userInitials = facultyName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'FM';

    try {
      if (activeToggle === 'Assistance request') {
        // ── Assistance request: still uses localStorage for now ──────────────
        const newRequest = {
          id: Date.now(),
          memberName: facultyName,
          avatar: userInitials,
          benefitType: categoryType,
          dateFiled: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          amountRequested: `₱ ${parseFloat(amountVal || 5000).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          status: 'Pending',
          attachment: uploadedFile ? uploadedFile.name : 'Application_Document.pdf',
          attachmentUrl: filePreviewUrl || '/assets/login-bg.jpg',
          notes: reasonText.trim() || 'Faculty submitted assistance application',
        };

        const existingStr = localStorage.getItem('ucare_benefit_requests');
        let existingRequests = initialBenefitRequests;
        if (existingStr) {
          try { existingRequests = JSON.parse(existingStr); } catch { existingRequests = initialBenefitRequests; }
        }
        localStorage.setItem('ucare_benefit_requests', JSON.stringify([newRequest, ...existingRequests]));
        window.dispatchEvent(new Event('ucare_requests_updated'));

        // Notify admins
        sendNotify({
          type:       'benefit_requested',
          title:      '📋 New Benefit Request Filed',
          message:    `${facultyName} filed a ${categoryType} request (₱${parseFloat(amountVal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}) pending review.`,
          action_tab: 'Approve Benefit Requests',
        }).catch(() => {});

        alert(`Success! Your assistance request for ${categoryType} (₱${amountVal}) has been submitted for admin approval.`);

      } else {
        // ── Proof of payment: save to real database via API ──────────────────
        const token = localStorage.getItem('ucare_token');

        // Use FormData so the proof image file can be uploaded
        const form = new FormData();
        form.append('amount',         amountVal || '0');
        form.append('payment_method', categoryType);
        form.append('reference_no',   reasonText.trim() || '');
        form.append('payment_date',   new Date().toISOString().split('T')[0]);
        if (uploadedFile) {
          form.append('proof_image', uploadedFile);
        }

        const response = await fetch('/api/faculty/submit-payment', {
          method:  'POST',
          headers: {
            'Accept':        'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: form,
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          const msg = data?.message || 'Submission failed. Please try again.';
          alert(`Error: ${msg}`);
          setIsSubmitting(false);
          return;
        }

        alert(`Success! Your proof of payment (₱${amountVal}) has been submitted and is now visible to the admin for verification.`);
      }

      // Reset form
      setReasonText('');
      setAmountVal('');
      setUploadedFile(null);
      setFilePreviewUrl(null);
      if (onSubmitSuccess) onSubmitSuccess();

    } catch (err) {
      alert('Could not connect to the server. Please make sure the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
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
            onClick={() => handleToggleChange('Proof of payment')}
            style={{ flex: 1, textAlign: 'center' }}
          >
            Proof of Payment
          </button>
          <button 
            type="button"
            className={`filter-tab ${activeToggle === 'Assistance request' ? 'active' : ''}`}
            onClick={() => handleToggleChange('Assistance request')}
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

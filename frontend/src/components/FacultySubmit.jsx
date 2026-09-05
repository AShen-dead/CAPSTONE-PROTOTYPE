import React, { useState, useEffect } from 'react';
import { sendNotify, fetchContributionDrives, submitBenefitRequest, fetchBenefitTypes } from '../api';

export default function FacultySubmit({ currentUser, onSubmitSuccess }) {
  const [activeToggle, setActiveToggle] = useState('Proof of payment');
  const [categoryType, setCategoryType] = useState('Monthly Contribution Dues');
  const [selectedDriveId, setSelectedDriveId] = useState('');
  const [contributionDrives, setContributionDrives] = useState([]);
  const [loadingDrives, setLoadingDrives] = useState(false);
  const [reasonText, setReasonText] = useState('');
  const [amountVal, setAmountVal] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadDrives = async () => {
      setLoadingDrives(true);
      try {
        const res = await fetchContributionDrives();
        setContributionDrives(res?.data || []);
      } catch (err) {
        console.error("Failed to load contribution drives", err);
      } finally {
        setLoadingDrives(false);
      }
    };
    loadDrives();
  }, []);

  const [benefitTypesList, setBenefitTypesList] = useState([
    'Death Aid / Mortuary',
    'Medical Assistance',
    'Surgical Assistance',
    'Retirement Assistance',
    'Pabaon',
    'Calamity Relief',
    'Educational Assistance',
  ]);

  useEffect(() => {
    fetchBenefitTypes({ status: 'Active' })
      .then(res => {
        if (res?.data && res.data.length > 0) {
          setBenefitTypesList(res.data.map(b => b.benefit_name));
        }
      })
      .catch(() => {});
  }, []);

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
        // ── Assistance request: save to real database via API ──────────────
        const formData = new FormData();
        formData.append('benefit_type', categoryType);
        if (amountVal) formData.append('amount_requested', amountVal);
        formData.append('reason', reasonText.trim() || 'Faculty submitted assistance application');
        if (uploadedFile) {
          formData.append('document', uploadedFile);
        }

        await submitBenefitRequest(formData);

        window.dispatchEvent(new Event('ucare_requests_updated'));

        // Notify admins
        sendNotify({
          type:       'benefit_requested',
          title:      '📋 New Benefit Request Filed',
          message:    `${facultyName} filed a ${categoryType} request pending review.`,
          action_tab: 'Approve Benefit Requests',
        }).catch(() => {});

        alert(`Success! Your assistance request for ${categoryType} has been submitted for admin approval.`);

      } else {
        // ── Proof of payment: save to real database via API ──────────────────
        const token = localStorage.getItem('ucare_token');

        // Determine payment method label
        let paymentMethodLabel = categoryType;
        if (selectedDriveId) {
          const matchedDrive = contributionDrives.find(d => String(d.id) === String(selectedDriveId));
          if (matchedDrive) {
            paymentMethodLabel = matchedDrive.beneficiary_name 
              ? `${matchedDrive.beneficiary_name} (${matchedDrive.benefit_type || 'Aid'})`
              : matchedDrive.title;
          }
        }

        // Use FormData so the proof image file can be uploaded
        const form = new FormData();
        form.append('amount',         amountVal || '0');
        form.append('payment_method', paymentMethodLabel);
        form.append('reference_no',   reasonText.trim() || '');
        form.append('payment_date',   new Date().toISOString().split('T')[0]);
        if (selectedDriveId) {
          form.append('announcement_id', selectedDriveId);
        }
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
      setSelectedDriveId('');
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
          
          {/* Payment Purpose / Contribution Drive Selector */}
          {activeToggle === 'Proof of payment' ? (
            <div className="form-group">
              <label>Payment Purpose / Beneficiary Aid Drive</label>
              <select 
                className="form-select"
                value={selectedDriveId}
                onChange={(e) => {
                  setSelectedDriveId(e.target.value);
                  if (!e.target.value) {
                    setCategoryType('Monthly Contribution Dues');
                  }
                }}
              >
                <option value="">-- General / Monthly Contribution Dues --</option>
                {contributionDrives.map(drive => (
                  <option key={drive.id} value={drive.id}>
                    🤝 {drive.beneficiary_name ? `${drive.beneficiary_name} — (${drive.benefit_type || 'Aid'})` : drive.title}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {contributionDrives.length > 0 
                  ? 'Select an announced beneficiary aid drive if this payment is for specific aid' 
                  : 'No active contribution drives announced at this time'}
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label>Benefit Category</label>
              <select 
                className="form-select"
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value)}
              >
                {benefitTypesList.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Amount Field — only for Proof of Payment */}
          {activeToggle === 'Proof of payment' && (
            <div className="form-group">
              <label>Amount (₱)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="e.g. 500.00"
                value={amountVal}
                onChange={(e) => setAmountVal(e.target.value)}
                required
              />
            </div>
          )}

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

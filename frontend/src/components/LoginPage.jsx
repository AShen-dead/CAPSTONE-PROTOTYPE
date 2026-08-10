import React, { useState } from 'react';
import { login, setAuth } from '../api';
import './LoginPage.css';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await login(email, password);
      setAuth(response.token, response.user);
      onLoginSuccess(response.user);
    } catch (err) {
      if (err.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.status === 422) {
        const messages = err.data?.errors
          ? Object.values(err.data.errors).flat().join(' ')
          : 'Validation error. Please check your input.';
        setError(messages);
      } else {
        setError('Cannot connect to the server. Make sure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Panel — Branding */}
      <div className="login-brand-panel">
        <div className="login-brand-content">
          <div className="login-logo-badge">U.C.A.R.E</div>
          <h1 className="login-brand-title">
            ISPSC Tagudin<br />Federated Faculty Union
          </h1>
          <p className="login-brand-subtitle">
            Compensation &amp; Assistance Records Engine
          </p>

          <div className="login-brand-features">
            <div className="login-feature-item">
              <span className="login-feature-icon">💰</span>
              <span>Contribution tracking &amp; payments</span>
            </div>
            <div className="login-feature-item">
              <span className="login-feature-icon">📋</span>
              <span>Benefit requests &amp; approvals</span>
            </div>
            <div className="login-feature-item">
              <span className="login-feature-icon">👥</span>
              <span>Faculty member management</span>
            </div>
            <div className="login-feature-item">
              <span className="login-feature-icon">📊</span>
              <span>Reports &amp; analytics</span>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="login-brand-circle login-brand-circle--1" />
        <div className="login-brand-circle login-brand-circle--2" />
        <div className="login-brand-circle login-brand-circle--3" />
      </div>

      {/* Right Panel — Login Form */}
      <div className="login-form-panel">
        <div className="login-card">
          {/* Header */}
          <div className="login-card-header">
            <div className="login-card-logo">
              <span>U</span>
            </div>
            <h2 className="login-card-title">Welcome Back</h2>
            <p className="login-card-subtitle">Sign in to your U.C.A.R.E account</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="login-error-banner" role="alert">
              <span className="login-error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label className="login-label" htmlFor="login-email">
                Email Address
              </label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">✉️</span>
                <input
                  id="login-email"
                  type="email"
                  className="login-input"
                  placeholder="you@ucare.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="login-field">
              <div className="login-label-row">
                <label className="login-label" htmlFor="login-password">
                  Password
                </label>
              </div>
              <div className="login-input-wrapper">
                <span className="login-input-icon">🔒</span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`login-btn${loading ? ' login-btn--loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Test credentials hint */}
          <div className="login-hint">
            <p className="login-hint-title">Test Credentials</p>
            <div className="login-hint-row">
              <span className="login-hint-badge login-hint-badge--admin">Admin</span>
              <code>admin@ucare.local</code>
              <span className="login-hint-sep">/</span>
              <code>password</code>
            </div>
            <div className="login-hint-row">
              <span className="login-hint-badge login-hint-badge--faculty">Faculty</span>
              <code>faculty@ucare.local</code>
              <span className="login-hint-sep">/</span>
              <code>password</code>
            </div>
          </div>

          <p className="login-footer-text">
            U.C.A.R.E &copy; {new Date().getFullYear()} — ISPSC Tagudin Faculty Union
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

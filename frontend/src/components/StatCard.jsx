import React from 'react';

export default function StatCard({ 
  headerTitle, 
  value, 
  subtitle, 
  trendText, 
  trendPositive = true,
  chartType = 'bar',
  isMainFocus = false
}) {
  // Pastel SaaS icon container background & icon color mapping
  const iconStyle = chartType === 'area' 
    ? { bg: '#E8F5E9', iconColor: '#2E7D32', border: '#C8E6C9' } // Forest Green Accent
    : { bg: '#E0F2FE', iconColor: '#0284C7', border: '#BAE6FD' }; // Sky Blue Accent

  return (
    <div className={`dashboard-card ${isMainFocus ? 'main-focus-card' : ''}`}>
      <div className="card-header-label">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: iconStyle.bg,
            border: `1px solid ${iconStyle.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconStyle.iconColor
          }}>
            {chartType === 'area' ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            )}
          </div>
          <span>{headerTitle}</span>
        </div>

        {trendText && (
          <span className={`trend-badge ${trendPositive ? 'positive' : ''}`}>
            {trendPositive ? '↑' : '↓'} {trendText}
          </span>
        )}
      </div>

      <div className="card-value">{value}</div>
      {subtitle && <div className="card-subtitle">{subtitle}</div>}

      {/* Metric SVG visual */}
      <div className="chart-placeholder">
        {chartType === 'area' ? (
          <svg className="chart-svg-mock" viewBox="0 0 300 90" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2E7D32" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2E7D32" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path 
              d="M 0 75 Q 45 35 90 55 T 180 25 T 270 40 T 300 20 L 300 90 L 0 90 Z" 
              fill="url(#areaGradient)" 
            />
            <path 
              d="M 0 75 Q 45 35 90 55 T 180 25 T 270 40 T 300 20" 
              fill="none" 
              stroke="#2E7D32" 
              strokeWidth="2.5" 
            />
            <circle cx="90" cy="55" r="4" fill="#2E7D32" />
            <circle cx="180" cy="25" r="4" fill="#2E7D32" />
            <circle cx="270" cy="40" r="4" fill="#2E7D32" />
          </svg>
        ) : (
          <svg className="chart-svg-mock" viewBox="0 0 200 90" fill="none">
            <rect x="15" y="45" width="18" height="40" rx="3" fill="#BAE6FD" />
            <rect x="45" y="30" width="18" height="55" rx="3" fill="#38BDF8" />
            <rect x="75" y="55" width="18" height="30" rx="3" fill="#BAE6FD" />
            <rect x="105" y="20" width="18" height="65" rx="3" fill="#0284C7" />
            <rect x="135" y="35" width="18" height="50" rx="3" fill="#BAE6FD" />
            <rect x="165" y="10" width="18" height="75" rx="3" fill="#0369A1" />
          </svg>
        )}
        <span className="chart-watermark">
          {chartType === 'area' ? 'Monthly Activity Trend' : 'Cumulative Growth Analytics'}
        </span>
      </div>
    </div>
  );
}

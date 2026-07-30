import React from 'react';

export default function StatCard({ 
  headerTitle, 
  value, 
  subtitle, 
  trendText, 
  trendPositive = true,
  chartType = 'bar',
  isMainFocus = false,
  data = [120, 145, 130, 175, 210, 245] // Future backend ready dynamic data array
}) {
  // Rich Maroon & Emerald Green color styling for metric icons
  const iconStyle = chartType === 'area' 
    ? { bg: '#FDF2F5', iconColor: '#8B1E3F', border: '#F8D7E0' } // Rich Maroon Primary Accent
    : { bg: '#E8F6EF', iconColor: '#2E8B57', border: '#C1E6D0' }; // Emerald Green Secondary Accent

  // Helper for dynamic SVG Area Curve generation based on data prop
  const renderAreaChart = () => {
    const maxVal = Math.max(...data, 1);
    const width = 300;
    const height = 80;
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - (val / maxVal) * (height - 15);
      return `${x},${y}`;
    });

    const dPath = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
    const strokePath = `M ${points.join(' L ')}`;

    return (
      <svg className="chart-svg-mock" viewBox={`0 0 ${width} ${height}`} fill="none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="dynamicAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B1E3F" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8B1E3F" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={dPath} fill="url(#dynamicAreaGrad)" />
        <path d={strokePath} fill="none" stroke="#8B1E3F" strokeWidth="2.5" />
        {data.map((val, idx) => {
          const x = (idx / (data.length - 1)) * width;
          const y = height - (val / maxVal) * (height - 15);
          return (
            <circle key={idx} cx={x} cy={y} r="3.5" fill="#8B1E3F" />
          );
        })}
      </svg>
    );
  };

  // Helper for dynamic SVG Bar Chart generation based on data prop
  const renderBarChart = () => {
    const maxVal = Math.max(...data, 1);
    const barWidth = 18;
    const gap = 12;
    const height = 80;

    return (
      <svg className="chart-svg-mock" viewBox="0 0 200 80" fill="none">
        {data.map((val, idx) => {
          const barHeight = Math.max(10, (val / maxVal) * 65);
          const x = 12 + idx * (barWidth + gap);
          const y = height - barHeight;
          const isHighest = val === maxVal;
          return (
            <rect
              key={idx}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="3"
              fill={isHighest ? '#2E8B57' : '#C1E6D0'}
            />
          );
        })}
      </svg>
    );
  };

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

      {/* Backend Ready Reactive Chart Rendering */}
      <div className="chart-placeholder">
        {chartType === 'area' ? renderAreaChart() : renderBarChart()}
        <span className="chart-watermark">
          {chartType === 'area' ? 'Monthly Activity Trend' : 'Cumulative Growth Analytics'}
        </span>
      </div>
    </div>
  );
}

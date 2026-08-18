import React, { useState, useEffect, useRef } from 'react';
import { animateNumberCounter } from '../utils/animations';

export default function StatCard({ 
  headerTitle, 
  value, 
  subtitle, 
  trendText, 
  trendPositive = true,
  chartType = 'bar',
  isMainFocus = false,
  data = [110000, 135000, 120000, 155000, 165000, 145800], // Dynamic backend ready data
  labels = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], // Dynamic month labels
  currencySymbol = '₱ '
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const valueRef = useRef(null);

  useEffect(() => {
    if (valueRef.current && value) {
      animateNumberCounter(valueRef.current, value);
    }
  }, [value]);

  // Icon styling mapping
  const iconStyle = chartType === 'area' 
    ? { bg: '#FDF2F5', iconColor: '#8B1E3F', border: '#F8D7E0' }
    : { bg: '#E8F6EF', iconColor: '#2E8B57', border: '#C1E6D0' };

  // Format numbers cleanly
  const formatVal = (val) => `${currencySymbol}${val.toLocaleString('en-US')}`;

  // Area Curve Renderer with Tooltip & Labels
  const renderAreaChart = () => {
    const maxVal = Math.max(...data, 1);
    const width = 320;
    const height = 90;
    const padding = 12;

    const points = data.map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
      const y = height - 20 - (val / maxVal) * (height - 35);
      return { x, y, val, label: labels[idx] || `Pt ${idx + 1}` };
    });

    const dPath = `M ${points[0].x},${height - 20} L ${points.map(p => `${p.x},${p.y}`).join(' L ')} L ${points[points.length - 1].x},${height - 20} Z`;
    const strokePath = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <svg className="chart-svg-mock" viewBox={`0 0 ${width} ${height}`} fill="none">
          <defs>
            <linearGradient id="areaGradInteractive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B1E3F" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8B1E3F" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Gridline */}
          <line x1="0" y1={height - 20} x2={width} y2={height - 20} stroke="#E2E8F0" strokeDasharray="3 3" />

          {/* Area Fill & Curve Line */}
          <path d={dPath} fill="url(#areaGradInteractive)" />
          <path d={strokePath} fill="none" stroke="#8B1E3F" strokeWidth="2.5" />

          {/* Points & Interactive Tooltip Triggers */}
          {points.map((pt, idx) => (
            <g key={idx} onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === idx ? "5" : "3.5"}
                fill={hoveredIndex === idx ? "#6E1731" : "#8B1E3F"}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
              />
              {/* X Axis Labels */}
              <text
                x={pt.x}
                y={height - 4}
                textAnchor="middle"
                fontSize="9"
                fill="#64748B"
                fontWeight="600"
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && (
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            fontSize: '0.72rem',
            padding: '4px 8px',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            pointerEvents: 'none',
            zIndex: 10
          }}>
            <strong>{labels[hoveredIndex]}:</strong> {formatVal(data[hoveredIndex])}
          </div>
        )}
      </div>
    );
  };

  // Bar Chart Renderer with Tooltip & Labels
  const renderBarChart = () => {
    const maxVal = Math.max(...data, 1);
    const height = 90;
    const barWidth = 22;
    const gap = 16;
    const startX = 14;

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <svg className="chart-svg-mock" viewBox="0 0 240 90" fill="none">
          {/* Baseline Gridline */}
          <line x1="0" y1={height - 20} x2="240" y2={height - 20} stroke="#E2E8F0" strokeDasharray="3 3" />

          {data.map((val, idx) => {
            const barHeight = Math.max(12, (val / maxVal) * (height - 35));
            const x = startX + idx * (barWidth + gap);
            const y = height - 20 - barHeight;
            const isHovered = hoveredIndex === idx;
            const isHighest = val === maxVal;

            return (
              <g 
                key={idx} 
                onMouseEnter={() => setHoveredIndex(idx)} 
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  fill={isHovered ? '#1B5E20' : isHighest ? '#2E8B57' : '#C1E6D0'}
                  style={{ transition: 'all 0.15s ease' }}
                />
                {/* X Axis Labels */}
                <text
                  x={x + barWidth / 2}
                  y={height - 4}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#64748B"
                  fontWeight="600"
                >
                  {labels[idx] || `M${idx + 1}`}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && (
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            fontSize: '0.72rem',
            padding: '4px 8px',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            pointerEvents: 'none',
            zIndex: 10
          }}>
            <strong>{labels[hoveredIndex]}:</strong> {formatVal(data[hoveredIndex])}
          </div>
        )}
      </div>
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

      <div className="card-value" ref={valueRef}>{value}</div>
      {subtitle && <div className="card-subtitle">{subtitle}</div>}

      {/* Backend Ready Dynamic SVG Chart with Interactive Tooltips */}
      <div className="chart-placeholder">
        {chartType === 'area' ? renderAreaChart() : renderBarChart()}
        <span className="chart-watermark">
          {chartType === 'area' ? 'Monthly Activity Trend' : 'Cumulative Growth Analytics'}
        </span>
      </div>
    </div>
  );
}

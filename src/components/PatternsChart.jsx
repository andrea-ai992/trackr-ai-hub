import React from 'react';

const PatternsChart = () => {
  const patterns = [
    { id: 'head-shoulders', name: 'Head & Shoulders', confidence: 0.85, svg: (
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 60 L40 40 L60 40 L80 60 L60 80 L40 80 Z" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M20 60 Q40 20 60 60" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <circle cx="30" cy="50" r="2" fill="#00ff88"/>
        <circle cx="50" cy="50" r="2" fill="#00ff88"/>
        <circle cx="70" cy="50" r="2" fill="#00ff88"/>
      </svg>
    )},
    { id: 'double-top', name: 'Double Top', confidence: 0.78, svg: (
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 40 L40 20 L60 20 L80 40" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M60 20 L80 20 L100 40" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <circle cx="30" cy="30" r="2" fill="#00ff88"/>
        <circle cx="50" cy="30" r="2" fill="#00ff88"/>
        <circle cx="70" cy="30" r="2" fill="#00ff88"/>
        <circle cx="90" cy="30" r="2" fill="#00ff88"/>
      </svg>
    )},
    { id: 'double-bottom', name: 'Double Bottom', confidence: 0.82, svg: (
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 60 L40 80 L60 80 L80 60" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M60 80 L80 80 L100 60" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <circle cx="30" cy="70" r="2" fill="#00ff88"/>
        <circle cx="50" cy="70" r="2" fill="#00ff88"/>
        <circle cx="70" cy="70" r="2" fill="#00ff88"/>
        <circle cx="90" cy="70" r="2" fill="#00ff88"/>
      </svg>
    )},
    { id: 'ascending-triangle', name: 'Ascending Triangle', confidence: 0.91, svg: (
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 20 L100 20" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M20 20 L20 60" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M20 60 L100 60" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M40 20 L40 40" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M60 20 L60 40" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M80 20 L80 40" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <circle cx="30" cy="40" r="2" fill="#00ff88"/>
        <circle cx="50" cy="40" r="2" fill="#00ff88"/>
        <circle cx="70" cy="40" r="2" fill="#00ff88"/>
        <circle cx="90" cy="40" r="2" fill="#00ff88"/>
      </svg>
    )},
    { id: 'descending-triangle', name: 'Descending Triangle', confidence: 0.89, svg: (
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 60 L100 60" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M20 20 L20 60" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M20 20 L100 20" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M40 40 L40 60" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M60 40 L60 60" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M80 40 L80 60" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <circle cx="30" cy="30" r="2" fill="#00ff88"/>
        <circle cx="50" cy="30" r="2" fill="#00ff88"/>
        <circle cx="70" cy="30" r="2" fill="#00ff88"/>
        <circle cx="90" cy="30" r="2" fill="#00ff88"/>
      </svg>
    )},
    { id: 'symmetrical-triangle', name: 'Symmetrical Triangle', confidence: 0.87, svg: (
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 40 L60 20 L100 40 L60 60 Z" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <circle cx="40" cy="30" r="2" fill="#00ff88"/>
        <circle cx="60" cy="30" r="2" fill="#00ff88"/>
        <circle cx="80" cy="30" r="2" fill="#00ff88"/>
        <circle cx="40" cy="50" r="2" fill="#00ff88"/>
        <circle cx="60" cy="50" r="2" fill="#00ff88"/>
        <circle cx="80" cy="50" r="2" fill="#00ff88"/>
      </svg>
    )},
    { id: 'wedge-up', name: 'Rising Wedge', confidence: 0.84, svg: (
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 60 L60 20 L100 20 L60 60 Z" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <circle cx="40" cy="40" r="2" fill="#00ff88"/>
        <circle cx="60" cy="40" r="2" fill="#00ff88"/>
        <circle cx="80" cy="40" r="2" fill="#00ff88"/>
        <circle cx="40" cy="60" r="2" fill="#00ff88"/>
        <circle cx="60" cy="60" r="2" fill="#00ff88"/>
        <circle cx="80" cy="60" r="2" fill="#00ff88"/>
      </svg>
    )},
    { id: 'wedge-down', name: 'Falling Wedge', confidence: 0.86, svg: (
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 20 L60 60 L100 60 L60 20 Z" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <circle cx="40" cy="20" r="2" fill="#00ff88"/>
        <circle cx="60" cy="20" r="2" fill="#00ff88"/>
        <circle cx="80" cy="20" r="2" fill="#00ff88"/>
        <circle cx="40" cy="40" r="2" fill="#00ff88"/>
        <circle cx="60" cy="40" r="2" fill="#00ff88"/>
        <circle cx="80" cy="40" r="2" fill="#00ff88"/>
      </svg>
    )},
    { id: 'cup-handle', name: 'Cup & Handle', confidence: 0.79, svg: (
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 60 Q40 40 60 60 Q80 40 100 60" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M50 60 L50 70 L70 70 L70 60" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <circle cx="30" cy="50" r="2" fill="#00ff88"/>
        <circle cx="50" cy="50" r="2" fill="#00ff88"/>
        <circle cx="70" cy="50" r="2" fill="#00ff88"/>
        <circle cx="90" cy="50" r="2" fill="#00ff88"/>
      </svg>
    )},
    { id: 'pennant', name: 'Pennant', confidence: 0.83, svg: (
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 40 L60 20 L100 40 L60 60 Z" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <circle cx="40" cy="30" r="2" fill="#00ff88"/>
        <circle cx="60" cy="30" r="2" fill="#00ff88"/>
        <circle cx="80" cy="30" r="2" fill="#00ff88"/>
        <circle cx="40" cy="50" r="2" fill="#00ff88"/>
        <circle cx="60" cy="50" r="2" fill="#00ff88"/>
        <circle cx="80" cy="50" r="2" fill="#00ff88"/>
      </svg>
    )},
    { id: 'flag', name: 'Flag', confidence: 0.92, svg: (
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 20 L20 60 L100 60 L100 20 Z" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M20 40 L100 40" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <circle cx="30" cy="30" r="2" fill="#00ff88"/>
        <circle cx="50" cy="30" r="2" fill="#00ff88"/>
        <circle cx="70" cy="30" r="2" fill="#00ff88"/>
        <circle cx="90" cy="30" r="2" fill="#00ff88"/>
        <circle cx="30" cy="50" r="2" fill="#00ff88"/>
        <circle cx="50" cy="50" r="2" fill="#00ff88"/>
        <circle cx="70" cy="50" r="2" fill="#00ff88"/>
        <circle cx="90" cy="50" r="2" fill="#00ff88"/>
      </svg>
    )},
    { id: 'channel-up', name: 'Up Channel', confidence: 0.88, svg: (
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 20 L100 20" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M20 60 L100 60" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M20 20 L20 60" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M40 20 L40 50" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M60 20 L60 50" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M80 20 L80 50" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <circle cx="30" cy="40" r="2" fill="#00ff88"/>
        <circle cx="50" cy="40" r="2" fill="#00ff88"/>
        <circle cx="70" cy="40" r="2" fill="#00ff88"/>
        <circle cx="90" cy="40" r="2" fill="#00ff88"/>
      </svg>
    )},
    { id: 'channel-down', name: 'Down Channel', confidence: 0.9, svg: (
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 60 L100 60" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M20 20 L100 20" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M20 60 L20 20" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M40 30 L40 60" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M60 30 L60 60" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <path d="M80 30 L80 60" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <circle cx="30" cy="50" r="2" fill="#00ff88"/>
        <circle cx="50" cy="50" r="2" fill="#00ff88"/>
        <circle cx="70" cy="50" r="2" fill="#00ff88"/>
        <circle cx="90" cy="50" r="2" fill="#00ff88"/>
      </svg>
    )},
    { id: 'triangle-top', name: 'Triangle Top', confidence: 0.81, svg: (
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 20 L60 60 L100 20" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <circle cx="40" cy="40" r="2" fill="#00ff88"/>
        <circle cx="60" cy="40" r="2" fill="#00ff88"/>
        <circle cx="80" cy="40" r="2" fill="#00ff88"/>
      </svg>
    )},
    { id: 'triangle-bottom', name: 'Triangle Bottom', confidence: 0.8, svg: (
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 60 L60 20 L100 60" stroke="#00ff88" strokeWidth="1" fill="none"/>
        <circle cx="40" cy="40" r="2" fill="#00ff88"/>
        <circle cx="60" cy="40" r="2" fill="#00ff88"/>
        <circle cx="80" cy="40" r="2" fill="#00ff88"/>
      </svg>
    )}
  ];

  return (
    <div className="patterns-chart" style={{
      fontFamily: 'JetBrains Mono, monospace',
      backgroundColor: 'var(--surface)',
      color: 'var(--text-primary)',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid var(--border)',
      width: '100%',
      maxWidth: '375px',
      margin: '0 auto'
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '16px',
        fontWeight: '400',
        color: 'var(--neon)',
        borderBottom: '1px solid var(--border-bright)',
        paddingBottom: '8px'
      }}>
        Chart Patterns
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
      }}>
        {patterns.map((pattern) => (
          <div
            key={pattern.id}
            style={{
              backgroundColor: 'var(--surface-low)',
              borderRadius: '6px',
              padding: '12px',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: '12px',
                fontWeight: '500',
                color: 'var(--neon)'
              }}>
                {pattern.name}
              </span>
              <span style={{
                fontSize: '10px',
                color: 'var(--text-secondary)'
              }}>
                {Math.round(pattern.confidence * 100)}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '60px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {pattern.svg}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatternsChart;
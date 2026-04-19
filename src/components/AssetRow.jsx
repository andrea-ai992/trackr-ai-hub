// src/components/AssetRow.jsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const AssetRow = ({ asset }) => {
  const isPositive = asset.change >= 0;
  const changeColor = isPositive ? 'var(--neon)' : '#ff4444';
  const changeIcon = isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />;

  return (
    <div className="asset-row" style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      borderBottom: '1px solid var(--border)',
      gap: '8px',
      height: '48px',
      transition: 'background 0.1s',
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        minWidth: '60px',
      }}>
        {asset.ticker}
      </div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '13px',
        color: 'var(--text-secondary)',
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {asset.name}
      </div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '16px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        minWidth: '80px',
        textAlign: 'right',
      }}>
        {asset.price}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        minWidth: '60px',
        justifyContent: 'flex-end',
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '12px',
          fontWeight: '600',
          color: changeColor,
        }}>
          {changeIcon}
          {Math.abs(asset.change)}%
        </div>
      </div>
      <div style={{
        width: '48px',
        height: '24px',
        background: 'linear-gradient(90deg, var(--neon-glow-soft) 0%, transparent 100%)',
        borderRadius: '4px',
      }}></div>
    </div>
  );
};

export default AssetRow;
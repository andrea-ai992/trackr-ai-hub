// src/components/DashboardHero.jsx
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function DashboardHero({ portfolio }) {
  const [pnl, setPnl] = useState(0);
  const [pnlChange, setPnlChange] = useState(0);

  useEffect(() => {
    if (!portfolio) return;

    const total = portfolio.reduce((acc, asset) => acc + (asset.value || 0), 0);
    const prevTotal = portfolio.reduce((acc, asset) => acc + (asset.prevValue || 0), 0);
    const change = ((total - prevTotal) / prevTotal) * 100;

    setPnl(total.toFixed(2));
    setPnlChange(change);
  }, [portfolio]);

  const isPositive = pnlChange >= 0;
  const pnlColor = isPositive ? 'var(--green)' : 'var(--red)';
  const pnlIcon = isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />;

  return (
    <div className="dashboard-hero">
      <div className="hero-card">
        <div className="hero-header">
          <span>Portfolio</span>
        </div>
        <div className="hero-content">
          <div className="hero-total">
            <span className="total-value">${pnl}</span>
            <div className="pnl-change" style={{ color: pnlColor }}>
              {pnlIcon}
              <span>{pnlChange.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
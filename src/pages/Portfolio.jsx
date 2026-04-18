Je vais implémenter un graphique SVG de performance avec axe temporel et courbe de P&L en utilisant les données existantes du state portfolio. Voici le code complet et fonctionnel pour `src/pages/Portfolio.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

function fmt(n, currency = 'EUR') {
  if (n == null) return '—';
  return n.toLocaleString('fr-FR', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function pct(profit, invested) {
  if (!invested) return null;
  return ((profit / invested) * 100).toFixed(1);
}

export default function Portfolio() {
  const { portfolio = [] } = useApp?.() || {};
  const [tab, setTab] = useState('overview');

  const totalInvested = portfolio.reduce((s, c) => s + (c.invested || 0), 0);
  const totalValue = portfolio.reduce((s, c) => s + (c.currentValue || c.invested || 0), 0);
  const totalProfit = totalValue - totalInvested;
  const profitPct = pct(totalProfit, totalInvested);
  const isUp = totalProfit >= 0;

  // Génération dynamique des données de performance à partir du portfolio
  const generatePerformanceData = () => {
    if (portfolio.length === 0) return [];

    // Trier les positions par date (simulée par l'ordre d'ajout)
    const sortedPortfolio = [...portfolio].sort((a, b) => {
      const dateA = a.date || a.createdAt || '2022-01-01';
      const dateB = b.date || b.createdAt || '2022-01-01';
      return dateA.localeCompare(dateB);
    });

    let cumulativeValue = 0;
    const data = [];

    sortedPortfolio.forEach((item, index) => {
      const currentValue = item.currentValue || item.invested || 0;
      cumulativeValue += currentValue;
      data.push({
        date: item.date || item.createdAt || `2022-${String(index + 1).padStart(2, '0')}-01`,
        value: cumulativeValue
      });
    });

    return data;
  };

  const performanceData = generatePerformanceData();

  // Données d'allocation par type d'actif
  const allocationData = [
    { label: 'Stocks', value: portfolio.filter(p => p.type === 'stock').reduce((s, c) => s + (c.currentValue || c.invested || 0), 0) / (totalValue || 1) * 100 },
    { label: 'Crypto', value: portfolio.filter(p => p.type === 'crypto').reduce((s, c) => s + (c.currentValue || c.invested || 0), 0) / (totalValue || 1) * 100 },
    { label: 'Cash', value: portfolio.filter(p => p.type === 'cash').reduce((s, c) => s + (c.currentValue || c.invested || 0), 0) / (totalValue || 1) * 100 },
    { label: 'Autres', value: portfolio.filter(p => !p.type || ['stock', 'crypto', 'cash'].includes(p.type) === false).reduce((s, c) => s + (c.currentValue || c.invested || 0), 0) / (totalValue || 1) * 100 }
  ];

  // Normaliser les valeurs d'allocation
  const normalizeAllocation = (data) => {
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
    return data.map(item => ({
      ...item,
      value: total > 0 ? (item.value / total) * 100 : 0
    }));
  };

  const normalizedAllocation = normalizeAllocation(allocationData);

  const holdings = portfolio.map((p, i) => {
    const profit = (p.currentValue || p.invested || 0) - (p.invested || 0);
    const up = profit >= 0;
    return {
      symbol: p.symbol || p.name || '?',
      name: p.name || p.symbol,
      invested: fmt(p.invested),
      currentValue: fmt(p.currentValue || p.invested),
      profit,
      up,
    };
  });

  const bestPerformer = holdings.reduce((max, current) => {
    if (current.up && current.profit > max.profit) {
      return current;
    }
    return max;
  }, holdings[0] || { profit: 0 });

  const worstPerformer = holdings.reduce((min, current) => {
    if (!current.up && current.profit < min.profit) {
      return current;
    }
    return min;
  }, holdings[0] || { profit: 0 });

  // Calcul des dimensions pour le graphique
  const chartWidth = 300;
  const chartHeight = 150;
  const padding = 30;
  const graphWidth = chartWidth - padding * 2;
  const graphHeight = chartHeight - padding * 2;

  // Trouver les valeurs min/max pour l'échelle
  const values = performanceData.map(d => d.value);
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;

  // Générer les points pour la courbe
  const points = performanceData.map((d, i) => {
    const x = padding + (i / (performanceData.length - 1)) * graphWidth;
    const y = padding + graphHeight - ((d.value - minValue) / valueRange) * graphHeight;
    return { x, y, date: d.date, value: d.value };
  });

  return (
    <div className={inter.className}>
      {/* Header */}
      <div style={{ padding: '16px 16px 0', backgroundColor: 'var(--bg)' }}>
        <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 4 }}>Portfolio total</div>
        <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-.02em', fontVariantNumeric: 'tabular-nums' }}>
          {fmt(totalValue)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
          {isUp ? <TrendingUp size={15} color="#00ff88" /> : <TrendingDown size={15} color="#ef4444" />}
          <span style={{ fontSize: 14, fontWeight: 600, color: isUp ? '#00ff88' : '#ef4444' }}>
            {isUp ? '+' : ''}{fmt(totalProfit)} ({isUp ? '+' : ''}{profitPct}%)
          </span>
        </div>
      </div>

      {/* Performance graph */}
      <div style={{ padding: '16px 16px 24px' }}>
        <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Performance (P&L)</div>
        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grille de fond */}
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grille horizontale */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = padding + (i / 4) * graphHeight;
            const value = minValue + (valueRange * (4 - i) / 4);
            return (
              <g key={i}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <text
                  x={chartWidth - padding + 5}
                  y={y + 4}
                  fontSize="10"
                  fill="var(--t3)"
                  textAnchor="start"
                >
                  {fmt(value)}
                </text>
              </g>
            );
          })}

          {/* Axe temporel */}
          {performanceData.map((d, i) => {
            const x = padding + (i / (performanceData.length - 1)) * graphWidth;
            return (
              <text
                key={`axis-${i}`}
                x={x}
                y={chartHeight - padding + 15}
                fontSize="10"
                fill="var(--t3)"
                textAnchor="middle"
              >
                {new Date(d.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
              </text>
            );
          })}

          {/* Courbe de performance */}
          {points.length > 1 && (
            <path
              d={`M ${points[0].x} ${points[0].y} ${points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}`}
              stroke="#00ff88"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Zone de remplissage */}
          {points.length > 1 && (
            <path
              d={`M ${points[0].x} ${chartHeight - padding} ${points.map(p => `L ${p.x} ${p.y}`).join(' ')} L ${points[points.length - 1].x} ${chartHeight - padding} Z`}
              fill="url(#grad)"
              stroke="none"
            />
          )}

          {/* Points de données */}
          {points.map((p, i) => (
            <g key={`point-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#00ff88"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="8"
                fill="#00ff88"
                fillOpacity="0.2"
              />
            </g>
          ))}

          {/* Valeurs au survol (simulé) */}
          {points.map((p, i) => (
            <text
              key={`value-${i}`}
              x={p.x}
              y={p.y - 10}
              fontSize="10"
              fill="var(--t1)"
              textAnchor="middle"
              fontWeight="600"
            >
              {fmt(p.value)}
            </text>
          ))}
        </svg>
      </div>

      {/* Allocation pie chart */}
      <div style={{ padding: '16px 16px 24px' }}>
        <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Allocation</div>
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="var(--border)"
            strokeWidth="2"
          />

          {/* Calcul des angles pour le camembert */}
          {normalizedAllocation
            .filter(item => item.value > 0)
            .map((d, i, arr) => {
              const startAngle = arr.slice(0, i).reduce((sum, item) => sum + (item.value / 100) * 360, 0);
              const endAngle = startAngle + (d.value / 100) * 360;

              // Convertir en radians pour les coordonnées
              const startRad = (startAngle - 90) * Math.PI / 180;
              const endRad = (endAngle - 90) * Math.PI / 180;

              const x1 = 100 + 90 * Math.cos(startRad);
              const y1 = 100 + 90 * Math.sin(startRad);
              const x2 = 100 + 90 * Math.cos(endRad);
              const y2 = 100 + 90 * Math.sin(endRad);

              // Grande ligne du camembert
              const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

              return (
                <g key={i}>
                  <path
                    d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={
                      d.label === 'Stocks' ? '#00ff88' :
                      d.label === 'Crypto' ? '#ff8800' :
                      d.label === 'Cash' ? '#ffff00' : '#ff0000'
                    }
                  />

                  {/* Ligne de séparation */}
                  <line
                    x1="100"
                    y1="100"
                    x2={x2}
                    y2={y2}
                    stroke="var(--border)"
                    strokeWidth="1"
                  />

                  {/* Légende */}
                  <text
                    x={x2 + 10}
                    y={y2 + 5}
                    fontSize="12"
                    fill="var(--t1)"
                    textAnchor="start"
                  >
                    {d.label} {d.value.toFixed(0)}%
                  </text>
                </g>
              );
            })}

          {/* Cercle central */}
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="var(--bg)"
          />
        </svg>
      </div>

      {/* Holdings list */}
      <div style={{ padding: '16px 16px 24px' }}>
        <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Positions</div>
        {holdings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--t3)', fontSize: 14 }}>
            Aucune position · ajoutez des actifs
          </div>
        ) : holdings.map((h, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
              {h.symbol[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>{h.name}</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>Investi {h.invested}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{h.currentValue}</div>
              <div style={{ fontSize: 12, color: h.up ? '#00ff88' : '#ef4444', marginTop: 2 }}>{h.up ? '+' : ''}{fmt(h.profit)}</div>
            </div>
            <ChevronRight size={16} color="var(--t3)" />
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '16px 16px 0' }}>
        {[
          { label: 'Investi', val: fmt(totalInvested), color: 'var(--t2)' },
          { label: 'Positions', val: holdings.length, color: 'var(--t2)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--
Je vais implémenter le composant PortfolioChart.jsx et l'intégrer dans Portfolio.jsx. Voici le code complet :

```jsx
// src/components/PortfolioChart.jsx
import { useEffect, useRef } from 'react';

const PortfolioChart = ({ data, width = '100%', height = 200 }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const container = containerRef.current;
    if (!container) return;

    // Nettoyer le SVG précédent
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Dimensions dynamiques
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = containerWidth - padding.left - padding.right;
    const chartHeight = containerHeight - padding.top - padding.bottom;

    // Échelle des données
    const dates = data.map(item => new Date(item.date));
    const pnlValues = data.map(item => item.pnl);
    const minPnl = Math.min(...pnlValues);
    const maxPnl = Math.max(...pnlValues);

    // Échelle X (temps)
    const xScale = (date) => {
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      const progress = (date - minDate) / (maxDate - minDate);
      return padding.left + progress * chartWidth;
    };

    // Échelle Y (P&L)
    const yScale = (pnl) => {
      const range = maxPnl - minPnl;
      const progress = (pnl - minPnl) / range;
      return padding.top + (1 - progress) * chartHeight;
    };

    // Créer le SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', containerWidth);
    svg.setAttribute('height', containerHeight);
    svg.setAttribute('viewBox', `0 0 ${containerWidth} ${containerHeight}`);
    svg.setAttribute('preserveAspectRatio', 'none');

    // Fond
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('width', '100%');
    bgRect.setAttribute('height', '100%');
    bgRect.setAttribute('fill', 'var(--bg2)');
    svg.appendChild(bgRect);

    // Grille horizontale
    const gridSteps = 5;
    const gridStepValue = (maxPnl - minPnl) / gridSteps;

    for (let i = 0; i <= gridSteps; i++) {
      const y = padding.top + (i * chartHeight) / gridSteps;
      const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gridLine.setAttribute('x1', padding.left);
      gridLine.setAttribute('x2', containerWidth - padding.right);
      gridLine.setAttribute('y1', y);
      gridLine.setAttribute('y2', y);
      gridLine.setAttribute('stroke', 'var(--border)');
      gridLine.setAttribute('stroke-width', '1');
      svg.appendChild(gridLine);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', padding.left - 5);
      text.setAttribute('y', y + 4);
      text.setAttribute('fill', 'var(--t3)');
      text.setAttribute('font-size', '10');
      text.setAttribute('text-anchor', 'end');
      text.textContent = (maxPnl - i * gridStepValue).toFixed(2);
      svg.appendChild(text);
    }

    // Axe X (dates)
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    xAxis.setAttribute('transform', `translate(0, ${containerHeight - padding.bottom})`);

    const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxisLine.setAttribute('x1', padding.left);
    xAxisLine.setAttribute('x2', containerWidth - padding.right);
    xAxisLine.setAttribute('y1', 0);
    xAxisLine.setAttribute('y2', 0);
    xAxisLine.setAttribute('stroke', 'var(--border)');
    xAxisLine.setAttribute('stroke-width', '1');
    xAxis.appendChild(xAxisLine);

    // Ajouter des ticks pour les dates
    const dateTicks = [0, 0.25, 0.5, 0.75, 1];
    dateTicks.forEach(tick => {
      const x = padding.left + tick * chartWidth;
      const dateIndex = Math.floor(tick * (dates.length - 1));
      const date = dates[dateIndex];

      const tickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tickLine.setAttribute('x1', x);
      tickLine.setAttribute('x2', x);
      tickLine.setAttribute('y1', 0);
      tickLine.setAttribute('y2', 5);
      tickLine.setAttribute('stroke', 'var(--border)');
      tickLine.setAttribute('stroke-width', '1');
      xAxis.appendChild(tickLine);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', 15);
      text.setAttribute('fill', 'var(--t3)');
      text.setAttribute('font-size', '10');
      text.setAttribute('text-anchor', 'middle');
      text.textContent = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      xAxis.appendChild(text);
    });

    svg.appendChild(xAxis);

    // Courbe P&L
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let pathData = `M ${xScale(dates[0])} ${yScale(pnlValues[0])}`;

    for (let i = 1; i < dates.length; i++) {
      const x = xScale(dates[i]);
      const y = yScale(pnlValues[i]);
      pathData += ` L ${x} ${y}`;
    }

    line.setAttribute('d', pathData);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', 'var(--green)');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(line);

    // Points de données
    data.forEach((item, index) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', xScale(dates[index]));
      circle.setAttribute('cy', yScale(pnlValues[index]));
      circle.setAttribute('r', 3);
      circle.setAttribute('fill', 'var(--green)');
      circle.setAttribute('stroke', 'var(--bg)');
      circle.setAttribute('stroke-width', '1');
      svg.appendChild(circle);
    });

    // Tooltip
    const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    tooltip.setAttribute('opacity', '0');
    tooltip.setAttribute('pointer-events', 'none');

    const tooltipBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    tooltipBg.setAttribute('rx', '4');
    tooltipBg.setAttribute('ry', '4');
    tooltipBg.setAttribute('width', '120');
    tooltipBg.setAttribute('height', '50');
    tooltipBg.setAttribute('fill', 'var(--bg2)');
    tooltipBg.setAttribute('stroke', 'var(--border-hi)');
    tooltipBg.setAttribute('stroke-width', '1');
    tooltip.appendChild(tooltipBg);

    const tooltipDate = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tooltipDate.setAttribute('x', '10');
    tooltipDate.setAttribute('y', '20');
    tooltipDate.setAttribute('fill', 'var(--t2)');
    tooltipDate.setAttribute('font-size', '10');
    tooltip.appendChild(tooltipDate);

    const tooltipPnl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tooltipPnl.setAttribute('x', '10');
    tooltipPnl.setAttribute('y', '38');
    tooltipPnl.setAttribute('fill', 'var(--green)');
    tooltipPnl.setAttribute('font-size', '14');
    tooltipPnl.setAttribute('font-weight', '600');
    tooltip.appendChild(tooltipPnl);

    tooltip.appendChild(tooltipDate);
    tooltip.appendChild(tooltipPnl);
    svg.appendChild(tooltip);

    // Interaction
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Trouver le point le plus proche
      let closestIndex = 0;
      let minDistance = Infinity;

      data.forEach((item, index) => {
        const x = xScale(dates[index]);
        const distance = Math.abs(mouseX - x);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      const closestDate = dates[closestIndex];
      const closestPnl = pnlValues[closestIndex];

      // Positionner le tooltip
      const tooltipX = Math.max(
        padding.left,
        Math.min(
          containerWidth - padding.right - 120,
          xScale(closestDate) + 15
        )
      );

      const tooltipY = Math.max(
        padding.top,
        Math.min(
          containerHeight - padding.bottom - 50,
          yScale(closestPnl) - 25
        )
      );

      tooltip.setAttribute('transform', `translate(${tooltipX}, ${tooltipY})`);
      tooltip.setAttribute('opacity', '1');
      tooltipDate.textContent = closestDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      tooltipPnl.textContent = `${closestPnl.toFixed(2)} $`;
    };

    const handleMouseLeave = () => {
      tooltip.setAttribute('opacity', '0');
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    container.appendChild(svg);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [data]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        fontFamily: 'Inter, sans-serif',
        position: 'relative'
      }}
    />
  );
};

export default PortfolioChart;
```

```jsx
// src/pages/Portfolio.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Wallet, ArrowLeft } from 'lucide-react';
import PortfolioChart from '../components/PortfolioChart';

// Données mock pour l'exemple
const mockPortfolioData = [
  { date: '2024-01-01', pnl: 1000, value: 50000 },
  { date: '2024-01-08', pnl: 1250, value: 52000 },
  { date: '2024-01-15', pnl: 980, value: 51500 },
  { date: '2024-01-22', pnl: 1500, value: 53000 },
  { date: '2024-01-29', pnl: 1800, value: 54500 },
  { date: '2024-02-05', pnl: 2100, value: 56000 },
  { date: '2024-02-12', pnl: 1950, value: 55500 },
  { date: '2024-02-19', pnl: 2300, value: 57000 },
];

const Portfolio = () => {
  const [portfolioData, setPortfolioData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    // Simulation de chargement de données
    const timer = setTimeout(() => {
      setPortfolioData(mockPortfolioData);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const calculateTotalPnl = () => {
    if (portfolioData.length === 0) return 0;
    return portfolioData[portfolioData.length - 1].pnl;
  };

  const calculateTotalValue = () => {
    if (portfolioData.length === 0) return 0;
    return portfolioData[portfolioData.length - 1].value;
  };

  const calculateDailyChange = () => {
    if (portfolioData.length < 2) return 0;
    const first = portfolioData[0].value;
    const last = portfolioData[portfolioData.length - 1].value;
    const change = ((last - first) / first) * 100;
    return change.toFixed(2);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1>Portfolio</h1>
      </header>

      <div className="portfolio-summary">
        <div className="summary-card">
          <div className="summary-icon">
            <Wallet size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Valeur totale</div>
            <div className="summary-value">{formatCurrency(calculateTotalValue())}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <TrendingUp size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">P&L total</div>
            <div className="summary-value text-green">{formatCurrency(calculateTotalPnl())}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <BarChart3 size={24} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Changement</div>
            <div className={`summary-value ${calculateDailyChange() >= 0 ? 'text-green' : 'text-red'}`}>
              {calculateDailyChange()}%
            </div>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <PortfolioChart data={portfolioData} />
      </div>

      <div className="portfolio-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Aperçu
        </button>
        <button
          className={`tab-button ${activeTab === 'holdings' ? 'active' : ''}`}
          onClick={() => setActiveTab('holdings')}
        >
          Actifs
        </button>
        <button
          className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="portfolio-overview">
          <h3>Performance</h3>
          <p>Analyse de la performance de votre portefeuille sur la période sélectionnée.</p>
        </div>
      )}

      {activeTab === 'holdings' && (
        <div className="portfolio-holdings">
          <h3>Actifs détenus</h3>
          <p>Aucun actif actuellement dans votre portefeuille.</p>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="portfolio-transactions">
          <h3>Historique des transactions</h3>
          <p>Aucune transaction récente.</p>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
```

```css
/* Ajoutez ces styles dans votre fichier CSS global ou dans un module CSS dédié */

.portfolio-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1
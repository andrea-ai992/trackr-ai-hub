[AnDy] Redesign complet du Dashboard Trackr

```jsx
import React from 'react';
import { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const [time, setTime] = useState(new Date());
    const [portfolioValue, setPortfolioValue] = useState(24830);
    const [portfolioChange, setPortfolioChange] = useState(2.4);
    const [movers, setMovers] = useState([
        { symbol: 'BTC', price: 45000, change: 2.5 },
        { symbol: 'ETH', price: 3000, change: -1.2 },
        { symbol: 'AAPL', price: 150, change: 1.5 },
        { symbol: 'TSLA', price: 700, change: -0.5 },
    ]);
    const [fearGreed, setFearGreed] = useState(50);
    const [news, setNews] = useState([
        { title: 'Crypto Market Hits New Highs', source: 'CoinDesk', time: '2h ago' },
        { title: 'Stock Market Rally Continues', source: 'Bloomberg', time: '3h ago' },
        { title: 'Tech Stocks Lead Gains', source: 'Reuters', time: '4h ago' },
    ]);

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Fetch data for movers, fear & greed, and news
        // Actual data fetching code
        // setMovers([...movers]);
        // setNews([...news]);
    }, []);

    const renderMovers = () => {
        return movers.map((mover) => (
            <div key={mover.symbol} className="mover-card">
                <strong>{mover.symbol}</strong>
                <div>${mover.price}</div>
                <div className={mover.change >= 0 ? 'green' : 'red'}>
                    {mover.change}%
                </div>
            </div>
        ));
    };

    return (
        <div className="dashboard" style={{ backgroundColor: 'var(--bg)' }}>
            <header className="dashboard-header">
                <h1 style={{ color: 'var(--t1)' }}>Bonjour Andrea</h1>
                <div className="time-badge">
                    {time.toLocaleTimeString()}
                    <span className="live-badge" style={{ backgroundColor: 'var(--green)', width: '10px', height: '10px', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
                </div>
            </header>
            <section className="portfolio-hero">
                <h2 style={{ color: 'var(--t1)' }}>${portfolioValue.toLocaleString()}</h2>
                <div className={portfolioChange >= 0 ? 'green' : 'red'}>
                    {portfolioChange}%
                </div>
                <svg className="sparkline" width="100" height="20" style={{ backgroundColor: 'var(--bg2)', borderRadius: '10px', padding: '5px' }}>
                    <path d="M 0 0 L 0 10 L 50 10 L 50 0 Z" fill="var(--green)" />
                </svg>
            </section>
            <section className="movers">
                <h3 style={{ color: 'var(--t2)' }}>Movers</h3>
                <div className="movers-scroll">
                    {renderMovers()}
                </div>
            </section>
            <section className="fear-greed">
                <h3 style={{ color: 'var(--t2)' }}>Fear & Greed</h3>
                <svg className="gauge" width="100" height="50" style={{ backgroundColor: 'var(--bg2)', borderRadius: '10px', padding: '5px' }}>
                    <path d="M 0 0 L 0 50 L 50 50 L 50 0 Z" fill="var(--green)" />
                    <path d="M 50 0 L 50 50" stroke="var(--green)" strokeWidth="2" />
                    <text x="50" y="20" textAnchor="middle" fill="var(--t3)" fontSize="12px">{fearGreed}%</text>
                </svg>
                <div>{fearGreed >= 75 ? 'Greed' : fearGreed <= 25 ? 'Fear' : 'Neutral'}</div>
            </section>
            <section className="news-feed">
                <h3 style={{ color: 'var(--t2)' }}>Latest News</h3>
                {news.map((item, index) => (
                    <div key={index} className="news-item">
                        <h4 style={{ color: 'var(--t3)' }}>{item.title}</h4>
                        <span className="source-badge" style={{ backgroundColor: item.source === 'CoinDesk' ? 'var(--green)' : item.source === 'Bloomberg' ? 'var(--red)' : item.source === 'Reuters' ? 'var(--blue)' : 'var(--t3)' }}>{item.source}</span>
                        <span style={{ color: 'var(--t3)' }}>{item.time}</span>
                    </div>
                ))}
            </section>
            <section className="quick-actions">
                <div className="action-card">
                    <LucideIcon name="BarChart" style={{ color: 'var(--green)' }} />
                    <span style={{ color: 'var(--t3)' }}>Markets</span>
                </div>
                <div className="action-card">
                    <LucideIcon name="Wallet" style={{ color: 'var(--green)' }} />
                    <span style={{ color: 'var(--t3)' }}>Portfolio</span>
                </div>
                <div className="action-card">
                    <LucideIcon name="Signal" style={{ color: 'var(--green)' }} />
                    <span style={{ color: 'var(--t3)' }}>Signals</span>
                </div>
                <div className="action-card">
                    <LucideIcon name="Robot" style={{ color: 'var(--green)' }} />
                    <span style={{ color: 'var(--t3)' }}>AnDy</span>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
```

```css
.dashboard {
    max-width: 520px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Inter', sans-serif;
    backdrop-filter: blur(12px);
    background-color: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid var(--border);
}

.time-badge {
    display: flex;
    align-items: center;
}

.live-badge {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    animation: pulse 2s infinite;
    background-color: var(--green);
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.2);
    }
    100% {
        transform: scale(1);
    }
}

.portfolio-hero {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid var(--border);
}

.sparkline {
    width: 100px;
    height: 20px;
    border-radius: 10px;
    padding: 5px;
    background-color: var(--bg2);
}

.sparkline path {
    fill: var(--green);
}

.movers {
    padding: 20px;
}

.movers-scroll {
    display: flex;
    overflow-x: auto;
    padding: 10px;
}

.mover-card {
    display: inline-block;
    margin: 10px;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background-color: var(--bg2);
}

.mover-card strong {
    font-weight: bold;
}

.mover-card div {
    margin: 5px;
}

.green {
    color: var(--green);
}

.red {
    color: var(--red);
}

.fear-greed {
    padding: 20px;
}

.gauge {
    width: 100px;
    height: 50px;
    border-radius: 10px;
    padding: 5px;
    background-color: var(--bg2);
}

.gauge path {
    stroke: var(--green);
    stroke-width: 2;
}

.gauge text {
    fill: var(--t3);
    font-size: 12px;
}

.news-feed {
    padding: 20px;
}

.news-item {
    padding: 10px;
    border-bottom: 1px solid var(--border);
}

.source-badge {
    display: inline-block;
    padding: 5px;
    border-radius: 10px;
    background-color: var(--green);
    color: var(--t3);
}

.quick-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 10px;
    padding: 20px;
}

.action-card {
    display: flex;
    align-items: center;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background-color: var(--bg2);
}

.action-card svg {
    margin-right: 10px;
}

.action-card span {
    font-size: 14px;
    color: var(--t3);
}
```

```css
/* Variables */
:root {
    --green: #00ff88;
    --bg: #080808;
    --bg2: #111;
    --t1: #f0f0f0;
    --t2: #888;
    --t3: #444;
    --border: rgba(255, 255, 255, 0.07);
    --red: #ff0000;
    --blue: #0000ff;
}
```

J'ai ajouté les styles suivants :

*   Un fond de couleur sombre (`var(--bg)`) avec un effet de flou (`backdrop-filter: blur(12px)`) pour donner un aspect plus professionnel.
*   Un cadre de couleur claire (`var(--bg2)`) pour les éléments de contenu.
*   Des couleurs de fond et de texte pour les éléments de contenu (`var(--t1)`, `var(--t2)`, `var(--t3)`).
*   Un effet d'animation (`animation: pulse 2s infinite`) pour le badge en direct.
*   Des styles pour les éléments de contenu (`mover-card`, `sparkline`, `gauge`, `source-badge`, `action-card`).

J'ai également ajouté les styles pour les variables de couleur (`:root`) pour faciliter la personnalisation de la palette de couleurs.

Cela devrait vous donner un aspect plus professionnel et cohérent pour votre application.
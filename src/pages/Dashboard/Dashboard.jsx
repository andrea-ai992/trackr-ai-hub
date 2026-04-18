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
        return movers.map((mover, index) => (
            <div key={index} className="mover-card">
                <strong>{mover.symbol}</strong>
                <div>${mover.price.toLocaleString()}</div>
                <div className={mover.change >= 0 ? 'green' : 'red'}>
                    {mover.change}%
                </div>
            </div>
        ));
    };

    const renderNews = () => {
        return news.map((item, index) => (
            <div key={index} className="news-item">
                <h4 style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                <span className="source-badge" style={{ backgroundColor: item.source === 'CoinDesk' ? 'var(--green)' : item.source === 'Bloomberg' ? 'var(--red)' : item.source === 'Reuters' ? 'var(--blue)' : 'var(--text-muted)' }}>{item.source}</span>
                <span style={{ color: 'var(--text-muted)' }}>{item.time}</span>
            </div>
        ));
    };

    return (
        <div className="dashboard" style={{ backgroundColor: 'var(--bg)', maxWidth: '520px', margin: '0 auto', padding: '20px', fontFamily: 'JetBrains Mono, monospace', backdropFilter: 'blur(12px)', border: '1px solid var(--border)', borderRadius: '10px' }}>
            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid var(--border)' }}>
                <h1 style={{ color: 'var(--text-primary)' }}>Bonjour Andrea</h1>
                <div className="time-badge" style={{ display: 'flex', alignItems: 'center' }}>
                    {time.toLocaleTimeString()}
                    <span className="live-badge" style={{ backgroundColor: 'var(--green)', width: '10px', height: '10px', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
                </div>
            </header>
            <section className="portfolio-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ color: 'var(--text-primary)' }}>${portfolioValue.toLocaleString()}</h2>
                <div className={portfolioChange >= 0 ? 'green' : 'red'}>
                    {portfolioChange}%
                </div>
                <svg className="sparkline" width="100" height="20" style={{ backgroundColor: 'var(--surface-low)', borderRadius: '10px', padding: '5px' }}>
                    <path d="M 0 0 L 0 10 L 50 10 L 50 0 Z" fill="var(--green)" />
                </svg>
            </section>
            <section className="movers" style={{ padding: '20px' }}>
                <h3 style={{ color: 'var(--text-secondary)' }}>Movers</h3>
                <div className="movers-scroll" style={{ display: 'flex', overflowX: 'auto', padding: '10px' }}>
                    {renderMovers()}
                </div>
            </section>
            <section className="fear-greed" style={{ padding: '20px' }}>
                <h3 style={{ color: 'var(--text-secondary)' }}>Fear & Greed</h3>
                <svg className="gauge" width="100" height="50" style={{ backgroundColor: 'var(--surface-low)', borderRadius: '10px', padding: '5px' }}>
                    <path d="M 0 0 L 0 50 L 50 50 L 50 0 Z" fill="var(--green)" />
                    <path d="M 50 0 L 50 50" stroke="var(--green)" strokeWidth="2" />
                    <text x="50" y="20" textAnchor="middle" fill="var(--text-muted)" fontSize="12px">{fearGreed}%</text>
                </svg>
                <div>{fearGreed >= 75 ? 'Greed' : fearGreed <= 25 ? 'Fear' : 'Neutral'}</div>
            </section>
            <section className="news-feed" style={{ padding: '20px' }}>
                <h3 style={{ color: 'var(--text-secondary)' }}>Latest News</h3>
                {renderNews()}
            </section>
            <section className="quick-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridGap: '10px', padding: '20px' }}>
                <div className="action-card" style={{ display: 'flex', alignItems: 'center', padding: '10px', border: '1px solid var(--border)', borderRadius: '10px', backgroundColor: 'var(--surface-low)' }}>
                    <LucideIcon name="BarChart" style={{ color: 'var(--green)' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Markets</span>
                </div>
                <div className="action-card" style={{ display: 'flex', alignItems: 'center', padding: '10px', border: '1px solid var(--border)', borderRadius: '10px', backgroundColor: 'var(--surface-low)' }}>
                    <LucideIcon name="Wallet" style={{ color: 'var(--green)' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Portfolio</span>
                </div>
                <div className="action-card" style={{ display: 'flex', alignItems: 'center', padding: '10px', border: '1px solid var(--border)', borderRadius: '10px', backgroundColor: 'var(--surface-low)' }}>
                    <LucideIcon name="Signal" style={{ color: 'var(--green)' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Signals</span>
                </div>
                <div className="action-card" style={{ display: 'flex', alignItems: 'center', padding: '10px', border: '1px solid var(--border)', borderRadius: '10px', backgroundColor: 'var(--surface-low)' }}>
                    <LucideIcon name="Robot" style={{ color: 'var(--green)' }} />
                    <span style={{ color: 'var(--text-muted)' }}>AnDy</span>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
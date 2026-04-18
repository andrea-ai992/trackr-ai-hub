import React from 'react';
import { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const [time, setTime] = useState(new Date());
    const [portfolioValue, setPortfolioValue] = useState(24830);
    const [portfolioChange, setPortfolioChange] = useState(2.4);
    const [movers, setMovers] = useState([]);
    const [fearGreed, setFearGreed] = useState(50);
    const [news, setNews] = useState([]);
    
    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Fetch data for movers, fear & greed, and news
        // Placeholder for actual data fetching
        setMovers([
            { symbol: 'BTC', price: 45000, change: 2.5 },
            { symbol: 'ETH', price: 3000, change: -1.2 },
            { symbol: 'AAPL', price: 150, change: 1.5 },
            { symbol: 'TSLA', price: 700, change: -0.5 },
        ]);
        setNews([
            { title: 'Crypto Market Hits New Highs', source: 'CoinDesk', time: '2h ago' },
            { title: 'Stock Market Rally Continues', source: 'Bloomberg', time: '3h ago' },
            { title: 'Tech Stocks Lead Gains', source: 'Reuters', time: '4h ago' },
        ]);
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
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Bonjour Andrea</h1>
                <div className="time-badge">
                    {time.toLocaleTimeString()}
                    <span className="live-badge"></span>
                </div>
            </header>
            <section className="portfolio-hero">
                <h2>${portfolioValue.toLocaleString()}</h2>
                <div className={portfolioChange >= 0 ? 'green' : 'red'}>
                    {portfolioChange}%
                </div>
                <svg className="sparkline" width="100" height="20">
                    {/* Placeholder for sparkline */}
                </svg>
            </section>
            <section className="movers">
                <h3>Movers</h3>
                <div className="movers-scroll">
                    {renderMovers()}
                </div>
            </section>
            <section className="fear-greed">
                <h3>Fear & Greed</h3>
                <svg className="gauge" width="100" height="50">
                    {/* Placeholder for gauge */}
                </svg>
                <div>{fearGreed >= 75 ? 'Greed' : fearGreed <= 25 ? 'Fear' : 'Neutral'}</div>
            </section>
            <section className="news-feed">
                <h3>Latest News</h3>
                {news.map((item, index) => (
                    <div key={index} className="news-item">
                        <h4>{item.title}</h4>
                        <span className="source-badge">{item.source}</span>
                        <span>{item.time}</span>
                    </div>
                ))}
            </section>
            <section className="quick-actions">
                <div className="action-card">
                    <LucideIcon name="BarChart" />
                    <span>Markets</span>
                </div>
                <div className="action-card">
                    <LucideIcon name="Wallet" />
                    <span>Portfolio</span>
                </div>
                <div className="action-card">
                    <LucideIcon name="Signal" />
                    <span>Signals</span>
                </div>
                <div className="action-card">
                    <LucideIcon name="Robot" />
                    <span>AnDy</span>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
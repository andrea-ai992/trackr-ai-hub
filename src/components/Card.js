import React from 'react';
import { useEffect, useState } from 'react';
import './Dashboard.css';
import Card from '../components/Card';
import Sparkline from '../components/Sparkline';
import TopMovers from '../components/TopMovers';
import FearGreedGauge from '../components/FearGreedGauge';
import NewsFeed from '../components/NewsFeed';
import QuickActions from '../components/QuickActions';

const Dashboard = () => {
    const [portfolioValue, setPortfolioValue] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch portfolio value and other data
        const fetchData = async () => {
            // Simulated fetch
            const value = await new Promise(resolve => setTimeout(() => resolve(10000), 1000));
            setPortfolioValue(value);
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="dashboard" style={{ backgroundColor: 'var(--bg)', color: 'var(--t1)' }}>
            {loading ? (
                <div className="skeleton-loader">Loading...</div>
            ) : (
                <div className="content">
                    <Card title="Portfolio Value" value={`$${portfolioValue}`} />
                    <Sparkline />
                    <TopMovers />
                    <FearGreedGauge />
                    <NewsFeed />
                    <QuickActions />
                </div>
            )}
        </div>
    );
};

export default Dashboard;

import React from 'react';
import './Card.css';

const Card = ({ title, value }) => {
    return (
        <div className="card" style={{ backgroundColor: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3>{title}</h3>
            <p>{value}</p>
        </div>
    );
};

export default Card;

import React from 'react';
import './BottomNav.css';
import { Link } from 'react-router-dom';

const BottomNav = () => {
    return (
        <nav className="bottom-nav" style={{ backgroundColor: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}>
            <Link to="/dashboard" className="nav-item">Dashboard</Link>
            <Link to="/markets" className="nav-item">Markets</Link>
            <Link to="/news" className="nav-item">News</Link>
            <Link to="/portfolio" className="nav-item">Portfolio</Link>
            <Link to="/more" className="nav-item">More</Link>
        </nav>
    );
};

export default BottomNav;

import React from 'react';
import './Markets.css';

const Markets = () => {
    return (
        <div className="markets" style={{ backgroundColor: 'var(--bg)', color: 'var(--t1)' }}>
            {/* Markets content goes here */}
        </div>
    );
};

export default Markets;

import './Dashboard.css';

.dashboard {
    max-width: 520px;
    margin: 0 auto;
    padding: 16px;
}

.content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.skeleton-loader {
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 75%);
    height: 200px;
    border-radius: 8px;
    animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
    0% {
        background-position: -200px 0;
    }
    100% {
        background-position: 200px 0;
    }
}

.card {
    padding: 16px;
    border-radius: 8px;
}

.bottom-nav {
    display: flex;
    justify-content: space-around;
    padding: 16px;
    border-radius: 24px;
}

.nav-item {
    color: var(--t1);
    text-decoration: none;
    padding: 8px;
}

.nav-item.active {
    color: var(--green);
}

.markets {
    max-width: 520px;
    margin: 0 auto;
    padding: 16px;
    background-color: var(--bg);
    color: var(--t1);
}
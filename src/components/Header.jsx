import React from 'react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Header from '../components/Header';
import { fetchPortfolio, fetchTopMovers, fetchNews, fetchFearGreed } from '../api'; // Assurez-vous que ces fonctions existent

const Dashboard = () => {
    const [portfolioValue, setPortfolioValue] = useState(null);
    const [topMovers, setTopMovers] = useState([]);
    const [news, setNews] = useState([]);
    const [fearGreed, setFearGreed] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const portfolio = await fetchPortfolio();
            const movers = await fetchTopMovers();
            const newsData = await fetchNews();
            const fearGreedData = await fetchFearGreed();

            setPortfolioValue(portfolio);
            setTopMovers(movers);
            setNews(newsData);
            setFearGreed(fearGreedData);
            setLoading(false);
        };

        fetchData();
    }, []);

    return (
        <div style={{ backgroundColor: 'var(--bg)', color: 'var(--t1)', padding: '16px', maxWidth: '520px', margin: '0 auto' }}>
            <Header />
            {loading ? (
                <div className="skeleton shimmer" style={{ height: '200px', marginBottom: '20px' }}></div>
            ) : (
                <div className="hero-card" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)', padding: '20px', borderRadius: '8px' }}>
                    <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold', fontSize: '2rem' }}>${portfolioValue?.total}</h2>
                    <span style={{ color: portfolioValue?.variation > 0 ? 'var(--green)' : 'red' }}>
                        {portfolioValue?.variation}%
                        <span className={`arrow ${portfolioValue?.variation > 0 ? 'up' : 'down'}`}></span>
                    </span>
                    <svg width="100" height="20">
                        {/* Mini sparkline SVG 7 jours */}
                    </svg>
                </div>
            )}
            <div className="top-movers" style={{ overflowX: 'auto', display: 'flex', margin: '20px 0' }}>
                {topMovers.map((mover) => (
                    <div key={mover.id} className="mover-card" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)', marginRight: '10px', padding: '10px', borderRadius: '8px' }}>
                        <div style={{ color: mover.change > 0 ? 'var(--green)' : 'red' }}>{mover.symbol}</div>
                        <div>${mover.price}</div>
                        <div>{mover.change}%</div>
                    </div>
                ))}
            </div>
            <div className="fear-greed" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                <svg width="100" height="100">
                    {/* SVG semicircular gauge */}
                </svg>
                <div>{fearGreed?.value}</div>
            </div>
            <div className="news-feed" style={{ margin: '20px 0' }}>
                {news.map((item) => (
                    <div key={item.id} className="news-item" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)', borderRadius: '8px', padding: '10px', marginBottom: '10px' }}>
                        <span style={{ color: item.sourceColor }}>{item.source}</span>
                        <h4>{item.title}</h4>
                        <span>{item.timeAgo}</span>
                    </div>
                ))}
            </div>
            <div className="quick-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div className="action-card" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                    <i className="lucide lucide-market" /> Markets
                </div>
                <div className="action-card" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                    <i className="lucide lucide-portfolio" /> Portfolio
                </div>
                <div className="action-card" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                    <i className="lucide lucide-signal" /> Signals
                </div>
                <div className="action-card" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                    <i className="lucide lucide-ai" /> AnDy
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
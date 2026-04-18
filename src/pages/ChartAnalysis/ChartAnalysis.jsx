Je vais créer le hook `useAbortableFetch` et l'intégrer dans ChartAnalysis. Voici le code complet et fonctionnel :

src/hooks/useAbortableFetch.js
```javascript
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useAbortableFetch = (initialTimeout = 10000) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timeoutError, setTimeoutError] = useState(false);

    const fetchData = useCallback(async (url, config = {}) => {
        setLoading(true);
        setError(null);
        setTimeoutError(false);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), initialTimeout);

            const response = await axios({
                method: config.method || 'POST',
                url,
                data: config.data,
                signal: controller.signal,
                ...config
            });

            clearTimeout(timeoutId);

            if (response.data) {
                setData(response.data);
                return response.data;
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                setTimeoutError(true);
                setError("Le serveur a mis trop de temps à répondre. Veuillez réessayer.");
            } else {
                setError("Erreur lors de la requête: " + (error.response?.data?.message || error.message));
            }
            console.error("Erreur lors de la requête:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [initialTimeout]);

    return { data, loading, error, timeoutError, fetchData };
};

export default useAbortableFetch;
```

src/pages/ChartAnalysis/ChartAnalysis.jsx
```javascript
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import useAbortableFetch from '../../hooks/useAbortableFetch';
import './ChartAnalysis.css';

const ChartAnalysis = () => {
    const { ticker, timeframe } = useParams();
    const [historicalAnalyses, setHistoricalAnalyses] = useState([]);
    const widgetRef = useRef(null);

    const { data: analysis, loading, error, timeoutError, fetchData } = useAbortableFetch(10000);

    const fetchAnalysis = async () => {
        await fetchData('/api/brain', {
            data: {
                ticker: ticker,
                timeframe: timeframe,
                prompt: `Analyse le chart de ${ticker} en ${timeframe}, identifie les niveaux clés, patterns, support/résistance, et donne une recommendation`
            }
        });

        if (analysis) {
            setHistoricalAnalyses(prev => [analysis, ...prev].slice(0, 3));
        }
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => {
            if (widgetRef.current && ticker) {
                new window.TradingView.widget({
                    autosize: true,
                    symbol: ticker,
                    interval: timeframe,
                    timezone: "Etc/UTC",
                    theme: "dark",
                    style: "1",
                    locale: "fr",
                    toolbar_bg: "#f1f3f6",
                    enable_publishing: false,
                    allow_symbol_change: true,
                    container_id: "tradingview-widget-container"
                });
            }
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
            if (widgetRef.current) {
                widgetRef.current.innerHTML = '';
            }
        };
    }, [ticker, timeframe]);

    return (
        <div className="chart-analysis">
            <div className="tradingview-widget">
                <div id="tradingview-widget-container">
                    {loading && (
                        <div className="tradingview-skeleton">
                            <div className="skeleton-line" style={{ width: '20%', height: '20px', marginBottom: '12px' }}></div>
                            <div className="skeleton-line" style={{ width: '25%', height: '16px', marginBottom: '12px' }}></div>
                            <div className="skeleton-line" style={{ width: '30%', height: '16px', marginBottom: '12px' }}></div>
                            <div className="skeleton-line" style={{ width: '100%', height: '300px', marginBottom: '12px' }}></div>
                            <div className="skeleton-line" style={{ width: '20%', height: '16px' }}></div>
                        </div>
                    )}
                </div>
            </div>
            <div className="analysis-section">
                <button
                    className="analyze-button"
                    onClick={fetchAnalysis}
                    disabled={loading}
                >
                    {loading ? 'Analyse en cours...' : 'Analyser ce chart'}
                </button>

                {timeoutError && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {error && !timeoutError && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {loading && !error && (
                    <div className="loading-skeleton">
                        <div className="skeleton-card">
                            <div className="skeleton-line" style={{ width: '30%', height: '24px', marginBottom: '16px' }}></div>
                            <div className="skeleton-line" style={{ width: '80%', height: '16px', marginBottom: '8px' }}></div>
                            <div className="skeleton-line" style={{ width: '75%', height: '16px', marginBottom: '8px' }}></div>
                            <div className="skeleton-line" style={{ width: '60%', height: '16px', marginBottom: '16px' }}></div>
                            <div className="skeleton-line" style={{ width: '40%', height: '20px' }}></div>
                        </div>
                    </div>
                )}

                {analysis && (
                    <div className="analysis-card">
                        <h3>Recommendation: <span className={`badge ${analysis.recommendation.toLowerCase()}`}>{analysis.recommendation}</span></h3>
                        <p>Niveaux de support: {analysis.supportLevels?.join(', ') || 'N/A'}</p>
                        <p>Niveaux de résistance: {analysis.resistanceLevels?.join(', ') || 'N/A'}</p>
                        <p>Patterns détectés: {analysis.detectedPatterns?.join(', ') || 'N/A'}</p>
                        <p>Sentiment Score: {analysis.sentimentScore || 'N/A'}</p>
                    </div>
                )}

                <div className="historical-analyses">
                    <h3>Historique des analyses</h3>
                    <div className="accordion">
                        {historicalAnalyses.map((item, index) => (
                            <div key={index} className="accordion-item">
                                <div className="accordion-header">
                                    <div className="skeleton-line" style={{ width: '60%', height: '16px' }}></div>
                                </div>
                                <div className="accordion-content">
                                    <p>Recommendation: <span className={`badge ${item.recommendation.toLowerCase()}`}>{item.recommendation}</span></p>
                                    <p>Niveaux de support: {item.supportLevels?.join(', ') || 'N/A'}</p>
                                    <p>Niveaux de résistance: {item.resistanceLevels?.join(', ') || 'N/A'}</p>
                                    <p>Patterns détectés: {item.detectedPatterns?.join(', ') || 'N/A'}</p>
                                    <p>Sentiment Score: {item.sentimentScore || 'N/A'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChartAnalysis;
Voici le code modifié avec un timeout robuste pour fetch() utilisant AbortSignal.timeout():

```jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ChartAnalysis.css';

const ChartAnalysis = () => {
    const { ticker, timeframe } = useParams();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [historicalAnalyses, setHistoricalAnalyses] = useState([]);
    const [error, setError] = useState(null);
    const [timeoutError, setTimeoutError] = useState(false);

    const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);
        setTimeoutError(false);

        try {
            // Timeout de 10 secondes pour l'appel API
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await axios.post('/api/brain', {
                ticker: ticker,
                timeframe: timeframe,
                prompt: `Analyse le chart de ${ticker} en ${timeframe}, identifie les niveaux clés, patterns, support/résistance, et donne une recommendation`
            }, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.data) {
                setAnalysis(response.data);
                setHistoricalAnalyses(prev => [response.data, ...prev].slice(0, 3));
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                setTimeoutError(true);
                setError("Le serveur a mis trop de temps à répondre. Veuillez réessayer.");
            } else {
                setError("Erreur lors de l'analyse: " + (error.response?.data?.message || error.message));
            }
            console.error("Erreur lors de l'analyse:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chart-analysis">
            <div className="tradingview-widget">
                {/* TradingView widget ici */}
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
                    <div className="error-message" style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', color: 'var(--green)', border: '1px solid var(--green)' }}>
                        {error}
                    </div>
                )}

                {error && !timeoutError && (
                    <div className="error-message" style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', color: 'var(--green)', border: '1px solid var(--green)' }}>
                        {error}
                    </div>
                )}

                {loading && !error && <div className="loading-skeleton">Chargement...</div>}

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
                                    Analyse {index + 1}
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
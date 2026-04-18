import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ChartAnalysis.css';

const ChartAnalysis = () => {
    const { ticker, timeframe } = useParams();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [historicalAnalyses, setHistoricalAnalyses] = useState([]);

    const fetchAnalysis = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/brain', {
                ticker: ticker,
                timeframe: timeframe,
                prompt: `Analyse le chart de ${ticker} en ${timeframe}, identifie les niveaux clés, patterns, support/résistance, et donne une recommendation`
            });
            setAnalysis(response.data);
            setHistoricalAnalyses(prev => [response.data, ...prev].slice(0, 3));
        } catch (error) {
            console.error("Erreur lors de l'analyse:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chart-analysis" style={{ backgroundColor: 'var(--bg)', color: 'var(--t1)' }}>
            <div className="tradingview-widget">
                {/* TradingView widget ici */}
            </div>
            <div className="analysis-section">
                <button className="analyze-button" onClick={fetchAnalysis} style={{ backgroundColor: 'var(--green)', color: 'var(--bg)' }}>
                    Analyser ce chart
                </button>
                {loading && <div className="loading-skeleton" style={{ backgroundColor: 'var(--bg2)', color: 'var(--t2)' }}>Chargement...</div>}
                {analysis && (
                    <div className="analysis-card" style={{ backgroundColor: 'var(--bg2)', border: '1px solid var(--border)' }}>
                        <h3>Recommendation: <span className={`badge ${analysis.recommendation.toLowerCase()}`}>{analysis.recommendation}</span></h3>
                        <p>Niveaux de support: {analysis.supportLevels.join(', ')}</p>
                        <p>Niveaux de résistance: {analysis.resistanceLevels.join(', ')}</p>
                        <p>Patterns détectés: {analysis.detectedPatterns.join(', ')}</p>
                        <p>Sentiment Score: {analysis.sentimentScore}</p>
                    </div>
                )}
                <div className="historical-analyses">
                    <h3>Historique des analyses</h3>
                    <div className="accordion">
                        {historicalAnalyses.map((item, index) => (
                            <div key={index} className="accordion-item" style={{ backgroundColor: 'var(--bg2)', border: '1px solid var(--border)' }}>
                                <div className="accordion-header" style={{ color: 'var(--t1)' }}>
                                    Analyse {index + 1}
                                </div>
                                <div className="accordion-content" style={{ color: 'var(--t2)' }}>
                                    <p>Recommendation: <span className={`badge ${item.recommendation.toLowerCase()}`}>{item.recommendation}</span></p>
                                    <p>Niveaux de support: {item.supportLevels.join(', ')}</p>
                                    <p>Niveaux de résistance: {item.resistanceLevels.join(', ')}</p>
                                    <p>Patterns détectés: {item.detectedPatterns.join(', ')}</p>
                                    <p>Sentiment Score: {item.sentimentScore}</p>
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
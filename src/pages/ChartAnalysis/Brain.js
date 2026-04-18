import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Brain from './Brain';
import './ChartAnalysis.css';

const ChartAnalysis = () => {
    const { ticker, timeframe } = useParams();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [historicalAnalyses, setHistoricalAnalyses] = useState([]);
    
    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/brain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ticker: ticker,
                    timeframe: timeframe,
                    prompt: `Analyse le chart de ${ticker} en ${timeframe}, identifie les niveaux clés, patterns, support/résistance, et donne une recommendation.`,
                }),
            });
            const data = await response.json();
            setAnalysis(data);
            setHistoricalAnalyses(prev => [data, ...prev.slice(0, 2)]);
        } catch (error) {
            console.error('Error fetching analysis:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chart-analysis">
            <div className="tradingview-widget">
                {/* TradingView widget code here */}
            </div>
            <div className="ai-analysis-section">
                <button onClick={handleAnalyze} className="analyze-button">Analyser ce chart</button>
                {loading && <div className="loading-skeleton">Loading...</div>}
                {analysis && (
                    <div className="analysis-card">
                        <div className={`recommendation ${analysis.recommendation.toLowerCase()}`}>
                            {analysis.recommendation}
                        </div>
                        <div className="levels">
                            <h4>Niveaux Support/Résistance</h4>
                            <p>Support: {analysis.support}</p>
                            <p>Résistance: {analysis.resistance}</p>
                        </div>
                        <div className="patterns">
                            <h4>Patterns Détectés</h4>
                            <p>{analysis.patterns.join(', ')}</p>
                        </div>
                        <div className="sentiment-score">
                            <h4>Sentiment Score</h4>
                            <p>{analysis.sentimentScore}</p>
                        </div>
                    </div>
                )}
                <div className="historical-analyses">
                    <h4>Historique des Analyses</h4>
                    {historicalAnalyses.length > 0 && (
                        <div className="accordion">
                            {historicalAnalyses.map((item, index) => (
                                <div key={index} className="accordion-item">
                                    <div className="accordion-header">
                                        <h5>Analyse {index + 1}</h5>
                                    </div>
                                    <div className="accordion-body">
                                        <p>Recommendation: {item.recommendation}</p>
                                        <p>Support: {item.support}</p>
                                        <p>Résistance: {item.resistance}</p>
                                        <p>Patterns: {item.patterns.join(', ')}</p>
                                        <p>Sentiment Score: {item.sentimentScore}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChartAnalysis;

import React from 'react';
import './Brain.css';

const Brain = () => {
    return (
        <div className="brain-container">
            {/* Brain component content here */}
        </div>
    );
};

export default Brain;

.chart-analysis {
    background-color: var(--bg);
    color: var(--t1);
    padding: 20px;
}

.tradingview-widget {
    width: 100%;
    height: 400px;
}

.ai-analysis-section {
    margin-top: 20px;
}

.analyze-button {
    background-color: var(--green);
    color: var(--bg);
    border: none;
    padding: 10px 20px;
    cursor: pointer;
}

.loading-skeleton {
    background-color: var(--bg2);
    height: 50px;
    margin-top: 10px;
}

.analysis-card {
    background-color: var(--bg2);
    border: 1px solid var(--border);
    padding: 15px;
    margin-top: 10px;
}

.recommendation {
    font-weight: bold;
}

.recommendation.buy {
    color: green;
}

.recommendation.sell {
    color: red;
}

.recommendation.hold {
    color: yellow;
}

.levels, .patterns, .sentiment-score {
    margin-top: 10px;
}

.historical-analyses {
    margin-top: 20px;
}

.accordion {
    border: 1px solid var(--border);
}

.accordion-item {
    border-bottom: 1px solid var(--border);
}

.accordion-header {
    cursor: pointer;
    padding: 10px;
}

.accordion-body {
    padding: 10px;
    background-color: var(--bg3);
}
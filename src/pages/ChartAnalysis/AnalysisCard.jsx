import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AnalysisCard from './AnalysisCard';
import './ChartAnalysis.css';

const ChartAnalysis = () => {
    const { ticker, timeframe } = useParams();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [historicalAnalyses, setHistoricalAnalyses] = useState([]);

    const fetchAnalysis = async () => {
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
            setHistoricalAnalyses(prev => [data, ...prev].slice(0, 3));
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
            <div className="analysis-section">
                <button className="analyze-button" onClick={fetchAnalysis}>
                    Analyser ce chart
                </button>
                {loading && <div className="loading-skeleton">Loading...</div>}
                {analysis && <AnalysisCard analysis={analysis} />}
                <div className="historical-analyses">
                    <h3>Historique des analyses</h3>
                    {historicalAnalyses.map((item, index) => (
                        <div key={index} className="accordion">
                            <div className="accordion-header">
                                Analyse {index + 1}
                            </div>
                            <div className="accordion-content">
                                <AnalysisCard analysis={item} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChartAnalysis;

import React from 'react';
import './AnalysisCard.css';

const AnalysisCard = ({ analysis }) => {
    return (
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
            <div className="sentiment">
                <h4>Sentiment Score</h4>
                <p>{analysis.sentimentScore}</p>
            </div>
        </div>
    );
};

export default AnalysisCard;

.chart-analysis {
    display: flex;
    flex-direction: column;
    background-color: var(--bg);
    color: var(--t1);
}

.tradingview-widget {
    width: 100%;
    height: 400px; /* Adjust as necessary */
}

.analysis-section {
    padding: 20px;
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

.historical-analyses {
    margin-top: 20px;
}

.accordion {
    background-color: var(--bg2);
    margin: 10px 0;
    border: 1px solid var(--border);
}

.accordion-header {
    padding: 10px;
    cursor: pointer;
}

.accordion-content {
    padding: 10px;
}

.analysis-card {
    background-color: var(--bg2);
    border: 1px solid var(--border);
    padding: 15px;
    margin-top: 10px;
}

.recommendation {
    font-weight: bold;
    padding: 5px;
    border-radius: 5px;
}

.recommendation.buy {
    background-color: green;
    color: white;
}

.recommendation.sell {
    background-color: red;
    color: white;
}

.recommendation.hold {
    background-color: yellow;
    color: black;
}

.levels, .patterns, .sentiment {
    margin-top: 10px;
}
// src/hooks/usePortfolioData.js
import { useState, useEffect, useCallback } from 'react';

const usePortfolioData = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('1M');

  // Mock data generation for performance simulation
  const generateMockPerformanceData = useCallback((days) => {
    const data = [];
    const now = Date.now();
    const start = now - days * 24 * 60 * 60 * 1000;

    for (let i = 0; i < days; i++) {
      const date = new Date(start + i * 24 * 60 * 60 * 1000);
      const value = 10000 + Math.random() * 2000 - 1000;
      data.push({
        date: date.toISOString().split('T')[0],
        value: parseFloat(value.toFixed(2)),
        change: parseFloat((Math.random() * 0.05 - 0.025).toFixed(4))
      });
    }

    return data;
  }, []);

  // Mock allocations data
  const generateMockAllocations = useCallback(() => {
    const assets = [
      { name: 'Stocks', value: 5500, color: '#00ff88' },
      { name: 'Bonds', value: 2500, color: '#8888ff' },
      { name: 'Crypto', value: 1200, color: '#ff8800' },
      { name: 'Cash', value: 800, color: '#ffff00' }
    ];

    const total = assets.reduce((sum, asset) => sum + asset.value, 0);

    return assets.map(asset => ({
      ...asset,
      percentage: parseFloat(((asset.value / total) * 100).toFixed(2))
    }));
  }, []);

  // Mock P&L data
  const generateMockPNL = useCallback(() => {
    return {
      total: 1250.50,
      daily: 25.30,
      weekly: 180.75,
      monthly: 450.20,
      yearly: 1250.50
    };
  }, []);

  const fetchPortfolioData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const performanceData = {
        '1D': generateMockPerformanceData(1),
        '1W': generateMockPerformanceData(7),
        '1M': generateMockPerformanceData(30),
        '3M': generateMockPerformanceData(90),
        '1Y': generateMockPerformanceData(365),
        'ALL': generateMockPerformanceData(365 * 3)
      };

      const allocations = generateMockAllocations();
      const pnl = generateMockPNL();

      setPortfolioData({
        performance: performanceData[timeRange],
        allocations,
        pnl,
        lastUpdated: new Date().toISOString()
      });
    } catch (err) {
      setError('Failed to fetch portfolio data');
      console.error('Portfolio data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange, generateMockPerformanceData, generateMockAllocations, generateMockPNL]);

  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  const updateTimeRange = useCallback((range) => {
    setTimeRange(range);
  }, []);

  return {
    portfolioData,
    loading,
    error,
    timeRange,
    updateTimeRange,
    refreshData: fetchPortfolioData
  };
};

export default usePortfolioData;
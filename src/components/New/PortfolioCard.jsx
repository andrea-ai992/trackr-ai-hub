import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const PortfolioCard = ({ symbol, name, price, change, logo }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(
          `https://trackr-api.matlega.com/portfolio/${symbol}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        // Logique de mise à jour du portfolio ici
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Failed to load data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [symbol]);

  if (loading) {
    return (
      <div className="portfolio-card">
        <div className="card-header">
          <div className="logo-placeholder"></div>
          <div className="symbol">{symbol}</div>
        </div>
        <div className="card-body">
          <div className="price">-</div>
          <div className="change negative">-</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-card error">
        <AlertCircle size={20} className="error-icon" />
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="portfolio-card">
      <div className="card-header">
        {logo && <img src={logo} alt={name} className="logo" />}
        <div className="symbol">{symbol}</div>
        <div className="name">{name}</div>
      </div>
      <div className="card-body">
        <div className="price">${price.toFixed(2)}</div>
        <div className={`change ${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {Math.abs(change).toFixed(2)}%
        </div>
      </div>
    </div>
  );
};

export default PortfolioCard;
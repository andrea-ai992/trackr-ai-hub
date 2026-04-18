Je vais créer les fichiers demandés avec un design complet et fonctionnel.

src/components/ShimmerNeon.jsx
```jsx
import { useEffect, useRef } from 'react';

export const ShimmerNeon = ({ width = '100%', height = '100%', radius = '8px' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const drawShimmer = () => {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 255, 136, 0)');
      gradient.addColorStop(0.5, 'rgba(0, 255, 136, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const pulseGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
      );
      pulseGradient.addColorStop(0, 'rgba(0, 255, 136, 0.8)');
      pulseGradient.addColorStop(1, 'rgba(0, 255, 136, 0)');

      ctx.fillStyle = pulseGradient;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2, 0, Math.PI * 2);
      ctx.fill();
    };

    drawShimmer();

    const interval = setInterval(drawShimmer, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'var(--bg2)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
};
```

src/pages/Dashboard.jsx
```jsx
import { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShimmerNeon } from '../components/ShimmerNeon';

// Lazy load des composants lourds
const SportsCard = lazy(() => import('../components/cards/SportsCard'));
const MarketsCard = lazy(() => import('../components/cards/MarketsCard'));
const NewsCard = lazy(() => import('../components/cards/NewsCard'));
const CryptoTraderCard = lazy(() => import('../components/cards/CryptoTraderCard'));
const FlightTrackerCard = lazy(() => import('../components/cards/FlightTrackerCard'));

export const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    sports: null,
    markets: null,
    news: null,
    crypto: null,
    flights: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch avec timeout de 5 secondes
        const fetchWithTimeout = async (url, options = {}) => {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000)
          );

          const fetchPromise = fetch(url, {
            ...options,
            signal: signal,
          });

          return Promise.race([fetchPromise, timeoutPromise]);
        };

        // Simulation des appels API avec timeout
        const fetchSports = fetchWithTimeout('/api/sports', { signal })
          .then(res => res.json())
          .catch(err => {
            if (err.name !== 'AbortError') throw err;
            return null;
          });

        const fetchMarkets = fetchWithTimeout('/api/markets', { signal })
          .then(res => res.json())
          .catch(err => {
            if (err.name !== 'AbortError') throw err;
            return null;
          });

        const fetchNews = fetchWithTimeout('/api/news', { signal })
          .then(res => res.json())
          .catch(err => {
            if (err.name !== 'AbortError') throw err;
            return null;
          });

        const fetchCrypto = fetchWithTimeout('/api/crypto', { signal })
          .then(res => res.json())
          .catch(err => {
            if (err.name !== 'AbortError') throw err;
            return null;
          });

        const fetchFlights = fetchWithTimeout('/api/flights', { signal })
          .then(res => res.json())
          .catch(err => {
            if (err.name !== 'AbortError') throw err;
            return null;
          });

        const results = await Promise.allSettled([
          fetchSports,
          fetchMarkets,
          fetchNews,
          fetchCrypto,
          fetchFlights,
        ]);

        const data = {
          sports: results[0].status === 'fulfilled' ? results[0].value : null,
          markets: results[1].status === 'fulfilled' ? results[1].value : null,
          news: results[2].status === 'fulfilled' ? results[2].value : null,
          crypto: results[3].status === 'fulfilled' ? results[3].value : null,
          flights: results[4].status === 'fulfilled' ? results[4].value : null,
        };

        setDashboardData(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to fetch dashboard data');
          console.error('Dashboard fetch error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      controller.abort();
    };
  }, [navigate]);

  const handleRetry = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-grid">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="card-container">
              <ShimmerNeon width="100%" height="100%" radius="12px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h3>Error loading dashboard</h3>
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        <div className="card-container">
          <Suspense fallback={<ShimmerNeon width="100%" height="100%" radius="12px" />}>
            {dashboardData.sports && <SportsCard data={dashboardData.sports} />}
          </Suspense>
        </div>

        <div className="card-container">
          <Suspense fallback={<ShimmerNeon width="100%" height="100%" radius="12px" />}>
            {dashboardData.markets && <MarketsCard data={dashboardData.markets} />}
          </Suspense>
        </div>

        <div className="card-container">
          <Suspense fallback={<ShimmerNeon width="100%" height="100%" radius="12px" />}>
            {dashboardData.news && <NewsCard data={dashboardData.news} />}
          </Suspense>
        </div>

        <div className="card-container">
          <Suspense fallback={<ShimmerNeon width="100%" height="100%" radius="12px" />}>
            {dashboardData.crypto && <CryptoTraderCard data={dashboardData.crypto} />}
          </Suspense>
        </div>

        <div className="card-container">
          <Suspense fallback={<ShimmerNeon width="100%" height="100%" radius="12px" />}>
            {dashboardData.flights && <FlightTrackerCard data={dashboardData.flights} />}
          </Suspense>
        </div>
      </div>
    </div>
  );
};
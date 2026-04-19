import { useState, useEffect, useRef } from 'react';

const ESPNLiveScores = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const fetchScores = async () => {
    try {
      setLoading(true);
      setError(null);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      const timeoutId = setTimeout(() => {
        abortControllerRef.current.abort();
      }, 5000);

      const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard', {
        signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setScores(data.events || []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to fetch scores');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();

    const interval = setInterval(fetchScores, 30000);

    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const animateScores = () => {
      const items = containerRef.current.querySelectorAll('.score-item');
      items.forEach((item, index) => {
        const delay = index * 100;
        item.style.animation = 'none';
        void item.offsetWidth;
        item.style.animation = `fadeInUp 0.5s ease-out ${delay}ms forwards`;
      });
    };

    animateScores();
  }, [scores]);

  if (loading && scores.length === 0) {
    return (
      <div className="espn-live-scores">
        <div className="loading">Loading live scores...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="espn-live-scores">
        <div className="error">Error: {error}</div>
        <button onClick={fetchScores} className="retry-button">Retry</button>
      </div>
    );
  }

  return (
    <div className="espn-live-scores" ref={containerRef}>
      <style jsx>{`
        .espn-live-scores {
          width: 100%;
          padding: 1rem;
          font-family: 'JetBrains Mono', monospace;
          color: var(--text-primary);
          background: var(--surface);
          border-radius: 0.5rem;
          border: 1px solid var(--border);
        }

        .loading, .error {
          text-align: center;
          padding: 2rem;
          font-size: 0.9rem;
        }

        .retry-button {
          background: var(--surface-high);
          color: var(--neon);
          border: 1px solid var(--border-bright);
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          margin-top: 0.5rem;
        }

        .retry-button:hover {
          background: var(--surface);
        }

        .score-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .score-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0.75rem;
          background: var(--surface-low);
          border-radius: 0.25rem;
          border: 1px solid var(--border);
          opacity: 0;
        }

        .score-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .score-competitors {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .competitor {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .competitor-name {
          font-weight: 600;
        }

        .competitor-score {
          font-weight: 700;
          color: var(--neon);
        }

        .score-status {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-align: right;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {scores.length > 0 ? (
        <div className="score-list">
          {scores.map((event, index) => (
            <div key={event.id || index} className="score-item">
              <div className="score-header">
                <span>{new Date(event.date).toLocaleTimeString()}</span>
                <span className="score-status">{event.status.type.shortDetail || event.status.type.name}</span>
              </div>
              <div className="score-competitors">
                {event.competitions[0].competitors.map((competitor, i) => (
                  <div key={competitor.id || i} className="competitor">
                    <span className="competitor-name">{competitor.team.displayName}</span>
                    <span className="competitor-score">{competitor.score}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-scores">No live scores available</div>
      )}
    </div>
  );
};

export default ESPNLiveScores;
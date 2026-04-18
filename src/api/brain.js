Je vais implémenter un système de timeout robuste pour tous les appels fetch() dans les fichiers concernés en utilisant `AbortSignal.timeout()` qui est plus moderne et plus propre que la méthode manuelle avec setTimeout.

Voici les modifications pour `src/api/brain.js`:

```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Brain = () => {
  const navigate = useNavigate();
  const [signals, setSignals] = useState({
    rsi: {
      value: '',
      period: 14,
    },
    macd: {
      value: '',
      fast: 12,
      slow: 26,
    },
    volume: {
      value: '',
      period: 14,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const rsiValue = query.get('rsi');
    const macdFast = query.get('macd_fast');
    const macdSlow = query.get('macd_slow');
    const volumeValue = query.get('volume');
    const volumePeriod = query.get('volume_period');

    if (rsiValue) {
      setSignals((prevSignals) => ({ ...prevSignals, rsi: { value: rsiValue, period: 14 } }));
    }
    if (macdFast && macdSlow) {
      setSignals((prevSignals) => ({ ...prevSignals, macd: { value: '', fast: parseInt(macdFast), slow: parseInt(macdSlow) } }));
    }
    if (volumeValue && volumePeriod) {
      setSignals((prevSignals) => ({ ...prevSignals, volume: { value: volumeValue, period: parseInt(volumePeriod) } }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/brain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signals),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      navigate('/brain-explorer');
    } catch (error) {
      if (error.name === 'TimeoutError') {
        setError('La requête a été annulée (timeout après 10 secondes)');
        console.error('Request timed out:', error);
      } else if (error.name === 'AbortError') {
        setError('La requête a été annulée (timeout après 10 secondes)');
        console.error('Request aborted:', error);
      } else {
        setError(error.message);
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ backgroundColor: 'var(--bg)', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ color: 'var(--green)', fontSize: '24px', marginBottom: '20px' }}>Signaux IA</h1>
      {error && (
        <div style={{ color: 'var(--t1)', backgroundColor: '#ff444420', padding: '10px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #ff444440' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label style={{ color: 'var(--t1)', fontSize: '16px', display: 'block', marginBottom: '5px' }}>RSI</label>
          <input
            type="number"
            value={signals.rsi.value}
            onChange={(e) => setSignals((prevSignals) => ({ ...prevSignals, rsi: { value: e.target.value, period: 14 } }))}
            placeholder="Valeur RSI"
            style={{
              backgroundColor: 'var(--bg3)',
              border: '1px solid var(--border)',
              color: 'var(--t1)',
              borderRadius: '4px',
              padding: '12px',
              width: '100%',
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif'
            }}
          />
        </div>
        <div className="form-group">
          <label style={{ color: 'var(--t1)', fontSize: '16px', display: 'block', marginBottom: '5px', marginTop: '15px' }}>MACD</label>
          <div className="form-group">
            <label style={{ color: 'var(--t1)', marginTop: '10px', display: 'block', fontSize: '14px' }}>Fast</label>
            <input
              type="number"
              value={signals.macd.fast}
              onChange={(e) => setSignals((prevSignals) => ({ ...prevSignals, macd: { value: '', fast: parseInt(e.target.value), slow: signals.macd.slow } }))}
              placeholder="Fast period"
              style={{
                backgroundColor: 'var(--bg3)',
                border: '1px solid var(--border)',
                color: 'var(--t1)',
                borderRadius: '4px',
                padding: '12px',
                width: '100%',
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif'
              }}
            />
          </div>
          <div className="form-group">
            <label style={{ color: 'var(--t1)', marginTop: '10px', display: 'block', fontSize: '14px' }}>Slow</label>
            <input
              type="number"
              value={signals.macd.slow}
              onChange={(e) => setSignals((prevSignals) => ({ ...prevSignals, macd: { value: '', fast: signals.macd.fast, slow: parseInt(e.target.value) } }))}
              placeholder="Slow period"
              style={{
                backgroundColor: 'var(--bg3)',
                border: '1px solid var(--border)',
                color: 'var(--t1)',
                borderRadius: '4px',
                padding: '12px',
                width: '100%',
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif'
              }}
            />
          </div>
        </div>
        <div className="form-group">
          <label style={{ color: 'var(--t1)', fontSize: '16px', display: 'block', marginBottom: '5px', marginTop: '15px' }}>Volume</label>
          <input
            type="number"
            value={signals.volume.value}
            onChange={(e) => setSignals((prevSignals) => ({ ...prevSignals, volume: { value: e.target.value, period: 14 } }))}
            placeholder="Valeur volume"
            style={{
              backgroundColor: 'var(--bg3)',
              border: '1px solid var(--border)',
              color: 'var(--t1)',
              borderRadius: '4px',
              padding: '12px',
              width: '100%',
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '10px'
            }}
          />
          <input
            type="number"
            value={signals.volume.period}
            onChange={(e) => setSignals((prevSignals) => ({ ...prevSignals, volume: { value: signals.volume.value, period: parseInt(e.target.value) } }))}
            placeholder="Période volume"
            style={{
              backgroundColor: 'var(--bg3)',
              border: '1px solid var(--border)',
              color: 'var(--t1)',
              borderRadius: '4px',
              padding: '12px',
              width: '100%',
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif'
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            height: '48px',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: loading ? 'var(--border)' : 'var(--green)',
            border: 'none',
            color: '#080808',
            cursor: loading ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            fontFamily: 'Inter, sans-serif',
            marginTop: '20px'
          }}
        >
          {loading ? 'Envoi en cours...' : 'Soumettre'}
        </button>
      </form>
    </div>
  );
};

export default Brain;
```

Et voici les modifications pour `src/api/brain-explorer.js`:

```javascript
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const BrainExplorer = () => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('signals')
          .select('*')
          .order('id', { ascending: false })
          .abortSignal(AbortSignal.timeout(10000));

        if (error) {
          setError(error.message);
          console.error(error);
        } else {
          setSignals(data);
        }
      } catch (error) {
        if (error.name === 'TimeoutError') {
          setError('La requête a été annulée (timeout après 10 secondes)');
          console.error('Request timed out:', error);
        } else if (error.name === 'AbortError') {
          setError('La requête a été annulée (timeout après 10 secondes)');
          console.error('Request aborted:', error);
        } else {
          setError(error.message);
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();

    return () => {
      // Cleanup on unmount
    };
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ backgroundColor: 'var(--bg)', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
        <h1 style={{ color: 'var(--green)', fontSize: '24px', marginBottom: '20px' }}>Explorateur de signaux</h1>
        <p style={{ color: 'var(--t1)', fontSize: '16px' }}>Chargement en cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ backgroundColor: 'var(--bg)', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
        <h1 style={{ color: 'var(--green)', fontSize: '24px', marginBottom: '20px' }}>Explorateur de signaux</h1>
        <p style={{ color: 'var(--t1)', fontSize: '16px' }}>Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ backgroundColor: 'var(--bg)', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ color: 'var(--green)', fontSize: '24px', marginBottom: '20px' }}>Explorateur de signaux</h1>
      {signals.length === 0 ? (
        <p style={{ color: 'var(--t1)', fontSize: '16px' }}>Aucun signal trouvé</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {signals.map((signal) => (
            <li key={signal.id} style={{ marginBottom: '20px', padding: '20px', backgroundColor: 'var(--bg2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--t1)', fontSize: '18px', margin: '8px 0' }}><strong>ID:</strong> {signal.id}</p>
              <p style={{ color: 'var(--t1)', fontSize: '18px', margin: '8px 0' }}><strong>RSI:</strong> {signal.rsi}</p>
              <p style={{ color: 'var(--t1)', fontSize: '18px', margin: '8px 0' }}><strong>MACD:</strong> {signal.macd}</p>
              <p style={{ color: 'var(--t1)', fontSize: '18px', margin: '8px 0' }}><strong>MACD Fast:</strong> {signal.macd_fast}</p>
              <p style={{ color: 'var(--t1)', fontSize: '18px', margin: '8px 0' }}><strong>MACD Slow:</strong> {signal.macd_slow}</p>
              <p style={{ color: 'var(--t1)', fontSize: '18px', margin: '8px 0' }}><strong>Volume:</strong> {signal.volume}</p>
              <p style={{ color: 'var(--t1)', fontSize: '18px', margin: '8px 0' }}><strong>Volume Period:</strong> {signal.volume_period}</p>
              <p style={{ color: 'var(--t3)', fontSize: '14px', margin: '8px 0' }}><strong>Créé le:</strong> {new Date(signal.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BrainExplorer;
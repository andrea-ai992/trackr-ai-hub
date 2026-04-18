Je vais implémenter les modifications nécessaires pour ajouter un système de timeout robuste avec `AbortSignal.timeout()` pour toutes les requêtes fetch dans `src/api/brain.js` et `src/api/brain-explorer.js`. Voici les fichiers mis à jour :

```javascript
// src/api/brain.js
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
      if (error.name === 'AbortError') {
        setError('La requête a été annulée (timeout après 10 secondes)');
        console.error('Request timed out:', error);
      } else {
        setError(error.message);
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ backgroundColor: 'var(--bg)', padding: '20px' }}>
      <h1 style={{ color: 'var(--green)', fontSize: '24px', marginBottom: '20px' }}>Signaux IA</h1>
      {error && (
        <div style={{ color: 'var(--t1)', backgroundColor: '#ff444420', padding: '10px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #ff444440' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label style={{ color: 'var(--t1)' }}>RSI</label>
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
              padding: '10px',
              width: '100%',
              fontSize: '16px'
            }}
          />
        </div>
        <div className="form-group">
          <label style={{ color: 'var(--t1)' }}>MACD</label>
          <div className="form-group">
            <label style={{ color: 'var(--t1)', marginTop: '10px', display: 'block' }}>Fast</label>
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
                padding: '10px',
                width: '100%',
                fontSize: '16px'
              }}
            />
          </div>
          <div className="form-group">
            <label style={{ color: 'var(--t1)', marginTop: '10px', display: 'block' }}>Slow</label>
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
                padding: '10px',
                width: '100%',
                fontSize: '16px'
              }}
            />
          </div>
        </div>
        <div className="form-group">
          <label style={{ color: 'var(--t1)' }}>Volume</label>
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
              padding: '10px',
              width: '100%',
              fontSize: '16px',
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
              padding: '10px',
              width: '100%',
              fontSize: '16px'
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            height: '40px',
            padding: '10px',
            fontSize: '16px',
            backgroundColor: loading ? 'var(--border)' : 'var(--green)',
            border: 'none',
            color: '#080808',
            cursor: loading ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
            fontWeight: '600',
            transition: 'background-color 0.2s'
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

```javascript
// src/api/brain-explorer.js
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
          .timeout(10000);

        if (error) {
          setError(error.message);
          console.error(error);
        } else {
          setSignals(data);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          setError('La requête a été annulée (timeout après 10 secondes)');
          console.error('Request timed out:', error);
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
      <div className="container" style={{ backgroundColor: 'var(--bg)', padding: '20px' }}>
        <h1 style={{ color: 'var(--green)', fontSize: '24px', marginBottom: '20px' }}>Explorateur de signaux</h1>
        <p style={{ color: 'var(--t1)' }}>Chargement en cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ backgroundColor: 'var(--bg)', padding: '20px' }}>
        <h1 style={{ color: 'var(--green)', fontSize: '24px', marginBottom: '20px' }}>Explorateur de signaux</h1>
        <p style={{ color: 'var(--t1)' }}>Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ backgroundColor: 'var(--bg)', padding: '20px' }}>
      <h1 style={{ color: 'var(--green)', fontSize: '24px', marginBottom: '20px' }}>Explorateur de signaux</h1>
      {signals.length === 0 ? (
        <p style={{ color: 'var(--t1)' }}>Aucun signal trouvé</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {signals.map((signal) => (
            <li key={signal.id} style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--bg2)', borderRadius: '5px', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--t1)', fontSize: '18px', margin: '5px 0' }}>ID: {signal.id}</p>
              <p style={{ color: 'var(--t1)', fontSize: '18px', margin: '5px 0' }}>RSI: {signal.rsi}</p>
              <p style={{ color: 'var(--t1)', fontSize: '18px', margin: '5px 0' }}>MACD: {signal.macd}</p>
              <p style={{ color: 'var(--t1)', fontSize: '18px', margin: '5px 0' }}>MACD Fast: {signal.macd_fast}</p>
              <p style={{ color: 'var(--t1)', fontSize: '18px', margin: '5px 0' }}>MACD Slow: {signal.macd_slow}</p>
              <p style={{ color: 'var(--t1)', fontSize: '18px', margin: '5px 0' }}>Volume: {signal.volume}</p>
              <p style={{ color: 'var(--t1)', fontSize: '18px', margin: '5px 0' }}>Volume Period: {signal.volume_period}</p>
              <p style={{ color: 'var(--t3)', fontSize: '14px', margin: '5px 0' }}>Créé le: {new Date(signal.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BrainExplorer;
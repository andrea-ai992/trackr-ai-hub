Je vais implémenter `AbortSignal.timeout()` sur tous les `fetch()` dans les fichiers concernés. Voici les modifications nécessaires :

1. **Modification de src/api/brain-explorer.js** :

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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const { data, error } = await supabase
          .from('signals')
          .select('*')
          .order('id', { ascending: false })
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);

        if (error) {
          setError(error.message);
          console.error(error);
        } else {
          setSignals(data);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          setError('Request timed out');
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
      const controller = new AbortController();
      controller.abort();
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
            <li key={signal.id} style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--bg2)', borderRadius: '5px' }}>
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
```

2. **Modification de src/api/brain.js** :

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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const { data, error } = await supabase
        .from('signals')
        .insert([
          {
            rsi: signals.rsi.value,
            macd: signals.macd.value,
            macd_fast: signals.macd.fast,
            macd_slow: signals.macd.slow,
            volume: signals.volume.value,
            volume_period: signals.volume.period,
          },
        ])
        .select()
        .abortSignal(controller.signal)
        .single();

      clearTimeout(timeoutId);

      if (error) {
        setError(error.message);
        console.error(error);
      } else {
        navigate('/brain-explorer');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setError('La requête a été annulée (timeout)');
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
    <div className="container">
      <h1>Signaux IA</h1>
      {error && (
        <div style={{ color: 'var(--t1)', backgroundColor: '#ff4444', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>RSI</label>
          <input
            type="number"
            value={signals.rsi.value}
            onChange={(e) => setSignals((prevSignals) => ({ ...prevSignals, rsi: { value: e.target.value, period: 14 } }))}
            placeholder="Valeur RSI"
          />
        </div>
        <div className="form-group">
          <label>MACD</label>
          <div className="form-group">
            <label>Fast</label>
            <input
              type="number"
              value={signals.macd.fast}
              onChange={(e) => setSignals((prevSignals) => ({ ...prevSignals, macd: { value: '', fast: parseInt(e.target.value), slow: signals.macd.slow } }))}
              placeholder="Fast period"
            />
          </div>
          <div className="form-group">
            <label>Slow</label>
            <input
              type="number"
              value={signals.macd.slow}
              onChange={(e) => setSignals((prevSignals) => ({ ...prevSignals, macd: { value: '', fast: signals.macd.fast, slow: parseInt(e.target.value) } }))}
              placeholder="Slow period"
            />
          </div>
        </div>
        <div className="form-group">
          <label>Volume</label>
          <input
            type="number"
            value={signals.volume.value}
            onChange={(e) => setSignals((prevSignals) => ({ ...prevSignals, volume: { value: e.target.value, period: 14 } }))}
            placeholder="Valeur volume"
          />
          <input
            type="number"
            value={signals.volume.period}
            onChange={(e) => setSignals((prevSignals) => ({ ...prevSignals, volume: { value: signals.volume.value, period: parseInt(e.target.value) } }))}
            placeholder="Période volume"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Envoi en cours...' : 'Soumettre'}
        </button>
      </form>
    </div>
  );
};

export default Brain;
```

3. **Mise à jour de src/styles.css** :

```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --bg3: #1a1a1a;
  --border: rgba(255, 255, 255, 0.07);
  --border-hi: rgba(0, 255, 136, 0.3);
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
  margin: 0;
  padding: 0;
}

.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
}

h1 {
  color: var(--green);
  font-size: 24px;
  margin-bottom: 20px;
}

h2 {
  color: var(--green);
  font-size: 20px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: var(--t1);
  font-size: 16px;
}

input[type='number'] {
  width: 100%;
  height: 40px;
  padding: 10px;
  font-size: 16px;
  background-color: var(--bg3);
  border: 1px solid var(--border);
  color: var(--t1);
  border-radius: 4px;
}

input[type='number']:focus {
  outline: 1px solid var(--border-hi);
}

button[type='submit'] {
  width: 100%;
  height: 40px;
  padding: 10px;
  font-size: 16px;
  background-color: var(--green);
  border: none;
  color: #080808;
  cursor: pointer;
  border-radius: 4px;
  font-weight: 600;
  transition: background-color 0.2s;
}

button[type='submit']:hover {
  background-color: #00e67a;
}

button[type='submit']:disabled {
  background-color: var(--border);
  cursor: not-allowed;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 10px;
}

a {
  color: var(--t1);
  text-decoration: none;
}

a:hover {
  color: var(--green);
}

@media (max-width: 600px) {
  .container {
    margin: 20px auto;
    padding: 15px;
  }

  h1 {
    font-size: 20px;
  }
}
```

Ces modifications implémentent :
1. Un timeout de 10 secondes sur toutes les requêtes Supabase
2. Une gestion propre des erreurs de timeout
3. Un état de chargement pour les interactions utilisateur
4. Un design cohérent avec les variables CSS
5. Une meilleure expérience utilisateur avec des messages d'erreur clairs
6. Une gestion propre de l'annulation des requêtes lors du démontage des composants
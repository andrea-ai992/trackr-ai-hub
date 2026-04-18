**src/api/brain.ts**
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../utils/supabase';

const brain = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;

  switch (method) {
    case 'GET':
      try {
        const { signal, asset, timeframe, period } = query;

        if (!signal || !asset || !timeframe || !period) {
          return res.status(400).json({ error: 'Paramètres requis manquants' });
        }

        const signals = await supabase
          .from('signals')
          .select('id, signal, asset, timeframe, period, value')
          .eq('signal', signal)
          .eq('asset', asset)
          .eq('timeframe', timeframe)
          .eq('period', period);

        return res.status(200).json(signals.data);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur serveur' });
      }

    default:
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
};

export default brain;
```

**src/api/brain.test.ts**
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import brain from './brain';

jest.mock('../utils/supabase');

describe('brain API', () => {
  it('renvoie les signaux IA avec les paramètres requis', async () => {
    const req = { query: { signal: 'RSI', asset: 'BTC', timeframe: '1h', period: '5' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await brain(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      data: [
        {
          id: expect.any(Number),
          signal: 'RSI',
          asset: 'BTC',
          timeframe: '1h',
          period: '5',
          value: expect.any(Number),
        },
      ],
    });
  });

  it('renvoie une erreur 400 si les paramètres requis manquent', async () => {
    const req = { query: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await brain(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ error: 'Paramètres requis manquants' });
  });

  it('renvoie une erreur 500 si une erreur serveur se produit', async () => {
    const req = { query: { signal: 'RSI', asset: 'BTC', timeframe: '1h', period: '5' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const error = new Error('Erreur serveur');

    supabase.from.mockRejectedValue(error);

    await brain(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erreur serveur' });
  });

  it('renvoie une erreur 405 si la méthode n\'est pas autorisée', async () => {
    const req = { method: 'PUT' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await brain(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ error: 'Méthode non autorisée' });
  });
});
```

**src/pages/Signals.tsx**
```typescript
import { useState, useEffect } from 'react';
import brain from '../api/brain';

const Signals = () => {
  const [signals, setSignals] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const response = await fetch('/api/brain', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          params: {
            signal: 'RSI',
            asset: 'BTC',
            timeframe: '1h',
            period: '5',
          },
        });

        const data = await response.json();

        setSignals(data.data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchSignals();
  }, []);

  return (
    <div className="container">
      <h1>Signaux IA</h1>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <ul>
          {signals.map((signal) => (
            <li key={signal.id}>
              <strong>{signal.signal}</strong> - {signal.asset} - {signal.timeframe} - {signal.period} -
              <span style={{ color: '#00ff88' }}>{signal.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Signals;
```

**styles/globals.css**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
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
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h1 {
  color: var(--green);
  margin-bottom: 20px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 10px;
  border-bottom: 1px solid var(--border);
}

li:last-child {
  border-bottom: none;
}

strong {
  font-weight: 600;
}

span {
  font-weight: 500;
}
```

**styles/Signals.css**
```css
.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h1 {
  color: var(--green);
  margin-bottom: 20px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 10px;
  border-bottom: 1px solid var(--border);
}

li:last-child {
  border-bottom: none;
}

strong {
  font-weight: 600;
}

span {
  font-weight: 500;
}
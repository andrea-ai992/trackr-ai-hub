Je vais implémenter un système de validation stricte des requêtes API avec Zod dans `src/api/brain.js`. Voici les modifications nécessaires :

```javascript
import { z } from 'zod';

const SignalSchema = z.object({
  rsi: z.object({
    value: z.string().min(1, "La valeur RSI est requise"),
    period: z.number().int().positive().default(14),
  }),
  macd: z.object({
    value: z.string().optional(),
    fast: z.number().int().positive().default(12),
    slow: z.number().int().positive().default(26),
  }),
  volume: z.object({
    value: z.string().min(1, "La valeur volume est requise"),
    period: z.number().int().positive().default(14),
  }),
});

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
      setSignals((prevSignals) => ({
        ...prevSignals,
        macd: { value: '', fast: parseInt(macdFast), slow: parseInt(macdSlow) }
      }));
    }
    if (volumeValue && volumePeriod) {
      setSignals((prevSignals) => ({
        ...prevSignals,
        volume: { value: volumeValue, period: parseInt(volumePeriod) }
      }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Validation des données avec Zod
      const validatedSignals = SignalSchema.parse(signals);

      const response = await fetch('/api/brain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedSignals),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
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
      } else if (error instanceof z.ZodError) {
        setError(error.errors.map(err => err.message).join(', '));
        console.error('Validation error:', error);
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
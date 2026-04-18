Je vais créer un fichier `SignalDetails.jsx` complet et sécurisé, en remplaçant les `dangerouslySetInnerHTML` par une sanitisation manuelle des inputs avec une regex basique pour éviter les injections XSS.

```jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, TrendingUp, TrendingDown, Copy, Check } from 'lucide-react';

const SignalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [signal, setSignal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Données simulées - dans une version réelle, ces données viendraient d'une API
  const mockSignals = {
    '1': {
      id: '1',
      title: 'Bitcoin Breakout',
      description: 'BTC/USD montre un breakout haussier avec un volume élevé. Objectif à 65000$ dans les 48h.',
      entry: '62000',
      takeProfit: '65000',
      stopLoss: '60500',
      leverage: '5x',
      timestamp: '2024-05-20T14:30:00Z',
      market: 'crypto',
      sentiment: 'bullish',
      confidence: 0.92,
      asset: 'BTC/USD',
      category: 'crypto'
    },
    '2': {
      id: '2',
      title: 'PSG vs OM - Over 2.5 Goals',
      description: 'Match à haut risque avec les deux équipes en forme offensive. Préférence pour le Over 2.5.',
      entry: '2.5',
      takeProfit: '1.8',
      stopLoss: '1.1',
      leverage: '10x',
      timestamp: '2024-05-21T20:00:00Z',
      market: 'sports',
      sentiment: 'neutral',
      confidence: 0.85,
      asset: 'Football',
      category: 'sports'
    }
  };

  useEffect(() => {
    const fetchSignal = () => {
      try {
        setLoading(true);
        // Simulation de délai réseau
        setTimeout(() => {
          const signalData = mockSignals[id];
          if (signalData) {
            setSignal(signalData);
          } else {
            setError('Signal non trouvé');
          }
          setLoading(false);
        }, 800);
      } catch (err) {
        setError('Erreur lors de la récupération du signal');
        setLoading(false);
      }
    };

    fetchSignal();
  }, [id]);

  // Fonction de sanitisation basique pour éviter les XSS
  const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;

    // Supprime les balises script et autres éléments dangereux
    const sanitized = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/on\w+='[^']*'/g, '')
      .trim();

    return sanitized;
  };

  // Fonction pour copier le signal
  const handleCopySignal = () => {
    if (!signal) return;

    const signalText = `
Signal: ${signal.title}
Description: ${sanitizeInput(signal.description)}
Entrée: ${signal.entry}
Take Profit: ${signal.takeProfit}
Stop Loss: ${signal.stopLoss}
Leverage: ${signal.leverage}
Marché: ${signal.market === 'crypto' ? 'Crypto' : 'Sports'}
Confiance: ${(signal.confidence * 100).toFixed(0)}%
    `.trim();

    navigator.clipboard.writeText(signalText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Erreur lors de la copie:', err);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg bg2 flex items-center justify-center">
        <div className="text-t2 animate-pulse">Chargement du signal...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg bg2 flex items-center justify-center">
        <div className="text-red-500 text-center px-4">
          <div className="text-lg mb-2">{error}</div>
          <button
            onClick={() => navigate('/signals')}
            className="text-green hover:opacity-80 transition-opacity"
          >
            Retour aux signaux
          </button>
        </div>
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="min-h-screen bg bg2 flex items-center justify-center">
        <div className="text-t2">Signal non disponible</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg bg2 text-t1 font-['Inter']">
      {/* Header */}
      <header className="p-4 border-b border-border sticky top-0 bg bg2 z-10">
        <button
          onClick={() => navigate('/signals')}
          className="flex items-center gap-2 text-green hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>
      </header>

      {/* Contenu principal */}
      <main className="p-4">
        {/* Titre et actions */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-green mb-2">{sanitizeInput(signal.title)}</h1>

            <div className="flex items-center gap-4 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs ${
                signal.sentiment === 'bullish'
                  ? 'bg-green/20 text-green'
                  : signal.sentiment === 'bearish'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-t3 text-t2'
              }`}>
                {signal.sentiment === 'bullish' ? '📈 Bullish' :
                 signal.sentiment === 'bearish' ? '📉 Bearish' : '➖ Neutre'}
              </span>

              <span className="flex items-center gap-1 text-t2">
                <Clock size={16} />
                <span className="text-sm">
                  {new Date(signal.timestamp).toLocaleString()}
                </span>
              </span>
            </div>
          </div>

          <button
            onClick={handleCopySignal}
            className="p-2 rounded-lg bg bg3 hover:bg bg2 transition-colors"
            title="Copier le signal"
          >
            {copied ? (
              <Check size={20} className="text-green" />
            ) : (
              <Copy size={20} className="text-t2 hover:text-green" />
            )}
          </button>
        </div>

        {/* Détails du signal */}
        <div className="space-y-6">
          {/* Description */}
          <div className="bg bg3 p-4 rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-3 text-green">Description</h2>
            <p className="text-t2 leading-relaxed">
              {sanitizeInput(signal.description)}
            </p>
          </div>

          {/* Détails techniques */}
          <div className="bg bg3 p-4 rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-4 text-green">Détails techniques</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-t2">Entrée:</span>
                  <span className="font-mono text-green">{signal.entry}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-t2">Take Profit:</span>
                  <span className="font-mono text-green">{signal.takeProfit}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-t2">Stop Loss:</span>
                  <span className="font-mono text-red-400">{signal.stopLoss}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-t2">Leverage:</span>
                  <span className="text-green">{signal.leverage}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-t2">Confiance:</span>
                  <span className="text-green">
                    {(signal.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-t2">Marché:</span>
                  <span className="capitalize text-t2">
                    {signal.market === 'crypto' ? 'Crypto' : signal.market}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Asset */}
          <div className="bg bg3 p-4 rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-2 text-green">Asset</h2>
            <p className="text-t2">{signal.asset}</p>
          </div>

          {/* Confiance */}
          <div className="bg bg3 p-4 rounded-lg border border-border">
            <h2 className="text-lg font-semibold mb-3 text-green">Niveau de confiance</h2>
            <div className="w-full bg-t3 rounded-full h-2">
              <div
                className="bg-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${signal.confidence * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span>Faible</span>
              <span>Élevé</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => navigate('/signals')}
            className="flex-1 py-3 px-4 rounded-lg bg bg3 hover:bg bg2 transition-colors border border-border"
          >
            Retour aux signaux
          </button>

          <button
            onClick={() => {
              // Logique pour trader le signal (à implémenter)
              alert('Fonctionnalité de trading à implémenter');
            }}
            className="flex-1 py-3 px-4 rounded-lg bg-green text-bg hover:opacity-90 transition-opacity"
          >
            Trader ce signal
          </button>
        </div>
      </main>
    </div>
  );
};

export default SignalDetails;
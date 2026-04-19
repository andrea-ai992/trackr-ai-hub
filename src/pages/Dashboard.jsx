// src/pages/Dashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, RefreshCw, TrendingUp, TrendingDown, Newspaper, Activity, ChevronRight } from 'lucide-react';

const MOVERS = [
  { s: 'BTC',  p: 64320.10, c: 2.41 },
  { s: 'ETH',  p: 3180.55,  c: -1.12 },
  { s: 'SOL',  p: 148.30,   c: 4.87 },
  { s: 'NVDA', p: 876.20,   c: 1.63 },
  { s: 'TSLA', p: 175.40,   c: -2.34 },
  { s: 'AAPL', p: 189.60,   c: 0.82 },
  { s: 'SPY',  p: 521.30,   c: 0.44 },
  { s: 'AMZN', p: 185.90,   c: -0.71 },
];

const NEWS = [
  { id: 0, title: 'Fed signals rate cut in Q3 amid cooling inflation data', src: 'Reuters', t: '3m' },
  { id: 1, title: 'Bitcoin ETF inflows hit $800M in single session record', src: 'Bloomberg', t: '12m' },
  { id: 2, title: 'NVDA earnings beat consensus by 18% on AI data center demand', src: 'WSJ', t: '28m' },
  { id: 3, title: 'ECB holds rates steady, warns of prolonged economic uncertainty', src: 'FT', t: '1h' },
  { id: 4, title: 'Solana network processes 65k TPS in stress test', src: 'CoinDesk', t: '1h' },
];

const SPARK = [0.3, 0.5, 0.4, 0.7, 0.6, 0.85, 0.75, 0.9, 0.8, 1.0];
function sparkPath(pts) {
  return pts.map((y, i) => `${i === 0 ? 'M' : 'L'}${(i / (pts.length - 1)) * 100},${30 - y * 25}`).join(' ');
}

function FearGreed({ value }) {
  const r = 34;
  const circ = Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value > 60 ? 'var(--neon)' : value < 40 ? '#ff4444' : '#f59e0b';
  const label = value > 60 ? 'Greed' : value < 40 ? 'Fear' : 'Neutral';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width="80" height="46" viewBox="0 0 80 46">
        <path d="M8,44 A34,34 0 0,1 72,44" fill="none" stroke="var(--surface-high)" strokeWidth="7" strokeLinecap="round" />
        <path d="M8,44 A34,34 0 0,1 72,44" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div style={{ fontSize: 20, fontWeight: 700, color, marginTop: -8 }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fg, setFg] = useState(72);
  const [pv, setPv] = useState(42893.24);
  const [pc, setPc] = useState(3.12);

  const refresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setFg(Math.floor(Math.random() * 40) + 50);
      setPv(42893.24 + (Math.random() - 0.5) * 1000);
      setPc(+(Math.random() * 6 - 1).toFixed(2));
      setLoading(false);
    }, 600);
  }, []);

  useEffect(() => { refresh(); }, []);

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', fontFamily: "'JetBrains Mono', monospace", paddingBottom: 'calc(72px + env(safe-area-inset-bottom))' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--neon)', boxShadow: '0 0 6px var(--neon)', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>TRACKR</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>TERMINAL</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={refresh} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          </button>
          <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <Settings size={15} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[90, 120, 60, 100, 80].map((w, i) => (
            <div key={i} style={{ height: 14, width: `${w}%`, borderRadius: 4, background: 'var(--surface-high)', animation: 'pulse 1.4s ease-in-out infinite alternate' }} />
          ))}
        </div>
      ) : (
        <>
          <div style={{ padding: '20px 16px 0' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Portfolio Value</div>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>
                    ${pv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    {pc >= 0 ? <TrendingUp size={12} color="var(--neon)" /> : <TrendingDown size={12} color="#ff4444" />}
                    <span style={{ fontSize: 13, fontWeight: 600, color: pc >= 0 ? 'var(--neon)' : '#ff4444' }}>
                      {pc >= 0 ? '+' : ''}{pc}% today
                    </span>
                  </div>
                </div>
                <svg width="110" height="36" viewBox="0 0 100 30" preserveAspectRatio="none" style={{ paddingTop: 4 }}>
                  <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--neon)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--neon)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={sparkPath(SPARK) + ' L100,30 L0,30 Z'} fill="url(#sg)" />
                  <path d={sparkPath(SPARK)} fill="none" stroke="var(--neon)" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          <div style={{ padding: '14px 0 0', overflowX: 'auto', scrollbarWidth: 'none' }}>
            <div style={{ display: 'flex', gap: 8, padding: '0 16px', width: 'max-content' }}>
              {MOVERS.map(m => (
                <div key={m.s} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px', minWidth: 90 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em' }}>{m.s}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>${m.p < 1000 ? m.p.toFixed(2) : m.p.toLocaleString()}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: m.c >= 0 ? 'var(--neon)' : '#ff4444', marginTop: 1 }}>{m.c >= 0 ? '+' : ''}{m.c}%</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '14px 16px 0', display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Signals</div>
              {[{ s: 'BTC', sig: 'BUY' }, { s: 'ETH', sig: 'HOLD' }, { s: 'NVDA', sig: 'BUY' }].map(item => (
                <div key={item.s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{item.s}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
                    background: item.sig === 'BUY' ? 'rgba(0,255,136,0.1)' : 'rgba(85,85,85,0.2)',
                    color: item.sig === 'BUY' ? 'var(--neon)' : 'var(--text-muted)',
                    border: `1px solid ${item.sig === 'BUY' ? 'var(--border-bright)' : 'transparent'}` }}>{item.sig}</span>
                </div>
              ))}
              <button onClick={() => navigate('/signals')} style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: 8, fontSize: 11, color: 'var(--neon)', display: 'flex', alignItems: 'center', gap: 2 }}>
                All signals <ChevronRight size={12} />
              </button>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>F&G</div>
              <FearGreed value={fg} />
            </div>
          </div>

          <div style={{ padding: '14px 16px 0' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Newspaper size={13} color="var(--text-muted)" />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>News</span>
                </div>
                <button onClick={() => navigate('/markets?tab=news')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: 'var(--neon)', display: 'flex', alignItems: 'center', gap: 2 }}>
                  More <ChevronRight size={11} />
                </button>
              </div>
              {NEWS.map((item, i) => (
                <div key={item.id} style={{ padding: '10px 14px', borderBottom: i < NEWS.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', gap: 10, cursor: 'pointer' }}
                  onClick={() => navigate('/markets?tab=news')}>
                  <div style={{ fontSize: 12, lineHeight: 1.4, flex: 1 }}>{item.title}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--neon)' }}>{item.src}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.t}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '14px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { label: 'Markets', icon: TrendingUp, to: '/markets' },
              { label: 'Signals', icon: Activity, to: '/signals' },
              { label: 'AI', icon: Activity, to: '/ai' },
            ].map(({ label, icon: Icon, to }) => (
              <button key={label} onClick={() => navigate(to)}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>
                <Icon size={18} color="var(--neon)" />
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

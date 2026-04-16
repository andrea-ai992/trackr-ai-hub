import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Activity, Clock, Zap, RefreshCw, ChevronDown, ChevronUp, Radio } from 'lucide-react'

// ─── All 45 agents ────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    key: 'ai-core',
    label: '🧠 Intelligence Centrale',
    color: '#00daf3',
    glow: 'rgba(0,218,243,0.15)',
    agents: [
      { key: 'andy',    name: 'AnDy',    emoji: '🧠', role: 'Intelligence centrale',    schedule: 'always' },
      { key: 'nexus',   name: 'Nexus',   emoji: '🔗', role: 'Coordinateur d\'agents',   schedule: 'always' },
      { key: 'pulse',   name: 'Pulse',   emoji: '💓', role: 'Surveillance app',          schedule: '5min' },
      { key: 'synapse', name: 'Synapse', emoji: '⚡', role: 'Communication inter-agents',schedule: 'always' },
      { key: 'oracle',  name: 'Oracle',  emoji: '🔮', role: 'Analyse prédictive',        schedule: 'on-demand' },
    ],
  },
  {
    key: 'markets',
    label: '📈 Marchés & Trading',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.12)',
    agents: [
      { key: 'market_scanner',  name: 'MarketScanner',  emoji: '🔭', role: 'Scanner 50+ tickers',     schedule: '15min' },
      { key: 'tech_analyst',    name: 'TechAnalyst',    emoji: '📈', role: 'RSI MACD EMA Bollinger',  schedule: 'on-demand' },
      { key: 'crypto_tracker',  name: 'CryptoTracker',  emoji: '₿',  role: 'BTC/ETH/SOL prix live',   schedule: '15min' },
      { key: 'alert_bot',       name: 'AlertBot',       emoji: '🔔', role: 'Alertes prix auto',        schedule: 'always' },
      { key: 'portfolio_guard', name: 'PortfolioGuard', emoji: '🛡️', role: 'P&L et risque portfolio',  schedule: 'on-demand' },
      { key: 'sector_spy',      name: 'SectorSpy',      emoji: '🏭', role: 'Rotation sectorielle',     schedule: 'on-demand' },
      { key: 'news_digest',     name: 'NewsDigest',     emoji: '📰', role: 'Actualités marché',        schedule: '15min' },
      { key: 'sentiment_bot',   name: 'SentimentBot',   emoji: '🌡️', role: 'Fear & Greed',             schedule: 'on-demand' },
      { key: 'macro_watch',     name: 'MacroWatch',     emoji: '🌍', role: 'Indicateurs macro',         schedule: 'on-demand' },
      { key: 'options_flow',    name: 'OptionsFlow',    emoji: '🌊', role: 'Flux options inhabituels',  schedule: 'on-demand' },
    ],
  },
  {
    key: 'dev',
    label: '💻 Développement',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.12)',
    agents: [
      { key: 'code_reviewer',  name: 'CodeReviewer',  emoji: '👁️', role: 'Revue code',                schedule: '4xday' },
      { key: 'bug_hunter',     name: 'BugHunter',     emoji: '🐛', role: 'Détection de bugs',          schedule: 'on-demand' },
      { key: 'perf_optimizer', name: 'PerfOptimizer', emoji: '⚡', role: 'Performance & Core Vitals',  schedule: 'on-demand' },
      { key: 'security_audit', name: 'SecurityAudit', emoji: '🔐', role: 'Audit sécurité OWASP',       schedule: 'on-demand' },
      { key: 'refactor_bot',   name: 'RefactorBot',   emoji: '🔧', role: 'Qualité code et patterns',   schedule: 'on-demand' },
      { key: 'test_coverage',  name: 'TestCoverage',  emoji: '✅', role: 'Couverture de tests',        schedule: 'on-demand' },
      { key: 'api_monitor',    name: 'APIMonitor',    emoji: '🔌', role: 'Santé API et latence',       schedule: 'always' },
      { key: 'deploy_watch',   name: 'DeployWatch',   emoji: '🚀', role: 'Déploiements Vercel',        schedule: 'always' },
      { key: 'dependency_bot', name: 'DependencyBot', emoji: '📦', role: 'Dépendances & vulnérabilités',schedule: 'on-demand' },
      { key: 'doc_writer',     name: 'DocWriter',     emoji: '📝', role: 'Génération de docs',         schedule: 'on-demand' },
    ],
  },
  {
    key: 'design',
    label: '🎨 Design & UX',
    color: '#f9a8d4',
    glow: 'rgba(249,168,212,0.12)',
    agents: [
      { key: 'ui_inspector',   name: 'UIInspector',   emoji: '🎨', role: 'Revue composants UI',       schedule: '2xday' },
      { key: 'ux_analyst',     name: 'UXAnalyst',     emoji: '👤', role: 'Analyse flux utilisateur',   schedule: '2xday' },
      { key: 'color_master',   name: 'ColorMaster',   emoji: '🌈', role: 'Palette & contrastes',       schedule: 'on-demand' },
      { key: 'typography_bot', name: 'TypographyBot', emoji: '🔤', role: 'Hiérarchie typographique',   schedule: 'on-demand' },
      { key: 'animation_bot',  name: 'AnimationBot',  emoji: '✨', role: 'Micro-interactions',         schedule: 'on-demand' },
      { key: 'responsive_bot', name: 'ResponsiveBot', emoji: '📱', role: 'Mobile & breakpoints',       schedule: 'on-demand' },
      { key: 'access_bot',     name: 'AccessBot',     emoji: '♿', role: 'Accessibilité WCAG 2.1',     schedule: 'on-demand' },
      { key: 'pixel_perfect',  name: 'PixelPerfect',  emoji: '🔍', role: 'Espacements & alignements',  schedule: 'on-demand' },
    ],
  },
  {
    key: 'data',
    label: '📊 Données & Analyse',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.12)',
    agents: [
      { key: 'data_miner',      name: 'DataMiner',      emoji: '⛏️', role: 'Patterns marché',        schedule: 'on-demand' },
      { key: 'stats_bot',       name: 'StatsBot',       emoji: '📊', role: 'Statistiques descriptives',schedule: 'on-demand' },
      { key: 'correlation_bot', name: 'CorrelationBot', emoji: '🔗', role: 'Corrélations actifs',     schedule: 'on-demand' },
      { key: 'backtest_bot',    name: 'BacktestBot',    emoji: '⏪', role: 'Backtesting stratégies',  schedule: 'on-demand' },
      { key: 'risk_metrics',    name: 'RiskMetrics',    emoji: '⚖️', role: 'VaR Sharpe drawdown',     schedule: 'on-demand' },
      { key: 'flow_tracker',    name: 'FlowTracker',    emoji: '💧', role: 'Money flow & volumes',    schedule: 'on-demand' },
      { key: 'trend_spotter',   name: 'TrendSpotter',   emoji: '🎯', role: 'Tendances émergentes',    schedule: 'on-demand' },
    ],
  },
  {
    key: 'utility',
    label: '🔧 Utilitaires',
    color: '#94a3b8',
    glow: 'rgba(148,163,184,0.10)',
    agents: [
      { key: 'scheduler',  name: 'Scheduler',  emoji: '⏰', role: 'Tâches planifiées',          schedule: 'always' },
      { key: 'report_bot', name: 'ReportBot',  emoji: '📋', role: 'Rapports quotidiens',         schedule: '1xday' },
      { key: 'translator', name: 'Translator', emoji: '🌐', role: 'Traduction multi-langues',    schedule: 'on-demand' },
      { key: 'web_scraper',name: 'WebScraper', emoji: '🕷️', role: 'Recherche web',               schedule: 'on-demand' },
      { key: 'notifier',   name: 'Notifier',   emoji: '🔔', role: 'Notifications intelligentes', schedule: 'always' },
    ],
  },
]

const SCHEDULE_LABEL = {
  'always':    { label: 'Toujours actif', color: '#34d399', pulse: true },
  '5min':      { label: 'Toutes les 5 min', color: '#00daf3', pulse: true },
  '15min':     { label: 'Toutes les 15 min', color: '#60a5fa', pulse: false },
  '4xday':     { label: '4× par jour', color: '#a78bfa', pulse: false },
  '2xday':     { label: '2× par jour', color: '#f9a8d4', pulse: false },
  '1xday':     { label: '1× par jour', color: '#94a3b8', pulse: false },
  'on-demand': { label: 'À la demande', color: '#4b6070', pulse: false },
}

function timeAgo(ts) {
  if (!ts) return null
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (diff < 60)  return `il y a ${diff}s`
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`
  return `il y a ${Math.floor(diff / 86400)} j`
}

// ─── Mini starfield canvas ────────────────────────────────────────────────────
function Starfield() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      o: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.0002 + 0.00005,
    }))

    function draw() {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)
      for (const s of stars) {
        s.o += Math.sin(Date.now() * s.speed) * 0.003
        ctx.globalAlpha = Math.max(0.05, Math.min(0.7, s.o))
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    function resize() {
      canvas.width  = canvas.offsetWidth  * devicePixelRatio
      canvas.height = canvas.offsetHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    draw()
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return (
    <canvas ref={ref} style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none',
    }} />
  )
}

// ─── Agent card ───────────────────────────────────────────────────────────────
function AgentCard({ agent, catColor, isActive }) {
  const sch = SCHEDULE_LABEL[agent.schedule] || SCHEDULE_LABEL['on-demand']
  return (
    <div style={{
      background: 'rgba(11,19,35,0.7)',
      border: `1px solid ${isActive ? catColor : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 12,
      padding: '10px 12px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      transition: 'border-color 0.3s',
      boxShadow: isActive ? `0 0 12px ${catColor}30` : 'none',
    }}>
      <span style={{ fontSize: 18, lineHeight: 1.2, flexShrink: 0 }}>{agent.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#dbe2f8', fontFamily: 'Space Grotesk, sans-serif' }}>
            {agent.name}
          </span>
          {sch.pulse && (
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: sch.color, flexShrink: 0,
              animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite',
              boxShadow: `0 0 6px ${sch.color}`,
            }} />
          )}
        </div>
        <div style={{ fontSize: 11, color: '#4b6070', marginBottom: 4, lineHeight: 1.3 }}>{agent.role}</div>
        <div style={{ fontSize: 10, color: sch.color, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={9} />
          {sch.label}
        </div>
      </div>
    </div>
  )
}

// ─── Activity entry ───────────────────────────────────────────────────────────
function ActivityEntry({ entry }) {
  return (
    <div style={{
      display: 'flex', gap: 10, padding: '10px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: `${entry.color}20`,
        border: `1px solid ${entry.color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, flexShrink: 0,
      }}>
        {entry.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: entry.color }}>{entry.agent}</span>
          <span style={{ fontSize: 10, color: '#4b6070', flexShrink: 0 }}>{timeAgo(entry.timestamp)}</span>
        </div>
        <p style={{ fontSize: 11, color: '#8ca3af', margin: 0, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {entry.summary}
        </p>
      </div>
    </div>
  )
}

// ─── Category section ─────────────────────────────────────────────────────────
function CategorySection({ cat, activeKeys }) {
  const [open, setOpen] = useState(cat.key === 'ai-core' || cat.key === 'markets')
  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', borderRadius: 12,
          background: open ? `${cat.glow}` : 'rgba(11,19,35,0.4)',
          border: `1px solid ${open ? cat.color + '30' : 'rgba(255,255,255,0.06)'}`,
          cursor: 'pointer', color: '#dbe2f8',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>{cat.label}</span>
          <span style={{
            fontSize: 11, background: `${cat.color}20`, color: cat.color,
            borderRadius: 20, padding: '1px 8px', border: `1px solid ${cat.color}30`,
          }}>{cat.agents.length} agents</span>
        </div>
        {open ? <ChevronUp size={14} color="#4b6070" /> : <ChevronDown size={14} color="#4b6070" />}
      </button>

      {open && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8, paddingLeft: 4,
        }}>
          {cat.agents.map(a => (
            <AgentCard key={a.key} agent={a} catColor={cat.color} isActive={activeKeys.has(a.key)} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Agents() {
  const navigate = useNavigate()
  const [log, setLog]       = useState([])
  const [stats, setStats]   = useState({ lastScan: null, tasksToday: 0, totalAgents: 45, activeAgents: 0 })
  const [loading, setLoading] = useState(true)
  const [tab, setTab]       = useState('feed') // 'feed' | 'agents'
  const [lastRefresh, setLastRefresh] = useState(null)

  // Active agents from recent Discord activity
  const ACTIVE_CHANNEL_MAP = {
    market_scanner: ['market_scanner', 'news_digest'],
    crypto: ['crypto_tracker'],
    code_review: ['code_reviewer', 'bug_hunter'],
    ui_review: ['ui_inspector', 'ux_analyst'],
    reports: ['report_bot'],
    app_pulse: ['pulse', 'api_monitor', 'deploy_watch'],
  }
  const activeKeys = new Set(
    (stats.activeChannels || []).flatMap(ch => ACTIVE_CHANNEL_MAP[ch] || [])
  )
  // Always-on agents
  ;['andy', 'nexus', 'synapse', 'alert_bot', 'scheduler', 'notifier'].forEach(k => activeKeys.add(k))

  const fetchLog = useCallback(async () => {
    try {
      const res = await fetch('/api/memory?type=agents-log')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setLog(data.log || [])
      setStats(data.stats || stats)
      setLastRefresh(Date.now())
    } catch {
      // keep existing data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLog()
    const interval = setInterval(fetchLog, 30000)
    return () => clearInterval(interval)
  }, [fetchLog])

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(102,0,234,0.25) 0%, rgba(11,19,35,0) 100%)',
        paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
        paddingBottom: 20,
        paddingLeft: 16, paddingRight: 16,
        minHeight: 140,
      }}>
        <Starfield />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#bac9cc', cursor: 'pointer', padding: 0, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <ArrowLeft size={14} /> Retour
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ margin: '0 0 4px', fontSize: 22, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#dbe2f8', letterSpacing: '-0.5px' }}>
                Mission Control
              </h1>
              <p style={{ margin: 0, fontSize: 12, color: '#4b6070' }}>
                Centre de commande · 45 agents IA
              </p>
            </div>
            <button
              onClick={fetchLog}
              style={{ background: 'rgba(0,218,243,0.1)', border: '1px solid rgba(0,218,243,0.2)', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', color: '#00daf3' }}
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Stats bar */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {[
              { icon: <Radio size={12} />, label: `${stats.activeAgents + 6} actifs`, color: '#34d399' },
              { icon: <Activity size={12} />, label: `${stats.tasksToday} tâches aujourd'hui`, color: '#00daf3' },
              { icon: <Clock size={12} />,   label: stats.lastScan ? `Scan ${timeAgo(stats.lastScan)}` : 'En attente…', color: '#a78bfa' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(11,19,35,0.6)', border: `1px solid ${s.color}25`,
                borderRadius: 20, padding: '4px 10px', color: s.color, fontSize: 11,
              }}>
                {s.icon} {s.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', padding: '0 16px 12px', gap: 8 }}>
        {[
          { key: 'feed',   label: '⚡ Activité live' },
          { key: 'agents', label: '🤖 Agents (45)' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 13,
              background: tab === t.key ? 'rgba(0,218,243,0.12)' : 'rgba(11,19,35,0.5)',
              color: tab === t.key ? '#00daf3' : '#4b6070',
              borderBottom: tab === t.key ? '2px solid #00daf3' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* ── Activity Feed ── */}
        {tab === 'feed' && (
          <div>
            {/* Schedule legend */}
            <div style={{
              background: 'rgba(11,19,35,0.6)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14, padding: '12px 14px', marginBottom: 16,
            }}>
              <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: '#bac9cc', fontFamily: 'Space Grotesk, sans-serif' }}>
                🗓 Planification automatique
              </p>
              {[
                { color: '#34d399', label: 'MarketScanner + CryptoTracker + Pulse', freq: 'Toutes les 15 min · 24/7' },
                { color: '#60a5fa', label: 'CodeReviewer + BugHunter', freq: '8h · 12h · 16h · 20h UTC' },
                { color: '#f9a8d4', label: 'UIInspector + UXAnalyst', freq: '9h et 18h UTC' },
                { color: '#67e8f9', label: 'ReportBot — rapport de marché', freq: 'Quotidien à 8h UTC' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ fontSize: 11, color: '#bac9cc' }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: 10, color: '#4b6070' }}>{s.freq}</span>
                </div>
              ))}
            </div>

            {/* Live feed */}
            <div style={{ background: 'rgba(11,19,35,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#bac9cc', fontFamily: 'Space Grotesk, sans-serif' }}>
                  ⚡ Activité récente
                </p>
                {lastRefresh && <span style={{ fontSize: 10, color: '#4b6070' }}>Mis à jour {timeAgo(lastRefresh)}</span>}
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#4b6070', fontSize: 12 }}>
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} /><br />
                  Chargement de l'activité…
                </div>
              ) : log.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🌌</div>
                  <p style={{ margin: 0, fontSize: 12, color: '#4b6070' }}>
                    Aucune activité détectée.<br />Les agents postent dans Discord toutes les 15 min.
                  </p>
                </div>
              ) : (
                log.map(entry => <ActivityEntry key={entry.id} entry={entry} />)
              )}
            </div>

            {/* Recap box */}
            <div style={{
              marginTop: 16,
              background: 'linear-gradient(135deg, rgba(102,0,234,0.15), rgba(0,218,243,0.08))',
              border: '1px solid rgba(102,0,234,0.3)',
              borderRadius: 14, padding: '14px 16px',
            }}>
              <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#d1bcff', fontFamily: 'Space Grotesk, sans-serif' }}>
                🧠 AnDy — Administrateur
              </p>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: '#8ca3af', lineHeight: 1.5 }}>
                AnDy coordonne les 45 agents et peut t'expliquer ce qui se passe. Demande-lui dans Discord ou dans l'app.
              </p>
              <button
                onClick={() => navigate('/andy')}
                style={{
                  background: 'rgba(102,0,234,0.3)', border: '1px solid rgba(102,0,234,0.5)',
                  borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, color: '#d1bcff',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <Zap size={12} /> Parler à AnDy
              </button>
            </div>
          </div>
        )}

        {/* ── Agents list ── */}
        {tab === 'agents' && (
          <div>
            <p style={{ margin: '0 0 14px', fontSize: 12, color: '#4b6070' }}>
              Les agents avec un <span style={{ color: '#34d399' }}>●</span> pulsant sont actifs en ce moment.
            </p>
            {CATEGORIES.map(cat => (
              <CategorySection key={cat.key} cat={cat} activeKeys={activeKeys} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

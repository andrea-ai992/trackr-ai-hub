import { useState, useEffect, useRef } from 'react'
import { Send, RefreshCw, CheckCircle, Clock, AlertCircle, Loader, ChevronDown, ChevronUp } from 'lucide-react'

const SERVER = import.meta.env.VITE_ANDY_SERVER || 'http://62.238.12.221:4000'

const QUICK = [
  { label: '🏟 Sports ESPN', text: 'Redesign page Sports style ESPN dark, scores animés, tabs PSG/NBA/NFL/UFC' },
  { label: '📈 Markets', text: 'Redesign page Markets style Bloomberg dark, prix live pulsants, sparklines SVG' },
  { label: '🏠 Dashboard', text: 'Redesign Dashboard — hero portfolio, movers scroll, Fear&Greed gauge SVG' },
  { label: '🎨 Design tokens', text: 'Consolide src/index.css — variables CSS complètes, animations fadeUp/shimmer/pulse' },
  { label: '⚡ Perf', text: 'Optimise les performances — lazy loading, code splitting, LCP < 1.5s' },
  { label: '📰 News', text: 'Redesign page News — cards premium avec image cover, badge BREAKING, tabs catégories' },
  { label: '🔒 Sécu', text: 'Audit sécurité complet — XSS, CSRF, headers HTTP, validation inputs' },
]

function statusColor(s) {
  if (s === 'DONE')    return '#00ff88'
  if (s === 'ERROR')   return '#ef4444'
  if (s === 'RUNNING') return '#fbbf24'
  return '#555'
}

function statusIcon(s) {
  if (s === 'DONE')    return <CheckCircle size={13} color="#00ff88" />
  if (s === 'ERROR')   return <AlertCircle size={13} color="#ef4444" />
  if (s === 'RUNNING') return <Loader size={13} color="#fbbf24" style={{ animation: 'spin 1s linear infinite' }} />
  return <Clock size={13} color="#555" />
}

function timeAgo(d) {
  if (!d) return ''
  const m = Math.floor((Date.now() - new Date(d)) / 60000)
  if (m < 1) return 'maintenant'
  if (m < 60) return `${m}min`
  return `${Math.floor(m / 60)}h`
}

export default function Tasks() {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(null) // null | 'ok' | 'err'
  const [tasks, setTasks] = useState([])
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({})
  const [logsOpen, setLogsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const textRef = useRef(null)
  const intervalRef = useRef(null)

  async function load() {
    try {
      const [t, l] = await Promise.allSettled([
        fetch(`${SERVER}/api/tasks`, { signal: AbortSignal.timeout(5000) }).then(r => r.json()),
        fetch(`${SERVER}/api/logs?which=daemon`, { signal: AbortSignal.timeout(5000) }).then(r => r.json()),
      ])
      if (t.status === 'fulfilled') {
        const d = t.value
        const f = d.files || {}
        setStats({ done: (f.done||[]).length, queue: (f.queue||[]).length, run: (f.running||[]).length, err: (f.error||[]).length })
        // Combine running + queue + recent done
        const s = d.status || []
        const running = (f.running||[]).map(n => s.find(x => x.name === n.replace('.running','')) || { name: n.replace('.running',''), status: 'RUNNING' })
        const queued  = (f.queue||[]).map(n => ({ name: n.replace('.txt',''), status: 'QUEUED' }))
        const done    = s.filter(x => x.status === 'DONE' || x.status === 'ERROR').slice(-12).reverse()
        setTasks([...running, ...queued, ...done])
      }
      if (l.status === 'fulfilled') {
        setLogs((l.value.lines || []).slice(-40).reverse())
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    load()
    intervalRef.current = setInterval(load, 5000)
    return () => clearInterval(intervalRef.current)
  }, [])

  async function submit() {
    const v = text.trim()
    if (!v || sending) return
    setSending(true)
    try {
      const r = await fetch(`${SERVER}/api/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desc: v }),
        signal: AbortSignal.timeout(8000),
      })
      if (r.ok) {
        setSent('ok')
        setText('')
        setTimeout(() => { setSent(null); load() }, 2500)
      } else { setSent('err') }
    } catch { setSent('err') }
    setSending(false)
    setTimeout(() => setSent(null), 3000)
  }

  function setQuick(t) {
    setText(t)
    textRef.current?.focus()
  }

  return (
    <div className="page" style={{ paddingTop: 16, maxWidth: 520, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-.02em' }}>Tâches AnDy</div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>Donne des instructions · suivi en direct</div>
        </div>
        <button onClick={load} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '7px 10px', cursor: 'pointer', color: 'var(--t3)' }}>
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, padding: '0 16px', marginBottom: 16 }}>
        {[
          { label: 'DONE', val: stats.done, color: '#00ff88' },
          { label: 'QUEUE', val: stats.queue, color: '#a78bfa' },
          { label: 'RUN', val: stats.run, color: '#fbbf24' },
          { label: 'ERR', val: stats.err, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '10px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{s.val ?? '—'}</div>
            <div style={{ fontSize: 9, color: 'var(--t3)', marginTop: 4, letterSpacing: '.08em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Task form */}
      <div style={{ margin: '0 16px 16px', background: 'var(--bg2)', border: '1px solid rgba(0,255,136,.18)', borderRadius: 18, padding: 16 }}>
        <div style={{ fontSize: 10, color: '#00ff88', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>Nouvelle tâche</div>

        {/* Quick chips */}
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', marginBottom: 10, paddingBottom: 2, scrollbarWidth: 'none' }}>
          {QUICK.map(q => (
            <button key={q.label} onClick={() => setQuick(q.text)}
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--t3)', fontSize: 11, padding: '6px 12px', borderRadius: 20, whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
              {q.label}
            </button>
          ))}
        </div>

        <textarea
          ref={textRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Décris ce qu'AnDy doit faire…"
          rows={3}
          style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 14px', color: 'var(--t1)', fontSize: 14, fontFamily: 'inherit', resize: 'none', outline: 'none', lineHeight: 1.5, transition: '.2s', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,.35)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) submit() }}
        />

        <button onClick={submit} disabled={sending || !text.trim()}
          style={{ marginTop: 10, width: '100%', padding: 14, background: sent === 'ok' ? '#00cc66' : sent === 'err' ? '#ef4444' : '#00ff88', color: '#080808', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: '.15s', opacity: (!text.trim() && !sending) ? .5 : 1 }}>
          {sending ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
          {sent === 'ok' ? '✅ Tâche reçue par le serveur !' : sent === 'err' ? '⚠ Erreur — serveur inaccessible' : 'Envoyer à AnDy →'}
        </button>
      </div>

      {/* Task list */}
      <div style={{ margin: '0 16px 16px' }}>
        <div style={{ fontSize: 10, color: 'var(--t3)', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>Statut des tâches</div>
        {loading ? (
          <div style={{ color: 'var(--t3)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>Connexion au serveur…</div>
        ) : tasks.length === 0 ? (
          <div style={{ color: 'var(--t3)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>Aucune tâche</div>
        ) : tasks.map((t, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${t.status === 'RUNNING' ? 'rgba(251,191,36,.2)' : 'var(--border)'}`, borderRadius: 14, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ marginTop: 2, flexShrink: 0 }}>{statusIcon(t.status)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: 'var(--t2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{t.name}</div>
              {t.desc && <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{t.desc}</div>}
              {t.files?.length > 0 && <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {t.files.map((f, fi) => <span key={fi} style={{ fontSize: 9, background: 'rgba(0,212,255,.07)', color: '#00d4ff', padding: '2px 6px', borderRadius: 5 }}>{f.split('/').pop()}</span>)}
              </div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: statusColor(t.status), textTransform: 'uppercase', letterSpacing: '.06em' }}>{t.status}</div>
              {t.startedAt && <div style={{ fontSize: 9, color: 'var(--t3)' }}>{timeAgo(t.startedAt)}</div>}
              {t.dur > 0 && <div style={{ fontSize: 9, color: 'var(--t3)' }}>{t.dur}s</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Logs */}
      <div style={{ margin: '0 16px 24px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden' }}>
        <button onClick={() => setLogsOpen(o => !o)}
          style={{ width: '100%', background: 'transparent', border: 'none', padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--t3)' }}>
          <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600 }}>Logs daemon</div>
          {logsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {logsOpen && (
          <div style={{ padding: '0 12px 12px', fontFamily: "'SF Mono', monospace", maxHeight: 300, overflowY: 'auto' }}>
            {logs.length === 0
              ? <div style={{ fontSize: 11, color: 'var(--t3)', padding: '8px 0' }}>Aucun log</div>
              : logs.map((l, i) => {
                  const col = l.includes('DONE') || l.includes('pushed') ? '#00ff88'
                    : l.includes('ERROR') ? '#ef4444'
                    : l.includes('TASK') || l.includes('tâche') ? '#a78bfa'
                    : l.includes('build') ? '#00d4ff'
                    : 'var(--t3)'
                  return <div key={i} style={{ fontSize: 10, color: col, padding: '2px 0', lineHeight: 1.6, borderBottom: '1px solid rgba(255,255,255,.03)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l}</div>
                })}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Activity, Plus } from 'lucide-react'

// ── Server config ─────────────────────────────────────────────────────────────
const SERVER  = import.meta.env.VITE_ANDY_SERVER || 'http://62.238.12.221:4000'
const PASS    = import.meta.env.VITE_ANDY_PASS   || 'trackr2024'
const HEADERS = { Authorization: `Bearer ${PASS}` }

// ── Pipeline stages ───────────────────────────────────────────────────────────
const STAGES = [
  { id: 'planning',   label: 'Plan',    color: '#a78bfa' },
  { id: 'generating', label: 'Code',    color: '#38bdf8' },
  { id: 'testing',    label: 'Review',  color: '#fbbf24' },
  { id: 'safe',       label: 'Safe',    color: '#00cc66' },
  { id: 'live',       label: 'Live',    color: '#00ff88' },
]

function timeAgo(ts) {
  if (!ts) return ''
  const s = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (s < 60)   return `${s}s`
  if (s < 3600) return `${Math.floor(s/60)}min`
  return `${Math.floor(s/3600)}h`
}

function PipelineBar({ stage }) {
  const idx = STAGES.findIndex(s => s.id === stage)
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginTop: 6 }}>
      {STAGES.map((s, i) => (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <div style={{ width: i <= idx ? 28 : 22, height: 4, borderRadius: 2, background: i <= idx ? s.color : 'var(--bg4)', transition: 'all 300ms ease' }} />
          {i < STAGES.length - 1 && <div style={{ width: 6, height: 1, background: i < idx ? 'var(--t3)' : 'var(--bg4)' }} />}
        </div>
      ))}
      {idx >= 0 && <span style={{ fontSize: 9, fontWeight: 700, color: STAGES[idx].color, marginLeft: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{STAGES[idx].label}</span>}
    </div>
  )
}

function TaskCard({ task, isRunning }) {
  const isLive = task.stage === 'live'
  const isErr  = task.status === 'ERROR' || task.stage === 'error'
  const accent = isErr ? 'var(--red)' : isLive ? 'var(--green)' : isRunning ? 'var(--blue)' : 'var(--t3)'

  return (
    <div style={{ padding: '13px 14px', borderRadius: 'var(--radius)', background: 'var(--bg2)', borderLeft: `3px solid ${accent}`, border: `1px solid var(--border)`, borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
        <p style={{ fontSize: 12, color: 'var(--t1)', fontWeight: 600, lineHeight: 1.35, flex: 1 }}>
          {(task.desc || task.name || '').slice(0, 90)}
        </p>
        <div style={{ display: 'flex', align: 'center', gap: 5, flexShrink: 0 }}>
          {isErr  && <XCircle     size={14} color="var(--red)"   />}
          {isLive && <CheckCircle size={14} color="var(--green)" />}
          {isRunning && !isErr && !isLive && <Activity size={14} color="var(--blue)" style={{ animation: 'pulse 1.5s infinite' }} />}
        </div>
      </div>
      {isRunning && task.stage && <PipelineBar stage={task.stage} />}
      {task.files?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
          {task.files.map(f => (
            <span key={f} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--t3)', fontFamily: 'monospace' }}>
              {f.split('/').pop()}
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
        {task.startedAt && <span style={{ fontSize: 10, color: 'var(--t3)' }}>il y a {timeAgo(task.startedAt)}</span>}
        {task.dur > 0    && <span style={{ fontSize: 10, color: 'var(--t3)' }}>· {task.dur}s</span>}
        {isErr && task.error && <span style={{ fontSize: 10, color: 'var(--red)', opacity: 0.8 }}>· {task.error.slice(0, 50)}</span>}
      </div>
    </div>
  )
}

export default function BrainStatus() {
  const navigate = useNavigate()
  const [data,      setData]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [lastFetch, setLastFetch] = useState(null)
  const [newTask,   setNewTask]   = useState('')
  const [sending,   setSending]   = useState(false)
  const [tab,       setTab]       = useState('live')

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const r = await fetch(`${SERVER}/api/tasks`, { headers: HEADERS, signal: AbortSignal.timeout(8000) })
      if (r.ok) {
        const d = await r.json()
        setData(d)
        setLastFetch(new Date())
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [])
  useEffect(() => {
    const id = setInterval(() => load(true), 15000)
    return () => clearInterval(id)
  }, [load])

  async function submitTask() {
    if (!newTask.trim()) return
    setSending(true)
    try {
      await fetch(`${SERVER}/api/task`, {
        method: 'POST',
        headers: { ...HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ desc: newTask.trim() }),
        signal: AbortSignal.timeout(8000),
      })
      setNewTask('')
      setTimeout(() => load(true), 1000)
    } catch {}
    setSending(false)
  }

  const files   = data?.files   || { queue: [], running: [], done: [], error: [] }
  const status  = data?.status  || []

  // Running tasks enrichis
  const running = files.running.map(name => status.find(t => t.name === name) || { name, stage: 'generating', status: 'RUNNING' })
  // Done récents
  const recent  = status.filter(t => t.status === 'DONE').slice(-20).reverse()
  // Errors
  const errors  = status.filter(t => t.status === 'ERROR').slice(-10).reverse()

  const stats = [
    { label: 'DONE',    value: files.done.length,    color: 'var(--green)' },
    { label: 'RUNNING', value: files.running.length, color: 'var(--blue)'  },
    { label: 'QUEUE',   value: files.queue.length,   color: 'var(--amber)' },
    { label: 'ERRORS',  value: files.error.length,   color: 'var(--red)'   },
  ]

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}>

      {/* ── Header ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg)', borderBottom: '1px solid var(--border)', paddingTop: 'max(52px, env(safe-area-inset-top, 0px))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px 12px' }}>
          <button onClick={() => navigate(-1)} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)' }}>
            <ArrowLeft size={16} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)' }}>AnDy Brain</span>
              {files.running.length > 0 && <span className="live-dot" />}
            </div>
            {lastFetch && <p style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1 }}>sync {timeAgo(lastFetch)}</p>}
          </div>
          <button onClick={() => load()} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: loading ? 'var(--t3)' : 'var(--t2)' }}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
          </button>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, padding: '0 16px 12px' }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', textAlign: 'center' }}>
              <div className="num" style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 8, color: 'var(--t3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '0 16px 10px' }}>
          {[
            { id: 'live',   label: `⚡ Live${running.length ? ` (${running.length})` : ''}` },
            { id: 'done',   label: `✅ Récents` },
            { id: 'errors', label: `⚠️ Erreurs${errors.length ? ` (${errors.length})` : ''}` },
            { id: 'task',   label: '＋ Tâche' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="tab-btn" style={{ fontSize: 11, color: tab === t.id ? 'var(--green)' : 'var(--t3)', background: tab === t.id ? 'var(--green-bg)' : 'transparent', borderColor: tab === t.id ? 'var(--border-hi)' : 'var(--border)' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 16px 0' }}>

        {/* ── Live tab ── */}
        {tab === 'live' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {running.length === 0 && files.queue.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--t3)' }}>
                <Activity size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ fontSize: 14 }}>En attente de tâches…</p>
              </div>
            )}
            {running.map(t => <TaskCard key={t.name} task={t} isRunning />)}
            {files.queue.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <p className="section-label" style={{ marginBottom: 8 }}>En queue ({files.queue.length})</p>
                {files.queue.slice(0, 5).map(name => (
                  <div key={name} style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg2)', border: '1px solid var(--border)', marginBottom: 6 }}>
                    <p style={{ fontSize: 12, color: 'var(--t2)' }}>{name.replace(/\.txt$/, '').replace(/^(auto|manual|chat)-\d+-/, '')}</p>
                  </div>
                ))}
                {files.queue.length > 5 && <p style={{ fontSize: 11, color: 'var(--t3)', textAlign: 'center', marginTop: 4 }}>+ {files.queue.length - 5} autres</p>}
              </div>
            )}
          </div>
        )}

        {/* ── Done tab ── */}
        {tab === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recent.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--t3)', padding: '40px 0', fontSize: 14 }}>Aucune tâche terminée</p>
            ) : recent.map(t => <TaskCard key={t.name + t.startedAt} task={t} />)}
          </div>
        )}

        {/* ── Errors tab ── */}
        {tab === 'errors' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {errors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircle size={32} color="var(--green)" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: 14, color: 'var(--t2)' }}>Aucune erreur 🎉</p>
              </div>
            ) : errors.map(t => <TaskCard key={t.name} task={t} />)}
          </div>
        )}

        {/* ── New task tab ── */}
        {tab === 'task' && (
          <div>
            <p style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 12, lineHeight: 1.5 }}>
              Donne une tâche à AnDy. Il l'exécute automatiquement, pousse le code sur GitHub et déploie sur Vercel.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Améliore le design de la page Dashboard — cartes plus propres, neon vert cohérent',
                'Ajoute un graphique de portfolio en temps réel sur la page Markets',
                'Améliore les animations de la page Sports — scores plus dynamiques',
                'Optimise les performances — code splitting sur les pages lourdes',
                'Améliore le design de la page News — cards avec accent de couleur par source',
              ].map(t => (
                <button key={t} onClick={() => setNewTask(t)} className="press-scale-sm"
                  style={{ textAlign: 'left', padding: '11px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg2)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--t2)', lineHeight: 1.35 }}>
                  {t}
                </button>
              ))}
            </div>
            <textarea
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              placeholder="Décris la tâche en détail…"
              rows={4}
              style={{ width: '100%', marginTop: 12, padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg2)', border: '1px solid var(--border-hi)', color: 'var(--t1)', fontSize: 13, fontFamily: 'inherit', resize: 'none', outline: 'none' }}
            />
            <button onClick={submitTask} disabled={!newTask.trim() || sending} className="press-scale"
              style={{ width: '100%', marginTop: 10, padding: '13px', borderRadius: 'var(--radius)', background: newTask.trim() ? 'var(--green-bg)' : 'var(--bg2)', border: `1px solid ${newTask.trim() ? 'var(--border-hi)' : 'var(--border)'}`, color: newTask.trim() ? 'var(--green)' : 'var(--t3)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Plus size={16} />
              {sending ? 'Envoi…' : 'Envoyer à AnDy'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

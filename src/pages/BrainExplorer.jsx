import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, ChevronRight, ChevronDown, Activity, CheckCircle, XCircle, Clock, Zap, Cpu, GitCommit } from 'lucide-react'

const SERVER  = import.meta.env.VITE_ANDY_SERVER || 'http://62.238.12.221:4000'
const PASS    = import.meta.env.VITE_ANDY_PASS   || 'trackr2024'
const HEADERS = { Authorization: `Bearer ${PASS}` }

const STAGE_COLOR = { idle:'var(--t3)', planning:'#a78bfa', generating:'var(--blue)', testing:'var(--amber)', safe:'var(--green-dim)', live:'var(--green)', error:'var(--red)' }
const STAGE_BAR   = { idle:0, planning:20, generating:50, testing:72, safe:88, live:100, error:0 }

function timeAgo(ts) {
  if (!ts) return ''
  const s = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (s < 60)   return `${s}s`
  if (s < 3600) return `${Math.floor(s/60)}m`
  return `${Math.floor(s/3600)}h`
}

// ── Worker Card ───────────────────────────────────────────────────────────────
function WorkerCard({ id, worker }) {
  const stage = worker.stage || 'idle'
  const pct   = STAGE_BAR[stage] || 0
  const col   = STAGE_COLOR[stage] || 'var(--t3)'
  const desc  = worker.task
    ? worker.task.replace(/^(auto|manual|chat|NUIT|v2|critical|fix)-[\d]+-?/, '').replace(/-/g, ' ')
    : 'idle'

  return (
    <div style={{ padding: '10px 12px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 700, width: 20, flexShrink: 0 }}>#{id}</span>
      <div style={{ flex: 1 }}>
        <div style={{ height: 3, background: 'var(--bg4, #1c1c1c)', borderRadius: 2, overflow: 'hidden', marginBottom: 5 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: 2, transition: 'width 600ms ease, background 300ms' }} />
        </div>
        <p style={{ fontSize: 10, color: 'var(--t2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{desc.slice(0, 50)}</p>
      </div>
      <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 999, background: `${col}22`, color: col, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
        {stage}
      </span>
    </div>
  )
}

// ── Task Node — infinite tree ─────────────────────────────────────────────────
function TaskNode({ task, depth = 0 }) {
  const [open, setOpen] = useState(depth < 1)

  const isLive  = task.status === 'DONE'
  const isErr   = task.status === 'ERROR'
  const isRun   = task.status === 'RUNNING'
  const accent  = isErr ? 'var(--red)' : isLive ? 'var(--green-dim)' : isRun ? 'var(--blue)' : 'var(--t3)'
  const icon    = isErr ? '✗' : isLive ? '✓' : isRun ? '◎' : '○'
  const files   = task.files || []
  const hasChildren = files.length > 0

  return (
    <div style={{ marginLeft: depth * 14 }}>
      <div
        onClick={() => hasChildren && setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '7px 10px', borderRadius: 8, cursor: hasChildren ? 'pointer' : 'default', background: 'transparent', transition: 'background 150ms' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {hasChildren
          ? <span style={{ color: 'var(--t3)', flexShrink: 0, marginTop: 1 }}>{open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}</span>
          : <span style={{ width: 11, flexShrink: 0 }} />
        }
        <span style={{ fontSize: 10, color: accent, flexShrink: 0, marginTop: 1 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, color: 'var(--t1)', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {(task.desc || task.name || '').slice(0, 80)}
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
            {task.startedAt && <span style={{ fontSize: 9, color: 'var(--t3)' }}>{timeAgo(task.startedAt)}</span>}
            {task.dur > 0   && <span style={{ fontSize: 9, color: 'var(--t3)' }}>{task.dur}s</span>}
            {isErr && task.error && <span style={{ fontSize: 9, color: 'var(--red)', opacity: 0.8 }}>{task.error.slice(0, 40)}</span>}
          </div>
        </div>
      </div>

      {open && hasChildren && (
        <div style={{ borderLeft: `1px solid var(--border)`, marginLeft: 18, paddingLeft: 4 }}>
          {files.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 10px', borderRadius: 6 }}>
              <span style={{ width: 11, flexShrink: 0 }} />
              <span style={{ fontSize: 9, color: 'var(--green-dim)' }}>📄</span>
              <span style={{ fontSize: 10, color: 'var(--t2)', fontFamily: 'monospace' }}>{f}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Folder ────────────────────────────────────────────────────────────────────
function Folder({ label, icon, count, accent, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ marginBottom: 4 }}>
      <div onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, cursor: 'pointer', background: open ? 'var(--bg2)' : 'transparent', border: open ? '1px solid var(--border)' : '1px solid transparent', transition: 'all 150ms' }}>
        <span style={{ fontSize: 12 }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', flex: 1 }}>{label}</span>
        <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 999, background: `${accent}22`, color: accent, fontWeight: 700 }}>{count}</span>
        <span style={{ color: 'var(--t3)' }}>{open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</span>
      </div>
      {open && (
        <div style={{ marginTop: 4, borderLeft: '1px solid var(--border)', marginLeft: 20, paddingLeft: 4 }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ── Log Line ──────────────────────────────────────────────────────────────────
function LogLine({ entry }) {
  const msg = (entry.msg || '').replace(/^\[[\d\-T:.Z]+\]\s*/, '')
  const isOk  = /done|pushed|envoyé|ok/i.test(msg)
  const isErr = /error|erreur|fatal|échec/i.test(msg)
  const isGen = /auto-gen|new task|generating/i.test(msg)
  const color = isErr ? 'var(--red)' : isOk ? 'var(--green-dim)' : isGen ? 'var(--amber)' : 'var(--t3)'
  return (
    <div style={{ display: 'flex', gap: 8, padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <span style={{ fontSize: 9, color: 'var(--t3)', flexShrink: 0, fontFamily: 'monospace' }}>
        {entry.ts ? entry.ts.slice(11, 19) : ''}
      </span>
      <span style={{ fontSize: 10, color, lineHeight: 1.4, wordBreak: 'break-all' }}>{msg}</span>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BrainExplorer() {
  const navigate = useNavigate()
  const [live,    setLive]    = useState(null)
  const [tasks,   setTasks]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('workers')
  const [newTask, setNewTask] = useState('')
  const [feedback, setFeedback] = useState('');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [liveR, tasksR] = await Promise.all([
        fetch(`${SERVER}/api/live`,  { headers: HEADERS, signal: AbortSignal.timeout(5000) }),
        fetch(`${SERVER}/api/tasks`, { headers: HEADERS, signal: AbortSignal.timeout(5000) }),
      ])
      if (liveR.ok)  setLive(await liveR.json())
      if (tasksR.ok) setTasks(await tasksR.json())
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const id = setInterval(() => load(true), 4000)
    return () => clearInterval(id)
  }, [load])

  const submitTask = async () => {
    if (!newTask) return;
    try {
      const response = await fetch(`${SERVER}/api/task`, {
        method: 'POST',
        headers: { ...HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: newTask }),
      });
      if (response.ok) {
        setFeedback('Tâche ajoutée à la queue');
        setNewTask('');
        setTimeout(() => {
          setFeedback('');
          load();
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la tâche:', error);
    }
  };

  const st      = live?.stats || {}
  const workers = live?.workers || {}
  const log     = (live?.log || []).slice().reverse()
  const status  = tasks?.status || []
  const done    = status.filter(t => t.status === 'DONE')
  const errors  = status.filter(t => t.status === 'ERROR')
  const running = status.filter(t => t.status === 'RUNNING')
  const wIds    = Object.keys(workers).filter(k => k !== '_current').sort()

  const age = live?.updatedAt ? Math.floor((Date.now() - new Date(live.updatedAt)) / 1000) : 999
  const isLive = age < 30

  const TABS = [
    { id: 'workers', label: `⚡ Workers${wIds.length ? ` (${wIds.length})` : ''}` },
    { id: 'log',     label: '📟 Log' },
    { id: 'done',    label: `✅ Done (${done.length})` },
    { id: 'errors',  label: `⚠️ Err (${errors.length})` },
    { id: 'tree',    label: '🗂 Tree' },
  ]

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', paddingBottom: 'calc(100px + env(safe-area-inset-bottom,0px))' }}>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg)', borderBottom: '1px solid var(--border)', paddingTop: 'max(52px, env(safe-area-inset-top,0px))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px 12px' }}>
          <button onClick={() => navigate(-1)} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t2)' }}>
            <ArrowLeft size={16} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)' }}>AnDy Explorer</span>
              {isLive && <span className="live-dot" />}
            </div>
            <p style={{ fontSize: 10, color: isLive ? 'var(--green-dim)' : 'var(--red)', marginTop: 1 }}>
              {isLive ? `live · ${age}s` : 'daemon hors ligne'}
            </p>
          </div>
          <button onClick={() => load()} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: loading ? 'var(--t3)' : 'var(--t2)' }}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
          </button>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, padding: '0 16px 10px' }}>
          {[
            { label: 'DONE',    v: st.done    ?? '—', color: 'var(--green)' },
            { label: 'ERRORS',  v: st.errors  ?? '—', color: 'var(--red)'   },
            { label: 'QUEUE',   v: st.queue   ?? '—', color: 'var(--amber)' },
            { label: 'RUNNING', v: st.running ?? '—', color: 'var(--blue)'  },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 0', textAlign: 'center' }}>
              <div className="num" style={{ fontSize: 18, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 10 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '10px', background: tab === t.id ? 'var(--bg2)' : 'transparent', border: 'none', color: 'var(--t1)', fontWeight: tab === t.id ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'workers' && (
        <div>
          {Object.entries(workers).map(([id, worker]) => (
            <WorkerCard key={id} id={id} worker={worker} />
          ))}
          <button onClick={() => window.open('http://62.238.12.221:4000/brain', '_blank')} style={{ marginTop: 20, padding: '10px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 5 }}>
            Ouvrir dashboard live
          </button>
        </div>
      )}

      {tab === 'log' && log.map((entry, index) => <LogLine key={index} entry={entry} />)}
      {tab === 'done' && done.map(task => <TaskNode key={task.id} task={task} />)}
      {tab === 'errors' && errors.map(task => <TaskNode key={task.id} task={task} />)}
      {tab === 'tree' && <div>Tree content here...</div>}

      {/* New Task Section */}
      <div style={{ marginTop: 20, padding: '10px', background: 'var(--bg2)',
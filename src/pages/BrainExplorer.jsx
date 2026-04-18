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
              <div style={{ fontSize: 8, color: 'var(--t3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '0 16px 10px', overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="tab-btn"
              style={{ fontSize: 10, whiteSpace: 'nowrap', color: tab === t.id ? 'var(--green)' : 'var(--t3)', background: tab === t.id ? 'var(--green-bg)' : 'transparent', borderColor: tab === t.id ? 'var(--border-hi)' : 'var(--border)' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 16px 0' }}>

        {/* Workers tab */}
        {tab === 'workers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {wIds.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--t3)' }}>
                <Cpu size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ fontSize: 13 }}>Daemon pas encore connecté</p>
                <p style={{ fontSize: 11, marginTop: 6, opacity: 0.6 }}>Serveur: {SERVER}</p>
              </div>
            ) : wIds.map(id => (
              <WorkerCard key={id} id={id} worker={workers[id]} />
            ))}
            {running.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Tâches actives</p>
                {running.map(t => <TaskNode key={t.name} task={t} />)}
              </div>
            )}
            <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', padding: '10px 12px', background: 'var(--bg2)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <Zap size={12} color="var(--amber)" />
              <span style={{ fontSize: 10, color: 'var(--t3)' }}>Coût estimé: </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>${st.cost || '0.00'}</span>
              <span style={{ fontSize: 10, color: 'var(--t3)', marginLeft: 'auto' }}>Cycle #{st.cycles || 0}</span>
            </div>
          </div>
        )}

        {/* Log tab */}
        {tab === 'log' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {log.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--t3)', padding: '40px 0', fontSize: 13 }}>Aucun log</p>
            ) : log.map((e, i) => <LogLine key={i} entry={e} />)}
          </div>
        )}

        {/* Done tab */}
        {tab === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {done.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--t3)', padding: '40px 0', fontSize: 13 }}>Aucune tâche terminée</p>
            ) : done.slice().reverse().map(t => <TaskNode key={t.name + t.startedAt} task={t} />)}
          </div>
        )}

        {/* Errors tab */}
        {tab === 'errors' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {errors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircle size={32} color="var(--green)" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: 13, color: 'var(--t2)' }}>Aucune erreur</p>
              </div>
            ) : errors.map(t => <TaskNode key={t.name} task={t} />)}
          </div>
        )}

        {/* Tree tab — infinite folder explorer */}
        {tab === 'tree' && (
          <div>
            <Folder label="En cours" icon="⚡" count={running.length} accent="var(--blue)" defaultOpen>
              {running.length === 0
                ? <p style={{ fontSize: 11, color: 'var(--t3)', padding: '8px 12px' }}>Aucune tâche en cours</p>
                : running.map(t => <TaskNode key={t.name} task={t} depth={0} />)
              }
            </Folder>
            <Folder label="Queue" icon="⏳" count={st.queue || 0} accent="var(--amber)" defaultOpen={false}>
              {(tasks?.files?.queue || []).slice(0, 20).map(name => (
                <div key={name} style={{ display: 'flex', gap: 7, padding: '6px 10px' }}>
                  <span style={{ fontSize: 10, color: 'var(--t3)' }}>○</span>
                  <span style={{ fontSize: 11, color: 'var(--t2)' }}>{name.replace(/^(auto|manual|chat)-[\d]+-?/, '').replace(/-/g, ' ').slice(0, 60)}</span>
                </div>
              ))}
            </Folder>
            <Folder label="Terminées" icon="✅" count={done.length} accent="var(--green-dim)" defaultOpen={false}>
              {done.slice(-30).reverse().map(t => <TaskNode key={t.name} task={t} depth={0} />)}
            </Folder>
            <Folder label="Erreurs" icon="⚠️" count={errors.length} accent="var(--red)" defaultOpen={false}>
              {errors.slice(-20).map(t => <TaskNode key={t.name} task={t} depth={0} />)}
            </Folder>
            <Folder label="Mémoire AnDy" icon="🧠" count="∞" accent="#a78bfa" defaultOpen={false}>
              <p style={{ fontSize: 11, color: 'var(--t3)', padding: '8px 12px' }}>Ouvre <a href={`${SERVER}/brain`} target="_blank" rel="noreferrer" style={{ color: 'var(--green-dim)' }}>le dashboard live</a> pour voir la mémoire complète.</p>
            </Folder>
          </div>
        )}

      </div>
    </div>
  )
}

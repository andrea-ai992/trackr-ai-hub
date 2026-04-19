// src/pages/AIControl.jsx — AnDy AI Control Center
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Brain, Radio, Zap, Send, RefreshCw, CheckCircle, Clock, AlertCircle, ChevronRight, Activity } from 'lucide-react'

const QUICK_TASKS = [
  'Améliore le design de la page Sports — style dense comme app de paris',
  'Ajoute un sparkline SVG sur chaque ligne de la watchlist Markets',
  'Crée une animation skeleton sur toutes les pages qui chargent',
  'Optimise les performances — lazy load les pages lourdes',
  'Améliore le BottomNav — micro-animations au tap',
]

const STATUS_COLORS = {
  online: 'var(--neon)',
  offline: '#ff4444',
  busy: '#f59e0b',
}

function useRecentCommits() {
  const [commits, setCommits] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('https://api.github.com/repos/andrea-ai992/trackr-ai-hub/commits?per_page=10', {
        headers: { Accept: 'application/vnd.github.v3+json' }
      })
      if (!r.ok) throw new Error()
      const data = await r.json()
      setCommits(data.map(c => ({
        sha: c.sha.slice(0, 7),
        msg: c.commit.message.replace(/\n.*/s, '').slice(0, 70),
        date: new Date(c.commit.author.date),
        isAndy: c.commit.author.name?.includes('andrea-ai') || c.commit.message.startsWith('[AnDy]'),
      })))
    } catch {
      setCommits([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch_() }, [])
  return { commits, loading, refresh: fetch_ }
}

function timeAgo(d) {
  const m = Math.floor((Date.now() - d) / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m`
  if (m < 1440) return `${Math.floor(m / 60)}h`
  return `${Math.floor(m / 1440)}d`
}

export default function AIControl() {
  const navigate = useNavigate()
  const { commits, loading: cLoading, refresh } = useRecentCommits()
  const [task, setTask] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const andyCommits = commits.filter(c => c.isAndy)
  const lastActivity = andyCommits[0]?.date
  const daemonStatus = lastActivity && (Date.now() - lastActivity) < 3600000 ? 'online' : 'offline'

  async function submitTask() {
    if (!task.trim()) return
    setSending(true)
    try {
      await fetch('/api/andy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: task.trim() })
      })
    } catch {}
    setSent(true)
    setTask('')
    setTimeout(() => setSent(false), 3000)
    setSending(false)
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', fontFamily: "'JetBrains Mono', monospace", paddingBottom: 'calc(72px + env(safe-area-inset-bottom))' }}>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '12px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bot size={16} color="var(--neon)" />
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>AI Control</span>
          </div>
          <button onClick={refresh} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <RefreshCw size={14} style={cLoading ? { animation: 'spin 1s linear infinite' } : {}} />
          </button>
        </div>
      </div>

      <div style={{ padding: '16px' }}>

        {/* Daemon Status */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AnDy Daemon</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLORS[daemonStatus], boxShadow: `0 0 6px ${STATUS_COLORS[daemonStatus]}`, animation: daemonStatus === 'online' ? 'pulse 2s infinite' : 'none' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLORS[daemonStatus], textTransform: 'uppercase' }}>{daemonStatus}</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'var(--surface-low)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Last commit</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                {lastActivity ? timeAgo(lastActivity) + ' ago' : '—'}
              </div>
            </div>
            <div style={{ background: 'var(--surface-low)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>AnDy commits</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--neon)' }}>{andyCommits.length} recent</div>
            </div>
          </div>
        </div>

        {/* Task submission */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Donner une tâche à AnDy</div>
          <textarea
            value={task}
            onChange={e => setTask(e.target.value)}
            placeholder="Ex: Redesigne la page Sports en style terminal dense..."
            rows={3}
            style={{ width: '100%', background: 'var(--surface-low)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace", resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5 }}
            onFocus={e => e.target.style.borderColor = 'var(--border-bright)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {QUICK_TASKS.map((q, i) => (
              <button key={i} onClick={() => setTask(q)}
                style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: 'var(--surface-low)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace' " }}>
                #{i + 1}
              </button>
            ))}
          </div>
          {task && (
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)', background: 'var(--surface-low)', borderRadius: 6, padding: '6px 10px', lineHeight: 1.4 }}>{task}</div>
          )}
          <button
            onClick={submitTask}
            disabled={!task.trim() || sending}
            style={{ marginTop: 10, width: '100%', padding: '10px', borderRadius: 8, border: 'none', cursor: task.trim() ? 'pointer' : 'not-allowed', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s',
              background: sent ? 'rgba(0,255,136,0.15)' : task.trim() ? 'var(--neon)' : 'var(--surface-high)',
              color: sent ? 'var(--neon)' : task.trim() ? '#000' : 'var(--text-muted)',
            }}
          >
            {sent ? <><CheckCircle size={14} /> Envoyé !</> : sending ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Envoi...</> : <><Send size={14} /> Envoyer à AnDy</>}
          </button>
        </div>

        {/* Recent activity */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={13} color="var(--text-muted)" />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Activité récente</span>
          </div>
          {cLoading ? (
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ height: 12, background: 'var(--surface-high)', borderRadius: 4, animation: 'pulse 1.4s ease-in-out infinite alternate', width: `${60 + i * 10}%` }} />
              ))}
            </div>
          ) : commits.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No activity found</div>
          ) : commits.map((c, i) => (
            <div key={c.sha} style={{ padding: '10px 14px', borderBottom: i < commits.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', marginTop: 4, flexShrink: 0, background: c.isAndy ? 'var(--neon)' : 'var(--text-muted)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: c.isAndy ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.4 }}>{c.msg}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 8 }}>
                  <span style={{ fontFamily: 'monospace', color: c.isAndy ? 'var(--neon-dim)' : 'var(--text-muted)' }}>{c.sha}</span>
                  <span>{timeAgo(c.date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick nav to AI pages */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Brain', icon: Brain, to: '/brain', desc: 'IA status' },
            { label: 'Agents', icon: Radio, to: '/agents', desc: '45 agents' },
            { label: 'AnDy', icon: Zap, to: '/andy', desc: 'Assistant' },
          ].map(({ label, icon: Icon, to, desc }) => (
            <button key={label} onClick={() => navigate(to)}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', transition: 'border-color 0.15s', fontFamily: "'JetBrains Mono', monospace" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <Icon size={18} color="var(--neon)" />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

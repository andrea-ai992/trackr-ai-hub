import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
  Shield, Users, Copy, Check, Trash2, RefreshCw, Plus, ChevronLeft,
  Bot, Zap, Activity, Terminal, Play, AlertTriangle, CheckCircle2,
  Clock, Send, Brain, Settings2, TrendingUp, Bug, Palette, Lock,
} from 'lucide-react'

const FOCUS_OPTIONS = [
  { value: 'bugs',        label: '🐛 Bugs',           desc: 'Détecte et corrige les bugs' },
  { value: 'security',    label: '🔐 Sécurité',        desc: 'Audit OWASP — priorité max' },
  { value: 'frontend',    label: '🎨 Design',          desc: 'UI mobile et animations' },
  { value: 'performance', label: '⚡ Performance',     desc: 'Vitesse et optimisations' },
  { value: 'features',    label: '✨ Features',        desc: 'Nouvelles fonctionnalités' },
  { value: 'trading',     label: '📊 Trading',         desc: 'Indicateurs et Discord' },
  { value: 'autonomous',  label: '🤖 Autonome',        desc: 'Brain, agents, Morning' },
]

const SEVERITY_COLOR = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#6b7280' }
const SEVERITY_EMOJI = { critical: '🔴', high: '🟠', medium: '🟡', low: '⚪' }

function timeAgo(d) {
  if (!d) return ''
  const m = Math.floor((Date.now() - new Date(d)) / 60000)
  if (m < 1) return 'maintenant'
  if (m < 60) return `${m}m`
  if (m < 1440) return `${Math.floor(m / 60)}h`
  return `${Math.floor(m / 1440)}j`
}

// ─── AI Dev Tab ───────────────────────────────────────────────────────────────
function AIDevPanel() {
  const [task, setTask]       = useState('')
  const [focus, setFocus]     = useState('bugs')
  const [running, setRunning] = useState(null) // focus name while running
  const [entries, setEntries] = useState([])
  const [status, setStatus]   = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [tab, setTab]         = useState('tasks') // 'tasks' | 'activity' | 'status'

  const loadEntries = useCallback(async () => {
    const r = await fetch('/api/memory?limit=50').catch(() => null)
    if (!r?.ok) return
    const d = await r.json()
    setEntries(d.entries || [])
  }, [])

  const loadStatus = useCallback(async () => {
    setLoadingStatus(true)
    const r = await fetch('/api/reports?type=status').catch(() => null)
    if (r?.ok) setStatus(await r.json())
    setLoadingStatus(false)
  }, [])

  useEffect(() => { loadEntries() }, [])

  async function assignTask() {
    if (!task.trim()) return
    await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'admin_task', task: task.trim(), focus, status: 'pending', assignedBy: 'admin-app' }),
    })
    setTask('')
    await loadEntries()
  }

  async function triggerRun(f = focus) {
    setRunning(f)
    try {
      await fetch(`/api/self-improve?focus=${f}`, { signal: AbortSignal.timeout(58000) })
    } catch {}
    setRunning(null)
    await loadEntries()
  }

  const improvements = entries.filter(e => e.type === 'improvement' && e.applied)
  const adminTasks   = entries.filter(e => e.type === 'admin_task')
  const pendingTasks = adminTasks.filter(e => e.status === 'pending')
  const doneTasks    = adminTasks.filter(e => e.status === 'done')
  const recentActivity = entries.filter(e => ['improvement','no_change','error','pattern_scan'].includes(e.type)).slice(0, 20)

  const cardStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20, padding: '18px 20px', marginBottom: 14,
  }

  return (
    <div>
      {/* Task input */}
      <div style={cardStyle}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          📋 Assigner une tâche à l'IA
        </p>
        <textarea
          value={task}
          onChange={e => setTask(e.target.value)}
          placeholder="Ex: Améliore les transitions de l'onglet Sports, ajoute le suivi PSG UCL en temps réel..."
          rows={2}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '10px 14px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,218,243,0.2)',
            borderRadius: 12, color: '#dbe2f8', fontSize: 13, resize: 'none',
            fontFamily: 'inherit', outline: 'none', marginBottom: 10,
          }}
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={focus}
            onChange={e => setFocus(e.target.value)}
            style={{
              flex: 1, minWidth: 140, padding: '8px 12px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, color: '#dbe2f8', fontSize: 12, cursor: 'pointer',
            }}
          >
            {FOCUS_OPTIONS.map(f => (
              <option key={f.value} value={f.value}>{f.label} — {f.desc}</option>
            ))}
          </select>
          <button
            onClick={assignTask}
            disabled={!task.trim()}
            className="press-scale"
            style={{
              padding: '9px 18px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: task.trim() ? 'pointer' : 'default',
              background: task.trim() ? 'rgba(102,0,234,0.25)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${task.trim() ? 'rgba(102,0,234,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: task.trim() ? '#d1bcff' : '#4b5563',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Send size={13} /> Assigner
          </button>
        </div>
      </div>

      {/* Quick run buttons */}
      <div style={cardStyle}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          ⚡ Lancer immédiatement
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {FOCUS_OPTIONS.map(f => (
            <button
              key={f.value}
              onClick={() => triggerRun(f.value)}
              disabled={!!running}
              className="press-scale"
              style={{
                padding: '10px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: running ? 'default' : 'pointer',
                background: running === f.value ? 'rgba(0,218,243,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${running === f.value ? 'rgba(0,218,243,0.3)' : 'rgba(255,255,255,0.07)'}`,
                color: running === f.value ? '#00daf3' : '#9ca3af',
                display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left',
              }}
            >
              {running === f.value
                ? <><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00daf3', animation: 'ping 1s ease-in-out infinite', flexShrink: 0 }} /> En cours...</>
                : <><Play size={10} /> {f.label}</>
              }
            </button>
          ))}
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[
          { id: 'tasks',    label: `Tâches (${adminTasks.length})` },
          { id: 'activity', label: `Activité (${improvements.length})` },
          { id: 'status',   label: 'Statut' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); if (t.id === 'status') loadStatus() }}
            style={{
              padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: tab === t.id ? 'rgba(0,218,243,0.14)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${tab === t.id ? 'rgba(0,218,243,0.3)' : 'rgba(255,255,255,0.07)'}`,
              color: tab === t.id ? '#00daf3' : '#6b7280',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tasks tab */}
      {tab === 'tasks' && (
        <div>
          {pendingTasks.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#fcd34d', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>⏳ En attente ({pendingTasks.length})</p>
              {pendingTasks.map(t => (
                <div key={t.id} style={{ padding: '11px 14px', marginBottom: 8, borderRadius: 14, background: 'rgba(252,211,77,0.06)', border: '1px solid rgba(252,211,77,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Clock size={11} color="#fcd34d" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#fcd34d' }}>{t.focus || 'bugs'}</span>
                    <span style={{ fontSize: 10, color: '#4b5563', marginLeft: 'auto' }}>{timeAgo(t.timestamp)}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#bac9cc', lineHeight: 1.4, margin: 0 }}>{t.task}</p>
                </div>
              ))}
            </div>
          )}
          {doneTasks.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>✅ Terminées ({doneTasks.length})</p>
              {doneTasks.slice(0, 5).map(t => (
                <div key={t.id} style={{ padding: '11px 14px', marginBottom: 8, borderRadius: 14, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <CheckCircle2 size={11} color="#10b981" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>{t.focus || 'bugs'}</span>
                    <span style={{ fontSize: 10, color: '#4b5563', marginLeft: 'auto' }}>{timeAgo(t.timestamp)}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4, margin: 0 }}>{t.task}</p>
                  {t.result && <p style={{ fontSize: 11, color: '#10b981', marginTop: 4, margin: '4px 0 0' }}>→ {t.result}</p>}
                </div>
              ))}
            </div>
          )}
          {adminTasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 20px', color: '#4b5563' }}>
              <Terminal size={28} style={{ opacity: 0.3, marginBottom: 10 }} />
              <p style={{ fontSize: 13 }}>Aucune tâche assignée</p>
              <p style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>Tape une tâche ci-dessus ou depuis Discord avec /dev action:task</p>
            </div>
          )}
        </div>
      )}

      {/* Activity tab */}
      {tab === 'activity' && (
        <div>
          {recentActivity.map((e, i) => (
            <div key={i} className="stagger-item" style={{
              padding: '11px 14px', marginBottom: 8, borderRadius: 14,
              background: e.applied ? 'rgba(0,218,243,0.04)' : e.type === 'error' ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${e.applied ? 'rgba(0,218,243,0.1)' : e.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 12 }}>
                  {e.type === 'improvement' ? (e.applied ? '✅' : '❌') : e.type === 'error' ? '⚠️' : e.type === 'pattern_scan' ? '🔍' : '💭'}
                </span>
                {e.severity && <span style={{ fontSize: 10, fontWeight: 700, color: SEVERITY_COLOR[e.severity] || '#6b7280' }}>{SEVERITY_EMOJI[e.severity]} {e.severity}</span>}
                <span style={{ fontSize: 10, color: '#4b5563', marginLeft: 'auto' }}>{timeAgo(e.timestamp)}</span>
              </div>
              <p style={{ fontSize: 12, color: '#bac9cc', lineHeight: 1.4, margin: 0 }}>
                {e.problem || e.reason || e.error || (e.count ? `${e.count} patterns détectés` : '?')}
              </p>
              {e.file && <span style={{ fontSize: 10, color: '#4b5563', fontFamily: 'monospace', marginTop: 4, display: 'block' }}>{e.file}</span>}
              {e.learned && <p style={{ fontSize: 10, color: '#00daf3', marginTop: 5, fontStyle: 'italic', margin: '5px 0 0' }}>💡 {e.learned}</p>}
            </div>
          ))}
          {recentActivity.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 20px', color: '#4b5563' }}>
              <Activity size={28} style={{ opacity: 0.3, marginBottom: 10 }} />
              <p style={{ fontSize: 13 }}>Aucune activité enregistrée</p>
            </div>
          )}
        </div>
      )}

      {/* Status tab */}
      {tab === 'status' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <button onClick={loadStatus} disabled={loadingStatus} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '6px 12px', cursor: 'pointer', color: '#6b7280', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
              <RefreshCw size={11} style={{ animation: loadingStatus ? 'andySpin 1s linear infinite' : 'none' }} /> Actualiser
            </button>
          </div>
          {status ? (
            <div>
              <div style={{ ...cardStyle, borderColor: status.ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: status.ok ? '#10b981' : '#ef4444', boxShadow: `0 0 6px ${status.ok ? '#10b981' : '#ef4444'}` }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{status.ok ? 'Tous les systèmes OK' : `${status.services?.ko || 0} service(s) en erreur`}</span>
                </div>
              </div>
              {(status.results || []).map(r => (
                <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', marginBottom: 6, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 12 }}>{r.ok ? '✅' : '❌'}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: r.ok ? '#bac9cc' : '#f87171', flex: 1 }}>{r.name}</span>
                  <span style={{ fontSize: 11, color: '#4b5563' }}>{r.ok ? `${r.ms}ms${r.note ? ` · ${r.note}` : ''}` : (r.error || `HTTP ${r.status}`)}</span>
                </div>
              ))}
              {status.missing?.length > 0 && (
                <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', marginTop: 8 }}>
                  <p style={{ fontSize: 11, color: '#f87171', marginBottom: 6, fontWeight: 700 }}>Variables manquantes :</p>
                  {status.missing.map(k => <span key={k} style={{ display: 'inline-block', fontSize: 10, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '2px 8px', margin: '2px', color: '#f87171', fontFamily: 'monospace' }}>{k}</span>)}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 20px', color: '#4b5563' }}>
              {loadingStatus
                ? <p style={{ fontSize: 13 }}>Vérification en cours...</p>
                : <p style={{ fontSize: 13 }}>Clique Actualiser pour vérifier le statut</p>
              }
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function Admin() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers]       = useState([])
  const [invites, setInvites]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [copied, setCopied]     = useState('')
  const [creating, setCreating] = useState(false)
  const [activeTab, setActiveTab] = useState('ai') // 'ai' | 'users'

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return }
    if (activeTab === 'users') fetchData()
    else setLoading(false)
  }, [isAdmin, activeTab])

  async function fetchData() {
    setLoading(true)
    const [{ data: u }, { data: i }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at'),
      supabase.from('invite_codes').select('*').order('created_at', { ascending: false }),
    ])
    setUsers(u || [])
    setInvites(i || [])
    setLoading(false)
  }

  async function createInvite() {
    setCreating(true)
    const code = Math.random().toString(36).slice(2, 10).toUpperCase()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const { error } = await supabase.from('invite_codes').insert({
      code, created_by: user.id, expires_at: expiresAt, used: false,
    })
    if (!error) await fetchData()
    setCreating(false)
  }

  async function deleteInvite(id) {
    await supabase.from('invite_codes').delete().eq('id', id)
    await fetchData()
  }

  async function toggleRole(userId, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    await fetchData()
  }

  function copyInviteLink(code) {
    const link = `${window.location.origin}/register?invite=${code}`
    navigator.clipboard.writeText(link)
    setCopied(code)
    setTimeout(() => setCopied(''), 2000)
  }

  const cardStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20, padding: '18px 20px', marginBottom: 14,
  }

  return (
    <div style={{ maxWidth: 580, margin: '0 auto', padding: '0 16px 40px', paddingTop: 'max(52px, env(safe-area-inset-top,0px))' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0 }}>
          <ChevronLeft size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 1 }}>Admin Panel</h1>
          <p style={{ fontSize: 12, color: '#4b5563' }}>Contrôle total · IA + Utilisateurs</p>
        </div>
        <div style={{ padding: '6px 12px', borderRadius: 10, fontSize: 11, fontWeight: 700, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Shield size={11} /> ADMIN
        </div>
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22, background: 'rgba(255,255,255,0.03)', padding: 5, borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => setActiveTab('ai')}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: activeTab === 'ai' ? 'linear-gradient(135deg, rgba(0,218,243,0.18), rgba(102,0,234,0.18))' : 'transparent',
            border: activeTab === 'ai' ? '1px solid rgba(0,218,243,0.25)' : '1px solid transparent',
            color: activeTab === 'ai' ? '#c3f5ff' : '#6b7280',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}
        >
          <Bot size={14} /> Dev IA
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: activeTab === 'users' ? 'rgba(255,255,255,0.06)' : 'transparent',
            border: activeTab === 'users' ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
            color: activeTab === 'users' ? 'white' : '#6b7280',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}
        >
          <Users size={14} /> Utilisateurs
        </button>
      </div>

      {/* AI Dev Panel */}
      {activeTab === 'ai' && <AIDevPanel />}

      {/* Users Panel */}
      {activeTab === 'users' && (
        <div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Utilisateurs', value: users.length, color: '#6366f1' },
              { label: 'Invitations actives', value: invites.filter(i => !i.used).length, color: '#10b981' },
            ].map(s => (
              <div key={s.label} style={{ ...cardStyle, marginBottom: 0, textAlign: 'center' }}>
                <p style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</p>
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Invite codes */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={14} style={{ color: '#6366f1' }} /> Codes d'invitation
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={fetchData} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4 }}>
                  <RefreshCw size={14} />
                </button>
                <button
                  onClick={createInvite} disabled={creating}
                  className="press-scale"
                  style={{ padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <Plus size={12} /> {creating ? '...' : 'Créer'}
                </button>
              </div>
            </div>
            {invites.length === 0 && <p style={{ fontSize: 13, color: '#4b5563', textAlign: 'center', padding: '12px 0' }}>Aucun code. Crée un lien pour inviter.</p>}
            {invites.map(inv => (
              <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: inv.used ? 0.4 : 1 }}>
                <code style={{ flex: 1, fontSize: 14, fontWeight: 700, color: inv.used ? '#4b5563' : '#818cf8', letterSpacing: '0.1em' }}>{inv.code}</code>
                <span style={{ fontSize: 11, color: '#4b5563' }}>{inv.used ? '✓ Utilisé' : `Expire ${new Date(inv.expires_at).toLocaleDateString('fr')}`}</span>
                {!inv.used && <button onClick={() => copyInviteLink(inv.code)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === inv.code ? '#10b981' : '#6b7280', padding: 4 }}>{copied === inv.code ? <Check size={14} /> : <Copy size={14} />}</button>}
                <button onClick={() => deleteInvite(inv.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4 }}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>

          {/* Users list */}
          <div style={cardStyle}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 16 }}>Utilisateurs ({users.length})</p>
            {loading && <p style={{ fontSize: 13, color: '#4b5563' }}>Chargement...</p>}
            {users.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0, background: u.role === 'admin' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)', border: `1px solid ${u.role === 'admin' ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: u.role === 'admin' ? '#f87171' : '#818cf8' }}>
                  {(u.username || u.email || '?')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{u.username || 'Sans nom'}</p>
                  <p style={{ fontSize: 11, color: '#4b5563' }}>{new Date(u.created_at).toLocaleDateString('fr')}</p>
                </div>
                {u.id !== user?.id
                  ? <button onClick={() => toggleRole(u.id, u.role)} style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: u.role === 'admin' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${u.role === 'admin' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}`, color: u.role === 'admin' ? '#f87171' : '#6b7280' }}>{u.role === 'admin' ? 'Admin' : 'User'}</button>
                  : <span style={{ fontSize: 11, color: '#4b5563' }}>Toi</span>
                }
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes andySpin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Brain, Zap, RefreshCw, Activity, CheckCircle,
  XCircle, Clock, TrendingUp, Shield, Code, Palette, Database,
  Plus, ChevronRight, Eye,
} from 'lucide-react'

// ─── Couleurs thème ───────────────────────────────────────────────────────────
const C = {
  bg:      '#060a16',
  card:    'rgba(11,19,35,0.7)',
  border:  'rgba(255,255,255,0.07)',
  cyan:    '#00daf3',
  purple:  '#6600ea',
  green:   '#34d399',
  orange:  '#f59e0b',
  red:     '#ef4444',
  text:    '#dbe2f8',
  muted:   '#4b6070',
}

function timeAgo(ts) {
  if (!ts) return 'jamais'
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (diff < 60)   return `il y a ${diff}s`
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`
  return `il y a ${Math.floor(diff / 86400)} j`
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, sub }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${color}25`,
      borderRadius: 14,
      padding: '14px 16px',
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ color, opacity: 0.8 }}>{icon}</span>
        <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

// ─── Entry de mémoire ─────────────────────────────────────────────────────────
function MemoryEntry({ entry }) {
  const typeConfig = {
    improvement:  { color: C.green,  icon: '✅', label: 'Amélioration' },
    brain_cycle:  { color: C.cyan,   icon: '🧠', label: 'Cycle Brain' },
    error:        { color: C.red,    icon: '❌', label: 'Erreur' },
    no_change:    { color: C.muted,  icon: '➖', label: 'Aucun changement' },
    dry_run:      { color: C.orange, icon: '🔍', label: 'Dry run' },
    agent_forged: { color: C.purple, icon: '⚗️', label: 'Agent créé' },
  }

  const focusIcon = {
    bugs: '🐛', security: '🔐', performance: '⚡', features: '✨', frontend: '🎨',
  }

  const cfg = typeConfig[entry.type] || { color: C.muted, icon: '•', label: entry.type }

  return (
    <div style={{
      display: 'flex', gap: 10, padding: '10px 0',
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: `${cfg.color}15`,
        border: `1px solid ${cfg.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, flexShrink: 0,
      }}>
        {cfg.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
          <span style={{ fontSize: 10, color: C.muted }}>{timeAgo(entry.timestamp)}</span>
        </div>
        {entry.file && (
          <div style={{ fontSize: 11, color: C.cyan, marginBottom: 2, fontFamily: 'monospace' }}>
            {entry.file}
          </div>
        )}
        {entry.problem && (
          <div style={{ fontSize: 11, color: '#8ca3af', lineHeight: 1.4 }}>
            {entry.problem}
          </div>
        )}
        {entry.learned && (
          <div style={{ fontSize: 10, color: C.orange, marginTop: 3, fontStyle: 'italic' }}>
            💡 {entry.learned}
          </div>
        )}
        {entry.type === 'brain_cycle' && (
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
            {entry.agentsRan} agents · {entry.appHealthy ? '🟢 App ok' : '🔴 App KO'} · {entry.duration}s
          </div>
        )}
        {entry.focus && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <span style={{ fontSize: 9, background: `${cfg.color}20`, color: cfg.color, borderRadius: 10, padding: '2px 7px', border: `1px solid ${cfg.color}30` }}>
              {focusIcon[entry.focus] || ''} {entry.focus}
            </span>
            {entry.severity && (
              <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.05)', color: C.muted, borderRadius: 10, padding: '2px 7px' }}>
                {entry.severity}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Barre de progression ──────────────────────────────────────────────────────
function ProgressBar({ value, color, label, max = 100 }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: 10, transition: 'width 0.6s ease',
          boxShadow: `0 0 8px ${color}60`,
        }} />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BrainStatus() {
  const navigate    = useNavigate()
  const [summary,   setSummary]   = useState(null)
  const [memory,    setMemory]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [brainRunning, setBrainRunning] = useState(false)
  const [tab,       setTab]       = useState('live') // 'live' | 'memory' | 'forge'
  const [forgeLog,  setForgeLog]  = useState([])
  const pollRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const [sumRes, memRes] = await Promise.allSettled([
        fetch('/api/reports?type=summary').then(r => r.json()),
        fetch('/api/memory?limit=40').then(r => r.json()),
      ])
      if (sumRes.status === 'fulfilled' && sumRes.value.ok) setSummary(sumRes.value.summary)
      if (memRes.status === 'fulfilled' && memRes.value.ok) setMemory(memRes.value.entries || [])
    } catch { /* keep existing */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    pollRef.current = setInterval(load, 30000) // refresh toutes les 30s
    return () => clearInterval(pollRef.current)
  }, [load])

  // Déclencher manuellement le Brain
  async function triggerBrain() {
    setBrainRunning(true)
    try {
      await fetch('/api/brain')
      await new Promise(r => setTimeout(r, 3000))
      await load()
    } finally {
      setBrainRunning(false)
    }
  }

  const brainCycles    = memory.filter(e => e.type === 'brain_cycle').length
  const improvements   = memory.filter(e => e.type === 'improvement' && e.applied).length
  const errors         = memory.filter(e => e.type === 'error').length
  const forgedAgents   = memory.filter(e => e.type === 'agent_forged')

  return (
    <div style={{ minHeight: '100dvh', background: C.bg, paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(102,0,234,0.3) 0%, transparent 100%)',
        padding: 'max(16px, env(safe-area-inset-top)) 16px 20px',
      }}>
        {/* Pulsing brain orb */}
        <div style={{
          position: 'absolute', top: 10, right: 16, width: 50, height: 50,
          background: 'radial-gradient(circle, rgba(0,218,243,0.15), transparent 70%)',
          borderRadius: '50%', animation: 'ping 3s infinite',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Brain size={20} color={C.cyan} />
        </div>

        <button onClick={() => navigate(-1)} style={{
          background: 'none', border: 'none', color: '#bac9cc',
          cursor: 'pointer', padding: 0, marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
        }}>
          <ArrowLeft size={14} /> Retour
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{
              margin: '0 0 4px', fontSize: 22,
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
              color: C.text, letterSpacing: '-0.5px',
            }}>
              Brain — IA Autonome
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: C.muted }}>
              {summary?.lastActivity ? `Dernière activité ${timeAgo(summary.lastActivity)}` : 'Chargement…'}
            </p>
          </div>
          <button
            onClick={triggerBrain}
            disabled={brainRunning}
            style={{
              background: brainRunning ? 'rgba(0,218,243,0.05)' : 'rgba(0,218,243,0.1)',
              border: `1px solid rgba(0,218,243,0.3)`,
              borderRadius: 10, padding: '7px 12px', cursor: 'pointer',
              color: C.cyan, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
            }}
          >
            <RefreshCw size={13} style={brainRunning ? { animation: 'spin 1s linear infinite' } : {}} />
            {brainRunning ? 'En cours…' : 'Déclencher'}
          </button>
        </div>

        {/* Métriques rapides */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { label: `${summary?.appUptime ?? '…'}% uptime`, color: C.green },
            { label: `${summary?.successRate ?? '…'}% succès`, color: C.cyan },
            { label: `${improvements} améliorations`, color: C.purple },
            { label: `${errors} erreurs`, color: errors > 0 ? C.red : C.muted },
          ].map((b, i) => (
            <div key={i} style={{
              background: 'rgba(11,19,35,0.6)',
              border: `1px solid ${b.color}25`,
              borderRadius: 20, padding: '4px 10px',
              color: b.color, fontSize: 11,
            }}>
              {b.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', padding: '0 16px 12px', gap: 6 }}>
        {[
          { key: 'live',   label: '⚡ Live' },
          { key: 'memory', label: '🧠 Mémoire' },
          { key: 'forge',  label: '⚗️ Forge' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '9px 0', borderRadius: 12, border: 'none',
            cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 600, fontSize: 12,
            background: tab === t.key ? 'rgba(0,218,243,0.12)' : 'rgba(11,19,35,0.5)',
            color: tab === t.key ? C.cyan : C.muted,
            borderBottom: tab === t.key ? `2px solid ${C.cyan}` : '2px solid transparent',
            transition: 'all 0.2s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* ── Tab LIVE ── */}
        {tab === 'live' && (
          <div>
            {/* Stats grid */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <StatCard icon={<Brain size={14} />} label="Cycles Brain" value={brainCycles} color={C.cyan} sub="40 dernières entrées" />
              <StatCard icon={<CheckCircle size={14} />} label="Améliorations" value={improvements} color={C.green} sub="appliquées" />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <StatCard icon={<Zap size={14} />} label="Agents forgés" value={forgedAgents.length} color={C.purple} sub="auto-créés" />
              <StatCard icon={<XCircle size={14} />} label="Erreurs" value={errors} color={errors > 0 ? C.red : C.muted} sub="à corriger" />
            </div>

            {/* Barres de progression */}
            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: '14px 16px', marginBottom: 12,
            }}>
              <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
                📊 Santé système
              </p>
              <ProgressBar value={summary?.successRate ?? 0}  color={C.green}  label="Taux de succès IA" />
              <ProgressBar value={summary?.appUptime ?? 100}  color={C.cyan}   label="Uptime application" />
              <ProgressBar
                value={improvements}
                max={Math.max(improvements + errors, 1)}
                color={C.purple}
                label="Rapport amélioration/erreur"
              />
            </div>

            {/* Planning des crons */}
            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: '14px 16px', marginBottom: 12,
            }}>
              <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
                🗓 Planification autonome
              </p>
              {[
                { color: C.cyan,   label: 'Brain — Orchestration complète',            freq: 'Toutes les heures' },
                { color: C.green,  label: 'self-improve — bugs',                       freq: '6h UTC' },
                { color: C.red,    label: 'self-improve — sécurité',                   freq: '12h UTC' },
                { color: C.orange, label: 'self-improve — performance',                freq: '18h UTC' },
                { color: C.purple, label: 'self-improve — features',                   freq: 'Lundi 0h UTC' },
                { color: '#f9a8d4', label: 'self-improve — frontend',                 freq: 'Mercredi 15h UTC' },
                { color: C.text,   label: 'Rapport quotidien Discord',                 freq: '8h UTC' },
                { color: C.muted,  label: 'Rapport hebdomadaire Discord',              freq: 'Dimanche 9h UTC' },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '5px 0',
                  borderBottom: i < 7 ? `1px solid ${C.border}` : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: row.color, flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ fontSize: 11, color: '#bac9cc' }}>{row.label}</span>
                  </div>
                  <span style={{ fontSize: 10, color: C.muted }}>{row.freq}</span>
                </div>
              ))}
            </div>

            {/* Dernière activité */}
            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: '14px 16px',
            }}>
              <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
                ⚡ Activité récente
              </p>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 20, color: C.muted, fontSize: 12 }}>
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} /><br />
                  Chargement…
                </div>
              ) : memory.slice(0, 8).map((e, i) => (
                <MemoryEntry key={e.id || i} entry={e} />
              ))}
            </div>
          </div>
        )}

        {/* ── Tab MÉMOIRE ── */}
        {tab === 'memory' && (
          <div>
            {/* Leçons apprises */}
            {summary?.lessons?.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(102,0,234,0.12), rgba(0,218,243,0.06))',
                border: `1px solid rgba(102,0,234,0.3)`,
                borderRadius: 14, padding: '14px 16px', marginBottom: 12,
              }}>
                <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#d1bcff', fontFamily: 'Space Grotesk, sans-serif' }}>
                  💡 Ce qu'AnDy a appris (7 derniers jours)
                </p>
                {summary.lessons.map((l, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: i < summary.lessons.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <span style={{ fontSize: 12, flexShrink: 0 }}>💡</span>
                    <span style={{ fontSize: 11, color: '#8ca3af', lineHeight: 1.4 }}>{l}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Fichiers les plus améliorés */}
            {summary?.topFiles?.length > 0 && (
              <div style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 14, padding: '14px 16px', marginBottom: 12,
              }}>
                <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
                  📂 Fichiers les plus améliorés
                </p>
                {summary.topFiles.map(([file, count], i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '7px 0', borderBottom: i < summary.topFiles.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}>
                    <span style={{ fontSize: 11, color: C.cyan, fontFamily: 'monospace' }}>{file}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>{count}×</span>
                  </div>
                ))}
              </div>
            )}

            {/* Toutes les entrées mémoire */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
              <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
                🧠 Mémoire complète ({memory.length} entrées)
              </p>
              {memory.map((e, i) => <MemoryEntry key={e.id || i} entry={e} />)}
            </div>
          </div>
        )}

        {/* ── Tab FORGE ── */}
        {tab === 'forge' && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(102,0,234,0.15), rgba(0,218,243,0.06))',
              border: `1px solid rgba(102,0,234,0.4)`,
              borderRadius: 14, padding: '14px 16px', marginBottom: 12,
            }}>
              <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#d1bcff', fontFamily: 'Space Grotesk, sans-serif' }}>
                ⚗️ Agent Forge
              </p>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: '#8ca3af', lineHeight: 1.5 }}>
                Le Brain identifie automatiquement les gaps de couverture et crée de nouveaux agents. Les agents sont écrits par Claude et déployés directement sur GitHub.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '10px 12px', border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Agents forgés</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#d1bcff', fontFamily: 'Space Grotesk, sans-serif' }}>
                    {forgedAgents.length}
                  </div>
                </div>
                <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '10px 12px', border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Registre</div>
                  <button
                    onClick={() => fetch('/api/agent-forge').then(r => r.json()).then(d => setForgeLog(d.agents || []))}
                    style={{
                      background: 'rgba(102,0,234,0.3)', border: `1px solid rgba(102,0,234,0.5)`,
                      borderRadius: 8, padding: '4px 10px', cursor: 'pointer',
                      fontSize: 12, color: '#d1bcff', display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <Eye size={11} /> Charger
                  </button>
                </div>
              </div>
            </div>

            {/* Comment ça marche */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
              <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
                🔄 Cycle de création autonome
              </p>
              {[
                { step: '1', desc: 'Brain identifie un gap (domaine non couvert)', color: C.cyan },
                { step: '2', desc: 'Brain appelle Agent Forge avec description du gap', color: C.purple },
                { step: '3', desc: 'Claude conçoit et écrit le code de l\'agent', color: C.orange },
                { step: '4', desc: 'Code validé et commité sur GitHub automatiquement', color: C.green },
                { step: '5', desc: 'Agent enregistré dans le registre et actif au prochain cycle', color: '#f9a8d4' },
              ].map(s => (
                <div key={s.step} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10,
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: `${s.color}20`, border: `1px solid ${s.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: s.color, flexShrink: 0,
                  }}>
                    {s.step}
                  </div>
                  <span style={{ fontSize: 11, color: '#8ca3af', lineHeight: 1.4, paddingTop: 3 }}>{s.desc}</span>
                </div>
              ))}
            </div>

            {/* Agents forgés récents */}
            {forgeLog.length > 0 && (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
                <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
                  ⚗️ Agents créés ({forgeLog.length})
                </p>
                {forgeLog.map((a, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: i < forgeLog.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{a.emoji} {a.name}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>{a.role}</div>
                    </div>
                    <span style={{ fontSize: 10, background: 'rgba(102,0,234,0.2)', color: '#d1bcff', borderRadius: 10, padding: '2px 8px' }}>
                      {a.schedule}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {forgedAgents.length === 0 && forgeLog.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>⚗️</div>
                <p style={{ margin: 0, fontSize: 12, color: C.muted }}>
                  Aucun agent créé automatiquement pour l'instant.<br />
                  Le Brain en créera dès qu'il identifie un gap de couverture.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes ping { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}

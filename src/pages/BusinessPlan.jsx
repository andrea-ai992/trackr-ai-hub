import { useState, useRef, useEffect } from 'react'
import { Lightbulb, FileText, TrendingUp, RefreshCw, X, Download, ChevronDown, ChevronUp, Sparkles, CheckCircle, XCircle, Brain } from 'lucide-react'

/* ─── Storage ─────────────────────────────────────────────────────────────── */
const STORAGE_KEY = 'trackr_biz_plans_v1'
function loadPlans() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] } }
function savePlans(l) { localStorage.setItem(STORAGE_KEY, JSON.stringify(l)) }

/* ─── Field ───────────────────────────────────────────────────────────────── */
function Field({ label, value, onChange, type = 'text', placeholder = '', multiline }) {
  const style = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)',
    borderRadius: 12, padding: '10px 13px', fontSize: 15, color: 'white',
    outline: 'none', fontFamily: 'inherit',
  }
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      {multiline
        ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...style, resize: 'none' }} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style} />
      }
    </div>
  )
}

/* ─── Validation badge ───────────────────────────────────────────────────────*/
function ValidationBadge({ result }) {
  if (!result) return null
  const colors = { FORT: '#10b981', MOYEN: '#f59e0b', FAIBLE: '#ef4444' }
  const color = colors[result.verdict] || '#6b7280'
  return (
    <div style={{ background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 16, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 14, fontWeight: 800, color }}>Score: {result.score}/10 — {result.verdict}</p>
        <span style={{ fontSize: 12, fontWeight: 700, color, background: `${color}20`, padding: '4px 10px', borderRadius: 8 }}>{result.recommended_action}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <p style={{ fontSize: 11, color: '#10b981', fontWeight: 700, marginBottom: 4 }}>✅ Points forts</p>
          {(result.pros || []).map((p, i) => <p key={i} style={{ fontSize: 12, color: '#d1d5db', marginBottom: 2 }}>• {p}</p>)}
        </div>
        <div>
          <p style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, marginBottom: 4 }}>⚠️ Risques</p>
          {(result.cons || []).map((c, i) => <p key={i} style={{ fontSize: 12, color: '#d1d5db', marginBottom: 2 }}>• {c}</p>)}
        </div>
      </div>
      {result.key_success_factor && (
        <p style={{ fontSize: 12, color: '#818cf8' }}>🔑 Facteur clé: {result.key_success_factor}</p>
      )}
    </div>
  )
}

/* ─── Streaming text renderer ────────────────────────────────────────────────*/
function StreamingPlan({ planText, loading }) {
  const ref = useRef(null)
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight }, [planText])

  // Convert markdown headings to styled sections
  function renderMarkdown(text) {
    if (!text) return null
    const lines = text.split('\n')
    return lines.map((line, i) => {
      if (line.startsWith('## '))
        return <p key={i} style={{ fontSize: 16, fontWeight: 800, color: '#818cf8', marginTop: 20, marginBottom: 6 }}>{line.slice(3)}</p>
      if (line.startsWith('### '))
        return <p key={i} style={{ fontSize: 14, fontWeight: 700, color: '#c4b5fd', marginTop: 14, marginBottom: 4 }}>{line.slice(4)}</p>
      if (line.startsWith('**') && line.endsWith('**'))
        return <p key={i} style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 4 }}>{line.slice(2, -2)}</p>
      if (line.startsWith('- ') || line.startsWith('• '))
        return <p key={i} style={{ fontSize: 13, color: '#d1d5db', marginBottom: 3, paddingLeft: 12 }}>• {line.slice(2)}</p>
      if (line.trim() === '')
        return <div key={i} style={{ height: 6 }} />
      return <p key={i} style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.6, marginBottom: 4 }}>{line}</p>
    })
  }

  return (
    <div ref={ref} style={{ maxHeight: '60vh', overflowY: 'auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 20 }}>
      {renderMarkdown(planText)}
      {loading && <span style={{ display: 'inline-block', width: 8, height: 16, background: '#818cf8', borderRadius: 2, animation: 'blink 1s step-end infinite', marginLeft: 2 }}>|</span>}
    </div>
  )
}

/* ─── Idea Cards ─────────────────────────────────────────────────────────────*/
function IdeaCard({ idea, onSelect }) {
  const risk = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' }[idea.risk] || '#6b7280'
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: 'white', flex: 1 }}>{idea.name}</p>
        <span style={{ fontSize: 10, fontWeight: 700, color: risk, background: `${risk}15`, border: `1px solid ${risk}30`, borderRadius: 6, padding: '2px 7px', marginLeft: 8, flexShrink: 0 }}>
          {idea.risk === 'low' ? 'Faible risque' : idea.risk === 'high' ? 'Risque élevé' : 'Risque moyen'}
        </span>
      </div>
      <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12, lineHeight: 1.5 }}>{idea.concept}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
        {[
          ['Investissement', idea.investment],
          ['Revenu/mois (12m)', idea.monthlyRevenue],
          ['Breakeven', idea.breakeven],
        ].map(([l, v]) => (
          <div key={l} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '8px 4px' }}>
            <p style={{ fontSize: 9, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{l}</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{v || '—'}</p>
          </div>
        ))}
      </div>
      {idea.why && <p style={{ fontSize: 12, color: '#818cf8', marginBottom: 12, fontStyle: 'italic' }}>💡 {idea.why}</p>}
      <button onClick={() => onSelect(idea)} style={{ width: '100%', padding: '10px', borderRadius: 12, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
        Créer le business plan complet →
      </button>
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────────────────────────────*/
export default function BusinessPlan() {
  const [tab, setTab] = useState('plan')
  const [plans, setPlans] = useState(loadPlans)

  // Plan form
  const [form, setForm] = useState({
    idea: '', industry: '', target: '', budget: '', revenue: '', timeline: '12 mois', location: 'France',
  })
  const [planText, setPlanText] = useState('')
  const [generating, setGenerating] = useState(false)
  const [section, setSection] = useState('full')
  const [validation, setValidation] = useState(null)
  const [validating, setValidating] = useState(false)

  // Ideas
  const [ideasForm, setIdeasForm] = useState({ skills: '', budget: '10000', interests: '', risk: 'medium' })
  const [ideas, setIdeas] = useState([])
  const [loadingIdeas, setLoadingIdeas] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function generatePlan() {
    if (!form.idea) return
    setGenerating(true)
    setPlanText('')

    try {
      const r = await fetch('/api/business-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, section }),
        signal: AbortSignal.timeout(90000),
      })

      const reader = r.body.getReader()
      const decoder = new TextDecoder()
      let buf = '', full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n'); buf = lines.pop()
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const ev = JSON.parse(line.slice(6))
            if (ev.type === 'token') { full += ev.text; setPlanText(full) }
          } catch {}
        }
      }

      // Auto-save plan
      const saved = { id: crypto.randomUUID(), idea: form.idea, industry: form.industry, content: full, section, createdAt: new Date().toISOString() }
      const updated = [saved, ...plans].slice(0, 20)
      setPlans(updated); savePlans(updated)
    } catch (e) {
      setPlanText(`❌ Erreur: ${e.message}`)
    }
    setGenerating(false)
  }

  async function validateIdea() {
    if (!form.idea) return
    setValidating(true)
    setValidation(null)
    try {
      const r = await fetch(`/api/business-plan?action=validate&idea=${encodeURIComponent(form.idea)}`)
      const d = await r.json()
      setValidation(d)
    } catch {}
    setValidating(false)
  }

  async function generateIdeas() {
    setLoadingIdeas(true)
    setIdeas([])
    try {
      const r = await fetch(`/api/business-plan?action=ideas&skills=${encodeURIComponent(ideasForm.skills)}&budget=${ideasForm.budget}&interests=${encodeURIComponent(ideasForm.interests)}&risk=${ideasForm.risk}`)
      const d = await r.json()
      setIdeas(d.ideas || [])
    } catch {}
    setLoadingIdeas(false)
  }

  function selectIdea(idea) {
    set('idea', idea.name + ' — ' + idea.concept)
    set('budget', idea.investment)
    set('revenue', 'Abonnement / Commission / Vente')
    setTab('plan')
  }

  const TABS = [
    { id: 'plan', label: '📄 Plan', icon: FileText },
    { id: 'ideas', label: '💡 Idées', icon: Lightbulb },
    { id: 'saved', label: '🗂 Sauvegardés', icon: FileText },
  ]

  const SECTIONS = [
    { id: 'full', label: 'Plan complet' },
    { id: 'executive', label: 'Résumé exec.' },
    { id: 'market', label: 'Analyse marché' },
    { id: 'financial', label: 'Financier' },
    { id: 'operations', label: 'Opérations' },
  ]

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '0 16px 96px', paddingTop: 'max(52px, env(safe-area-inset-top, 0px))' }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 2 }}>Business Plan IA</h1>
        <p style={{ fontSize: 13, color: '#4b5563' }}>Génère, valide et développe tes idées business</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 4, marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '8px 4px', borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', background: tab === t.id ? 'rgba(99,102,241,0.18)' : 'transparent', color: tab === t.id ? '#818cf8' : '#6b7280' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PLAN TAB ── */}
      {tab === 'plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Ton idée *" value={form.idea} onChange={v => set('idea', v)} multiline placeholder="Ex: Plateforme de location de montres de luxe entre particuliers en France..." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Secteur" value={form.industry} onChange={v => set('industry', v)} placeholder="Luxe / Fintech / SaaS" />
            <Field label="Cible client" value={form.target} onChange={v => set('target', v)} placeholder="Millennials 25-40" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Budget démarrage (€)" value={form.budget} onChange={v => set('budget', v)} type="number" placeholder="50000" />
            <Field label="Modèle de revenus" value={form.revenue} onChange={v => set('revenue', v)} placeholder="Abonnement SaaS" />
          </div>

          {/* Section picker */}
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Section à générer</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => setSection(s.id)} style={{ padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1px solid ${section === s.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`, background: section === s.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', color: section === s.id ? '#818cf8' : '#9ca3af' }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={validateIdea} disabled={!form.idea || validating} style={{ flex: 1, padding: '12px', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <CheckCircle size={15} />{validating ? 'Validation...' : 'Valider l\'idée'}
            </button>
            <button onClick={generatePlan} disabled={!form.idea || generating} style={{ flex: 2, padding: '12px', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', background: generating ? 'rgba(99,102,241,0.2)' : '#6366f1', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: (!form.idea || generating) ? 0.6 : 1 }}>
              <Brain size={15} />{generating ? 'Génération...' : `Générer${section !== 'full' ? ' ' + SECTIONS.find(s => s.id === section)?.label : ' le plan complet'}`}
            </button>
          </div>

          {validation && <ValidationBadge result={validation} />}
          {planText && <StreamingPlan planText={planText} loading={generating} />}
        </div>
      )}

      {/* ── IDEAS TAB ── */}
      {tab === 'ideas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 18 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 14 }}>💡 Génère des idées business adaptées à ton profil</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Field label="Tes compétences" value={ideasForm.skills} onChange={v => setIdeasForm(f => ({ ...f, skills: v }))} placeholder="Dev, finance, marketing, luxe..." />
              <Field label="Budget disponible (€)" value={ideasForm.budget} onChange={v => setIdeasForm(f => ({ ...f, budget: v }))} type="number" placeholder="10000" />
              <Field label="Tes intérêts" value={ideasForm.interests} onChange={v => setIdeasForm(f => ({ ...f, interests: v }))} placeholder="Tech, montres, immobilier, crypto..." />
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tolérance au risque</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[['low', '🟢 Faible'], ['medium', '🟡 Moyen'], ['high', '🔴 Élevé']].map(([v, l]) => (
                    <button key={v} onClick={() => setIdeasForm(f => ({ ...f, risk: v }))} style={{ flex: 1, padding: '8px 4px', borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1px solid ${ideasForm.risk === v ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`, background: ideasForm.risk === v ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', color: ideasForm.risk === v ? '#818cf8' : '#9ca3af' }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={generateIdeas} disabled={loadingIdeas} style={{ width: '100%', marginTop: 14, padding: '12px', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', background: loadingIdeas ? 'rgba(99,102,241,0.2)' : '#6366f1', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Sparkles size={15} />{loadingIdeas ? 'Génération des idées...' : 'Générer 5 idées avec l\'IA'}
            </button>
          </div>
          {ideas.map((idea, i) => <IdeaCard key={i} idea={idea} onSelect={selectIdea} />)}
        </div>
      )}

      {/* ── SAVED TAB ── */}
      {tab === 'saved' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {plans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#4b5563' }}>
              <p style={{ fontSize: 14 }}>Aucun plan sauvegardé.</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Génère ton premier business plan dans l'onglet Plan.</p>
            </div>
          ) : plans.map(p => (
            <div key={p.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{p.idea?.slice(0, 50) || 'Plan sans nom'}</p>
                <button onClick={() => { setPlanText(p.content); setTab('plan') }} style={{ fontSize: 11, color: '#818cf8', fontWeight: 700, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}>Voir</button>
              </div>
              <p style={{ fontSize: 11, color: '#4b5563' }}>{p.industry || 'Secteur N/A'} · {p.section} · {new Date(p.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

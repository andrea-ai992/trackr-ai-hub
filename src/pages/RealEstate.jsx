import { useState, useEffect } from 'react'
import { Home, TrendingUp, TrendingDown, Calculator, Plus, X, Pencil, Trash2, ExternalLink, RefreshCw, MapPin, Euro, ChevronDown, ChevronUp, Brain } from 'lucide-react'

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function fmt(n, decimals = 0) {
  if (n == null || isNaN(n)) return '—'
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: decimals })
}
function fmtPct(n) {
  if (n == null || isNaN(n)) return '—'
  return `${n >= 0 ? '+' : ''}${parseFloat(n).toFixed(1)}%`
}

const STORAGE_KEY = 'trackr_realestate_v1'
function loadProperties() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] } }
function saveProperties(l) { localStorage.setItem(STORAGE_KEY, JSON.stringify(l)) }

const EMPTY_PROP = {
  name: '', city: '', address: '', type: 'apartment', surface: '', floor: '',
  buyPrice: '', notaryFees: '', renovationCost: '', buyDate: '',
  marketValue: '', rent: '', charges: '', taxeFonciere: '',
  loanAmount: '', loanRate: '', loanDuration: 20,
  status: 'owned', notes: '',
}

const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Appartement' },
  { id: 'house', label: 'Maison' },
  { id: 'studio', label: 'Studio' },
  { id: 'commercial', label: 'Local commercial' },
  { id: 'land', label: 'Terrain' },
  { id: 'parking', label: 'Parking' },
]

const FRENCH_CITIES = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Nice', 'Nantes', 'Toulouse', 'Strasbourg', 'Montpellier', 'Rennes', 'Lille', 'Grenoble']

/* ─── Compute metrics ─────────────────────────────────────────────────────── */
function computeMetrics(p) {
  const buy = parseFloat(p.buyPrice) || 0
  const notary = parseFloat(p.notaryFees) || 0
  const reno = parseFloat(p.renovationCost) || 0
  const totalInvest = buy + notary + reno
  const market = parseFloat(p.marketValue) || buy
  const rent = parseFloat(p.rent) || 0
  const charges = parseFloat(p.charges) || 0
  const taxe = parseFloat(p.taxeFonciere) || 0
  const surface = parseFloat(p.surface) || 1
  const loanAmt = parseFloat(p.loanAmount) || 0
  const loanRate = parseFloat(p.loanRate) || 0
  const loanDuration = parseInt(p.loanDuration) || 20

  const annualRent = rent * 12
  const annualCharges = charges * 12 + taxe
  const netRent = annualRent - annualCharges
  const grossYield = totalInvest > 0 ? (annualRent / totalInvest * 100) : 0
  const netYield = totalInvest > 0 ? (netRent / totalInvest * 100) : 0
  const priceM2 = surface > 0 ? buy / surface : 0
  const latentGain = market - buy
  const latentGainPct = buy > 0 ? (latentGain / buy * 100) : 0

  let monthly = 0
  if (loanAmt > 0 && loanRate > 0) {
    const r = loanRate / 100 / 12
    const n = loanDuration * 12
    monthly = Math.round(loanAmt * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1))
  }
  const cashflow = rent - monthly - charges - (taxe / 12)

  return { totalInvest, market, annualRent, annualCharges, netRent, grossYield, netYield, priceM2, latentGain, latentGainPct, monthly, cashflow }
}

/* ─── Input components ───────────────────────────────────────────────────────*/
function Field({ label, value, onChange, type = 'text', placeholder = '', suffix }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{
            width: '100%', boxSizing: 'border-box', paddingRight: suffix ? 32 : 13,
            background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: `10px 13px`, fontSize: 15, color: 'white',
            outline: 'none', fontFamily: 'inherit',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
        {suffix && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#4b5563' }}>{suffix}</span>}
      </div>
    </div>
  )
}

/* ─── Sheet ───────────────────────────────────────────────────────────────── */
function Sheet({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />
      <div style={{ position: 'relative', zIndex: 1, background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '28px 28px 0 0', maxHeight: '94vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '14px auto 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 12px' }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: 'white' }}>{title}</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}><X size={16} /></button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px 8px' }}>{children}</div>
      </div>
    </div>
  )
}

/* ─── Property card ──────────────────────────────────────────────────────────*/
function PropertyCard({ prop, onEdit, onDelete }) {
  const m = computeMetrics(prop)
  const [expanded, setExpanded] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [loadingAI, setLoadingAI] = useState(false)

  async function getAIAnalysis() {
    setLoadingAI(true)
    try {
      const r = await fetch(`/api/real-estate?action=analyze&city=${encodeURIComponent(prop.city)}&price=${prop.buyPrice}&surface=${prop.surface}&rent=${prop.rent}&charges=${prop.charges}&taxeFonciere=${prop.taxeFonciere}&loanAmount=${prop.loanAmount}&loanRate=${prop.loanRate}&loanDuration=${prop.loanDuration}&type=${prop.type}&description=${encodeURIComponent(prop.notes || '')}`, { method: 'POST' })
      const d = await r.json()
      setAiAnalysis(d.aiAnalysis || null)
    } catch {}
    setLoadingAI(false)
  }

  const gain = m.latentGain
  const color = '#10b981'

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 22, padding: '18px 16px', boxShadow: '0 4px 20px rgba(16,185,129,0.08)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Home size={16} style={{ color: '#10b981' }} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>{prop.name || prop.address || prop.city}</p>
              <p style={{ fontSize: 11, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 3 }}>
                <MapPin size={10} />{prop.city}{prop.surface ? ` · ${prop.surface}m²` : ''}
                {prop.type ? ` · ${PROPERTY_TYPES.find(t => t.id === prop.type)?.label}` : ''}
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onEdit(prop)} style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}><Pencil size={12} /></button>
          <button onClick={() => onDelete(prop.id)} style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><Trash2 size={12} /></button>
        </div>
      </div>

      {/* Key metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Investi', value: fmt(m.totalInvest), color: '#6b7280' },
          { label: 'Valeur marché', value: fmt(m.market), color: '#6366f1' },
          { label: 'Plus-value', value: gain ? `${gain >= 0 ? '+' : ''}${fmt(gain)}` : '—', color: gain >= 0 ? '#10b981' : '#ef4444' },
          { label: 'Loyer brut', value: fmt(parseFloat(prop.rent) || 0) + '/m', color: '#f59e0b' },
          { label: 'Rendement brut', value: m.grossYield ? `${m.grossYield.toFixed(1)}%` : '—', color: '#10b981' },
          { label: 'Cashflow', value: m.cashflow ? `${m.cashflow >= 0 ? '+' : ''}${Math.round(m.cashflow)}€` : '—', color: m.cashflow >= 0 ? '#10b981' : '#ef4444' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: '8px 4px' }}>
            <p style={{ fontSize: 9, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{label}</p>
            <p style={{ fontSize: 13, fontWeight: 700, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Expand / AI */}
      <button onClick={() => setExpanded(e => !e)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', fontSize: 12, padding: '4px 0' }}>
        <span>Détails & Analyse IA</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
          {/* Detail rows */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            {[
              ['Prix d\'achat', fmt(parseFloat(prop.buyPrice))],
              ['Frais notaire', fmt(parseFloat(prop.notaryFees))],
              ['Travaux', fmt(parseFloat(prop.renovationCost))],
              ['Prix/m²', prop.surface ? fmt(parseFloat(prop.buyPrice) / parseFloat(prop.surface)) + '/m²' : '—'],
              ['Rendement net', m.netYield ? `${m.netYield.toFixed(1)}%` : '—'],
              ['Mensualité crédit', m.monthly ? fmt(m.monthly) + '/m' : '—'],
              ['Charges annuelles', fmt(m.annualCharges)],
              ['Loyer net/an', fmt(m.netRent)],
            ].map(([label, value]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '8px 10px' }}>
                <p style={{ fontSize: 10, color: '#4b5563', marginBottom: 2 }}>{label}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{value || '—'}</p>
              </div>
            ))}
          </div>

          {prop.notes && <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12, fontStyle: 'italic' }}>{prop.notes}</p>}

          {/* Chrono links */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <a href={`https://www.seloger.com/list.htm?idtypebien=1,2&naturebien=1,2&ci=${prop.city}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>SeLoger <ExternalLink size={10} /></a>
            <a href={`https://www.meilleursagents.com/prix-immobilier/${prop.city.toLowerCase()}/`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>MeilleursAgents <ExternalLink size={10} /></a>
            <a href={`https://app.dvf.etalab.gouv.fr/`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>DVF <ExternalLink size={10} /></a>
          </div>

          {/* AI Analysis */}
          {!aiAnalysis && (
            <button onClick={getAIAnalysis} disabled={loadingAI} style={{ width: '100%', padding: '10px', borderRadius: 12, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Brain size={14} />
              {loadingAI ? 'Analyse en cours...' : 'Analyse IA — Bon investissement ?'}
            </button>
          )}
          {aiAnalysis && (
            <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 14, padding: 14 }}>
              <p style={{ fontSize: 11, color: '#818cf8', fontWeight: 700, marginBottom: 8 }}>🧠 Analyse IA</p>
              <p style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{aiAnalysis}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Property Form ──────────────────────────────────────────────────────────*/
function PropertyForm({ initial = EMPTY_PROP, onSave, onCancel }) {
  const [form, setForm] = useState(initial)
  const [fetchingPrice, setFetchingPrice] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function autoPrice() {
    if (!form.city) return
    setFetchingPrice(true)
    try {
      const r = await fetch(`/api/real-estate?action=price&city=${encodeURIComponent(form.city)}&type=${form.type}`)
      const d = await r.json()
      if (d.avgPriceM2 && form.surface) {
        const estimated = Math.round(d.avgPriceM2 * parseFloat(form.surface))
        set('marketValue', String(estimated))
      }
    } catch {}
    setFetchingPrice(false)
  }

  function handleSave() {
    if (!form.city || !form.buyPrice) return
    onSave({ ...form, id: form.id || crypto.randomUUID(), addedAt: form.addedAt || new Date().toISOString() })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Nom / Label" value={form.name} onChange={v => set('name', v)} placeholder="Appart Lyon" />
        <Field label="Ville" value={form.city} onChange={v => set('city', v)} placeholder="Lyon" />
      </div>
      <Field label="Adresse" value={form.address} onChange={v => set('address', v)} placeholder="12 rue de la Paix" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value)} style={{ width: '100%', background: '#0f0f1a', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 13px', fontSize: 15, color: 'white', outline: 'none', fontFamily: 'inherit', appearance: 'none' }}>
            {PROPERTY_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <Field label="Surface (m²)" value={form.surface} onChange={v => set('surface', v)} type="number" placeholder="65" />
      </div>

      <p style={{ fontSize: 12, color: '#6366f1', fontWeight: 700, marginBottom: -6, marginTop: 4 }}>💰 Acquisition</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Prix d'achat (€) *" value={form.buyPrice} onChange={v => set('buyPrice', v)} type="number" placeholder="200000" />
        <Field label="Frais notaire (€)" value={form.notaryFees} onChange={v => set('notaryFees', v)} type="number" placeholder="16000" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Travaux (€)" value={form.renovationCost} onChange={v => set('renovationCost', v)} type="number" placeholder="0" />
        <Field label="Date achat" value={form.buyDate} onChange={v => set('buyDate', v)} type="date" />
      </div>

      <p style={{ fontSize: 12, color: '#10b981', fontWeight: 700, marginBottom: -6, marginTop: 4 }}>📈 Valorisation & Loyer</p>
      <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: 14, border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Valeur de marché actuelle</span>
          <button onClick={autoPrice} disabled={fetchingPrice} style={{ fontSize: 11, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <RefreshCw size={10} /> {fetchingPrice ? 'Cherche...' : 'Auto'}
          </button>
        </div>
        <Field label="" value={form.marketValue} onChange={v => set('marketValue', v)} type="number" placeholder="220000" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="Loyer (€/mois)" value={form.rent} onChange={v => set('rent', v)} type="number" placeholder="900" />
        <Field label="Charges (€/mois)" value={form.charges} onChange={v => set('charges', v)} type="number" placeholder="150" />
        <Field label="Taxe foncière (€/an)" value={form.taxeFonciere} onChange={v => set('taxeFonciere', v)} type="number" placeholder="800" />
      </div>

      <p style={{ fontSize: 12, color: '#6366f1', fontWeight: 700, marginBottom: -6, marginTop: 4 }}>🏦 Crédit immobilier</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="Montant emprunté (€)" value={form.loanAmount} onChange={v => set('loanAmount', v)} type="number" placeholder="160000" />
        <Field label="Taux (%)" value={form.loanRate} onChange={v => set('loanRate', v)} type="number" placeholder="3.5" />
        <Field label="Durée (ans)" value={form.loanDuration} onChange={v => set('loanDuration', v)} type="number" placeholder="20" />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="DPE B, proche transports, quartier en développement..." style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 13px', fontSize: 15, color: 'white', outline: 'none', fontFamily: 'inherit', resize: 'none' }} />
      </div>

      <div style={{ display: 'flex', gap: 10, paddingTop: 4, paddingBottom: 8 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: 14, borderRadius: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>Annuler</button>
        <button onClick={handleSave} disabled={!form.city || !form.buyPrice} style={{ flex: 2, padding: 14, borderRadius: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer', background: (!form.city || !form.buyPrice) ? 'rgba(16,185,129,0.2)' : '#10b981', border: 'none', color: 'white', opacity: (!form.city || !form.buyPrice) ? 0.5 : 1 }}>Sauvegarder</button>
      </div>
    </div>
  )
}

/* ─── Market Trends ──────────────────────────────────────────────────────────*/
function MarketTrends() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/real-estate?action=trends').then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: 20, color: '#4b5563', fontSize: 13 }}>Chargement des données marché...</div>

  const cities = data?.allCities || []
  return (
    <div>
      <p style={{ fontSize: 12, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Marchés immobiliers — France</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
        {cities.map((c, i) => (
          <div key={c.city} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)', borderBottom: i < cities.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'white', textTransform: 'capitalize' }}>{c.city}</p>
              <p style={{ fontSize: 11, color: '#4b5563' }}>{c.avgRent}€/m² moyen loyer · {c.grossYield}% rdt brut</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{c.avgM2.toLocaleString('fr-FR')}€/m²</p>
              <p style={{ fontSize: 11, color: c.trend1y >= 0 ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                {c.trend1y >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {fmtPct(c.trend1y)} 1 an
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Calculator ─────────────────────────────────────────────────────────────*/
function MortgageCalc() {
  const [calc, setCalc] = useState({ amount: '200000', rate: '3.5', duration: '20' })
  const [result, setResult] = useState(null)
  const setC = (k, v) => setCalc(c => ({ ...c, [k]: v }))

  useEffect(() => {
    const a = parseFloat(calc.amount) || 0
    const r = parseFloat(calc.rate) / 100 / 12
    const n = parseInt(calc.duration) * 12
    if (a > 0 && r > 0 && n > 0) {
      const monthly = Math.round(a * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1))
      setResult({ monthly, total: monthly * n, interest: monthly * n - a })
    }
  }, [calc])

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 20 }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}><Calculator size={15} style={{ color: '#10b981' }} />Simulateur de crédit</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
        <Field label="Montant (€)" value={calc.amount} onChange={v => setC('amount', v)} type="number" placeholder="200000" />
        <Field label="Taux (%)" value={calc.rate} onChange={v => setC('rate', v)} type="number" placeholder="3.5" />
        <Field label="Durée (ans)" value={calc.duration} onChange={v => setC('duration', v)} type="number" placeholder="20" />
      </div>
      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { label: 'Mensualité', value: fmt(result.monthly) + '/mois', color: '#6366f1' },
            { label: 'Coût total', value: fmt(result.total), color: '#f59e0b' },
            { label: 'Intérêts', value: fmt(result.interest), color: '#ef4444' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '10px 4px' }}>
              <p style={{ fontSize: 10, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>{label}</p>
              <p style={{ fontSize: 13, fontWeight: 800, color }}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────────────────────────────*/
export default function RealEstate() {
  const [properties, setProperties] = useState(loadProperties)
  const [sheet, setSheet] = useState(null)
  const [tab, setTab] = useState('portfolio')

  function save(list) { setProperties(list); saveProperties(list) }
  function handleSave(p) {
    const exists = properties.find(x => x.id === p.id)
    save(exists ? properties.map(x => x.id === p.id ? p : x) : [p, ...properties])
    setSheet(null)
  }
  function handleDelete(id) {
    if (!confirm('Supprimer ce bien ?')) return
    save(properties.filter(p => p.id !== id))
  }

  // Stats
  const totalInvested = properties.reduce((s, p) => s + (parseFloat(p.buyPrice) || 0), 0)
  const totalValue = properties.reduce((s, p) => s + (parseFloat(p.marketValue) || parseFloat(p.buyPrice) || 0), 0)
  const totalRentGross = properties.reduce((s, p) => s + ((parseFloat(p.rent) || 0) * 12), 0)
  const avgYield = properties.length > 0
    ? (properties.reduce((s, p) => s + (computeMetrics(p).grossYield || 0), 0) / properties.length).toFixed(1)
    : 0

  const TABS = [
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'market', label: 'Marché' },
    { id: 'calculator', label: 'Simulateur' },
  ]

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '0 16px 96px', paddingTop: 'max(52px, env(safe-area-inset-top, 0px))' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 2 }}>Immobilier</h1>
          <p style={{ fontSize: 13, color: '#4b5563' }}>{properties.length} bien{properties.length > 1 ? 's' : ''} en portefeuille</p>
        </div>
        <button onClick={() => setSheet('add')} style={{ width: 44, height: 44, borderRadius: 16, cursor: 'pointer', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={20} style={{ color: '#10b981' }} />
        </button>
      </div>

      {/* Stats */}
      {properties.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Investi', value: fmt(totalInvested), color: '#6b7280' },
            { label: 'Valeur totale', value: fmt(totalValue), color: '#6366f1' },
            { label: 'Plus-value latente', value: `${totalValue - totalInvested >= 0 ? '+' : ''}${fmt(totalValue - totalInvested)}`, color: totalValue >= totalInvested ? '#10b981' : '#ef4444' },
            { label: 'Loyers annuels', value: fmt(totalRentGross), color: '#f59e0b' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '12px 14px', textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</p>
              <p style={{ fontSize: 16, fontWeight: 800, color }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '8px 0', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', background: tab === t.id ? 'rgba(16,185,129,0.15)' : 'transparent', color: tab === t.id ? '#10b981' : '#6b7280' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'portfolio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {properties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 32px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
              <p style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 8 }}>Aucun bien immobilier</p>
              <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 24 }}>Ajoute tes biens pour suivre rendements, cashflow et plus-values en temps réel.</p>
              <button onClick={() => setSheet('add')} style={{ padding: '14px 28px', borderRadius: 16, fontSize: 15, fontWeight: 700, background: '#10b981', border: 'none', color: 'white', cursor: 'pointer' }}>
                Ajouter un bien
              </button>
            </div>
          ) : properties.map(p => (
            <PropertyCard key={p.id} prop={p} onEdit={p => setSheet(p)} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {tab === 'market' && <MarketTrends />}
      {tab === 'calculator' && <MortgageCalc />}

      {/* Sheet */}
      {sheet && (
        <Sheet title={sheet === 'add' ? 'Ajouter un bien' : `Modifier · ${sheet.name || sheet.city}`} onClose={() => setSheet(null)}>
          <PropertyForm initial={sheet === 'add' ? EMPTY_PROP : sheet} onSave={handleSave} onCancel={() => setSheet(null)} />
        </Sheet>
      )}
    </div>
  )
}

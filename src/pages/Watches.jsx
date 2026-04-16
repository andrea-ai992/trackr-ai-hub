import { useState, useEffect } from 'react'
import {
  Plus, X, Pencil, Trash2, ExternalLink, ChevronRight,
  TrendingUp, TrendingDown, Watch, RefreshCw, Search,
} from 'lucide-react'

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function fmt(n, cur = 'EUR') {
  if (n == null) return '—'
  return n.toLocaleString('fr-FR', { style: 'currency', currency: cur, maximumFractionDigits: 0 })
}

const CHRONO24 = name => `https://www.chrono24.com/search/index.htm?query=${encodeURIComponent(name)}&dosearch=true`
const WATCHFINDER = name => `https://www.watchfinder.com/search?q=${encodeURIComponent(name)}`
const BOBS = name => `https://www.bobswatches.com/rolex-watches.html?q=${encodeURIComponent(name)}`

const BRAND_COLORS = {
  rolex: '#c9a84c', patek: '#1a2744', ap: '#00456b', omega: '#003780',
  cartier: '#c8102e', tudor: '#0d2137', iwc: '#c41230', jaeger: '#1c1c1c',
  breitling: '#003087', tag: '#d4af37', longines: '#000', tissot: '#c8102e',
  seiko: '#c00', grand: '#c00', citizen: '#00457c', casio: '#c00',
}
function brandColor(brand = '') {
  const b = brand.toLowerCase()
  for (const [k, c] of Object.entries(BRAND_COLORS)) if (b.includes(k)) return c
  return '#6366f1'
}

const STORAGE_KEY = 'trackr_watches_v1'
function loadWatches() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveWatches(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

const EMPTY = {
  name: '', brand: '', reference: '', caseSizeMm: '', movement: '',
  condition: 'Bon état', year: '', buyPrice: '', buyDate: '',
  marketValue: '', salePrice: '', saleDate: '', notes: '',
}

const CONDITIONS = ['Neuve', 'Comme neuve', 'Très bon état', 'Bon état', 'État correct', 'À restaurer']

/* ─── Watch Avatar ────────────────────────────────────────────────────────── */
function WatchAvatar({ brand, name, sz = 52 }) {
  const color = brandColor(brand || name)
  const initial = (brand || name || 'W')[0].toUpperCase()
  return (
    <div style={{
      width: sz, height: sz, borderRadius: '50%', flexShrink: 0,
      background: color + '20', border: `2px solid ${color}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: sz * 0.38, fontWeight: 900, color,
    }}>
      {initial}
    </div>
  )
}

/* ─── Input ───────────────────────────────────────────────────────────────── */
function Input({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: '10px 13px', fontSize: 15, color: 'white',
          outline: 'none', fontFamily: 'inherit',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
      />
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      <select
        value={value} onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: '#0f0f1a', border: '1.5px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: '10px 13px', fontSize: 15, color: 'white',
          outline: 'none', fontFamily: 'inherit', appearance: 'none',
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

/* ─── Sheet ───────────────────────────────────────────────────────────────── */
function Sheet({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />
      <div style={{
        position: 'relative', zIndex: 1, background: '#0f0f1a',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '28px 28px 0 0',
        maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '14px auto 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 12px' }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: 'white' }}>{title}</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px 8px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

/* ─── Watch Form ──────────────────────────────────────────────────────────── */
function WatchForm({ initial = EMPTY, onSave, onCancel }) {
  const [form, setForm] = useState(initial)
  const [searching, setSearching] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const profit = form.salePrice && form.buyPrice
    ? parseFloat(form.salePrice) - parseFloat(form.buyPrice)
    : form.marketValue && form.buyPrice
    ? parseFloat(form.marketValue) - parseFloat(form.buyPrice)
    : null

  async function fetchMarketPrice() {
    if (!form.name && !form.reference) return
    setSearching(true)
    try {
      const query = form.reference || form.name
      const r = await fetch(`/api/watch-price?q=${encodeURIComponent(query)}&brand=${encodeURIComponent(form.brand || '')}`)
      if (r.ok) {
        const d = await r.json()
        if (d.price) set('marketValue', String(d.price))
      }
    } catch {}
    setSearching(false)
  }

  function handleSave() {
    if (!form.name || !form.buyPrice) return
    onSave({
      ...form,
      id: form.id || crypto.randomUUID(),
      buyPrice: parseFloat(form.buyPrice) || 0,
      salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
      marketValue: form.marketValue ? parseFloat(form.marketValue) : null,
      caseSizeMm: form.caseSizeMm ? parseInt(form.caseSizeMm) : null,
      year: form.year ? parseInt(form.year) : null,
      addedAt: form.addedAt || new Date().toISOString(),
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 16 }}>
      {/* Preview */}
      {form.name && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
          background: 'rgba(99,102,241,0.06)', borderRadius: 16, border: '1px solid rgba(99,102,241,0.15)',
        }}>
          <WatchAvatar brand={form.brand} name={form.name} sz={44} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{form.name}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              {form.brand || 'Marque'}{form.reference ? ` · Réf. ${form.reference}` : ''}{form.caseSizeMm ? ` · ${form.caseSizeMm}mm` : ''}
            </div>
          </div>
          {profit !== null && (
            <div style={{ fontSize: 15, fontWeight: 800, color: profit >= 0 ? '#10b981' : '#ef4444' }}>
              {profit >= 0 ? '+' : ''}{fmt(profit)}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Modèle *" value={form.name} onChange={v => set('name', v)} placeholder="Submariner Date" />
        <Input label="Marque" value={form.brand} onChange={v => set('brand', v)} placeholder="Rolex" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Référence" value={form.reference} onChange={v => set('reference', v)} placeholder="126610LN" />
        <Input label="Boîte (mm)" value={form.caseSizeMm} onChange={v => set('caseSizeMm', v)} type="number" placeholder="41" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Mouvement" value={form.movement} onChange={v => set('movement', v)} placeholder="Automatique" />
        <Input label="Année" value={form.year} onChange={v => set('year', v)} type="number" placeholder="2022" />
      </div>
      <Select label="Condition" value={form.condition} onChange={v => set('condition', v)} options={CONDITIONS} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Prix achat (€) *" value={form.buyPrice} onChange={v => set('buyPrice', v)} type="number" placeholder="12000" />
        <Input label="Date d'achat" value={form.buyDate} onChange={v => set('buyDate', v)} type="date" />
      </div>

      {/* Market value */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Valeur marché actuelle</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={fetchMarketPrice} disabled={searching}
              style={{
                fontSize: 11, fontWeight: 700, color: '#818cf8', background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '4px 10px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <RefreshCw size={10} className={searching ? 'spin' : ''} />
              {searching ? 'Cherche...' : 'Auto'}
            </button>
            {form.name && (
              <a href={CHRONO24(form.reference || form.name)} target="_blank" rel="noreferrer"
                style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
                Chrono24 <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
        <input
          type="number" value={form.marketValue} onChange={e => set('marketValue', e.target.value)}
          placeholder="Prix actuel sur Chrono24…"
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '10px 13px', fontSize: 15, color: 'white',
            outline: 'none', fontFamily: 'inherit',
          }}
        />
        {form.name && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {[['Watchfinder', '#8b5cf6', WATCHFINDER(form.name)], ['Bob\'s', '#10b981', BOBS(form.name)]].map(([l, c, href]) => (
              <a key={l} href={href} target="_blank" rel="noreferrer"
                style={{ fontSize: 11, color: c, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
                {l} <ExternalLink size={10} />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Sale */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 14 }}>
        <p style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 12 }}>Vente (optionnel)</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label="Prix vente (€)" value={form.salePrice || ''} onChange={v => set('salePrice', v)} type="number" placeholder="15000" />
          <Input label="Date vente" value={form.saleDate || ''} onChange={v => set('saleDate', v)} type="date" />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes</label>
        <textarea
          value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
          placeholder="Complet avec box & papiers, lunette originale…"
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '10px 13px', fontSize: 15, color: 'white',
            outline: 'none', fontFamily: 'inherit', resize: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, paddingTop: 4, paddingBottom: 8 }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: 14, borderRadius: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af',
        }}>Annuler</button>
        <button onClick={handleSave} disabled={!form.name || !form.buyPrice} style={{
          flex: 2, padding: 14, borderRadius: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer',
          background: (!form.name || !form.buyPrice) ? 'rgba(99,102,241,0.2)' : '#6366f1',
          border: 'none', color: 'white', opacity: (!form.name || !form.buyPrice) ? 0.5 : 1,
        }}>Sauvegarder</button>
      </div>
    </div>
  )
}

/* ─── Watch Card ──────────────────────────────────────────────────────────── */
function WatchCard({ watch, onEdit, onDelete }) {
  const color = brandColor(watch.brand || watch.name)
  const gain = watch.salePrice != null
    ? watch.salePrice - watch.buyPrice
    : watch.marketValue != null
    ? watch.marketValue - watch.buyPrice
    : null
  const gainPct = gain != null && watch.buyPrice ? (gain / watch.buyPrice * 100).toFixed(1) : null
  const sold = watch.salePrice != null

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.08)`,
      borderRadius: 22, padding: '18px 16px',
      boxShadow: `0 4px 24px ${color}15`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
        <WatchAvatar brand={watch.brand} name={watch.name} sz={50} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {watch.name}
            </p>
            {sold && (
              <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 6, padding: '2px 6px', flexShrink: 0 }}>
                VENDU
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: '#4b5563' }}>
            {watch.brand || ''}{watch.reference ? ` · ${watch.reference}` : ''}{watch.caseSizeMm ? ` · ${watch.caseSizeMm}mm` : ''}{watch.condition ? ` · ${watch.condition}` : ''}
          </p>
        </div>
      </div>

      {/* Prices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 }}>
        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '10px 6px' }}>
          <p style={{ fontSize: 10, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Achat</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{fmt(watch.buyPrice)}</p>
        </div>
        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '10px 6px' }}>
          <p style={{ fontSize: 10, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
            {sold ? 'Vente' : 'Marché'}
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: sold ? '#10b981' : (watch.marketValue ? 'white' : '#374151') }}>
            {fmt(sold ? watch.salePrice : watch.marketValue) || '—'}
          </p>
        </div>
        <div style={{ textAlign: 'center', background: gain >= 0 ? 'rgba(16,185,129,0.08)' : gain != null ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '10px 6px', border: gain >= 0 ? '1px solid rgba(16,185,129,0.15)' : gain != null ? '1px solid rgba(239,68,68,0.15)' : 'none' }}>
          <p style={{ fontSize: 10, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>P&L</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: gain == null ? '#374151' : gain >= 0 ? '#10b981' : '#ef4444' }}>
            {gain == null ? '—' : `${gain >= 0 ? '+' : ''}${fmt(gain)}`}
          </p>
          {gainPct && <p style={{ fontSize: 10, color: gain >= 0 ? '#10b981' : '#ef4444' }}>{gain >= 0 ? '+' : ''}{gainPct}%</p>}
        </div>
      </div>

      {/* Links + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <a href={CHRONO24(watch.reference || watch.name)} target="_blank" rel="noreferrer"
            style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
            Chrono24 <ExternalLink size={10} />
          </a>
          <a href={WATCHFINDER(watch.name)} target="_blank" rel="noreferrer"
            style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
            Watchfinder <ExternalLink size={10} />
          </a>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onEdit(watch)} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(watch.id)} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main page ───────────────────────────────────────────────────────────── */
export default function Watches() {
  const [watches, setWatches] = useState(loadWatches)
  const [sheet, setSheet] = useState(null)  // null | 'add' | watch object (edit)
  const [search, setSearch] = useState('')

  function save(list) { setWatches(list); saveWatches(list) }

  function handleSave(w) {
    const existing = watches.find(x => x.id === w.id)
    if (existing) {
      save(watches.map(x => x.id === w.id ? w : x))
    } else {
      save([w, ...watches])
    }
    setSheet(null)
  }

  function handleDelete(id) {
    if (!confirm('Supprimer cette montre ?')) return
    save(watches.filter(w => w.id !== id))
  }

  // Stats
  const active = watches.filter(w => !w.salePrice)
  const sold = watches.filter(w => w.salePrice != null)
  const totalInvested = watches.reduce((s, w) => s + (w.buyPrice || 0), 0)
  const totalValue = watches.reduce((s, w) => s + (w.salePrice || w.marketValue || w.buyPrice || 0), 0)
  const totalGain = totalValue - totalInvested
  const realizedGain = sold.reduce((s, w) => s + ((w.salePrice || 0) - (w.buyPrice || 0)), 0)

  const filtered = watches.filter(w =>
    !search || w.name.toLowerCase().includes(search.toLowerCase()) ||
    (w.brand || '').toLowerCase().includes(search.toLowerCase()) ||
    (w.reference || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '0 16px 96px', paddingTop: 'max(52px, env(safe-area-inset-top, 0px))' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 2 }}>Montres</h1>
          <p style={{ fontSize: 13, color: '#4b5563' }}>{active.length} en collection · {sold.length} vendues</p>
        </div>
        <button
          onClick={() => setSheet('add')}
          style={{
            width: 44, height: 44, borderRadius: 16, cursor: 'pointer',
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Plus size={20} style={{ color: '#818cf8' }} />
        </button>
      </div>

      {/* Stats */}
      {watches.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Investi', value: fmt(totalInvested), color: '#6b7280' },
            { label: 'Valeur totale', value: fmt(totalValue), color: '#6366f1' },
            { label: 'P&L total', value: `${totalGain >= 0 ? '+' : ''}${fmt(totalGain)}`, color: totalGain >= 0 ? '#10b981' : '#ef4444' },
            { label: 'Gains réalisés', value: `${realizedGain >= 0 ? '+' : ''}${fmt(realizedGain)}`, color: realizedGain >= 0 ? '#10b981' : '#ef4444' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '14px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 18, fontWeight: 800, color }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      {watches.length > 3 && (
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher (modèle, marque, réf.)…"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '11px 14px 11px 36px', fontSize: 14, color: 'white',
              outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>
      )}

      {/* Empty state */}
      {watches.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 32px' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>⌚</div>
          <p style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 8 }}>Aucune montre</p>
          <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 24 }}>Ajoute ta première montre pour suivre la valeur et ton P&L en temps réel.</p>
          <button
            onClick={() => setSheet('add')}
            style={{
              padding: '14px 28px', borderRadius: 16, fontSize: 15, fontWeight: 700,
              background: '#6366f1', border: 'none', color: 'white', cursor: 'pointer',
            }}
          >
            Ajouter une montre
          </button>
        </div>
      )}

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map(w => (
          <WatchCard key={w.id} watch={w} onEdit={w => setSheet(w)} onDelete={handleDelete} />
        ))}
      </div>

      {/* Form sheet */}
      {sheet && (
        <Sheet
          title={sheet === 'add' ? 'Ajouter une montre' : `Modifier · ${sheet.name}`}
          onClose={() => setSheet(null)}
        >
          <WatchForm
            initial={sheet === 'add' ? EMPTY : sheet}
            onSave={handleSave}
            onCancel={() => setSheet(null)}
          />
        </Sheet>
      )}
    </div>
  )
}

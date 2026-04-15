import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import {
  Plus, Pencil, Trash2, Footprints, TrendingUp, Package,
  ArrowUpRight, ArrowDownRight, ExternalLink, ChevronRight,
  Search, X, Filter, MoreHorizontal, CheckCircle2, Check,
} from 'lucide-react'

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function fmt(n) {
  if (n == null) return '—'
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}
const STOCKX = name => `https://stockx.com/search?s=${encodeURIComponent(name)}`
const GOAT   = name => `https://www.goat.com/search?query=${encodeURIComponent(name)}`
const KLEKT  = name => `https://www.klekt.com/search?query=${encodeURIComponent(name)}`

const BRANDS = {
  nike: '#f97316', jordan: '#ef4444', adidas: '#6366f1', yeezy: '#f59e0b',
  new: '#10b981', asics: '#06b6d4', puma: '#8b5cf6', reebok: '#ec4899',
  converse: '#f59e0b', vans: '#374151', salomon: '#10b981', hoka: '#f97316',
}
function brandColor(brand = '') {
  const b = brand.toLowerCase()
  for (const [key, col] of Object.entries(BRANDS)) if (b.includes(key)) return col
  return '#6366f1'
}

const EMPTY = { name: '', brand: '', size: '', buyPrice: '', buyDate: '', salePrice: '', saleDate: '', marketValue: '', notes: '' }

/* ─── Sneaker Logo Placeholder ────────────────────────────────────────────── */
function SneakerThumb({ name, brand, size: sz = 52 }) {
  const color = brandColor(brand)
  const initial = (brand || name || '?')[0].toUpperCase()
  return (
    <div style={{
      width: sz, height: sz, borderRadius: Math.round(sz * 0.28), flexShrink: 0,
      background: color + '18', border: `1.5px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: sz * 0.4, fontWeight: 900, color,
    }}>
      {initial}
    </div>
  )
}

/* ─── Input ───────────────────────────────────────────────────────────────── */
function Input({ label, value, onChange, type = 'text', placeholder = '', hint }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)',
          borderRadius: 14, padding: '11px 14px', fontSize: 15, color: 'white',
          outline: 'none', fontFamily: 'inherit',
          transition: 'border-color 150ms',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
      />
      {hint && <p style={{ fontSize: 11, color: '#4b5563', marginTop: 4 }}>{hint}</p>}
    </div>
  )
}

/* ─── Bottom Sheet ────────────────────────────────────────────────────────── */
function Sheet({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />
      <div style={{
        position: 'relative', zIndex: 1, background: '#0f0f1a',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '28px 28px 0 0',
        maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))',
        animation: 'slideUp 300ms cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '14px auto 0' }} />
        {/* Header */}
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

/* ─── Sneaker Form ────────────────────────────────────────────────────────── */
function SneakerForm({ initial = EMPTY, onSave, onCancel }) {
  const [form, setForm] = useState(initial)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const profit = form.salePrice && form.buyPrice
    ? parseFloat(form.salePrice) - parseFloat(form.buyPrice)
    : form.marketValue && form.buyPrice
    ? parseFloat(form.marketValue) - parseFloat(form.buyPrice)
    : null

  function handleSave() {
    if (!form.name || !form.buyPrice) return
    onSave({
      ...form,
      buyPrice: parseFloat(form.buyPrice) || 0,
      salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
      marketValue: form.marketValue ? parseFloat(form.marketValue) : null,
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Preview */}
      {form.name && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
          background: 'rgba(99,102,241,0.06)', borderRadius: 16, border: '1px solid rgba(99,102,241,0.15)',
        }}>
          <SneakerThumb name={form.name} brand={form.brand} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.name}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{form.brand || 'Marque'} · Taille {form.size || '?'}</div>
          </div>
          {profit !== null && (
            <div style={{ fontSize: 15, fontWeight: 800, color: profit >= 0 ? '#10b981' : '#ef4444', flexShrink: 0 }}>
              {profit >= 0 ? '+' : ''}{fmt(profit)}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Modèle *" value={form.name} onChange={v => set('name', v)} placeholder="Air Jordan 1…" />
        <Input label="Marque" value={form.brand} onChange={v => set('brand', v)} placeholder="Nike" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Taille EU" value={form.size} onChange={v => set('size', v)} placeholder="42" />
        <Input label="Prix achat (€) *" value={form.buyPrice} onChange={v => set('buyPrice', v)} type="number" placeholder="150" />
      </div>
      <Input label="Date d'achat" value={form.buyDate} onChange={v => set('buyDate', v)} type="date" />

      {/* Market value */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Valeur marché actuelle</span>
          {form.name && (
            <div style={{ display: 'flex', gap: 10 }}>
              {[['StockX', '#6366f1', STOCKX(form.name)], ['GOAT', '#10b981', GOAT(form.name)], ['Klekt', '#f59e0b', KLEKT(form.name)]].map(([label, color, href]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" style={{ fontSize: 11, color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
                  {label} <ExternalLink size={10} />
                </a>
              ))}
            </div>
          )}
        </div>
        <input
          type="number" value={form.marketValue} onChange={e => set('marketValue', e.target.value)}
          placeholder="Prix actuel sur StockX / GOAT…"
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '10px 14px', fontSize: 15, color: 'white',
            outline: 'none', fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Sale */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '14px' }}>
        <p style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 12 }}>Vente (optionnel)</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label="Prix vente (€)" value={form.salePrice} onChange={v => set('salePrice', v)} type="number" placeholder="250" />
          <Input label="Date vente" value={form.saleDate} onChange={v => set('saleDate', v)} type="date" />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes</label>
        <textarea
          value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
          placeholder="DS, worn once, avec boîte…"
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)',
            borderRadius: 14, padding: '11px 14px', fontSize: 15, color: 'white',
            outline: 'none', fontFamily: 'inherit', resize: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, paddingTop: 4, paddingBottom: 8 }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: '14px', borderRadius: 16,
          border: '1.5px solid rgba(255,255,255,0.1)',
          background: 'transparent', color: '#6b7280', fontSize: 15, fontWeight: 600, cursor: 'pointer',
        }}>Annuler</button>
        <button onClick={handleSave} style={{
          flex: 2, padding: '14px', borderRadius: 16,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer',
        }}>Enregistrer</button>
      </div>
    </div>
  )
}

/* ─── Sneaker Card ────────────────────────────────────────────────────────── */
function SneakerCard({ s, onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const profit = s.salePrice ? s.salePrice - s.buyPrice : null
  const potential = !s.salePrice && s.marketValue ? s.marketValue - s.buyPrice : null
  const sold = !!s.salePrice
  const color = brandColor(s.brand)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 20,
      overflow: 'hidden',
      transition: 'border-color 180ms',
    }}>
      {/* Main row */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', cursor: 'pointer' }}
      >
        <SneakerThumb name={s.name} brand={s.brand} size={50} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {s.brand && <span style={{ fontSize: 12, color: color, fontWeight: 600 }}>{s.brand}</span>}
            {s.size && <span style={{ fontSize: 12, color: '#4b5563' }}>· EU {s.size}</span>}
            <span style={{
              marginLeft: 'auto',
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              padding: '2px 7px', borderRadius: 6,
              background: sold ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
              color: sold ? '#10b981' : '#f59e0b',
            }}>
              {sold ? 'Vendu' : 'Stock'}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {profit !== null ? (
            <div style={{ fontSize: 16, fontWeight: 800, color: profit >= 0 ? '#10b981' : '#ef4444' }}>
              {profit >= 0 ? '+' : ''}{fmt(profit)}
            </div>
          ) : potential !== null ? (
            <div style={{ fontSize: 15, fontWeight: 700, color: potential >= 0 ? '#6366f1' : '#ef4444' }}>
              {potential >= 0 ? '+' : ''}{fmt(potential)}
            </div>
          ) : (
            <div style={{ fontSize: 14, fontWeight: 600, color: '#6b7280' }}>{fmt(s.buyPrice)}</div>
          )}
          <div style={{ fontSize: 11, color: '#4b5563', marginTop: 1 }}>
            {profit !== null ? 'profit' : potential !== null ? 'potentiel' : 'achat'}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {open && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '14px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Achat', value: fmt(s.buyPrice), sub: s.buyDate },
              { label: 'Marché', value: s.marketValue ? fmt(s.marketValue) : '—', sub: 'valeur actuelle' },
              { label: 'Vendu', value: s.salePrice ? fmt(s.salePrice) : '—', sub: s.saleDate },
            ].map(({ label, value, sub }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{value}</div>
                {sub && <div style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>{sub}</div>}
              </div>
            ))}
          </div>

          {s.notes && (
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: '8px 12px', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{s.notes}</span>
            </div>
          )}

          {/* Quick links + actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {[['StockX', '#6366f1', STOCKX(s.name)], ['GOAT', '#10b981', GOAT(s.name)], ['Klekt', '#f59e0b', KLEKT(s.name)]].map(([label, col, href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 10,
                background: col + '14', border: `1px solid ${col}30`,
                color: col, fontSize: 12, fontWeight: 700, textDecoration: 'none',
              }}>
                {label} <ExternalLink size={10} />
              </a>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button onClick={() => onEdit(s)} style={{
                padding: '6px 14px', borderRadius: 10,
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                color: '#818cf8', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Modifier</button>
              <button onClick={() => onDelete(s.id)} style={{
                padding: '6px 12px', borderRadius: 10,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
                color: '#f87171', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Stats Strip ─────────────────────────────────────────────────────────── */
function Stat({ label, value, sub, color = '#6366f1' }) {
  return (
    <div style={{
      flex: 1, minWidth: 0, padding: '14px 16px',
      background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 18,
    }}>
      <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function Sneakers() {
  const { sneakers, addSneaker, updateSneaker, deleteSneaker } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    const h = () => setShowAdd(true)
    window.addEventListener('trackr:fab', h)
    return () => window.removeEventListener('trackr:fab', h)
  }, [])

  const sold = sneakers.filter(s => s.salePrice)
  const inStock = sneakers.filter(s => !s.salePrice)
  const totalProfit = sold.reduce((s, i) => s + (i.salePrice - i.buyPrice), 0)
  const totalInvested = sneakers.reduce((s, i) => s + (i.buyPrice || 0), 0)
  const marketValue = inStock.filter(s => s.marketValue).reduce((s, i) => s + i.marketValue, 0)
  const unrealizedPnL = marketValue - inStock.filter(s => s.marketValue).reduce((s, i) => s + i.buyPrice, 0)

  const filtered = sneakers
    .filter(s => filter === 'stock' ? !s.salePrice : filter === 'sold' ? !!s.salePrice : true)
    .filter(s => !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.brand?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.buyDate || '').localeCompare(a.buyDate || ''))

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 32 }}>
      {/* ── Header ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(7,7,15,0.92)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        paddingTop: 'max(52px, env(safe-area-inset-top, 0px))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Footprints size={20} color="#6366f1" />
            <span style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>Sneakers</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowSearch(v => !v)} style={{
              width: 36, height: 36, borderRadius: 12,
              background: showSearch ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: showSearch ? '#818cf8' : '#6b7280',
            }}>
              {showSearch ? <X size={16} /> : <Search size={16} />}
            </button>
            <button onClick={() => setShowAdd(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0 14px', height: 36, borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>
              <Plus size={15} /> Ajouter
            </button>
          </div>
        </div>

        {showSearch && (
          <div style={{ padding: '0 16px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Search size={15} color="#6b7280" />
              <input
                autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un modèle, une marque…"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 15, fontFamily: 'inherit' }}
              />
              {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0 }}><X size={14} /></button>}
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, padding: '0 16px 12px' }}>
          {[['all', 'Tout'], ['stock', 'En stock'], ['sold', 'Vendues']].map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} style={{
              padding: '7px 14px', borderRadius: 12,
              background: filter === id ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)',
              border: filter === id ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.06)',
              color: filter === id ? '#818cf8' : '#6b7280',
              fontSize: 13, fontWeight: filter === id ? 700 : 500, cursor: 'pointer',
            }}>
              {label}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#4b5563', display: 'flex', alignItems: 'center' }}>
            {filtered.length} paire{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {/* ── Stats ── */}
        {sneakers.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
            <Stat label="Profit réalisé" value={fmt(totalProfit)} sub={`${sold.length} paires vendues`} color={totalProfit >= 0 ? '#10b981' : '#ef4444'} />
            <Stat label="En stock" value={inStock.length} sub={marketValue > 0 ? `Valeur: ${fmt(marketValue)}` : `Investi: ${fmt(totalInvested)}`} color="#f59e0b" />
            {marketValue > 0 && (
              <Stat label="P&L non réalisé" value={(unrealizedPnL >= 0 ? '+' : '') + fmt(unrealizedPnL)} sub="valeur marché − achat" color={unrealizedPnL >= 0 ? '#6366f1' : '#ef4444'} />
            )}
            <Stat label="Total investi" value={fmt(totalInvested)} sub={`${sneakers.length} paires au total`} color="#6b7280" />
          </div>
        )}

        {/* ── Empty ── */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: 70, height: 70, borderRadius: 22, margin: '0 auto 16px',
              background: 'rgba(99,102,241,0.1)', border: '1.5px dashed rgba(99,102,241,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Footprints size={28} color="#6366f1" />
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#9ca3af', marginBottom: 8 }}>
              {search ? 'Aucun résultat' : 'Aucune paire'}
            </p>
            <p style={{ fontSize: 13, color: '#4b5563', marginBottom: 20 }}>
              {search ? 'Essaie un autre terme' : 'Ajoute ta première paire de sneakers'}
            </p>
            {!search && (
              <button onClick={() => setShowAdd(true)} style={{
                padding: '12px 24px', borderRadius: 14,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}>
                + Ajouter une paire
              </button>
            )}
          </div>
        )}

        {/* ── List ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(s => (
            <SneakerCard
              key={s.id} s={s}
              onEdit={item => setEditItem(item)}
              onDelete={id => deleteSneaker(id)}
            />
          ))}
        </div>
      </div>

      {/* ── Sheets ── */}
      {showAdd && (
        <Sheet title="Ajouter une paire" onClose={() => setShowAdd(false)}>
          <SneakerForm onSave={d => { addSneaker(d); setShowAdd(false) }} onCancel={() => setShowAdd(false)} />
        </Sheet>
      )}
      {editItem && (
        <Sheet title="Modifier" onClose={() => setEditItem(null)}>
          <SneakerForm
            initial={{
              ...editItem,
              buyPrice: editItem.buyPrice?.toString() ?? '',
              salePrice: editItem.salePrice?.toString() ?? '',
              marketValue: editItem.marketValue?.toString() ?? '',
            }}
            onSave={d => { updateSneaker(editItem.id, d); setEditItem(null) }}
            onCancel={() => setEditItem(null)}
          />
        </Sheet>
      )}
    </div>
  )
}

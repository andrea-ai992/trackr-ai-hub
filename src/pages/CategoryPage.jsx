import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import StatCard from '../components/StatCard'
import { CategoryIcon } from '../components/Sidebar'
import {
  Plus, Pencil, Trash2, DollarSign,
  TrendingUp, Package, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'

function fmt(n) {
  if (n == null) return '—'
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

const EMPTY = { name: '', quantity: '1', buyPrice: '', buyDate: '', salePrice: '', saleDate: '', notes: '' }

function ItemForm({ initial = EMPTY, color, onSave, onCancel }) {
  const [form, setForm] = useState(initial)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      ...form,
      quantity: parseFloat(form.quantity) || 1,
      buyPrice: parseFloat(form.buyPrice) || 0,
      salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
    })
  }

  const field = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      <input type={type} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none transition-all"
        style={{ '--tw-ring-color': color }}
      />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-3">
        {field('Nom / Modèle *', 'name', 'text', 'Rolex Submariner...')}
        {field('Quantité', 'quantity', 'number', '1')}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {field("Prix d'achat (€) *", 'buyPrice', 'number', '500')}
        {field("Date d'achat", 'buyDate', 'date')}
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
        <p className="text-xs text-gray-600 mb-3">Vente (optionnel)</p>
        <div className="grid grid-cols-2 gap-3">
          {field('Prix de vente (€)', 'salePrice', 'number', '700')}
          {field('Date de vente', 'saleDate', 'date')}
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1.5">Notes</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none transition-all resize-none"
          placeholder="Condition, référence..." />
      </div>
      <div className="flex gap-2.5 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm text-gray-500 hover:text-white transition-all">
          Annuler
        </button>
        <button type="submit"
          className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
          Enregistrer
        </button>
      </div>
    </form>
  )
}

export default function CategoryPage() {
  const { id } = useParams()
  const { categories, customItems, addCustomItem, updateCustomItem, deleteCustomItem } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState(null)
  const [filter, setFilter] = useState('all')

  const cat = categories.find(c => c.id === id)
  if (!cat) return <Navigate to="/" replace />

  const items = customItems[id] || []
  const sold = items.filter(i => i.salePrice && i.saleDate)
  const inStock = items.filter(i => !i.salePrice)
  const totalProfit = sold.reduce((s, i) => s + (i.salePrice - i.buyPrice) * (i.quantity || 1), 0)
  const totalInvested = items.reduce((s, i) => s + (i.buyPrice || 0) * (i.quantity || 1), 0)

  const chartData = sold.map(i => ({
    name: i.name.length > 12 ? i.name.slice(0, 12) + '…' : i.name,
    profit: +((i.salePrice - i.buyPrice) * (i.quantity || 1)).toFixed(2),
  }))

  const filtered = items.filter(i =>
    filter === 'stock' ? !i.salePrice : filter === 'sold' ? !!i.salePrice : true
  )

  const editItem = items.find(i => i.id === editId)

  return (
    <div className="p-5 md:p-7 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: cat.color + '20' }}>
            <CategoryIcon name={cat.icon} size={16} style={{ color: cat.color }} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{cat.name}</h1>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 text-white text-sm px-4 py-2.5 rounded-xl font-medium transition-all hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)` }}>
          <Plus size={15} /> Ajouter
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-7">Suivi inventaire · profit · ventes</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
        <StatCard label="Total articles" value={items.length} icon={Package} color={cat.color} />
        <StatCard label="En stock" value={inStock.length} icon={Package} color="#f59e0b" />
        <StatCard label="Vendus" value={sold.length} sub={`sur ${items.length}`} icon={TrendingUp} color={cat.color} />
        <StatCard label="Profit réalisé" value={fmt(totalProfit)}
          sub={`Investi: ${fmt(totalInvested)}`}
          color={totalProfit >= 0 ? '#10b981' : '#ef4444'}
          icon={totalProfit >= 0 ? ArrowUpRight : ArrowDownRight} />
      </div>

      {chartData.length > 0 && (
        <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-5 mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Profit par article vendu</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
              <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={v => [fmt(v), 'Profit']}
              />
              <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
                {chartData.map((e, i) => <Cell key={i} fill={e.profit >= 0 ? cat.color : '#ef4444'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {['all', 'stock', 'sold'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f ? 'text-white' : 'bg-white/[0.04] text-gray-500 hover:text-gray-300'
            }`}
            style={filter === f ? { background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)` } : {}}>
            {f === 'all' ? 'Tout' : f === 'stock' ? 'En stock' : 'Vendus'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-14 text-center">
          <CategoryIcon name={cat.icon} size={28} className="mx-auto mb-3" style={{ color: '#374151' }} />
          <p className="text-gray-600 text-sm">Aucun article — clique sur Ajouter</p>
        </div>
      ) : (
        <div className="bg-[#111118] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.05] text-gray-600 text-xs">
                  <th className="text-left px-5 py-3.5 font-medium">Article</th>
                  <th className="text-right px-4 py-3.5 font-medium">Qté</th>
                  <th className="text-right px-4 py-3.5 font-medium">Achat</th>
                  <th className="text-right px-4 py-3.5 font-medium">Vente</th>
                  <th className="text-right px-4 py-3.5 font-medium">Profit</th>
                  <th className="text-left px-4 py-3.5 font-medium">Statut</th>
                  <th className="px-4 py-3.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const qty = item.quantity || 1
                  const profit = item.salePrice ? (item.salePrice - item.buyPrice) * qty : null
                  return (
                    <tr key={item.id} className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-white">{item.name}</div>
                        {item.notes && <div className="text-xs text-gray-600 truncate max-w-xs">{item.notes}</div>}
                        {item.buyDate && <div className="text-xs text-gray-700">{item.buyDate}</div>}
                      </td>
                      <td className="px-4 py-3.5 text-right text-gray-400">{qty}</td>
                      <td className="px-4 py-3.5 text-right text-gray-300">{fmt(item.buyPrice)}</td>
                      <td className="px-4 py-3.5 text-right">
                        {item.salePrice ? (
                          <div>
                            <div className="text-gray-300">{fmt(item.salePrice)}</div>
                            {item.saleDate && <div className="text-xs text-gray-700">{item.saleDate}</div>}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold">
                        {profit != null ? (
                          <span className={profit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {profit >= 0 ? '+' : ''}{fmt(profit)}
                          </span>
                        ) : <span className="text-gray-700">—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.salePrice ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {item.salePrice ? 'Vendu' : 'Stock'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditId(item.id)}
                            className="text-gray-700 hover:text-indigo-400 transition-colors p-1">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => deleteCustomItem(id, item.id)}
                            className="text-gray-700 hover:text-red-400 transition-colors p-1">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && (
        <Modal title={`Ajouter un article — ${cat.name}`} onClose={() => setShowAdd(false)}>
          <ItemForm color={cat.color}
            onSave={d => { addCustomItem(id, d); setShowAdd(false) }}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}
      {editId && editItem && (
        <Modal title="Modifier l'article" onClose={() => setEditId(null)}>
          <ItemForm
            color={cat.color}
            initial={{ ...editItem, buyPrice: editItem.buyPrice?.toString() ?? '', salePrice: editItem.salePrice?.toString() ?? '', quantity: editItem.quantity?.toString() ?? '1' }}
            onSave={d => { updateCustomItem(id, editId, d); setEditId(null) }}
            onCancel={() => setEditId(null)}
          />
        </Modal>
      )}
    </div>
  )
}

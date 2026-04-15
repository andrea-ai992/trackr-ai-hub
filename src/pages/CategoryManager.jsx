import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import { CategoryIcon } from '../components/Sidebar'
import {
  Plus, Pencil, Trash2, Settings2, Lock,
  Footprints, TrendingUp, Watch, Gem, ShoppingBag,
  Car, Music, Camera, Gamepad2, Package, Bitcoin,
} from 'lucide-react'

const AVAILABLE_ICONS = [
  'Footprints', 'TrendingUp', 'Watch', 'Gem', 'ShoppingBag',
  'Car', 'Music', 'Camera', 'Gamepad2', 'Package', 'Bitcoin',
]

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#10b981', '#06b6d4',
  '#3b82f6', '#64748b', '#d97706', '#be185d',
]

const EMPTY_CAT = { name: '', icon: 'Package', color: '#6366f1' }

function CategoryForm({ initial = EMPTY_CAT, onSave, onCancel, isEdit = false }) {
  const [form, setForm] = useState(initial)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs text-gray-500 mb-1.5">Nom de la catégorie *</label>
        <input
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Montres, Cartes, Streetwear..."
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/60 transition-all"
        />
      </div>

      {/* Color picker */}
      <div>
        <label className="block text-xs text-gray-500 mb-2">Couleur</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(c => (
            <button key={c} onClick={() => set('color', c)}
              className={`w-7 h-7 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-white/40 ring-offset-1 ring-offset-[#131320] scale-110' : 'hover:scale-105'}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      {/* Icon picker */}
      <div>
        <label className="block text-xs text-gray-500 mb-2">Icône</label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_ICONS.map(icon => (
            <button key={icon} onClick={() => set('icon', icon)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                form.icon === icon
                  ? 'ring-2 ring-offset-1 ring-offset-[#131320]'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-gray-500 hover:text-white'
              }`}
              style={form.icon === icon ? { background: form.color + '30', color: form.color, ringColor: form.color } : {}}>
              <CategoryIcon name={icon} size={16} style={form.icon === icon ? { color: form.color } : {}} />
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: form.color + '25' }}>
          <CategoryIcon name={form.icon} size={16} style={{ color: form.color }} />
        </div>
        <div>
          <div className="text-sm font-medium text-white">{form.name || 'Aperçu'}</div>
          <div className="text-xs text-gray-600">Nouvelle catégorie</div>
        </div>
      </div>

      <div className="flex gap-2.5 pt-1">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm text-gray-500 hover:text-white hover:border-white/20 transition-all">
          Annuler
        </button>
        <button onClick={() => form.name && onSave(form)}
          disabled={!form.name}
          className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${form.color}, ${form.color}cc)` }}>
          {isEdit ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </div>
  )
}

export default function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const editCat = categories.find(c => c.id === editId)

  return (
    <div className="p-5 md:p-7 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">Catégories</h1>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 text-white text-sm px-4 py-2.5 rounded-xl font-medium transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <Plus size={15} /> Ajouter
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-7">Crée, renomme ou supprime tes catégories de suivi</p>

      <div className="flex flex-col gap-3">
        {categories.map(cat => (
          <div key={cat.id}
            className="flex items-center gap-4 px-5 py-4 bg-[#111118] border border-white/[0.06] rounded-2xl hover:border-white/[0.1] transition-all"
            style={{ boxShadow: `0 0 30px ${cat.color}06` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: cat.color + '20' }}>
              <CategoryIcon name={cat.icon} size={17} style={{ color: cat.color }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">{cat.name}</div>
              <div className="text-xs text-gray-600 mt-0.5">
                {cat.builtIn ? (
                  <span className="flex items-center gap-1"><Lock size={10} /> Catégorie intégrée</span>
                ) : (
                  'Catégorie personnalisée'
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditId(cat.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:text-indigo-400 hover:bg-white/[0.05] transition-all">
                <Pencil size={14} />
              </button>
              {!cat.builtIn && (
                <button onClick={() => setConfirmDelete(cat)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:text-red-400 hover:bg-white/[0.05] transition-all">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add */}
      {showAdd && (
        <Modal title="Nouvelle catégorie" onClose={() => setShowAdd(false)}>
          <CategoryForm
            onSave={data => { addCategory(data); setShowAdd(false) }}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}

      {/* Edit */}
      {editId && editCat && (
        <Modal title={`Modifier "${editCat.name}"`} onClose={() => setEditId(null)}>
          <CategoryForm
            initial={{ name: editCat.name, icon: editCat.icon, color: editCat.color }}
            isEdit
            onSave={data => { updateCategory(editId, data); setEditId(null) }}
            onCancel={() => setEditId(null)}
          />
        </Modal>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <Modal title="Supprimer la catégorie" onClose={() => setConfirmDelete(null)} size="sm">
          <div className="text-center py-2">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: confirmDelete.color + '20' }}>
              <CategoryIcon name={confirmDelete.icon} size={20} style={{ color: confirmDelete.color }} />
            </div>
            <p className="text-sm text-white font-medium mb-2">Supprimer "{confirmDelete.name}" ?</p>
            <p className="text-xs text-gray-600 mb-6">Tous les articles de cette catégorie seront définitivement supprimés.</p>
            <div className="flex gap-2.5">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm text-gray-500 hover:text-white transition-all">
                Annuler
              </button>
              <button onClick={() => { deleteCategory(confirmDelete.id); setConfirmDelete(null) }}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-sm font-medium transition-all">
                Supprimer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

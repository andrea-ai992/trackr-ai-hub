import { useState, useRef } from 'react'
import { useSettings, THEMES, PATTERNS } from '../context/SettingsContext'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import { CategoryIcon } from '../components/Sidebar'
import {
  User, Bell, Camera, Trash2, Plus, Pencil, Lock, Check,
  ChevronRight, Package, Type, Database, Info, Paintbrush,
  Download, Upload, Moon, Smartphone, Shield, Bot,
} from 'lucide-react'
import { requestNotificationPermission } from '../hooks/useAlerts'

const ICONS = ['Footprints','TrendingUp','Watch','Gem','ShoppingBag','Car','Music','Camera','Gamepad2','Package','Bitcoin']
const CAT_COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#eab308','#10b981','#06b6d4','#3b82f6','#64748b']
const EMPTY_CAT = { name: '', icon: 'Package', color: '#6366f1' }

function CategoryForm({ initial = EMPTY_CAT, onSave, onCancel }) {
  const [form, setForm] = useState(initial)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Name *</label>
        <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Watches, Cards..."
          style={{
            width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 14, padding: '12px 16px', fontSize: 15, color: 'white',
            outline: 'none', boxSizing: 'border-box',
          }} />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 10 }}>Color</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CAT_COLORS.map(c => (
            <button key={c} onClick={() => set('color', c)}
              style={{
                width: 34, height: 34, borderRadius: 10, background: c, cursor: 'pointer',
                border: form.color === c ? '3px solid rgba(255,255,255,0.6)' : '2px solid transparent',
                transform: form.color === c ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 200ms',
              }} />
          ))}
        </div>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 10 }}>Icon</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ICONS.map(icon => (
            <button key={icon} onClick={() => set('icon', icon)}
              style={{
                width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                background: form.icon === icon ? form.color + '25' : 'rgba(255,255,255,0.04)',
                border: form.icon === icon ? `1px solid ${form.color}60` : '1px solid rgba(255,255,255,0.06)',
                transition: 'all 200ms',
              }}>
              <CategoryIcon name={icon} size={16} style={{ color: form.icon === icon ? form.color : '#6b7280' }} />
            </button>
          ))}
        </div>
      </div>
      {/* Preview */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
        background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: form.color + '25', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CategoryIcon name={form.icon} size={16} style={{ color: form.color }} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: form.name ? 'white' : '#4b5563' }}>{form.name || 'Preview'}</span>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel}
          style={{
            flex: 1, padding: '14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: '#6b7280', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}>Cancel</button>
        <button onClick={() => form.name && onSave(form)} disabled={!form.name}
          style={{
            flex: 1, padding: '14px', borderRadius: 14, border: 'none',
            background: form.name ? `linear-gradient(135deg, ${form.color}, ${form.color}cc)` : 'rgba(255,255,255,0.05)',
            color: form.name ? 'white' : '#4b5563', fontSize: 15, fontWeight: 700, cursor: form.name ? 'pointer' : 'default',
          }}>Save</button>
      </div>
    </div>
  )
}

// ── Building blocks ────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, color = '#6b7280' }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, paddingLeft: 4 }}>
        {Icon && <Icon size={12} style={{ color }} />}
        <h2 style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</h2>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, sub, right, onClick, last, danger }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 20px',
        borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 150ms',
      }}
      onMouseDown={e => onClick && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
      onMouseUp={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: danger ? '#f87171' : 'white' }}>{label}</div>
        {sub && <div style={{ fontSize: 13, color: '#4b5563', marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <div onClick={onChange}
      style={{
        width: 50, height: 28, borderRadius: 14, cursor: 'pointer', flexShrink: 0,
        background: value ? '#6366f1' : 'rgba(255,255,255,0.12)',
        position: 'relative', transition: 'background 250ms',
        border: value ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
      }}>
      <div style={{
        position: 'absolute', top: 3, width: 22, height: 22, borderRadius: '50%',
        background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        left: value ? 25 : 3, transition: 'left 250ms cubic-bezier(0.22,1,0.36,1)',
      }} />
    </div>
  )
}

export default function Settings() {
  const { settings, setTheme, setPattern, setFontSize, setProfileName, setProfilePhoto, toggleNotifications, getStorageInfo } = useSettings()
  const { categories, addCategory, updateCategory, deleteCategory, exportData, importData } = useApp()
  const importRef = useRef()
  const photoRef = useRef()
  const [editName, setEditName] = useState(false)
  const [nameInput, setNameInput] = useState(settings.profileName)
  const [showAddCat, setShowAddCat] = useState(false)
  const [editCatId, setEditCatId] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [importMsg, setImportMsg] = useState(null)

  const storage = getStorageInfo()
  const editCat = categories.find(c => c.id === editCatId)

  function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('Image too large (max 2MB)'); return }
    const reader = new FileReader()
    reader.onload = ev => setProfilePhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '0 16px 40px', paddingTop: 'max(52px, env(safe-area-inset-top, 0px))' }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 4 }}>Settings</h1>
      <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 32 }}>Customize your Trackr experience</p>

      {/* ── Profile ── */}
      <Section title="Profile" icon={User}>
        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div onClick={() => photoRef.current?.click()}
              style={{
                width: 68, height: 68, borderRadius: 22, overflow: 'hidden', cursor: 'pointer',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              {settings.profilePhoto
                ? <img src={settings.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <User size={24} style={{ color: '#4b5563' }} />}
            </div>
            <div onClick={() => photoRef.current?.click()}
              style={{
                position: 'absolute', bottom: -4, right: -4, width: 24, height: 24,
                borderRadius: '50%', background: '#1e1e2e', border: '2px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
              <Camera size={11} style={{ color: '#9ca3af' }} />
            </div>
            <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editName ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') { setProfileName(nameInput); setEditName(false) } }}
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 12, padding: '10px 14px', fontSize: 16, color: 'white', outline: 'none',
                  }}
                />
                <button onClick={() => { setProfileName(nameInput); setEditName(false) }}
                  style={{
                    width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#6366f1', border: 'none', cursor: 'pointer',
                  }}>
                  <Check size={16} style={{ color: 'white' }} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                onClick={() => { setEditName(true); setNameInput(settings.profileName) }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>{settings.profileName || 'My Profile'}</span>
                <Pencil size={13} style={{ color: '#4b5563' }} />
              </div>
            )}
            <div style={{ fontSize: 13, color: '#374151', marginTop: 4 }}>Trackr User</div>
          </div>
          {settings.profilePhoto && (
            <button onClick={() => setProfilePhoto(null)} style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563' }}>
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Notifications toggle */}
        <Row
          label="Price Alert Notifications"
          sub={
            settings.notificationsEnabled
              ? 'Enabled — you\'ll get price alerts'
              : settings.notificationPermission === 'denied'
                ? '⚠ Blocked — enable in browser settings'
                : 'Get notified when prices hit your targets'
          }
          right={<Toggle value={settings.notificationsEnabled} onChange={toggleNotifications} />}
          last
        />
      </Section>

      {/* ── Appearance ── */}
      <Section title="Appearance" icon={Paintbrush}>
        {/* Color theme */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'white', marginBottom: 14 }}>Color Theme</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {Object.values(THEMES).map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)}
                style={{
                  position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '12px 8px', borderRadius: 16, cursor: 'pointer',
                  background: settings.themeId === t.id ? t.primary + '20' : 'rgba(255,255,255,0.03)',
                  border: settings.themeId === t.id ? `1.5px solid ${t.primary}60` : '1px solid rgba(255,255,255,0.07)',
                  transition: 'all 200ms',
                }}>
                <div style={{ width: 28, height: 28, borderRadius: 10, background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})` }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: settings.themeId === t.id ? t.primary : '#6b7280' }}>{t.name}</span>
                {settings.themeId === t.id && (
                  <Check size={10} style={{ position: 'absolute', top: 6, right: 6, color: t.primary }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Background pattern */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'white', marginBottom: 14 }}>Background Pattern</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {Object.values(PATTERNS).map(p => (
              <button key={p.id} onClick={() => setPattern(p.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '10px 4px', borderRadius: 14, cursor: 'pointer',
                  background: settings.patternId === p.id ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
                  border: settings.patternId === p.id ? '1.5px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 200ms',
                }}>
                <div className={p.class} style={{ width: 36, height: 26, borderRadius: 8, background: '#0d0d16', border: '1px solid rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: 10, color: settings.patternId === p.id ? '#818cf8' : '#6b7280', fontWeight: 500 }}>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font size */}
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Type size={14} style={{ color: '#6b7280' }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: 'white' }}>Text Size</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#818cf8' }}>{settings.fontSize}px</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 700 }}>A</span>
            <input type="range" min={12} max={18} step={1} value={settings.fontSize}
              onChange={e => setFontSize(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#6366f1', height: 4, cursor: 'pointer' }} />
            <span style={{ fontSize: 16, color: '#9ca3af', fontWeight: 700 }}>A</span>
          </div>
        </div>
      </Section>

      {/* ── Categories ── */}
      <Section title="Custom Categories" icon={Package}>
        {categories.map((cat, i) => (
          <div key={cat.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
              borderBottom: i < categories.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12, flexShrink: 0,
              background: cat.color + '20', border: `1px solid ${cat.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CategoryIcon name={cat.icon} size={16} style={{ color: cat.color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>{cat.name}</div>
              {cat.builtIn && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Lock size={9} style={{ color: '#374151' }} />
                  <span style={{ fontSize: 11, color: '#374151' }}>Built-in</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setEditCatId(cat.id)}
                style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' }}>
                <Pencil size={13} />
              </button>
              {!cat.builtIn && (
                <button onClick={() => setConfirmDel(cat)}
                  style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#f87171' }}>
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
        <button onClick={() => setShowAddCat(true)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px',
            borderTop: '1px solid rgba(255,255,255,0.05)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
            color: '#6366f1', fontSize: 15, fontWeight: 600,
          }}>
          <Plus size={16} /> Add Category
        </button>
      </Section>

      {/* ── Data ── */}
      <Section title="Data & Storage" icon={Database}>
        <Row label="Storage Used" sub="Saved locally on this device"
          right={<span style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{storage.kb} KB</span>} />
        <Row label="Categories" right={<span style={{ fontSize: 15, color: '#6b7280' }}>{categories.length}</span>} />
        <Row label="Export Data"
          sub="Download a backup file"
          onClick={exportData}
          right={<Download size={18} style={{ color: '#818cf8' }} />}
        />
        <Row label="Import Data"
          sub="Restore from a backup file"
          onClick={() => importRef.current?.click()}
          right={<Upload size={18} style={{ color: '#818cf8' }} />}
          last
        />
        {importMsg && (
          <div style={{ padding: '12px 20px', fontSize: 13, color: importMsg.ok ? '#34d399' : '#f87171', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {importMsg.text}
          </div>
        )}
        <input ref={importRef} type="file" accept=".json,application/json" style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = ev => {
              const ok = importData(ev.target.result)
              setImportMsg({ ok, text: ok ? '✓ Data imported successfully!' : '✗ Invalid backup file.' })
              setTimeout(() => setImportMsg(null), 4000)
            }
            reader.readAsText(file)
            e.target.value = ''
          }} />
      </Section>

      {/* ── AnDy AI ── */}
      <Section title="AnDy AI" icon={Bot} color="#818cf8">
        <Row
          label="AnDy AI"
          sub="Assistant vocal · Appuie sur le bouton violet flottant"
          right={
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 7, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
              ● Actif
            </span>
          }
          last
        />
      </Section>

      {/* ── About ── */}
      <Section title="About" icon={Info}>
        <Row label="App" right={<span style={{ fontSize: 14, color: '#6b7280' }}>Trackr</span>} />
        <Row label="Version" right={<span style={{ fontSize: 14, color: '#6b7280' }}>2.3</span>} />
        <Row label="AI Model" right={<span style={{ fontSize: 14, color: '#6b7280' }}>Claude Sonnet</span>} />
        <Row label="Live Prices" sub="Yahoo Finance · CoinGecko" right={<span style={{ fontSize: 12, color: '#34d399', fontWeight: 700 }}>✓ Active</span>} />
        <Row label="News" sub="BBC · CNBC · Reuters · CoinTelegraph" right={<span style={{ fontSize: 12, color: '#34d399', fontWeight: 700 }}>✓ RSS</span>} />
        <Row label="Flights" sub="ADSB.lol · OpenStreetMap" right={<span style={{ fontSize: 12, color: '#34d399', fontWeight: 700 }}>✓ Live</span>} last />
      </Section>

      {/* Modals */}
      {showAddCat && (
        <Modal title="New Category" onClose={() => setShowAddCat(false)}>
          <CategoryForm onSave={d => { addCategory(d); setShowAddCat(false) }} onCancel={() => setShowAddCat(false)} />
        </Modal>
      )}
      {editCatId && editCat && (
        <Modal title={`Edit "${editCat.name}"`} onClose={() => setEditCatId(null)}>
          <CategoryForm
            initial={{ name: editCat.name, icon: editCat.icon, color: editCat.color }}
            onSave={d => { updateCategory(editCatId, d); setEditCatId(null) }}
            onCancel={() => setEditCatId(null)}
          />
        </Modal>
      )}
      {confirmDel && (
        <Modal title="Delete Category" onClose={() => setConfirmDel(null)} size="sm">
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: confirmDel.color + '20' }}>
              <CategoryIcon name={confirmDel.icon} size={24} style={{ color: confirmDel.color }} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 8 }}>Delete "{confirmDel.name}"?</p>
            <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 24 }}>All items in this category will be permanently deleted.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDel(null)}
                style={{ flex: 1, padding: '14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#6b7280', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => { deleteCategory(confirmDel.id); setConfirmDel(null) }}
                style={{ flex: 1, padding: '14px', borderRadius: 14, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.12)', color: '#f87171', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

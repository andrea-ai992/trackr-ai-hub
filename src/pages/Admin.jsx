import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Shield, Users, Copy, Check, Trash2, RefreshCw, Plus, ChevronLeft } from 'lucide-react'

export default function Admin() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers]       = useState([])
  const [invites, setInvites]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [copied, setCopied]     = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return }
    fetchData()
  }, [isAdmin])

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

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: '16px 20px', marginBottom: 16,
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 40px', paddingTop: 'max(52px, env(safe-area-inset-top,0px))' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0 }}>
          <ChevronLeft size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white' }}>Admin Panel</h1>
          <p style={{ fontSize: 13, color: '#4b5563' }}>Gestion des utilisateurs & invitations</p>
        </div>
        <div style={{
          padding: '6px 12px', borderRadius: 10, fontSize: 11, fontWeight: 700,
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171',
        }}>
          <Shield size={12} style={{ display: 'inline', marginRight: 4 }} />ADMIN
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Utilisateurs', value: users.length, color: '#6366f1' },
          { label: 'Invitations actives', value: invites.filter(i => !i.used).length, color: '#10b981' },
        ].map(s => (
          <div key={s.label} style={{ ...inputStyle, marginBottom: 0, textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Invite codes */}
      <div style={inputStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>
            <Users size={14} style={{ display: 'inline', marginRight: 6, color: '#6366f1' }} />
            Codes d'invitation
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={fetchData} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4 }}>
              <RefreshCw size={14} />
            </button>
            <button
              onClick={createInvite} disabled={creating}
              className="press-scale"
              style={{
                padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8',
              }}
            >
              <Plus size={12} style={{ display: 'inline', marginRight: 4 }} />
              {creating ? '...' : 'Créer'}
            </button>
          </div>
        </div>

        {invites.length === 0 && (
          <p style={{ fontSize: 13, color: '#4b5563', textAlign: 'center', padding: '12px 0' }}>
            Aucun code. Crée un lien pour inviter un ami.
          </p>
        )}

        {invites.map(inv => (
          <div key={inv.id} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            opacity: inv.used ? 0.4 : 1,
          }}>
            <code style={{ flex: 1, fontSize: 14, fontWeight: 700, color: inv.used ? '#4b5563' : '#818cf8', letterSpacing: '0.1em' }}>
              {inv.code}
            </code>
            <span style={{ fontSize: 11, color: '#4b5563' }}>
              {inv.used ? '✓ Utilisé' : `Expire ${new Date(inv.expires_at).toLocaleDateString('fr')}`}
            </span>
            {!inv.used && (
              <button onClick={() => copyInviteLink(inv.code)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === inv.code ? '#10b981' : '#6b7280', padding: 4 }}>
                {copied === inv.code ? <Check size={14} /> : <Copy size={14} />}
              </button>
            )}
            <button onClick={() => deleteInvite(inv.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4 }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Users list */}
      <div style={inputStyle}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 16 }}>
          Utilisateurs ({users.length})
        </p>
        {loading && <p style={{ fontSize: 13, color: '#4b5563' }}>Chargement...</p>}
        {users.map(u => (
          <div key={u.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12, flexShrink: 0,
              background: u.role === 'admin' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
              border: `1px solid ${u.role === 'admin' ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: u.role === 'admin' ? '#f87171' : '#818cf8',
            }}>
              {(u.username || u.email || '?')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{u.username || 'Sans nom'}</p>
              <p style={{ fontSize: 11, color: '#4b5563' }}>{new Date(u.created_at).toLocaleDateString('fr')}</p>
            </div>
            {u.id !== user?.id && (
              <button
                onClick={() => toggleRole(u.id, u.role)}
                style={{
                  padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  background: u.role === 'admin' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${u.role === 'admin' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  color: u.role === 'admin' ? '#f87171' : '#6b7280',
                }}
              >
                {u.role === 'admin' ? 'Admin' : 'User'}
              </button>
            )}
            {u.id === user?.id && (
              <span style={{ fontSize: 11, color: '#4b5563' }}>Toi</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Bot, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { isSupabaseEnabled } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [mode, setMode]       = useState('login')   // 'login' | 'register'
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [username, setUser]   = useState('')
  const [showPass, setShowP]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!email || !password) return setError('Email et mot de passe requis')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect' : error.message)
      else navigate('/')
    } else {
      if (!username) return setError('Nom d\'utilisateur requis') & setLoading(false)
      const { error } = await signUp(email, password, username)
      if (error) setError(error.message)
      else setSuccess('Compte créé ! Vérifie ton email pour confirmer.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100dvh', background: '#0b1323',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Aurora blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(102,0,234,0.3) 0%, transparent 70%)', animation: 'float 20s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,255,0.2) 0%, transparent 70%)', animation: 'float 18s ease-in-out infinite reverse' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 24, margin: '0 auto 16px',
            background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(139,92,246,0.3)',
          }}>
            <Bot size={36} style={{ color: '#8b5cf6' }} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 6 }}>Trackr AI Hub</h1>
          <p style={{ fontSize: 14, color: '#4b5563' }}>
            {mode === 'login' ? 'Connexion à ton espace' : 'Créer un compte'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 28, padding: 28,
          backdropFilter: 'blur(20px)',
        }}>
          {!isSupabaseEnabled && (
            <div style={{
              padding: '12px 16px', borderRadius: 12, marginBottom: 20,
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <AlertCircle size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: '#f59e0b', lineHeight: 1.5 }}>
                Auth non configurée. Ajoute <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON</code> dans <code>.env.local</code>
              </p>
            </div>
          )}

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 16,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              fontSize: 13, color: '#f87171',
            }}>{error}</div>
          )}

          {success && (
            <div style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 16,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              fontSize: 13, color: '#34d399',
            }}>{success}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>NOM D'UTILISATEUR</span>
                <input
                  type="text" placeholder="ex: alex" value={username}
                  onChange={e => setUser(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, padding: '12px 14px', color: 'white', fontSize: 15,
                    outline: 'none', width: '100%',
                  }}
                />
              </label>
            )}

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>EMAIL</span>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
                <input
                  type="email" placeholder="ton@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, padding: '12px 14px 12px 40px', color: 'white', fontSize: 15,
                    outline: 'none', width: '100%',
                  }}
                />
              </div>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>MOT DE PASSE</span>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
                <input
                  type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password}
                  onChange={e => setPass(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, padding: '12px 40px 12px 40px', color: 'white', fontSize: 15,
                    outline: 'none', width: '100%',
                  }}
                />
                <button type="button" onClick={() => setShowP(s => !s)} style={{
                  position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', padding: 0,
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <button
              type="submit" disabled={loading || !isSupabaseEnabled}
              className="press-scale"
              style={{
                marginTop: 4, padding: '14px', borderRadius: 14, fontWeight: 700, fontSize: 15,
                cursor: loading || !isSupabaseEnabled ? 'not-allowed' : 'pointer',
                background: loading || !isSupabaseEnabled
                  ? 'rgba(99,102,241,0.3)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', color: 'white',
                boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                transition: 'all 200ms',
              }}
            >
              {loading ? '...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); setSuccess('') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6366f1' }}
            >
              {mode === 'login' ? "Pas de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#374151' }}>
          Trackr AI Hub · 45 agents IA · 24/7
        </p>
      </div>
    </div>
  )
}

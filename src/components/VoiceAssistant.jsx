import { useNavigate, useLocation } from 'react-router-dom'
import { Bot } from 'lucide-react'

export default function VoiceAssistant() {
  const navigate = useNavigate()
  const location = useLocation()

  // Hide on Andy page itself, flights (has own layout), widget
  if (
    location.pathname.startsWith('/andy') ||
    location.pathname.startsWith('/widget')
  ) return null

  return (
    <button
      onClick={() => navigate('/andy')}
      className="press-scale"
      aria-label="AnDy AI"
      style={{
        position: 'fixed',
        bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        right: 20,
        zIndex: 1100,
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #00a3b8 0%, #6600ea 100%)',
        border: 'none',
        boxShadow: '0 4px 24px rgba(0,218,243,0.35), 0 0 0 1px rgba(0,218,243,0.15) inset',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'white',
      }}
    >
      <Bot size={22} />
    </button>
  )
}

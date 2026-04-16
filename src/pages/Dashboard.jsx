```jsx
// src/components/sports/PSGWidget.jsx
import { useState, useEffect } from 'react'

const PSG_BLUE = '#004170'
const PSG_RED = '#DA291C'
const PSG_GOLD = '#FFD700'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function PSGWidget() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const apiKey = import.meta.env.VITE_FOOTBALL_API_KEY
    if (!apiKey) {
      setError('Clé API manquante')
      setLoading(false)
      return
    }

    const controller = new AbortController()

    fetch('https://api.football-data.org/v4/teams/524/matches?status=SCHEDULED&limit=5', {
      headers: { 'X-Auth-Token': apiKey },
      signal: controller.signal,
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(d => {
        setMatches(d.matches?.slice(0, 5) || [])
        setLoading(false)
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError('Impossible de charger les matchs')
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [])

  return (
    <div style={{
      borderRadius: 20,
      overflow: 'hidden',
      border: `1px solid rgba(0,65,112,0.4)`,
      background: `linear-gradient(135deg, rgba(0,65,112,0.18) 0%, rgba(218,41,28,0.08) 100%)`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '14px 16px',
        background: `linear-gradient(90deg, ${PSG_BLUE} 0%, #005fa3 100%)`,
        borderBottom: `2px solid ${PSG_RED}`,
      }}>
        <span style={{ fontSize: 20 }}>⚽</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          PSG — Prochains matchs
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: PSG_GOLD, letterSpacing: '0.05em' }}>
          PARIS SG
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 0' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#6b7280', fontSize: 13 }}>
            Chargement…
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '16px', color: PSG_RED, fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}

        {!loading && !error && matches.length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px', color: '#6b7280', fontSize: 13 }}>
            Aucun match planifié
          </div>
        )}

        {!loading && !error && matches.map((match, i) => {
          const isHome = match.homeTeam?.id === 524
          const opponent = isHome ? match.awayTeam?.shortName : match.homeTeam?.shortName
          const venue = isHome ? 'Domicile' : 'Extérieur'
          const venueColor = isHome ? '#10b981' : '#f59e0b'

          return (
            <div key={match.id} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              padding: '11px 16px',
              borderBottom: i < matches.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>
                  PSG vs {opponent || 'TBD'}
                </span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: venueColor,
                  background: `${venueColor}22`,
                  border: `1px solid ${venueColor}44`,
                  borderRadius: 6,
                  padding: '2px 7px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  {venue}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  {formatDate(match.utcDate)}
                </span>
                <span style={{ fontSize: 11, color: PSG_GOLD, fontWeight: 600 }}>
                  {match.competition?.name || ''}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
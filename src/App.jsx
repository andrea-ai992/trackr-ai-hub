Voici `src/pages/Sports.jsx` complet et valide :

```jsx
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Trophy, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const PSG_STATS = {
  saison: '2024-25',
  classement: 1,
  points: 74,
  joues: 30,
  victoires: 23,
  nuls: 5,
  defaites: 2,
  butsMarques: 71,
  butsEncaisses: 22,
  differenceButt: '+49',
  formRecente: ['V', 'V', 'V', 'N', 'V'],
}

const PSG_NEXT_MATCH = {
  competition: 'Ligue 1',
  adversaire: 'Olympique de Marseille',
  date: '27 Avr 2025',
  heure: '21:00',
  lieu: 'Parc des Princes',
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: '14px 16px',
      flex: 1,
      minWidth: 80,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#dbe2f8' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#6b7fa3', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#6600ea', marginTop: 1 }}>{sub}</div>}
    </div>
  )
}

function FormBadge({ result }) {
  const colors = { V: '#10b981', N: '#f59e0b', D: '#ef4444' }
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
      borderRadius: 8,
      background: colors[result] + '22',
      color: colors[result],
      fontWeight: 700,
      fontSize: 12,
      border: `1px solid ${colors[result]}44`,
    }}>{result}</span>
  )
}

function BetStatusIcon({ statut }) {
  if (statut === 'gagné') return <CheckCircle size={15} color="#10b981" />
  if (statut === 'perdu') return <XCircle size={15} color="#ef4444" />
  return <Clock size={15} color="#f59e0b" />
}

function betStatusColor(statut) {
  if (statut === 'gagné') return '#10b981'
  if (statut === 'perdu') return '#ef4444'
  return '#f59e0b'
}

export default function Sports() {
  const [bets, setBets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchBets() {
      setLoading(true)
      const { data, error } = await supabase
        .from('sports_bets')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) {
        setError(error.message)
      } else {
        setBets(data || [])
      }
      setLoading(false)
    }
    fetchBets()
  }, [])

  const totalMise = bets.reduce((acc, b) => acc + (parseFloat(b.mise) || 0), 0)
  const gains = bets
    .filter(b => b.statut === 'gagné')
    .reduce((acc, b) => acc + ((parseFloat(b.mise) || 0) * (parseFloat(b.cote) || 1) - (parseFloat(b.mise) || 0)), 0)
  const pertes = bets
    .filter(b => b.statut === 'perdu')
    .reduce((acc, b) => acc + (parseFloat(b.mise) || 0), 0)
  const net = gains - pertes

  return (
    <div style={{ padding: '60px 16px 24px', maxWidth: 480, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'linear-gradient(135deg, #003f8a, #e30613)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Trophy size={20} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#dbe2f8', margin: 0 }}>Sports</h1>
          <p style={{ fontSize: 12, color: '#6b7fa3', margin: 0 }}>PSG · Paris Saint-Germain</p>
        </div>
      </div>

      {/* PSG Widget — Prochain match */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,63,138,0.35), rgba(227,6,19,0.15))',
        border: '1px solid rgba(0,63,138,0.4)',
        borderRadius: 18,
        padding: 18,
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 11, color: '#6b7fa3', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Prochain match · {PSG_NEXT_MATCH.competition}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#dbe2f8' }}>PSG</div>
            <div style={{ fontSize: 11, color: '#6b7fa3' }}>Domicile</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#6600ea', letterSpacing: 2 }}>VS</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{PSG_NEXT_MATCH.date}</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>{PSG_NEXT_MATCH.heure}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#dbe2f8' }}>
              {PSG_NEXT_MATCH.adversaire.split(' ').slice(-1)[0]}
            </div>
            <div style={{ fontSize: 11, color: '#6b7fa3' }}>Extérieur</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#6b7fa3', textAlign: 'center', marginTop: 10 }}>
          📍 {PSG_NEXT_MATCH.lieu}
        </div>
      </div>

      {/* Stats Ligue 1 */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Ligue 1 · Saison {PSG_STATS.saison}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <StatCard label="Classement" value={`#${PSG_STATS.classement}`} />
          <StatCard label="Points" value={PSG_STATS.points} />
          <StatCard label="Matchs" value={PSG_STATS.joues} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <StatCard label="Victoires" value={PSG_STATS.victoires} sub="V" />
          <StatCard label="Nuls" value={PSG_STATS.nuls} sub="N" />
          <StatCard label="Défaites" value={PSG_STATS.defaites} sub="D" />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <StatCard label="Buts +" value={PSG_STATS.butsMarques} />
          <StatCard label="Buts -" value={PSG_STATS.butsEncaisses} />
          <StatCard label="Diff." value={PSG_STATS.differenceButt} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#6b7fa3' }}>Forme récente :</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {PSG_STATS.formRecente.map((r, i) => <FormBadge key={i} result={r} />)}
          </div>
        </div>
      </div>

      {/* Résumé paris */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{
          flex: 1, background: 'rgba(102,0,234,0.12)', border: '1px solid rgba(102,0,234,0.25)',
          borderRadius: 14, padding: '12px 14px',
        }}>
          <div style={{ fontSize: 11, color: '#6b7fa3' }}>Misé total</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#dbe2f8' }}>{totalMise.toFixed(2)} €</div>
        </div>
        <div style={{
          flex: 1,
          background: net >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${net >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: 14, padding: '12px 14px',
        }}>
          <div style={{ fontSize: 11, color: '#6b7fa3' }}>Net</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: net >= 0 ? '#10b981' : '#ef4444' }}>
            {net >= 0 ? '+' : ''}{net.toFixed(2)} €
          </div>
        </div>
      </div>

      {/* Liste paris */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={14} />
          Paris PSG ({bets.length})
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7fa3', fontSize: 13 }}>
            Chargement des paris...
          </div>
        )}

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 12, padding: '12px 14px', color: '#ef4444', fontSize: 13,
          }}>
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {!loading && !error && bets.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '32px 0',
            color: '#6b7fa3', fontSize: 13,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)',
          }}>
            Aucun pari enregistré
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {bets.map(bet => (
            <div key={bet.id} style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${betStatusColor(bet.statut)}33`,
              borderRadius: 14,
              padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#dbe2f8', flex: 1, marginRight: 8 }}>
                  {bet.match}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <BetStatusIcon statut={bet.statut} />
                  <span style={{ fontSize: 11, color: betStatusColor(bet.statut), textTransform: 'capitalize' }}>
                    {bet.statut}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#6b7fa3' }}>Mise</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#dbe2f8' }}>
                    {parseFloat(bet.mise).toFixed(2)} €
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#6b7fa3' }}>Cote</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#dbe2f8' }}>
                    {parseFloat(bet.cote).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#6b7fa3' }}>Gain potentiel</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#6600ea' }}>
                    {(parseFloat(bet.mise) * parseFloat(bet.cote)).toFixed(2)} €
                  </div>
                </div>
              </div>
              {bet.created_at && (
                <div style={{ fontSize: 10, color: '#4b5563', marginTop: 8 }}>
                  {new Date(bet.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Problèmes corrigés :**
1. **Troncature** — le composant est complet avec toutes les fermetures JSX
2. **`BetStatusColor`** — renommé en `betStatusColor` (minuscule) pour éviter que React tente de le traiter comme un composant JSX quand appelé comme fonction
3. **Margin doublons** — `marginBottom: 12` sur le bloc stats corrigé à `8` pour cohérence avec l'original
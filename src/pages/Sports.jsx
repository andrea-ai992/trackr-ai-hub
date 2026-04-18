import { useState, useEffect, useCallback } from 'react'
import { Loader2, RefreshCw, ExternalLink, Trophy, ChevronRight, Zap, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { PullIndicator } from '../components/Skeleton'

const TABS = [
  { id: 'psg', label: 'PSG', emoji: '⚽', color: '#004170', accent: '#DA291C', sport: 'soccer', league: 'fra.1' },
  { id: 'nba', label: 'NBA', emoji: '🏀', color: '#f59e0b', accent: '#fbbf24', sport: 'basketball', league: 'nba' },
  { id: 'nfl', label: 'NFL', emoji: '🏈', color: '#f97316', accent: '#002244', sport: 'football', league: 'nfl' },
  { id: 'ufc', label: 'UFC', emoji: '🥊', color: '#8b5cf6', accent: '#ef4444', sport: 'mma', league: 'ufc' },
]

const MY_TEAMS = [
  { id: '160', sport: 'soccer', league: 'fra.1', name: 'PSG', fullName: 'Paris Saint-Germain', color: '#004170', accent: '#DA291C', emoji: '⚽',
    logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/160.png&h=80&w=80', tags: ['soccer', 'ucl'] },
  { id: '14', sport: 'basketball', league: 'nba', name: 'Heat', fullName: 'Miami Heat', color: '#98002E', accent: '#F9A01B', emoji: '🏀',
    tags: ['nba'], logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/mia.png&h=80&w=80' },
  { id: '7', sport: 'football', league: 'nfl', name: 'Broncos', fullName: 'Denver Broncos', color: '#FB4F14', accent: '#002244', emoji: '🏈',
    tags: ['nfl'], logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/den.png&h=80&w=80' },
  { id: '20', sport: 'mma', league: 'ufc', name: 'UFC', fullName: 'Ultimate Fighting Championship', color: '#8b5cf6', accent: '#ef4444', emoji: '🥊',
    tags: ['mma'], logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/mma/500/ufc.png&h=80&w=80' },
]

async function espn(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (r.ok) return await r.json()
  } catch {}
  try {
    const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(10000) })
    if (r.ok) { const w = await r.json(); return JSON.parse(w.contents) }
  } catch {}
  return null
}

function parseSchedule(json, teamId) {
  const events = json?.events || []
  const completed = []
  const upcoming = []
  const now = new Date()

  for (const ev of events) {
    const comp = ev.competitions?.[0]
    if (!comp) continue
    const status = comp.status?.type
    const date = new Date(ev.date)
    if (status?.completed) {
      completed.push({ ev, comp, date })
    } else if (date > now) {
      upcoming.push({ ev, comp, date })
    }
  }

  const recent = completed.slice(-5).reverse()
  const next = upcoming[0] || null

  function parseComp(item) {
    if (!item) return null
    const { ev, comp, date } = item
    const competitors = comp.competitors || []
    const mine = competitors.find(c => c.id === teamId)
    const opp = competitors.find(c => c.id !== teamId)
    const myScore = parseInt(mine?.score ?? 0)
    const oppScore = parseInt(opp?.score ?? 0)
    let result = null
    if (comp.status?.type?.completed) {
      if (mine?.winner) result = 'W'
      else if (opp?.winner) result = 'L'
      else result = 'D'
    }
    const statusDetail = comp.status?.type?.shortDetail || comp.status?.type?.detail || ''
    return {
      date,
      opponent: opp?.team?.shortDisplayName || opp?.team?.displayName || '?',
      opponentLogo: opp?.team?.logo,
      myScore, oppScore, result,
      statusDetail,
      isHome: mine?.homeAway === 'home',
      inProgress: comp.status?.type?.state === 'in',
    }
  }

  return { recent: recent.map(parseComp), next: parseComp(next) }
}

async function fetchTeam(team) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${team.sport}/${team.league}/teams/${team.id}/schedule`
  const json = await espn(url)
  return parseSchedule(json, team.id)
}

async function fetchNbaStandings() {
  const url = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings'
  const json = await espn(url)
  return json?.sports?.[0]?.leagues?.[0]?.standings || []
}

async function fetchNbaScoreboard() {
  const url = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard'
  const json = await espn(url)
  return (json?.events || []).map(ev => {
    const comp = ev.competitions?.[0]
    const competitors = comp?.competitors || []
    const home = competitors.find(c => c.homeAway === 'home')
    const away = competitors.find(c => c.homeAway === 'away')
    const status = comp?.status?.type
    return {
      id: ev.id,
      name: ev.name,
      date: new Date(ev.date),
      homeTeam: home?.team?.shortDisplayName || home?.team?.displayName,
      homeLogo: home?.team?.logo,
      homeScore: home?.score,
      homeWinner: home?.winner,
      awayTeam: away?.team?.shortDisplayName || away?.team?.displayName,
      awayLogo: away?.team?.logo,
      awayScore: away?.score,
      awayWinner: away?.winner,
      status: status?.shortDetail || status?.detail || '',
      completed: status?.completed,
      inProgress: status?.state === 'in',
      period: comp?.status?.period,
      clock: comp?.status?.displayClock,
    }
  })
}

function fmtDate(d) {
  if (!d) return ''
  const now = new Date()
  const diff = d - now
  if (Math.abs(diff) < 86400000) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function ResultBadge({ result }) {
  if (!result) return null
  const map = { W: ['#10b981', '#052e16'], L: ['#ef4444', '#1c0909'], D: ['#6b7280', '#111827'] }
  const [color, bg] = map[result] || ['#6b7280', '#111827']
  return (
    <span style={{ fontSize: 11, fontWeight: 900, padding: '2px 8px', borderRadius: 6, background: bg, color, border: `1px solid ${color}40`, letterSpacing: '0.06em' }}>
      {result}
    </span>
  )
}

function TeamCard({ team, data }) {
  const { recent, next } = data || {}
  return (
    <div style={{
      borderRadius: 20, overflow: 'hidden',
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px 10px', background: `linear-gradient(135deg, ${team.color}18, ${team.accent}08)`, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <img src={team.logo} alt={team.name} style={{ width: 40, height: 40, objectFit: 'contain' }} onError={e => { e.target.style.display = 'none' }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>{team.fullName}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{team.emoji} {team.league.toUpperCase()}</div>
        </div>
      </div>

      {next ? (
        <div style={{ padding: '12px 16px', borderBottom: recent?.length ? '1px solid var(--border)' : 'none' }}>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Prochain match · {fmtDate(next.date)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {next.inProgress ? (
              <div style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#00ff8818', color: 'var(--neon)', border: '1px solid var(--neon)' }}>
                EN DIRECT
              </div>
            ) : (
              <ResultBadge result={null} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {next.homeLogo && (
                  <img src={next.homeLogo} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
                )}
                <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                  {next.isHome ? 'vs' : '@'} {next.opponent}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                {next.status}
              </div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              {next.myScore !== undefined ? next.myScore : '—'} - {next.oppScore !== undefined ? next.oppScore : '—'}
            </div>
          </div>
        </div>
      ) : null}

      {recent?.length ? (
        <div style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            {next ? 'Derniers matchs' : 'Matchs récents'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recent.map((match, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ResultBadge result={match.result} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {match.opponentLogo && (
                      <img src={match.opponentLogo} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
                    )}
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                      {match.isHome ? 'vs' : '@'} {match.opponent}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {match.statusDetail}
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: match.result === 'W' ? '#10b981' : match.result === 'L' ? '#ef4444' : 'var(--text-primary)' }}>
                  {match.myScore} - {match.oppScore}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function NbaStandings({ standings }) {
  return (
    <div style={{
      borderRadius: 20, overflow: 'hidden',
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid var(--border)',
    }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>Classement NBA</div>
      </div>
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {standings.map((team, i) => (
          <div key={i} style={{
            padding: '12px 16px',
            borderBottom: i < standings.length - 1 ? '1px solid var(--border)' : 'none',
            backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', minWidth: 24 }}>{i + 1}</div>
              <img src={team.team.logo} alt={team.team.shortDisplayName} style={{ width: 32, height: 32, objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{team.team.shortDisplayName}</span>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{team.stats[0]?.value || '0'} - {team.stats[1]?.value || '0'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NbaScoreboard({ games }) {
  const now = new Date()
  const todayGames = games.filter(g => {
    const gameDate = new Date(g.date)
    return gameDate.toDateString() === now.toDateString()
  })

  if (!todayGames.length) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Aucun match aujourd'hui</div>
      </div>
    )
  }

  return (
    <div style={{
      borderRadius: 20, overflow: 'hidden',
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid var(--border)',
    }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>Scores du jour</div>
      </div>
      <div style={{ maxHeight: 500, overflowY: 'auto' }}>
        {todayGames.map((game,
import { useState, useEffect, useCallback } from 'react'
import { Loader2, RefreshCw, ExternalLink, Trophy, ChevronRight, Zap } from 'lucide-react'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { PullIndicator } from '../components/Skeleton'

// ─── Tabs ────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'all',    label: 'Tout',   emoji: '🏆', color: '#6366f1' },
  { id: 'soccer', label: 'Ligue 1',emoji: '⚽', color: '#10b981', sport: 'soccer',     league: 'fra.1' },
  { id: 'ucl',    label: 'UCL',    emoji: '⭐', color: '#1e40af', sport: 'soccer',     league: 'uefa.champions' },
  { id: 'nfl',    label: 'NFL',    emoji: '🏈', color: '#f97316', sport: 'football',   league: 'nfl' },
  { id: 'ncaa',   label: 'NCAA',   emoji: '🎓', color: '#ef4444', sport: 'football',   league: 'college-football' },
  { id: 'nba',    label: 'NBA',    emoji: '🏀', color: '#f59e0b', sport: 'basketball', league: 'nba' },
  { id: 'tennis', label: 'Tennis', emoji: '🎾', color: '#84cc16', sport: 'tennis',     league: 'atp' },
  { id: 'mma',    label: 'MMA',    emoji: '🥊', color: '#8b5cf6', sport: 'mma',        league: 'ufc' },
]

// ─── My Teams ────────────────────────────────────────────────────────────────
const MY_TEAMS = [
  // PSG — Ligue 1
  { id: '160', sport: 'soccer',     league: 'fra.1',            name: 'PSG',      fullName: 'Paris Saint-Germain', color: '#004170', accent: '#DA291C', emoji: '⚽',
    logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/160.png&h=80&w=80', tags: ['soccer', 'ucl'] },
  // PSG — Champions League (même équipe, ligue différente)
  { id: '160', sport: 'soccer',     league: 'uefa.champions',   name: 'PSG UCL',  fullName: 'PSG — Ligue des Champions', color: '#1e3a8a', accent: '#fbbf24', emoji: '⭐',
    logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/160.png&h=80&w=80', tags: ['ucl'] },
  { id: '7',   sport: 'football',   league: 'nfl',              name: 'Broncos',  fullName: 'Denver Broncos',      color: '#FB4F14', accent: '#002244', emoji: '🏈',
    tags: ['nfl'], logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/den.png&h=80&w=80' },
  { id: '201', sport: 'football',   league: 'college-football', name: 'Oklahoma', fullName: 'Oklahoma Sooners',    color: '#841617', accent: '#FDF9D8', emoji: '🎓',
    tags: ['ncaa'], logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500/201.png&h=80&w=80' },
  { id: '14',  sport: 'basketball', league: 'nba',              name: 'Heat',     fullName: 'Miami Heat',          color: '#98002E', accent: '#F9A01B', emoji: '🏀',
    tags: ['nba'], logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/mia.png&h=80&w=80' },
]

// ─── ESPN fetch with proxy fallback ──────────────────────────────────────────
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

// ─── Parse team schedule ──────────────────────────────────────────────────────
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

  const recent = completed[completed.length - 1] || null
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

  return { recent: parseComp(recent), next: parseComp(next) }
}

// ─── Fetch team data ──────────────────────────────────────────────────────────
async function fetchTeam(team) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${team.sport}/${team.league}/teams/${team.id}/schedule`
  const json = await espn(url)
  return parseSchedule(json, team.id)
}

// ─── Fetch sport news ─────────────────────────────────────────────────────────
async function fetchNews(sport, league, limit = 8) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/news?limit=${limit}`
  const json = await espn(url)
  return (json?.articles || []).map(a => ({
    headline: a.headline,
    description: a.description,
    url: a.links?.web?.href || a.links?.mobile?.href,
    published: a.published,
    image: a.images?.[0]?.url,
    byline: a.byline,
  })).filter(a => a.headline && a.url)
}

// ─── Fetch scoreboard ─────────────────────────────────────────────────────────
async function fetchScoreboard(sport, league) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`
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

// ─── Time formatting ──────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return ''
  const now = new Date()
  const diff = d - now
  if (Math.abs(diff) < 86400000) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
function timeAgo(d) {
  if (!d) return ''
  const m = Math.floor((Date.now() - new Date(d)) / 60000)
  if (m < 60) return `${m}m`
  if (m < 1440) return `${Math.floor(m / 60)}h`
  return `${Math.floor(m / 1440)}j`
}

// ─── Result badge ─────────────────────────────────────────────────────────────
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

// ─── Team Card ────────────────────────────────────────────────────────────────
function TeamCard({ team, data }) {
  const { recent, next } = data || {}
  return (
    <div style={{
      borderRadius: 20, overflow: 'hidden',
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.07)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px 10px', background: `linear-gradient(135deg, ${team.color}18, ${team.accent}08)`, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <img src={team.logo} alt={team.name} style={{ width: 40, height: 40, objectFit: 'contain' }} onError={e => { e.target.style.display = 'none' }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>{team.fullName}</div>
          <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{team.emoji} {team.league.toUpperCase()}</div>
        </div>
      </div>

      {/* Recent result */}
      {recent ? (
        <div style={{ padding: '12px 16px', borderBottom: next ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
          <div style={{ fontSize: 10, color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Dernier match · {fmtDate(recent.date)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ResultBadge result={recent.result} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {recent.opponentLogo && (
                  <img src={recent.opponentLogo} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
                )}
                <span style={{ fontSize: 14, color: '#d1d5db' }}>
                  {recent.isHome ? 'vs' : '@'} {recent.opponent}
                </span>
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'white', fontVariantNumeric: 'tabular-nums' }}>
              {recent.myScore}
              <span style={{ fontSize: 16, color: '#4b5563', margin: '0 4px' }}>-</span>
              {recent.oppScore}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '12px 16px', borderBottom: next ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
          <div style={{ fontSize: 13, color: '#4b5563' }}>Aucun résultat récent</div>
        </div>
      )}

      {/* Next match */}
      {next && (
        <div style={{ padding: '10px 16px' }}>
          <div style={{ fontSize: 10, color: '#4b5563', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            Prochain match
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {next.opponentLogo && (
              <img src={next.opponentLogo} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
            )}
            <span style={{ fontSize: 13, color: '#9ca3af', flex: 1 }}>
              {next.isHome ? 'vs' : '@'} {next.opponent}
            </span>
            <span style={{ fontSize: 12, color: '#6366f1', fontWeight: 700 }}>{fmtDate(next.date)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Score Card ───────────────────────────────────────────────────────────────
function ScoreCard({ game }) {
  const { homeTeam, homeLogo, homeScore, homeWinner, awayTeam, awayLogo, awayScore, awayWinner, status, completed, inProgress, clock, period } = game
  return (
    <div style={{
      padding: '12px 16px', borderRadius: 18,
      background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
          background: inProgress ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)',
          color: inProgress ? '#ef4444' : '#6b7280',
          border: inProgress ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {inProgress && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />}
          {inProgress ? `${clock || ''} P${period || ''}` : status}
        </span>
      </div>
      {/* Teams + Scores */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 14, fontWeight: awayWinner ? 800 : 500, color: awayWinner ? 'white' : '#9ca3af', textAlign: 'right' }}>{awayTeam}</span>
          {awayLogo && <img src={awayLogo} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: awayWinner ? 'white' : '#6b7280', fontVariantNumeric: 'tabular-nums', minWidth: 24, textAlign: 'right' }}>
            {awayScore ?? '—'}
          </span>
          <span style={{ fontSize: 14, color: '#374151' }}>-</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: homeWinner ? 'white' : '#6b7280', fontVariantNumeric: 'tabular-nums', minWidth: 24 }}>
            {homeScore ?? '—'}
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          {homeLogo && <img src={homeLogo} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />}
          <span style={{ fontSize: 14, fontWeight: homeWinner ? 800 : 500, color: homeWinner ? 'white' : '#9ca3af' }}>{homeTeam}</span>
        </div>
      </div>
    </div>
  )
}

// ─── News Card ────────────────────────────────────────────────────────────────
function NewsItem({ article, color }) {
  if (!article.url) return null
  return (
    <a href={article.url} target="_blank" rel="noreferrer" style={{ display: 'flex', gap: 12, padding: '12px 0', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      {article.image && (
        <img src={article.image} alt="" style={{ width: 72, height: 54, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.45, margin: '0 0 4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {article.headline}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {article.byline && <span style={{ fontSize: 11, color: '#4b5563' }}>{article.byline}</span>}
          <span style={{ fontSize: 11, color: '#374151' }}>· {timeAgo(article.published)}</span>
          <ExternalLink size={10} color="#374151" style={{ marginLeft: 'auto' }} />
        </div>
      </div>
    </a>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Sports() {
  const [tab, setTab] = useState('all')
  const [teamData, setTeamData] = useState({})
  const [news, setNews] = useState({})
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [newsLoading, setNewsLoading] = useState(false)

  const activeTab = TABS.find(t => t.id === tab)

  // Fetch team results once
  useEffect(() => {
    Promise.all(MY_TEAMS.map(async t => {
      const data = await fetchTeam(t)
      return [`${t.id}-${t.league}`, data]
    })).then(results => {
      const map = {}
      results.forEach(([key, data]) => { map[key] = data })
      setTeamData(map)
      setLoading(false)
    })
  }, [])

  // Fetch news + scores when tab changes
  useEffect(() => {
    setNewsLoading(true)
    setScores([])

    const jobs = tab === 'all'
      ? TABS.filter(t => t.sport).map(t => fetchNews(t.sport, t.league, 3))
      : [fetchNews(activeTab?.sport, activeTab?.league, 10)]

    Promise.all([
      Promise.all(jobs),
      activeTab?.sport && tab !== 'all' ? fetchScoreboard(activeTab.sport, activeTab.league) : Promise.resolve([]),
    ]).then(([newsArrays, scoreData]) => {
      const combined = newsArrays.flat().sort((a, b) => new Date(b.published) - new Date(a.published))
      const dedup = [...new Map(combined.map(a => [a.headline?.slice(0, 60), a])).values()]
      setNews(n => ({ ...n, [tab]: dedup }))
      if (scoreData?.length) setScores(scoreData.slice(0, 15))
      setNewsLoading(false)
    })
  }, [tab])

  const refresh = useCallback(async () => {
    setLoading(true)
    setNewsLoading(true)
    const [teams, newsArrays, scoreData] = await Promise.all([
      Promise.all(MY_TEAMS.map(async t => [`${t.id}-${t.league}`, await fetchTeam(t)])),
      tab === 'all'
        ? Promise.all(TABS.filter(t => t.sport).map(t => fetchNews(t.sport, t.league, 3)))
        : [await fetchNews(activeTab?.sport, activeTab?.league, 10)],
      activeTab?.sport && tab !== 'all' ? fetchScoreboard(activeTab.sport, activeTab.league) : [],
    ])
    const tmap = {}; teams.forEach(([key, d]) => { tmap[key] = d })
    setTeamData(tmap)
    const combined = newsArrays.flat().sort((a, b) => new Date(b.published) - new Date(a.published))
    const dedup = [...new Map(combined.map(a => [a.headline?.slice(0, 60), a])).values()]
    setNews(n => ({ ...n, [tab]: dedup }))
    if (scoreData?.length) setScores(scoreData.slice(0, 15))
    setLoading(false)
    setNewsLoading(false)
  }, [tab])

  const ptr = usePullToRefresh(refresh)
  const tabNews = news[tab] || []
  const liveScores = scores.filter(s => s.inProgress)
  const recentScores = scores.filter(s => s.completed && !s.inProgress)

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 32 }}>
      <PullIndicator progress={ptr.progress} refreshing={ptr.refreshing} />

      {/* ── Header ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(7,7,15,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        paddingTop: 'max(52px, env(safe-area-inset-top, 0px))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Trophy size={20} color="#f59e0b" />
            <span style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>Sport</span>
            {liveScores.length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#ef4444' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px #ef4444' }} />
                {liveScores.length} live
              </span>
            )}
          </div>
          <button onClick={refresh} style={{ width: 34, height: 34, borderRadius: 11, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, padding: '0 16px 12px', overflowX: 'auto' }} className="no-scrollbar">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 14px', borderRadius: 13, whiteSpace: 'nowrap',
              background: tab === t.id ? `${t.color}18` : 'rgba(255,255,255,0.04)',
              border: tab === t.id ? `1px solid ${t.color}35` : '1px solid rgba(255,255,255,0.06)',
              color: tab === t.id ? t.color : '#6b7280',
              fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer',
              boxShadow: tab === t.id ? `0 0 10px ${t.color}18` : 'none',
            }}>
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── My Teams ── */}
        {(() => {
          const visible = MY_TEAMS.filter(t =>
            tab === 'all'
              ? !t.tags?.includes('ucl')   // All tab: skip duplicate UCL entry
              : t.tags?.includes(tab) || t.league === activeTab?.league
          )
          if (!visible.length) return null
          return (
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span className="section-label">🏆 Mes équipes</span>
              </div>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[...Array(visible.length || 2)].map((_, i) => <div key={i} style={{ height: 110, borderRadius: 20 }} className="skeleton" />)}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {visible.map((team, i) => (
                    <div key={`${team.id}-${team.league}`} className="stagger-item" style={{ '--i': i }}>
                      <TeamCard team={team} data={teamData[`${team.id}-${team.league}`] || teamData[team.id]} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })()}

        {/* ── Live Scores ── */}
        {liveScores.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <Zap size={12} color="#ef4444" fill="#ef4444" />
              <span className="section-label" style={{ color: '#ef4444' }}>En direct</span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px #ef4444' }} className="live-ping" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {liveScores.map((g, i) => (
                <div key={i} className="stagger-item"><ScoreCard game={g} /></div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recent Scores ── */}
        {recentScores.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <span className="section-label" style={{ display: 'block', marginBottom: 10 }}>Résultats récents</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentScores.slice(0, 8).map((g, i) => (
                <div key={i} className="stagger-item"><ScoreCard game={g} /></div>
              ))}
            </div>
          </div>
        )}

        {/* ── News ── */}
        <div>
          <span className="section-label" style={{ display: 'block', marginBottom: 10 }}>
            Actualités {activeTab?.emoji || '🏆'}
          </span>
          {newsLoading && tabNews.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 72, height: 54, borderRadius: 10, background: 'rgba(255,255,255,0.04)' }} className="skeleton" />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.04)', marginBottom: 8 }} className="skeleton" />
                    <div style={{ height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.04)', width: '70%' }} className="skeleton" />
                  </div>
                </div>
              ))}
            </div>
          ) : tabNews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#4b5563', fontSize: 14 }}>
              Aucune actualité disponible pour le moment
            </div>
          ) : (
            <div>
              {tabNews.map((a, i) => <NewsItem key={i} article={a} color={activeTab?.color || '#6366f1'} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

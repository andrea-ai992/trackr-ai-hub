/git write api/psg-stats.js "feat: add PSG live stats API with 5min cache"

Here is the complete file content:

import fetch from 'node-fetch';

const PSG_TEAM_ID = 524;
const LIGUE1_COMPETITION_ID = 'FL1';
const API_BASE = 'https://api.football-data.org/v4';
const API_KEY = process.env.FOOTBALL_DATA_API_KEY;

const cache = {
  data: null,
  timestamp: 0,
};
const CACHE_TTL = 5 * 60 * 1000;

async function fetchFromAPI(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'X-Auth-Token': API_KEY,
    },
  });
  if (!res.ok) {
    throw new Error(`football-data.org error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const now = Date.now();
  if (cache.data && now - cache.timestamp < CACHE_TTL) {
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cache.data);
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'FOOTBALL_DATA_API_KEY not configured' });
  }

  try {
    const [standingsData, matchesData, scorersData] = await Promise.all([
      fetchFromAPI(`/competitions/${LIGUE1_COMPETITION_ID}/standings`),
      fetchFromAPI(`/teams/${PSG_TEAM_ID}/matches?status=FINISHED&limit=5`),
      fetchFromAPI(`/competitions/${LIGUE1_COMPETITION_ID}/scorers?limit=10`),
    ]);

    const standingsTable = standingsData?.standings?.find(
      (s) => s.type === 'TOTAL'
    )?.table || [];

    const psgStanding = standingsTable.find((entry) => entry.team.id === PSG_TEAM_ID) || null;

    const formattedStandings = standingsTable.slice(0, 10).map((entry) => ({
      position: entry.position,
      team: entry.team.name,
      teamId: entry.team.id,
      crest: entry.team.crest,
      playedGames: entry.playedGames,
      won: entry.won,
      draw: entry.draw,
      lost: entry.lost,
      points: entry.points,
      goalsFor: entry.goalsFor,
      goalsAgainst: entry.goalsAgainst,
      goalDifference: entry.goalDifference,
      isPSG: entry.team.id === PSG_TEAM_ID,
    }));

    const recentMatches = (matchesData?.matches || [])
      .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate))
      .slice(0, 5)
      .map((match) => {
        const isPSGHome = match.homeTeam.id === PSG_TEAM_ID;
        const psgScore = isPSGHome
          ? match.score?.fullTime?.home
          : match.score?.fullTime?.away;
        const opponentScore = isPSGHome
          ? match.score?.fullTime?.away
          : match.score?.fullTime?.home;
        const opponent = isPSGHome ? match.awayTeam : match.homeTeam;

        let result = 'N/A';
        if (psgScore !== null && opponentScore !== null) {
          if (psgScore > opponentScore) result = 'W';
          else if (psgScore < opponentScore) result = 'L';
          else result = 'D';
        }

        return {
          matchId: match.id,
          date: match.utcDate,
          competition: match.competition?.name || 'Ligue 1',
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          opponent: opponent.name,
          opponentCrest: opponent.crest,
          isHome: isPSGHome,
          psgScore,
          opponentScore,
          scoreDisplay: `${psgScore ?? '?'} - ${opponentScore ?? '?'}`,
          result,
          matchday: match.matchday,
          venue: match.venue || null,
        };
      });

    const topScorers = (scorersData?.scorers || []).slice(0, 10).map((entry) => ({
      playerId: entry.player.id,
      playerName: entry.player.name,
      nationality: entry.player.nationality,
      teamId: entry.team.id,
      teamName: entry.team.name,
      teamCrest: entry.team.crest,
      goals: entry.goals,
      assists: entry.assists ?? null,
      penalties: entry.penalties ?? null,
      playedMatches: entry.playedMatches,
      isPSGPlayer: entry.team.id === PSG_TEAM_ID,
    }));

    const psgScorers = topScorers.filter((s) => s.isPSGPlayer);

    const responseData = {
      updatedAt: new Date().toISOString(),
      psg: {
        teamId: PSG_TEAM_ID,
        name: 'Paris Saint-Germain FC',
        standing: psgStanding
          ? {
              position: psgStanding.position,
              playedGames: psgStanding.playedGames,
              won: psgStanding.won,
              draw: psgStanding.draw,
              lost: psgStanding.lost,
              points: psgStanding.points,
              goalsFor: psgStanding.goalsFor,
              goalsAgainst: psgStanding.goalsAgainst,
              goalDifference: psgStanding.goalDifference,
              form: psgStanding.form || null,
            }
          : null,
        recentMatches,
        scorers: psgScorers,
      },
      ligue1: {
        season: standingsData?.season?.startDate
          ? `${new Date(standingsData.season.startDate).getFullYear()}/${new Date(standingsData.season.endDate).getFullYear()}`
          : null,
        currentMatchday: standingsData?.season?.currentMatchday || null,
        standings: formattedStandings,
        topScorers,
      },
    };

    cache.data = responseData;
    cache.timestamp = now;

    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(responseData);
  } catch (err) {
    console.error('[psg-stats] Error:', err.message);
    if (cache.data) {
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
      res.setHeader('X-Cache', 'STALE');
      return res.status(200).json({ ...cache.data, stale: true, error: err.message });
    }
    return res.status(500).json({ error: 'Failed to fetch PSG stats', details: err.message });
  }
}
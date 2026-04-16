src/pages/Sports.jsx
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LiveScoreCard from "../components/sports/LiveScoreCard";
import StatsPanel from "../components/sports/StatsPanel";
import styles from "../styles/sports.module.css";

const INITIAL_MATCHES = [
  {
    id: 1,
    homeTeam: "Lakers",
    awayTeam: "Warriors",
    homeScore: 87,
    awayScore: 92,
    sport: "NBA",
    quarter: "Q3",
    time: "4:32",
    status: "LIVE",
    homeLogo: "🏀",
    awayLogo: "🏀",
  },
  {
    id: 2,
    homeTeam: "Chiefs",
    awayTeam: "Eagles",
    homeScore: 21,
    awayScore: 17,
    sport: "NFL",
    quarter: "Q2",
    time: "8:15",
    status: "LIVE",
    homeLogo: "🏈",
    awayLogo: "🏈",
  },
  {
    id: 3,
    homeTeam: "Yankees",
    awayTeam: "Red Sox",
    homeScore: 4,
    awayScore: 6,
    sport: "MLB",
    quarter: "7th",
    time: "BOT",
    status: "LIVE",
    homeLogo: "⚾",
    awayLogo: "⚾",
  },
  {
    id: 4,
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    homeScore: 2,
    awayScore: 2,
    sport: "UEFA",
    quarter: "2nd",
    time: "67'",
    status: "LIVE",
    homeLogo: "⚽",
    awayLogo: "⚽",
  },
  {
    id: 5,
    homeTeam: "Celtics",
    awayTeam: "Heat",
    homeScore: 110,
    awayScore: 108,
    sport: "NBA",
    quarter: "FINAL",
    time: "—",
    status: "FINAL",
    homeLogo: "🏀",
    awayLogo: "🏀",
  },
  {
    id: 6,
    homeTeam: "Rams",
    awayTeam: "49ers",
    homeScore: 0,
    awayScore: 0,
    sport: "NFL",
    quarter: "PRE",
    time: "8:30PM",
    status: "UPCOMING",
    homeLogo: "🏈",
    awayLogo: "🏈",
  },
];

const STANDINGS = [
  { rank: 1, team: "Boston Celtics", w: 48, l: 12, pct: ".800", gb: "—", streak: "W5", logo: "🏀" },
  { rank: 2, team: "Milwaukee Bucks", w: 42, l: 18, pct: ".700", gb: "6.0", streak: "L1", logo: "🏀" },
  { rank: 3, team: "Philadelphia 76ers", w: 40, l: 20, pct: ".667", gb: "8.0", streak: "W2", logo: "🏀" },
  { rank: 4, team: "New York Knicks", w: 38, l: 22, pct: ".633", gb: "10.0", streak: "W3", logo: "🏀" },
  { rank: 5, team: "Cleveland Cavaliers", w: 36, l: 24, pct: ".600", gb: "12.0", streak: "W1", logo: "🏀" },
  { rank: 6, team: "Indiana Pacers", w: 34, l: 26, pct: ".567", gb: "14.0", streak: "L2", logo: "🏀" },
  { rank: 7, team: "Miami Heat", w: 32, l: 28, pct: ".533", gb: "16.0", streak: "W1", logo: "🏀" },
  { rank: 8, team: "Orlando Magic", w: 30, l: 30, pct: ".500", gb: "18.0", streak: "L1", logo: "🏀" },
];

const PLAYERS = [
  {
    id: 1,
    name: "LeBron James",
    team: "Lakers",
    position: "SF",
    pts: 28.4,
    reb: 8.1,
    ast: 7.9,
    fg: "52.1%",
    img: "👑",
    highlights: ["4x Champion", "4x MVP", "All-Time Scoring Leader"],
    season: "2023-24",
  },
  {
    id: 2,
    name: "Stephen Curry",
    team: "Warriors",
    position: "PG",
    pts: 31.2,
    reb: 4.5,
    ast: 6.3,
    fg: "49.8%",
    img: "🎯",
    highlights: ["4x Champion", "2x MVP", "3PT Record Holder"],
    season: "2023-24",
  },
  {
    id: 3,
    name: "Giannis Antetokounmpo",
    team: "Bucks",
    position: "PF",
    pts: 32.1,
    reb: 11.8,
    ast: 5.4,
    fg: "61.3%",
    img: "🦌",
    highlights: ["1x Champion", "2x MVP", "DPOY"],
    season: "2023-24",
  },
  {
    id: 4,
    name: "Nikola Jokić",
    team: "Nuggets",
    position: "C",
    pts: 26.4,
    reb: 12.4,
    ast: 9.1,
    fg: "58.7%",
    img: "🃏",
    highlights: ["1x Champion", "3x MVP", "Historic Passer"],
    season: "2023-24",
  },
];

const SPORT_FILTERS = ["ALL", "NBA", "NFL", "MLB", "UEFA"];

export default function Sports() {
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("scores");
  const [standings] = useState(STANDINGS);
  const [players] = useState(PLAYERS);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const updateScores = useCallback(() => {
    setMatches((prev) =>
      prev.map((match) => {
        if (match.status !== "LIVE") return match;
        const homeChange = Math.random() < 0.3 ? (Math.random() < 0.5 ? 1 : 2) : 0;
        const awayChange = Math.random() < 0.3 ? (Math.random() < 0.5 ? 1 : 2) : 0;
        return {
          ...match,
          homeScore: match.homeScore + homeChange,
          awayScore: match.awayScore + awayChange,
        };
      })
    );
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    const interval = setInterval(updateScores, 4000);
    return () => clearInterval(interval);
  }, [updateScores]);

  useEffect(() => {
    const tickerInterval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % INITIAL_MATCHES.length);
    }, 3000);
    return () => clearInterval(tickerInterval);
  }, []);

  const filteredMatches =
    activeFilter === "ALL"
      ? matches
      : matches.filter((m) => m.sport === activeFilter);

  const liveCount = matches.filter((m) => m.status === "LIVE").length;

  const tickerItems = matches.filter((m) => m.status === "LIVE");

  return (
    <div className={styles.sportsContainer}>
      <div className={styles.stadiumBg} />

      <header className={styles.sportsHeader}>
        <div className={styles.headerTop}>
          <motion.div
            className={styles.logoArea}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className={styles.logoIcon}>🏟️</span>
            <div>
              <h1 className={styles.mainTitle}>TRACKR SPORTS</h1>
              <p className={styles.subTitle}>Live • Scores • Stats • Standings</p>
            </div>
          </motion.div>

          <motion.div
            className={styles.liveIndicator}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className={styles.liveDot}
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
            <span className={styles.liveText}>{liveCount} LIVE</span>
            <span className={styles.updateTime}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          </motion.div>
        </div>

        <div className={styles.scoreTicker}>
          <span className={styles.tickerLabel}>LIVE ▶</span>
          <div className={styles.tickerTrack}>
            <AnimatePresence mode="wait">
              <motion.div
                key={tickerIndex}
                className={styles.tickerItem}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                {tickerItems[tickerIndex % tickerItems.length] && (
                  <>
                    <span className={styles.tickerSport}>
                      {tickerItems[tickerIndex % tickerItems.length].sport}
                    </span>
                    <span className={styles.tickerScore}>
                      {tickerItems[tickerIndex % tickerItems.length].homeTeam}{" "}
                      <strong>
                        {tickerItems[tickerIndex % tickerItems.length].homeScore}
                      </strong>{" "}
                      –{" "}
                      <strong>
                        {tickerItems[tickerIndex % tickerItems.length].awayScore}
                      </strong>{" "}
                      {tickerItems[tickerIndex % tickerItems.length].awayTeam}
                    </span>
                    <span className={styles.tickerTime}>
                      {tickerItems[tickerIndex % tickerItems.length].time}
                    </span>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </header>

      <nav className={styles.tabNav}>
        {["scores", "standings", "players"].map((tab) => (
          <motion.button
            key={tab}
            className={`${styles.tabBtn} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab)}
            whileTap={{ scale: 0.96 }}
          >
            {tab === "scores" && "⚡ Scores"}
            {tab === "standings" && "🏆 Standings"}
            {tab === "players" && "👤 Players"}
          </motion.button>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        {activeTab === "scores" && (
          <motion.section
            key="scores"
            className={styles.scoresSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            <div className={styles.filterRow}>
              {SPORT_FILTERS.map((f) => (
                <motion.button
                  key={f}
                  className={`${styles.filterBtn} ${activeFilter === f ? styles.filterActive : ""}`}
                  onClick={() => setActiveFilter(f)}
                  whileTap={{ scale: 0.94 }}
                >
                  {f}
                </motion.button>
              ))}
            </div>

            <div className={styles.scoresGrid}>
              <AnimatePresence>
                {filteredMatches.map((match, i) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.06, duration: 0.35 }}
                  >
                    <LiveScoreCard match={match} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        )}

        {activeTab === "standings" && (
          <motion.section
            key="standings"
            className={styles.standingsSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            <div className={styles.standingsHeader}>
              <span className={styles.standingsTitle}>🏆 NBA Eastern Conference</span>
              <span className={styles.standingsSeason}>2023–24</span>
            </div>

            <div className={styles.standingsTableWrapper}>
              <table className={styles.standingsTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Team</th>
                    <th>W</th>
                    <th>L</th>
                    <th>PCT</th>
                    <th>GB</th>
                    <th>STK</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, i) => (
                    <motion.tr
                      key={row.rank}
                      className={`${styles.standingsRow} ${row.rank <= 6 ? styles.playoffRow : styles.playinRow}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ backgroundColor: "rgba(212, 175, 55, 0.08)" }}
                    >
                      <td className={styles.rankCell}>
                        {row.rank <= 3 ? (
                          <span className={styles.medalRank}>
                            {row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : "🥉"}
                          </span>
                        ) : (
                          <span className={styles.numRank}>{row.rank}</span>
                        )}
                      </td>
                      <td className={styles.teamCell}>
                        <span className={styles.teamLogo}>{row.logo}</span>
                        <span className={styles.teamName}>{row.team}</span>
                      </td>
                      <td className={styles.wCell}>{row.w}</td>
                      <td className={styles.lCell}>{row.l}</td>
                      <td>{row.pct}</td>
                      <td>{row.gb}</td>
                      <td>
                        <span
                          className={`${styles.streakBadge} ${
                            row.streak.startsWith("W") ? styles.streakW : styles.streakL
                          }`}
                        >
                          {row.streak}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.standingsLegend}>
              <span className={styles.legendPlayoff}>■ Playoff</span>
              <span className={styles.legendPlayin}>■ Play-In</span>
            </div>
          </motion.section>
        )}

        {activeTab === "players" && (
          <motion.section
            key="players"
            className={styles.playersSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            <div className={styles.playersGrid}>
              {players.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <StatsPanel player={player} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <footer className={styles.sportsFooter}>
        <p>Data simulated for demo purposes · Trackr Sports Hub · {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

---

src/components/sports/LiveScoreCard.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../../styles/sports.module.css";

const STATUS_CONFIG = {
  LIVE: { color: "#ff3b30", label: "LIVE", pulse: true },
  FINAL: { color: "#d4af37", label: "FINAL", pulse: false },
  UPCOMING: { color: "#8a8a8a", label: "UPCOMING", pulse: false },
};

export default function LiveScoreCard({ match }) {
  const [prevHome, setPrevHome] = useState(match.homeScore);
  const [prevAway, setPrevAway] = useState(match.awayScore);
  const [homeFlash, setHomeFlash] = useState(false);
  const [awayFlash, setAwayFlash] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (match.homeScore !== prevHome) {
      setHomeFlash(true);
      setPrevHome(match.homeScore);
      setTimeout(() => setHomeFlash(false), 800);
    }
    if (match.away
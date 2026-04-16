src/components/sports/LiveScoreCard.jsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../../styles/sports.module.css";

const LiveScoreCard = ({ match, index }) => {
  const [score, setScore] = useState(match.score);
  const [isPulsing, setIsPulsing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [minute, setMinute] = useState(match.minute || 0);

  useEffect(() => {
    if (match.status !== "LIVE") return;

    const scoreInterval = setInterval(() => {
      const random = Math.random();
      if (random < 0.08) {
        const team = Math.random() < 0.5 ? "home" : "away";
        setScore((prev) => {
          const newScore = {
            ...prev,
            [team]: prev[team] + 1,
          };
          setLastUpdate(team);
          setIsPulsing(true);
          setTimeout(() => setIsPulsing(false), 2000);
          return newScore;
        });
      }
    }, 3000);

    const minuteInterval = setInterval(() => {
      setMinute((prev) => {
        if (prev >= 90) return 90;
        return prev + 1;
      });
    }, 8000);

    return () => {
      clearInterval(scoreInterval);
      clearInterval(minuteInterval);
    };
  }, [match.status]);

  const getStatusColor = (status) => {
    switch (status) {
      case "LIVE":
        return "#ff4444";
      case "FT":
        return "#888";
      case "HT":
        return "#f59e0b";
      default:
        return "#c9a227";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "LIVE":
        return `${minute}'`;
      case "FT":
        return "FT";
      case "HT":
        return "HT";
      default:
        return status;
    }
  };

  return (
    <motion.div
      className={`${styles.scoreCard} ${isPulsing ? styles.scorePulse : ""}`}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 0 30px rgba(201, 162, 39, 0.3)",
        transition: { duration: 0.2 },
      }}
    >
      <div className={styles.scoreCardInner}>
        <div className={styles.leagueBadge}>
          <span className={styles.leagueIcon}>{match.leagueIcon}</span>
          <span className={styles.leagueName}>{match.league}</span>
          <motion.span
            className={styles.statusBadge}
            style={{ backgroundColor: getStatusColor(match.status) }}
            animate={
              match.status === "LIVE"
                ? {
                    opacity: [1, 0.5, 1],
                  }
                : {}
            }
            transition={
              match.status === "LIVE"
                ? {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
                : {}
            }
          >
            {match.status === "LIVE" && (
              <span className={styles.liveDot} />
            )}
            {getStatusLabel(match.status)}
          </motion.span>
        </div>

        <div className={styles.teamsRow}>
          <motion.div
            className={`${styles.teamBlock} ${
              lastUpdate === "home" ? styles.teamScored : ""
            }`}
            animate={
              lastUpdate === "home"
                ? { scale: [1, 1.05, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 0.4 }}
          >
            <div className={styles.teamLogo}>{match.homeLogo}</div>
            <span className={styles.teamName}>{match.homeTeam}</span>
          </motion.div>

          <div className={styles.scoreBlock}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${score.home}-${score.away}`}
                className={styles.scoreDisplay}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.span
                  className={`${styles.scoreNumber} ${
                    lastUpdate === "home" ? styles.scoreUpdated : ""
                  }`}
                >
                  {score.home}
                </motion.span>
                <span className={styles.scoreSeparator}>:</span>
                <motion.span
                  className={`${styles.scoreNumber} ${
                    lastUpdate === "away" ? styles.scoreUpdated : ""
                  }`}
                >
                  {score.away}
                </motion.span>
              </motion.div>
            </AnimatePresence>
            {match.status === "LIVE" && (
              <div className={styles.liveIndicator}>
                <motion.div
                  className={styles.liveRing}
                  animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            )}
          </div>

          <motion.div
            className={`${styles.teamBlock} ${styles.teamBlockRight} ${
              lastUpdate === "away" ? styles.teamScored : ""
            }`}
            animate={
              lastUpdate === "away"
                ? { scale: [1, 1.05, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 0.4 }}
          >
            <div className={styles.teamLogo}>{match.awayLogo}</div>
            <span className={styles.teamName}>{match.awayTeam}</span>
          </motion.div>
        </div>

        {match.scorers && match.scorers.length > 0 && (
          <motion.div
            className={styles.scorersRow}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ delay: 0.3 }}
          >
            {match.scorers.map((scorer, i) => (
              <span key={i} className={styles.scorerTag}>
                ⚽ {scorer.name} {scorer.minute}&apos;
              </span>
            ))}
          </motion.div>
        )}

        <div className={styles.cardFooter}>
          <span className={styles.venue}>{match.venue}</span>
          <div className={styles.cardActions}>
            <motion.button
              className={styles.actionBtn}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              📊 Stats
            </motion.button>
            <motion.button
              className={styles.actionBtn}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              🔔 Alert
            </motion.button>
          </div>
        </div>
      </div>

      {isPulsing && (
        <motion.div
          className={styles.goalFlash}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 1.5 }}
        />
      )}
    </motion.div>
  );
};

export default LiveScoreCard;
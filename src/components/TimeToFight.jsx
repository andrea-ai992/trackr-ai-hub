Code complet et production-ready

### 1️⃣ **src/services/mmaService.js** (COMPLET)

```javascript
// UFC/MMA Mock API Service
export const UFC_FIGHTERS = [
  {
    id: 1,
    name: 'Jon Jones',
    nickname: 'Bones',
    weightClass: 'Heavyweight',
    record: { wins: 27, losses: 1, draws: 0, nc: 1 },
    rank: 1,
    champion: true,
    country: 'USA',
    age: 36,
    height: "6'4\"",
    reach: '84.5"',
    stance: 'Orthodox',
    stats: {
      strikingAccuracy: 57,
      takedownAccuracy: 43,
      subAvg: 0.5,
      tdAvg: 1.55,
      slpm: 4.29,
      sapm: 2.17,
      strDef: 64,
      tdDef: 96,
    },
    image: 'https://dmxg5wxfqgde4.cloudfront.net/styles/athlete_bio_full_body/s3/2023-11/JONES_JON_L_BELT_03.png',
    flag: '🇺🇸',
    nextFight: '2025-04-12',
    gym: 'Jackson-Wink MMA',
    wins_by: { ko: 10, sub: 7, dec: 10 },
  },
  {
    id: 2,
    name: 'Islam Makhachev',
    nickname: "The Eagle's Protégé",
    weightClass: 'Lightweight',
    record: { wins: 26, losses: 1, draws: 0, nc: 0 },
    rank: 1,
    champion: true,
    country: 'Russia',
    age: 32,
    height: "5'10\"",
    reach: '70.5"',
    stance: 'Southpaw',
    stats: {
      strikingAccuracy: 58,
      takedownAccuracy: 48,
      subAvg: 1.5,
      tdAvg: 4.25,
      slpm: 4.01,
      sapm: 1.84,
      strDef: 72,
      tdDef: 74,
    },
    image: 'https://dmxg5wxfqgde4.cloudfront.net/styles/athlete_bio_full_body/s3/2023-10/MAKHACHEV_ISLAM_L_BELT_10-21.png',
    flag: '🇷🇺',
    nextFight: '2025-03-22',
    gym: 'AKA',
    wins_by: { ko: 4, sub: 11, dec: 11 },
  },
  {
    id: 3,
    name: 'Alex Pereira',
    nickname: 'Poatan',
    weightClass: 'Light Heavyweight',
    record: { wins: 10, losses: 2, draws: 0, nc: 0 },
    rank: 1,
    champion: true,
    country: 'Brazil',
    age: 36,
    height: "6'4\"",
    reach: '79"',
    stance: 'Orthodox',
    stats: {
      strikingAccuracy: 52,
      takedownAccuracy: 25,
      subAvg: 0.0,
      tdAvg: 0.24,
      slpm: 5.62,
      sapm: 3.49,
      strDef: 55,
      tdDef: 62,
    },
    image: 'https://dmxg5wxfqgde4.cloudfront.net/styles/athlete_bio_full_body/s3/2023-11/PEREIRA_ALEX_L_BELT_11.png',
    flag: '🇧🇷',
    nextFight: '2025-05-03',
    gym: 'Glory Kickboxing',
    wins_by: { ko: 7, sub: 0, dec: 3 },
  },
  {
    id: 4,
    name: 'Leon Edwards',
    nickname: 'Rocky',
    weightClass: 'Welterweight',
    record: { wins: 22, losses: 3, draws: 0, nc: 1 },
    rank: 1,
    champion: false,
    country: 'UK',
    age: 32,
    height: "6'0\"",
    reach: '74"',
    stance: 'Orthodox',
    stats: {
      strikingAccuracy: 51,
      takedownAccuracy: 36,
      subAvg: 0.1,
      tdAvg: 1.38,
      slpm: 3.57,
      sapm: 2.56,
      strDef: 61,
      tdDef: 69,
    },
    image: 'https://dmxg5wxfqgde4.cloudfront.net/styles/athlete_bio_full_body/s3/2023-07/EDWARDS_LEON_L_07-29.png',
    flag: '🇬🇧',
    nextFight: '2025-04-05',
    gym: 'Birmingham Pantheon',
    wins_by: { ko: 8, sub: 2, dec: 12 },
  },
  {
    id: 5,
    name: "Sean O'Malley",
    nickname: 'Sugar',
    weightClass: 'Bantamweight',
    record: { wins: 17, losses: 1, draws: 0, nc: 1 },
    rank: 2,
    champion: false,
    country: 'USA',
    age: 29,
    height: "5'11\"",
    reach: '72"',
    stance: 'Orthodox',
    stats: {
      strikingAccuracy: 60,
      takedownAccuracy: 22,
      subAvg: 0.3,
      tdAvg: 0.65,
      slpm: 6.87,
      sapm: 3.58,
      strDef: 57,
      tdDef: 81,
    },
    image: 'https://dmxg5wxfqgde4.cloudfront.net/styles/athlete_bio_full_body/s3/2023-08/OMALLEY_SEAN_L_08-19.png',
    flag: '🇺🇸',
    nextFight: '2025-03-29',
    gym: '316 MMA',
    wins_by: { ko: 12, sub: 1, dec: 4 },
  },
  {
    id: 6,
    name: 'Dricus Du Plessis',
    nickname: 'Stillknocks',
    weightClass: 'Middleweight',
    record: { wins: 21, losses: 2, draws: 0, nc: 0 },
    rank: 1,
    champion: true,
    country: 'South Africa',
    age: 30,
    height: "6'0\"",
    reach: '76"',
    stance: 'Orthodox',
    stats: {
      strikingAccuracy: 49,
      takedownAccuracy: 35,
      subAvg: 0.8,
      tdAvg: 1.22,
      slpm: 4.14,
      sapm: 2.98,
      strDef: 52,
      tdDef: 78,
    },
    image: 'https://dmxg5wxfqgde4.cloudfront.net/styles/athlete_bio_full_body/s3/2024-01/DU_PLESSIS_DRICUS_L_BELT.png',
    flag: '🇿🇦',
    nextFight: '2025-06-07',
    gym: 'EFC Africa',
    wins_by: { ko: 13, sub: 4, dec: 4 },
  },
  {
    id: 7,
    name: 'Valentina Shevchenko',
    nickname: 'Bullet',
    weightClass: "Women's Flyweight",
    record: { wins: 24, losses: 4, draws: 0, nc: 0 },
    rank: 1,
    champion: false,
    country: 'Kyrgyzstan',
    age: 36,
    height: "5'5\"",
    reach: '67"',
    stance: 'Orthodox',
    stats: {
      strikingAccuracy: 55,
      takedownAccuracy: 30,
      subAvg: 0.9,
      tdAvg: 1.6,
      slpm: 4.3,
      sapm: 2.2,
      strDef: 65,
      tdDef: 82,
    },
    image: 'https://dmxg5wxfqgde4.cloudfront.net/styles/athlete_bio_full_body/s3/2023-09/SHEVCHENKO_VALENTINA_L_09-16.png',
    flag: '🇰🇬',
    nextFight: '2025-04-19',
    gym: 'Tiger Muay Thai',
    wins_by: { ko: 7, sub: 6, dec: 11 },
  },
  {
    id: 8,
    name: 'Paddy Pimblett',
    nickname: 'The Baddy',
    weightClass: 'Lightweight',
    record: { wins: 22, losses: 3, draws: 0, nc: 0 },
    rank: 5,
    champion: false,
    country: 'UK',
    age: 29,
    height: "5'10\"",
    reach: '73"',
    stance: 'Orthodox',
    stats: {
      strikingAccuracy: 48,
      takedownAccuracy: 38,
      subAvg: 1.2,
      tdAvg: 2.1,
      slpm: 4.89,
      sapm: 4.12,
      strDef: 44,
      tdDef: 58,
    },
    image: 'https://dmxg5wxfqgde4.cloudfront.net/styles/athlete_bio_full_body/s3/2024-03/PIMBLETT_PADDY_L_03-16.png',
    flag: '🇬🇧',
    nextFight: '2025-05-10',
    gym: 'Straightblast Gym Dublin',
    wins_by: { ko: 8, sub: 10, dec: 4 },
  },
];

export const getChampions = () => UFC_FIGHTERS.filter(f => f.champion);
export const getFightersByRank = () => UFC_FIGHTERS.sort((a, b) => a.rank - b.rank);
export const getFighterById = (id) => UFC_FIGHTERS.find(f => f.id === id);
```

---

### 2️⃣ **src/components/FighterCard.jsx** (NOUVEAU)

```javascript
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Trophy, Zap } from 'lucide-react';

const FighterCard = ({ fighter, index }) => {
  const cardVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.9,
      rotateY: -20,
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      boxShadow: '0 0 30px rgba(230, 57, 70, 0.8)',
      transition: { duration: 0.3 },
    },
  };

  const imageVariants = {
    initial: { scale: 1.1 },
    animate: { scale: 1 },
    hover: { scale: 1.15 },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="h-full"
      style={{ perspective: 1000 }}
    >
      <div className="bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-lg overflow-hidden border-2 border-[#333] hover:border-[#e63946] shadow-xl h-full flex flex-col">
        {/* HEADER BADGE */}
        <div className="relative h-40 bg-black overflow-hidden">
          <motion.img
            variants={imageVariants}
            initial="initial"
            whileHover="hover"
            src={fighter.image}
            alt={fighter.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.src =
                'https://via.placeholder.com/300x400?text=Fighter';
            }}
          />

          {/* CHAMPION BADGE */}
          {fighter.champion && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 bg-gradient-to-r from-[#e63946] to-[#a4161a] px-3 py-1 rounded-full flex items-center gap-1"
            >
              <Trophy size={14} className="text-white" />
              <span className="text-xs font-bold text-white">CHAMP</span>
            </motion.div>
          )}

          {/* RANK BADGE */}
          <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-sm font-bold text-[#e63946]">
            #{fighter.rank}
          </div>
        </div>

        {/* FIGHTER INFO */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          {/* NAME & NICKNAME */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-black text-white leading-tight">
                  {fighter.name}
                </h3>
                <p className="text-sm text-[#e63946] font-semibold italic">
                  "{fighter.nickname}"
                </p>
              </div>
              <span className="text-2xl">{fighter.flag}</span>
            </div>

            {/* WEIGHT CLASS & AGE */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="bg-[#1a1a1a] p-2 rounded border border-[#333]">
                <p className="text-gray-400 text-xs">Weight Class</p>
                <p className="text-white font-bold truncate">
                  {fighter.weightClass}
                </p>
              </div>
              <div className="bg-[#1a1a1a] p-2 rounded border border-[#333]">
                <p className="text-gray-400 text-xs">Age</p>
                <p className="text-white font-bold">{fighter.age} yrs</p>
              </div>
            </div>
          </div>

          {/* RECORD */}
          <motion.div
            className="bg-gradient-to-r from-[#e63946]/20 to-[#a4161a]/20 p-3 rounded-lg mb-3 border border-[#e63946]/30"
            whileHover={{ borderColor: '#e63946' }}
          >
            <p className="text-xs text-gray-400 mb-2 font-semibold uppercase">
              Record
            </p>
            <div className="flex items-center justify-around text-center">
              <div>
                <p className="text-white text-lg font-black">
                  {fighter.record.wins}
                </p>
                <p className="text-green-400 text-xs font-bold">Wins</p>
              </div>
              <div className="w-px h-8 bg-[#e63946]/50"></div>
              <div>
                <p className="text-white text-lg font-black">
                  {fighter.record.losses}
                </p>
                <p className="text-red-400 text-xs font-bold">Losses</p>
              </div>
              <div className="w-px h-8 bg-[#e63946]/50"></div>
              <div>
                <p className="text-white text-lg font-black">
                  {fighter.record.draws}
                </p>
                <p className="text-gray-400 text-xs font-bold">Draws</p>
              </div>
            </div>
          </motion.div>

          {/* STATS MINI */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-[#1a1a1a] p-2 rounded border border-[#333]">
              <div className="flex items-center gap-1 mb-1">
                <Zap size={12} className="text-yellow-500" />
                <span className="text-xs text-gray-400">STR ACC</span>
              </div>
              <p className="text-sm font-bold text-white">
                {fighter.stats.strikingAccuracy}%
              </p>
            </div>
            <div className="bg-[#1a1a1a] p-2 rounded border border-[#333]">
              <div className="flex items-center gap-1 mb-1">
                <Shield size={12} className="text-blue-400" />
                <span className="text-xs text-gray-400">TD AVG</span>
              </div>
              <p className="text-sm font-bold text-white">
                {fighter.stats.tdAvg.toFixed(2)}
              </p>
            </div>
          </div>

          {/* BUTTON */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-[#e63946] to-[#a4161a] text-white font-bold
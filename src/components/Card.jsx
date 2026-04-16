Je vais créer tous les fichiers nécessaires pour éliminer les layout shifts. Commençons par le CSS de stabilité, puis chaque composant.

FILE: src/styles/layout-stability.css

/* ============================================
   LAYOUT STABILITY - CLS Optimization
   Target: CLS < 0.1 via Vercel Analytics
   ============================================ */

/* ============================================
   CSS Custom Properties
   ============================================ */
:root {
  /* Card min-heights par type */
  --card-base-min-height: 280px;
  --card-sport-min-height: 320px;
  --card-news-min-height: 360px;
  --card-crypto-min-height: 200px;

  /* Image aspect ratios */
  --ratio-16-9: 56.25%;   /* 9/16 * 100 */
  --ratio-4-3: 75%;       /* 3/4 * 100 */
  --ratio-1-1: 100%;

  /* Transition */
  --card-transition: transform 0.2s ease, box-shadow 0.2s ease;

  /* Skeleton shimmer */
  --shimmer-bg: linear-gradient(
    90deg,
    rgba(255,255,255,0.03) 0%,
    rgba(255,255,255,0.08) 50%,
    rgba(255,255,255,0.03) 100%
  );
}

/* ============================================
   ASPECT RATIO CONTAINERS
   Empêche le reflow lors du chargement images
   ============================================ */
.aspect-ratio-container {
  position: relative;
  width: 100%;
  height: 0;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.05);
}

.aspect-ratio-container--16-9 {
  padding-bottom: var(--ratio-16-9);
}

.aspect-ratio-container--4-3 {
  padding-bottom: var(--ratio-4-3);
}

.aspect-ratio-container--1-1 {
  padding-bottom: var(--ratio-1-1);
}

.aspect-ratio-container img,
.aspect-ratio-container video,
.aspect-ratio-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  /* Évite le flash avant chargement */
  transition: opacity 0.3s ease;
}

.aspect-ratio-container img.loading {
  opacity: 0;
}

.aspect-ratio-container img.loaded {
  opacity: 1;
}

/* ============================================
   MODERN ASPECT-RATIO PROPERTY (fallback natif)
   ============================================ */
@supports (aspect-ratio: 16/9) {
  .img-16-9 {
    aspect-ratio: 16 / 9;
    width: 100%;
    height: auto;
    object-fit: cover;
    display: block;
  }

  .img-4-3 {
    aspect-ratio: 4 / 3;
    width: 100%;
    height: auto;
    object-fit: cover;
    display: block;
  }

  .img-1-1 {
    aspect-ratio: 1 / 1;
    width: 100%;
    height: auto;
    object-fit: cover;
    display: block;
  }

  /* Override padding-bottom fallback */
  .aspect-ratio-container--16-9,
  .aspect-ratio-container--4-3,
  .aspect-ratio-container--1-1 {
    height: auto;
    padding-bottom: 0;
  }

  .aspect-ratio-container--16-9 {
    aspect-ratio: 16 / 9;
  }

  .aspect-ratio-container--4-3 {
    aspect-ratio: 4 / 3;
  }

  .aspect-ratio-container--1-1 {
    aspect-ratio: 1 / 1;
  }
}

/* ============================================
   BASE CARD - Stabilité dimensionnelle
   ============================================ */
.card-base {
  position: relative;
  min-height: var(--card-base-min-height);
  width: 100%;
  display: flex;
  flex-direction: column;
  /* Évite collapse sur contenu vide */
  contain: layout style;
  /* GPU layer pour éviter repaint */
  will-change: transform;
  transform: translateZ(0);
  transition: var(--card-transition);
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
}

.card-base:hover {
  transform: translateY(-2px) translateZ(0);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Content area - flex-grow pour remplir */
.card-base__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  /* Hauteur minimale du contenu */
  min-height: 120px;
}

/* Header section */
.card-base__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  /* Hauteur fixe pour éviter reflow */
  min-height: 32px;
}

/* Footer section */
.card-base__footer {
  margin-top: auto;
  padding-top: 12px;
  /* Hauteur fixe */
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ============================================
   SPORT CARD
   ============================================ */
.card-sport {
  min-height: var(--card-sport-min-height);
  container-type: inline-size;
  container-name: sport-card;
}

.card-sport__image-wrapper {
  /* Hauteur fixe pour l'image sport */
  flex-shrink: 0;
}

.card-sport__teams {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  /* Hauteur fixe pour éviter reflow lors du chargement des logos */
  min-height: 64px;
  padding: 12px 0;
}

.card-sport__team-logo-wrapper {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
}

.card-sport__team-logo-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-sport__score {
  font-size: clamp(1.25rem, 4vw, 1.75rem);
  font-weight: 700;
  letter-spacing: 2px;
  /* Hauteur fixe pour le score */
  min-height: 36px;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.card-sport__meta {
  /* Hauteur fixe pour les métadonnées */
  min-height: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Container queries pour sport card */
@container sport-card (max-width: 280px) {
  .card-sport__team-logo-wrapper {
    width: 36px;
    height: 36px;
  }
  .card-sport__score {
    font-size: 1rem;
  }
}

@container sport-card (min-width: 400px) {
  .card-sport__team-logo-wrapper {
    width: 56px;
    height: 56px;
  }
}

/* ============================================
   NEWS CARD
   ============================================ */
.card-news {
  min-height: var(--card-news-min-height);
  container-type: inline-size;
  container-name: news-card;
}

.card-news__image-wrapper {
  flex-shrink: 0;
  /* Garantit l'espace image même pendant chargement */
}

.card-news__category {
  /* Badge catégorie - hauteur fixe */
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  flex-shrink: 0;
  white-space: nowrap;
}

.card-news__title {
  /* Hauteur réservée pour titre (2 lignes) */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 48px;
  font-size: clamp(0.875rem, 2.5vw, 1rem);
  font-weight: 600;
  line-height: 1.4;
  margin: 8px 0;
}

.card-news__excerpt {
  /* Hauteur réservée pour extrait (3 lignes) */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 60px;
  font-size: 0.8rem;
  line-height: 1.5;
  opacity: 0.7;
  margin-bottom: 8px;
}

.card-news__author-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  /* Hauteur fixe auteur */
  min-height: 32px;
  flex-shrink: 0;
}

.card-news__author-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
}

.card-news__author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Container queries pour news card */
@container news-card (min-width: 400px) {
  .card-news__title {
    font-size: 1.1rem;
    min-height: 56px;
  }
  .card-news__excerpt {
    -webkit-line-clamp: 4;
    min-height: 80px;
  }
}

@container news-card (max-width: 260px) {
  .card-news__excerpt {
    display: none;
  }
  .card-news {
    min-height: 280px;
  }
}

/* ============================================
   CRYPTO CARD
   ============================================ */
.card-crypto {
  min-height: var(--card-crypto-min-height);
  container-type: inline-size;
  container-name: crypto-card;
}

.card-crypto__icon-wrapper {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-crypto__icon-wrapper img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.card-crypto__price {
  font-size: clamp(1.25rem, 4vw, 1.75rem);
  font-weight: 700;
  /* Hauteur fixe pour prix */
  min-height: 36px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-crypto__change {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  /* Hauteur fixe pour variation */
  min-height: 24px;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.card-crypto__chart-wrapper {
  /* Espace réservé pour mini-chart */
  height: 60px;
  width: 100%;
  flex-shrink: 0;
  overflow: hidden;
}

.card-crypto__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  /* Hauteur fixe pour stats */
  min-height: 48px;
}

.card-crypto__stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 40px;
}

/* Container queries pour crypto card */
@container crypto-card (min-width: 300px) {
  .card-crypto__stats {
    grid-template-columns: repeat(3, 1fr);
  }
}

@container crypto-card (max-width: 200px) {
  .card-crypto__stats {
    grid-template-columns: 1fr;
  }
  .card-crypto {
    min-height: 240px;
  }
}

/* ============================================
   SKELETON LOADING - Évite reflow
   ============================================ */
.skeleton {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8px;
}

.skeleton::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: var(--shimmer-bg);
  animation: shimmer 1.8s infinite ease-in-out;
}

@keyframes shimmer {
  0%   { left: -100%; }
  100% { left: 100%; }
}

/* Skeleton variants avec hauteurs fixes */
.skeleton--image-16-9 {
  width: 100%;
  padding-bottom: var(--ratio-16-9);
  height: 0;
}

@supports (aspect-ratio: 16/9) {
  .skeleton--image-16-9 {
    aspect-ratio: 16 / 9;
    padding-bottom: 0;
    height: auto;
    min-height: 0;
  }
}

.skeleton--text-sm {
  height: 14px;
  width: 80%;
  margin-bottom: 8px;
}

.skeleton--text-md {
  height: 18px;
  width: 100%;
  margin-bottom: 8px;
}

.skeleton--text-lg {
  height: 24px;
  width: 60%;
  margin-bottom: 12px;
}

.skeleton--avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.skeleton--badge {
  width: 80px;
  height: 24px;
  border-radius: 12px;
}

/* ============================================
   GRID CONTAINERS - Hauteur auto
   ============================================ */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  /* height: auto pour éviter constraints */
  height: auto;
  align-items: start;
  /* Évite reflow lors ajout items */
  grid-auto-rows: min-content;
}

.cards-grid--sport {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-auto-rows: min-content;
}

.cards-grid--news {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  grid-auto-rows: min-content;
}

.cards-grid--crypto {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-auto-rows: min-content;
}

/* Mobile */
@media (max-width: 480px) {
  .cards-grid,
  .cards-grid--sport,
  .cards-grid--news {
    grid-template-columns: 1fr;
  }

  .cards-grid--crypto {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ============================================
   FONT DISPLAY - Évite FOUT/CLS texte
   ============================================ */
.text-stable {
  /* Réserve espace avant chargement font */
  font-display: optional;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* Empêche width shift */
  font-size-adjust: auto;
}

/* ============================================
   IMAGES - Optimisation chargement
   ============================================ */
img {
  /* Empêche layout shift images sans dimension */
  max-width: 100%;
  height: auto;
  /* Decode async pour éviter jank */
  decoding: async;
}

img[width][height] {
  /* Navigateur peut calculer AR avant chargement */
  height: auto;
}

/* ============================================
   PERFORMANCE - Contenu critique
   ============================================ */
.card-above-fold {
  /* Priorité de rendu */
  content-visibility: visible;
}

.card-below-fold {
  /* Rendu différé pour cards hors viewport */
  content-visibility: auto;
  contain-intrinsic-size: 0 var(--card-base-min-height);
}

.card-below-fold.card-sport {
  contain-intrinsic-size: 0 var(--card-sport-min-height);
}

.card-below-fold.card-news {
  contain-intrinsic-size: 0 var(--card-news-min-height);
}

.card-below-fold.card-crypto {
  contain-intrinsic-size: 0 var(--card-crypto-min-height);
}

FILE: src/components/Card.jsx

import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import '../styles/layout-stability.css';

/* ============================================
   Sub-components (mémoïsés)
   ============================================ */

/**
 * Image avec aspect-ratio fixe pour éviter CLS
 * Utilise padding-bottom trick + fallback modern aspect-ratio
 */
const StableImage = memo(function StableImage({
  src,
  alt = '',
  ratio = '16-9',
  className = '',
  priority = false,
  onLoad,
  onError,
}) {
  const [status, setStatus] = useState('loading
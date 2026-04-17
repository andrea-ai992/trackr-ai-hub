Je vais créer tous les fichiers nécessaires pour le dashboard Hub avec toutes les fonctionnalités demandées.

**Fichier 1: src/utils/dashboardConfig.js**

export const DASHBOARD_WIDGETS = [
  {
    id: 'widget-revenue',
    title: 'Revenue Total',
    type: 'kpi',
    size: 'small',
    order: 0,
    data: {
      value: 847293,
      prefix: '$',
      suffix: '',
      change: 12.5,
      changeLabel: 'vs mois dernier',
      color: '#6366f1',
      icon: 'TrendingUp',
    },
  },
  {
    id: 'widget-users',
    title: 'Utilisateurs Actifs',
    type: 'kpi',
    size: 'small',
    order: 1,
    data: {
      value: 24891,
      prefix: '',
      suffix: '',
      change: 8.3,
      changeLabel: 'vs mois dernier',
      color: '#06b6d4',
      icon: 'Users',
    },
  },
  {
    id: 'widget-conversion',
    title: 'Taux de Conversion',
    type: 'kpi',
    size: 'small',
    order: 2,
    data: {
      value: 3.87,
      prefix: '',
      suffix: '%',
      change: -1.2,
      changeLabel: 'vs mois dernier',
      color: '#f59e0b',
      icon: 'Target',
    },
  },
  {
    id: 'widget-sessions',
    title: 'Sessions',
    type: 'kpi',
    size: 'small',
    order: 3,
    data: {
      value: 182450,
      prefix: '',
      suffix: '',
      change: 22.1,
      changeLabel: 'vs mois dernier',
      color: '#10b981',
      icon: 'Activity',
    },
  },
  {
    id: 'widget-revenue-chart',
    title: 'Évolution Revenue',
    type: 'line-chart',
    size: 'large',
    order: 4,
    data: {
      color: '#6366f1',
      chartData: [
        { name: 'Jan', value: 65000, prev: 52000 },
        { name: 'Fév', value: 72000, prev: 61000 },
        { name: 'Mar', value: 68000, prev: 58000 },
        { name: 'Avr', value: 91000, prev: 71000 },
        { name: 'Mai', value: 87000, prev: 79000 },
        { name: 'Jun', value: 103000, prev: 84000 },
        { name: 'Jul', value: 98000, prev: 91000 },
        { name: 'Aoû', value: 115000, prev: 97000 },
        { name: 'Sep', value: 121000, prev: 103000 },
        { name: 'Oct', value: 134000, prev: 112000 },
        { name: 'Nov', value: 128000, prev: 118000 },
        { name: 'Déc', value: 147000, prev: 124000 },
      ],
    },
  },
  {
    id: 'widget-traffic',
    title: 'Sources de Trafic',
    type: 'pie-chart',
    size: 'medium',
    order: 5,
    data: {
      chartData: [
        { name: 'Organique', value: 42, color: '#6366f1' },
        { name: 'Direct', value: 28, color: '#06b6d4' },
        { name: 'Social', value: 18, color: '#f59e0b' },
        { name: 'Email', value: 8, color: '#10b981' },
        { name: 'Référent', value: 4, color: '#ec4899' },
      ],
    },
  },
  {
    id: 'widget-performance',
    title: 'Performance Hebdo',
    type: 'bar-chart',
    size: 'medium',
    order: 6,
    data: {
      color: '#06b6d4',
      chartData: [
        { name: 'Lun', value: 4200, goal: 5000 },
        { name: 'Mar', value: 5800, goal: 5000 },
        { name: 'Mer', value: 4900, goal: 5000 },
        { name: 'Jeu', value: 6200, goal: 5000 },
        { name: 'Ven', value: 5500, goal: 5000 },
        { name: 'Sam', value: 3800, goal: 5000 },
        { name: 'Dim', value: 2900, goal: 5000 },
      ],
    },
  },
  {
    id: 'widget-activity',
    title: 'Activité Récente',
    type: 'activity-feed',
    size: 'medium',
    order: 7,
    data: {
      activities: [
        { id: 1, user: 'Marie D.', action: 'Nouvel abonnement Premium', time: '2 min', avatar: 'MD', color: '#6366f1' },
        { id: 2, user: 'Thomas R.', action: 'Rapport généré', time: '8 min', avatar: 'TR', color: '#06b6d4' },
        { id: 3, user: 'Sophie L.', action: 'Intégration configurée', time: '15 min', avatar: 'SL', color: '#10b981' },
        { id: 4, user: 'Lucas M.', action: 'Support ticket résolu', time: '32 min', avatar: 'LM', color: '#f59e0b' },
        { id: 5, user: 'Emma B.', action: 'Dashboard personnalisé', time: '1h', avatar: 'EB', color: '#ec4899' },
        { id: 6, user: 'Nicolas P.', action: 'Export données CSV', time: '2h', avatar: 'NP', color: '#8b5cf6' },
      ],
    },
  },
  {
    id: 'widget-goals',
    title: 'Objectifs du Mois',
    type: 'goals',
    size: 'medium',
    order: 8,
    data: {
      goals: [
        { id: 1, label: 'Revenue', current: 847293, target: 1000000, color: '#6366f1' },
        { id: 2, label: 'Nouveaux Users', current: 2891, target: 3500, color: '#06b6d4' },
        { id: 3, label: 'NPS Score', current: 72, target: 80, color: '#10b981' },
        { id: 4, label: 'Uptime', current: 99.7, target: 99.9, color: '#f59e0b' },
      ],
    },
  },
];

export const GRID_COLS = {
  small: 'col-span-12 md:col-span-6 lg:col-span-3',
  medium: 'col-span-12 md:col-span-6',
  large: 'col-span-12',
};

export const WIDGET_HEIGHTS = {
  small: '160px',
  medium: '320px',
  large: '380px',
};

export const GRADIENT_PRESETS = {
  primary: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)',
  cyan: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
  amber: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
  emerald: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)',
  pink: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)',
};

export const formatValue = (value, prefix = '', suffix = '') => {
  if (typeof value !== 'number') return `${prefix}${value}${suffix}`;
  if (value >= 1000000) return `${prefix}${(value / 1000000).toFixed(1)}M${suffix}`;
  if (value >= 1000) return `${prefix}${(value / 1000).toFixed(1)}K${suffix}`;
  if (suffix === '%') return `${prefix}${value.toFixed(2)}${suffix}`;
  return `${prefix}${value.toLocaleString('fr-FR')}${suffix}`;
};

**Fichier 2: src/hooks/useDragDrop.js**

import { useState, useCallback } from 'react';

export const useDragDrop = (initialItems) => {
  const [items, setItems] = useState(initialItems);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedId, setDraggedId] = useState(null);

  const reorder = useCallback((list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result.map((item, index) => ({ ...item, order: index }));
  }, []);

  const onDragStart = useCallback((start) => {
    setIsDragging(true);
    setDraggedId(start.draggableId);
  }, []);

  const onDragEnd = useCallback(
    (result) => {
      setIsDragging(false);
      setDraggedId(null);

      if (!result.destination) return;
      if (result.destination.index === result.source.index) return;

      const reordered = reorder(items, result.source.index, result.destination.index);
      setItems(reordered);
    },
    [items, reorder]
  );

  const resetLayout = useCallback(() => {
    setItems(initialItems);
  }, [initialItems]);

  const moveItem = useCallback(
    (fromIndex, toIndex) => {
      const reordered = reorder(items, fromIndex, toIndex);
      setItems(reordered);
    },
    [items, reorder]
  );

  return {
    items,
    isDragging,
    draggedId,
    onDragStart,
    onDragEnd,
    resetLayout,
    moveItem,
    setItems,
  };
};

export default useDragDrop;

**Fichier 3: src/components/KPICounter.jsx**

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Target, Activity, DollarSign, BarChart2, Zap } from 'lucide-react';
import { formatValue } from '../utils/dashboardConfig';

const ICON_MAP = {
  TrendingUp,
  Users,
  Target,
  Activity,
  DollarSign,
  BarChart2,
  Zap,
};

const useCountUp = (end, duration = 2000, start = 0, enabled = false) => {
  const [count, setCount] = useState(start);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const startTime = performance.now();
    const isDecimal = end % 1 !== 0;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeOut;

      setCount(isDecimal ? parseFloat(current.toFixed(2)) : Math.floor(current));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [end, duration, start, enabled]);

  return count;
};

const SparkLine = ({ value, color }) => {
  const points = [30, 45, 35, 55, 48, 62, 58, 70, 65, value > 0 ? 80 : 40];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const width = 80;
  const height = 32;
  const padding = 2;

  const pathData = points
    .map((p, i) => {
      const x = padding + (i / (points.length - 1)) * (width - padding * 2);
      const y = height - padding - ((p - min) / range) * (height - padding * 2);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={pathData + ` L ${width - padding} ${height} L ${padding} ${height} Z`}
        fill={`url(#spark-${color.replace('#', '')})`}
      />
      <path d={pathData} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width - padding} cy={height - padding - ((points[points.length - 1] - min) / range) * (height - padding * 2)} r="3" fill={color} />
    </svg>
  );
};

const KPICounter = ({ data, title }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const count = useCountUp(data.value, 2000, 0, isInView);

  const Icon = ICON_MAP[data.icon] || Activity;
  const isPositive = data.change >= 0;

  const gradientMap = {
    '#6366f1': 'rgba(99, 102, 241, 0.15)',
    '#06b6d4': 'rgba(6, 182, 212, 0.15)',
    '#f59e0b': 'rgba(245, 158, 11, 0.15)',
    '#10b981': 'rgba(16, 185, 129, 0.15)',
  };

  const bgColor = gradientMap[data.color] || 'rgba(99, 102, 241, 0.15)';

  return (
    <div ref={ref} style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {data.prefix}{typeof count === 'number' && count >= 1000
                ? count >= 1000000
                  ? `${(count / 1000000).toFixed(1)}M`
                  : `${(count / 1000).toFixed(1)}K`
                : data.suffix === '%'
                ? count.toFixed(2)
                : count.toLocaleString('fr-FR')}
              {data.suffix}
            </span>
          </motion.div>
        </div>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={isInView ? { scale: 1, rotate: 0 } : {}}
          transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: bgColor,
            border: `1px solid ${data.color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={20} color={data.color} />
        </motion.div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
            {isPositive ? (
              <TrendingUp size={14} color="#10b981" />
            ) : (
              <TrendingDown size={14} color="#ef4444" />
            )}
            <span style={{ fontSize: '13px', fontWeight: 600, color: isPositive ? '#10b981' : '#ef4444' }}>
              {isPositive ? '+' : ''}{data.change}%
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{data.changeLabel}</span>
        </div>
        <SparkLine value={data.change} color={data.color} />
      </div>
    </div>
  );
};

export default KPICounter;

**Fichier 4: src/components/Dash